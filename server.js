const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');
const crypto = require('crypto');
const chokidar = require('chokidar');
const mime = require('mime-types');
const multer = require('multer');
const AdmZip = require('adm-zip');
const { imageSizeFromFile } = require('image-size/fromFile');

const app = express();
const PORT = process.env.PORT || 4000;
const ROOT_DIR =
  process.env.FFMPEG_ROOT ||
  path.resolve(process.env.HOME || process.cwd(), 'Desktop');
const LOG_DIR = path.join(__dirname, 'logs');
const PREVIEW_DIR = path.join(__dirname, 'temp', 'previews');
const UPLOAD_DIR = path.join(__dirname, 'temp', 'uploads');
const SEQUENCE_DIR = path.join(__dirname, 'temp', 'sequences');
const PRESET_FILE = path.join(__dirname, 'presets.json');
const STATIC_DIR = path.join(__dirname, 'public');

const ALLOWED_VIDEO_CODECS = [
  'libvpx-vp9',
  'libvpx',
  'libx264',
  'libx265',
  'libwebp',
  'copy',
];
const ALLOWED_AUDIO_CODECS = ['aac', 'libopus', 'libvorbis', 'copy', 'none'];
const ALLOWED_PIXEL_FORMATS = [
  'yuv420p',
  'yuv422p',
  'yuv444p',
  'yuva420p',
  'yuva422p',
  'yuva444p',
  'rgba',
];

const jobs = new Map();
const queue = [];
let activeJobId = null;

const presets = {
  data: [],
};

ensureDirs([
  path.join(__dirname, 'temp'),
  PREVIEW_DIR,
  UPLOAD_DIR,
  SEQUENCE_DIR,
  LOG_DIR,
]);

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 200 * 1024 * 1024; // 默认 200MB (MVP)
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: MAX_FILE_SIZE },
});

// temp / logs 清理与保留策略（可配置）
const TEMP_UPLOAD_TTL_HOURS = Number(process.env.TEMP_UPLOAD_TTL_HOURS) || 24;
const TEMP_SEQUENCE_TTL_HOURS = Number(process.env.TEMP_SEQUENCE_TTL_HOURS) || 6;
const TEMP_PREVIEW_TTL_HOURS = Number(process.env.TEMP_PREVIEW_TTL_HOURS) || 24;
const LOG_RETENTION_DAYS = Number(process.env.LOG_RETENTION_DAYS) || 7;
const TEMP_MAX_SIZE_MB = Number(process.env.TEMP_MAX_SIZE_MB) || 5120;
const LOG_MAX_SIZE_MB = Number(process.env.LOG_MAX_SIZE_MB) || 500;

loadPresets();
watchPresetFile();
runCleanupOnStartup();
scheduleTempCleanup();
scheduleLogCleanup();
scheduleDiskUsageCheck();

// CORS 支持（可选）
if (process.env.ENABLE_CORS === 'true') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
}

app.use(express.json({ limit: '2mb' }));

// Fluxio 主入口为 /；旧版 FFmpeg 控制台在 /legacy；/fluxio 重定向到 /
app.get(/^\/fluxio(\/.*)?$/, (req, res) => {
  const rest = req.path.replace(/^\/fluxio/, '') || '/';
  res.redirect(301, rest || '/');
});
app.get('/legacy', (_, res) => res.sendFile(path.join(STATIC_DIR, 'index.html')));

app.get('/', (_, res) => res.sendFile(path.join(STATIC_DIR, 'fluxio.html')));
app.get(/^\/tasks\/[^/]+$/, (_, res) => res.sendFile(path.join(STATIC_DIR, 'fluxio.html')));
app.get(/^\/tasks\/[^/]+\/files\/[^/]+$/, (_, res) => res.sendFile(path.join(STATIC_DIR, 'fluxio.html')));
app.get(/^\/tasks\/?$/, (_, res) => res.redirect(301, '/'));

app.use(express.static(STATIC_DIR));
app.use('/previews', express.static(PREVIEW_DIR));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/logs', express.static(LOG_DIR));

app.get('/api/video-stream', async (req, res) => {
  try {
    const filePath = ensureInsideRoot(req.query.path);
    await fsp.access(filePath, fs.constants.R_OK);
    const stat = await fsp.stat(filePath);
    const range = req.headers.range;
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
      if (start >= stat.size || end >= stat.size) {
        return res
          .status(416)
          .set('Content-Range', `bytes */${stat.size}`)
          .end();
      }
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/file-info', async (req, res) => {
  try {
    const filePath = ensureInsideRoot(req.query.path);
    const [stat, probe] = await Promise.all([
      fsp.stat(filePath),
      runFfprobe(filePath),
    ]);
    res.json({
      success: true,
      data: {
        path: filePath,
        size: stat.size,
        modifiedAt: stat.mtime,
        probe,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/options', (_, res) => {
  res.json({
    success: true,
    data: {
      rootDir: ROOT_DIR,
      videoCodecs: ALLOWED_VIDEO_CODECS,
      audioCodecs: ALLOWED_AUDIO_CODECS,
      pixelFormats: ALLOWED_PIXEL_FORMATS,
    },
  });
});

app.get('/api/ffprobe', async (req, res) => {
  try {
    const inputPath = ensureInsideRoot(req.query.input);
    const result = await runFfprobe(inputPath);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/jobs', (_, res) => {
  res.json({
    success: true,
    data: Array.from(jobs.values()).map(normalizeJob),
  });
});

app.post('/api/queue', async (req, res) => {
  try {
    const payload = req.body || {};
    const { job, previewRequest } = await createJobFromPayload(payload);
    jobs.set(job.id, job);
    queue.push(job.id);
    processQueue();

    if (previewRequest) {
      generatePreview(previewRequest).catch((error) => {
        console.error('Preview error', error);
      });
    }

    res.json({ success: true, data: normalizeJob(job) });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/jobs/:id/cancel', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }

  if (job.status === 'success' || job.status === 'failed') {
    return res
      .status(400)
      .json({ success: false, error: 'Job already finished' });
  }

  if (job.status === 'queued') {
    job.status = 'cancelled';
    job.endedAt = new Date().toISOString();
    const idx = queue.indexOf(job.id);
    if (idx >= 0) queue.splice(idx, 1);
    return res.json({ success: true, data: normalizeJob(job) });
  }

  if (job.status === 'running' && job.process) {
    job.status = 'cancelled';
    job.endedAt = new Date().toISOString();
    job.process.kill('SIGTERM');
    appendLog(job.logPath, '\nJob cancelled by user.\n');
    return res.json({ success: true, data: normalizeJob(job) });
  }

  return res.status(400).json({ success: false, error: 'Unable to cancel job' });
});

app.post('/api/preview', async (req, res) => {
  try {
    const payload = req.body || {};
    const previewData = await generatePreview({
      inputPath: ensureInsideRoot(payload.inputPath),
      seek: Number(payload.seek) || 0,
      duration: Number(payload.duration) || 2,
      scale: payload.scale || '640:-1',
      format: payload.format || 'webm',
      pixelFormat:
        ALLOWED_PIXEL_FORMATS.includes(payload.pixelFormat) ||
        payload.pixelFormat === 'auto'
          ? payload.pixelFormat
          : 'yuv420p',
    });
    res.json({ success: true, data: previewData });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/presets', (_, res) => {
  res.json({ success: true, data: presets.data });
});

app.post('/api/presets', async (req, res) => {
  try {
    const preset = req.body;
    if (!preset?.name || !preset?.params) {
      throw new Error('Preset requires name and params');
    }
    presets.data = presets.data.filter((p) => p.name !== preset.name);
    presets.data.push(preset);
    await savePresets();
    res.json({ success: true, data: presets.data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/presets/:name', async (req, res) => {
  const before = presets.data.length;
  presets.data = presets.data.filter((p) => p.name !== req.params.name);
  if (presets.data.length === before) {
    return res.status(404).json({ success: false, error: 'Preset not found' });
  }
  await savePresets();
  res.json({ success: true, data: presets.data });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const originalName = req.file.originalname || 'uploaded';
    const ext = path.extname(originalName);
    const newName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const newPath = path.join(UPLOAD_DIR, newName);
    await fsp.rename(req.file.path, newPath);
    const fullPath = path.resolve(newPath);
    res.json({
      success: true,
      data: {
        path: fullPath,
        name: originalName,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const MAX_SEQUENCE_FRAMES = 600;
// 序列帧命名：前缀_编号，如 demo_0001.png 或 合成 6_00001.png。前缀可含中文、空格，编号 4-6 位、从 0001 连续
const SEQUENCE_NAME_REGEX = /^(.+)_(\d{4,6})\.(png|jpg|jpeg)$/i;

app.post('/api/upload-sequence', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const originalName = req.file.originalname || 'sequence.zip';
    if (!/\.zip$/i.test(originalName)) {
      await fsp.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, error: '仅支持 ZIP 格式' });
    }

    const extractId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const extractDir = path.join(SEQUENCE_DIR, extractId);
    await fsp.mkdir(extractDir, { recursive: true });

    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(extractDir, true);
    await fsp.unlink(req.file.path).catch(() => {});

    let frameDir = extractDir;
    let frameFiles = [];
    const entries = await fsp.readdir(extractDir, { withFileTypes: true });
    const sortByFrameNum = (names) =>
      names.sort((a, b) => {
        const mA = a.match(SEQUENCE_NAME_REGEX);
        const mB = b.match(SEQUENCE_NAME_REGEX);
        return (mA ? parseInt(mA[2], 10) : 0) - (mB ? parseInt(mB[2], 10) : 0);
      });
    const filesHere = entries
      .filter((e) => e.isFile() && !e.name.startsWith('._') && SEQUENCE_NAME_REGEX.test(e.name))
      .map((e) => e.name);
    if (filesHere.length > 0) {
      frameFiles = sortByFrameNum(filesHere);
    } else {
      const subdirs = entries.filter((e) => e.isDirectory() && e.name !== '__MACOSX');
      for (const d of subdirs) {
        const subPath = path.join(extractDir, d.name);
        const subEntries = await fsp.readdir(subPath, { withFileTypes: true });
        const subFiles = subEntries
          .filter((e) => e.isFile() && !e.name.startsWith('._') && SEQUENCE_NAME_REGEX.test(e.name))
          .map((e) => e.name);
        if (subFiles.length > 0) {
          frameDir = subPath;
          frameFiles = sortByFrameNum(subFiles);
          break;
        }
      }
    }

    if (frameFiles.length === 0) {
      await fsp.rm(extractDir, { recursive: true, force: true });
      return res.status(400).json({
        success: false,
        error: 'ZIP 内需包含按 前缀_编号 命名的 PNG/JPG 序列帧，如 demo_0001.png',
      });
    }

    const firstMatch = frameFiles[0].match(SEQUENCE_NAME_REGEX);
    const refPrefix = firstMatch[1];
    const refNumWidth = firstMatch[2].length;
    const ext = path.extname(frameFiles[0]).toLowerCase();
    const pattern = `${refPrefix}_%0${refNumWidth}d${ext}`;

    const parsed = frameFiles.map((f) => {
      const m = f.match(SEQUENCE_NAME_REGEX);
      return m ? { prefix: m[1], num: parseInt(m[2], 10), numWidth: m[2].length } : null;
    });

    for (let i = 0; i < parsed.length; i++) {
      const p = parsed[i];
      if (!p || p.prefix !== refPrefix) {
        await fsp.rm(extractDir, { recursive: true, force: true });
        return res.status(400).json({
          success: false,
          error: `同一 ZIP 内前缀需一致，期望 ${refPrefix}`,
        });
      }
      if (p.numWidth !== refNumWidth) {
        await fsp.rm(extractDir, { recursive: true, force: true });
        return res.status(400).json({
          success: false,
          error: `编号位数需一致，期望 ${refNumWidth} 位`,
        });
      }
      if (p.num !== i + 1) {
        await fsp.rm(extractDir, { recursive: true, force: true });
        return res.status(400).json({
          success: false,
          error: `帧序号不连续，期望 ${i + 1} 实际 ${p.num}`,
        });
      }
    }

    if (frameFiles.length > MAX_SEQUENCE_FRAMES) {
      await fsp.rm(extractDir, { recursive: true, force: true });
      return res.status(400).json({
        success: false,
        error: `帧数不得超过 ${MAX_SEQUENCE_FRAMES}`,
      });
    }

    let refSize = null;
    for (const f of frameFiles) {
      const fp = path.join(frameDir, f);
      const dims = await imageSizeFromFile(fp);
      if (!dims || !dims.width || !dims.height) {
        await fsp.rm(extractDir, { recursive: true, force: true });
        return res.status(400).json({ success: false, error: `无法读取 ${f} 的尺寸` });
      }
      if (!refSize) refSize = { width: dims.width, height: dims.height };
      else if (refSize.width !== dims.width || refSize.height !== dims.height) {
        await fsp.rm(extractDir, { recursive: true, force: true });
        return res.status(400).json({
          success: false,
          error: `帧尺寸不一致：${f} 为 ${dims.width}×${dims.height}，期望 ${refSize.width}×${refSize.height}`,
        });
      }
    }

    const fullDir = path.resolve(frameDir);
    res.json({
      success: true,
      data: {
        path: fullDir,
        name: originalName,
        frameCount: frameFiles.length,
        pattern,
        width: refSize.width,
        height: refSize.height,
        isSequence: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/convert-to-icns', async (req, res) => {
  try {
    const { pngPath, outputName } = req.body;
    if (!pngPath) {
      return res.status(400).json({ success: false, error: 'PNG path is required' });
    }

    const inputPath = ensureInsideRoot(pngPath);
    await fsp.access(inputPath, fs.constants.R_OK);

    const outputDir = path.dirname(inputPath);
    const baseName = outputName
      ? outputName.replace(/\.icns$/, '')
      : path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.icns`);

    const iconsetDir = path.join(__dirname, 'temp', `iconset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    await fsp.mkdir(iconsetDir, { recursive: true });

    const sizes = [
      { name: 'icon_16x16.png', size: 16 },
      { name: 'icon_16x16@2x.png', size: 32 },
      { name: 'icon_32x32.png', size: 32 },
      { name: 'icon_32x32@2x.png', size: 64 },
      { name: 'icon_128x128.png', size: 128 },
      { name: 'icon_128x128@2x.png', size: 256 },
      { name: 'icon_256x256.png', size: 256 },
      { name: 'icon_256x256@2x.png', size: 512 },
      { name: 'icon_512x512.png', size: 512 },
      { name: 'icon_512x512@2x.png', size: 1024 },
    ];

    for (const { name, size } of sizes) {
      const outputFile = path.join(iconsetDir, name);
      await runCommand('ffmpeg', [
        '-i',
        inputPath,
        '-vf',
        `scale=${size}:${size}:flags=lanczos`,
        '-y',
        outputFile,
      ]);
    }

    await runCommand('iconutil', ['-c', 'icns', iconsetDir, '-o', outputPath]);

    await fsp.rm(iconsetDir, { recursive: true, force: true });

    res.json({
      success: true,
      data: {
        path: outputPath,
        name: path.basename(outputPath),
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/download-zip', async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No job ids' });
    }
    const zip = new AdmZip();
    for (const id of ids) {
      const job = jobs.get(id);
      if (!job || job.status !== 'success' || !job.outputPath) continue;
      const fullPath = path.resolve(job.outputPath);
      try {
        ensureInsideRoot(fullPath);
        await fsp.access(fullPath, fs.constants.R_OK);
      } catch {
        continue;
      }
      const basename = path.basename(fullPath);
      zip.addLocalFile(fullPath, '', basename);
    }
    if (zip.getEntries().length === 0) {
      return res.status(400).json({ success: false, error: 'No valid files to zip' });
    }
    const zipBuffer = zip.toBuffer();
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="fluxio-results.zip"',
    });
    res.send(zipBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use((_, res) => {
  res.sendFile(path.join(STATIC_DIR, 'fluxio.html'));
});

app.listen(PORT, () => {
  console.log(`FFmpeg UI running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Root directory: ${ROOT_DIR}`);
  console.log(`Max file size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB`);
});

function ensureDirs(pathsList) {
  pathsList.forEach((p) => {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
  });
}

function ensureInsideRoot(target) {
  if (!target) throw new Error('Path is required');
  const resolved = path.resolve(target);
  const normalizedRoot = path.resolve(ROOT_DIR);
  const normalizedUploadDir = path.resolve(UPLOAD_DIR);
  const normalizedSequenceDir = path.resolve(SEQUENCE_DIR);
  const normalizedProjectDir = path.resolve(__dirname);

  // 允许访问：ROOT_DIR、上传目录、序列帧目录、项目目录内的文件
  if (
    !resolved.startsWith(normalizedRoot) &&
    !resolved.startsWith(normalizedUploadDir) &&
    !resolved.startsWith(normalizedSequenceDir) &&
    !resolved.startsWith(normalizedProjectDir)
  ) {
    throw new Error(`Path must be within ${normalizedRoot}, ${normalizedUploadDir}, or project directory`);
  }
  return resolved;
}

async function createJobFromPayload(payload) {
  const container = (payload.container || 'webm').replace(/^\./, '');
  let inputPath;
  let inputSequence = null;

  if (payload.inputSequence) {
    const seq = payload.inputSequence;
    const dir = ensureInsideRoot(seq.dir);
    await fsp.access(dir, fs.constants.R_OK);
    inputSequence = {
      dir,
      pattern: seq.pattern || '%04d.png',
      frameCount: seq.frameCount || 0,
    };
    inputPath = dir;
  } else {
    inputPath = ensureInsideRoot(payload.inputPath);
  }

  const baseName = payload.outputName
    ? payload.outputName.trim().replace(/\.[a-z]+$/i, '')
    : inputSequence
      ? `sequence-${path.basename(inputPath)}`
      : path.basename(inputPath, path.extname(inputPath));
  const name = ensureExtension(baseName, container);
  const outputDir = ensureInsideRoot(payload.outputDir || UPLOAD_DIR);
  const outputPath = ensureInsideRoot(path.join(outputDir, name));

  const job = {
    id: crypto.randomUUID(),
    inputPath,
    inputSequence,
    outputPath,
    params: sanitizeParams(payload.params || {}),
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    logPath: path.join(LOG_DIR, `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}.log`),
  };

  const previewRequest =
    payload.preview && !inputSequence
      ? {
          inputPath,
          seek: Number(payload.preview.seek) || 0,
          duration: Number(payload.preview.duration) || 2,
          scale: payload.preview.scale || '640:-1',
          format: payload.preview.format || 'webm',
        }
      : null;

  return { job, previewRequest };
}

function sanitizeParams(params) {
  const cleaned = {};
  if (
    params.videoCodec &&
    ALLOWED_VIDEO_CODECS.includes(params.videoCodec)
  ) {
    cleaned.videoCodec = params.videoCodec;
  }
  if (params.audioCodec && ALLOWED_AUDIO_CODECS.includes(params.audioCodec)) {
    cleaned.audioCodec = params.audioCodec;
  }
  if (
    params.pixelFormat &&
    ALLOWED_PIXEL_FORMATS.includes(params.pixelFormat)
  ) {
    cleaned.pixelFormat = params.pixelFormat;
  }
  if (params.crf !== undefined) cleaned.crf = String(params.crf);
  if (params.videoBitrate) cleaned.videoBitrate = String(params.videoBitrate);
  if (params.frameRate) cleaned.frameRate = String(params.frameRate);
  if (params.audioBitrate) cleaned.audioBitrate = String(params.audioBitrate);
  if (params.width || params.height) {
    cleaned.scale = `${params.width || -1}:${params.height || -1}`;
  }
  if (params.extraFilters) cleaned.extraFilters = String(params.extraFilters);
  if (params.customArgs && Array.isArray(params.customArgs)) {
    cleaned.customArgs = params.customArgs.slice(0, 8).map(String);
  }
  if (params.preserveAlpha) cleaned.preserveAlpha = true;
  return cleaned;
}

function ensureExtension(filename, extension) {
  if (!filename.toLowerCase().endsWith(`.${extension}`.toLowerCase())) {
    return `${filename}.${extension}`;
  }
  return filename;
}

function processQueue() {
  if (activeJobId || queue.length === 0) return;
  const nextId = queue.shift();
  const job = jobs.get(nextId);
  if (!job || job.status !== 'queued') {
    return processQueue();
  }
  activeJobId = job.id;
  job.status = 'running';
  job.startedAt = new Date().toISOString();
  runFfmpegJob(job)
    .then(async () => {
      job.status = job.status === 'cancelled' ? 'cancelled' : 'success';
      job.endedAt = new Date().toISOString();
      if (job.status === 'success' && job.outputPath) {
        try {
          const stat = await fsp.stat(job.outputPath);
          job.outputSize = stat.size;
        } catch (e) {}
      }
    })
    .catch((error) => {
      if (job.status !== 'cancelled') {
        job.status = 'failed';
        job.error = error.message;
        job.endedAt = new Date().toISOString();
        appendLog(job.logPath, `\nERROR: ${error.message}\n`);
      }
    })
    .finally(async () => {
      activeJobId = null;
      cleanupJobSequenceDir(job).catch((e) => console.warn('Sequence cleanup:', e.message));
      processQueue();
    });
}

function runFfmpegJob(job) {
  return new Promise((resolve, reject) => {
    const args = buildFfmpegArgs(job);
    const child = spawn('ffmpeg', args);
    job.process = child;
    const logStream = fs.createWriteStream(job.logPath, { flags: 'a' });

    child.stdout.on('data', (chunk) => logStream.write(chunk));
    child.stderr.on('data', (chunk) => {
      logStream.write(chunk);
      updateProgressFromLine(job, chunk.toString());
    });

    child.on('error', (error) => {
      logStream.write(`\nProcess error: ${error.message}\n`);
      logStream.end();
      if (job.status === 'cancelled') resolve();
      else reject(error);
    });

    child.on('close', (code) => {
      logStream.write(`\nProcess exited with code ${code}\n`);
      logStream.end();
      job.process = null;
      if (job.status === 'cancelled') return resolve();
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

function buildFfmpegArgs(job) {
  const args = ['-y'];
  const p = job.params;

  if (job.inputSequence) {
    const frameRate = p.frameRate || '24';
    const inputPattern = path.join(job.inputSequence.dir, job.inputSequence.pattern);
    args.push('-framerate', frameRate, '-i', inputPattern);
  } else {
    args.push('-i', job.inputPath);
  }
  const ext = path.extname(job.outputPath || '').toLowerCase();
  const isAnimatedImage = ['.gif', '.webp', '.apng'].includes(ext);
  const isStaticImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && !isAnimatedImage;

  // 视频编码器
  if (p.videoCodec) {
    args.push('-c:v', p.videoCodec);
  } else if (ext === '.webp' && !isAnimatedImage) {
    args.push('-c:v', 'libwebp');
  }

  // 像素格式
  if (p.pixelFormat) args.push('-pix_fmt', p.pixelFormat);

  // 质量：静态图按格式区分（crf 23/30/35 映射到各编码器）
  if (isStaticImage) {
    const crf = Number(p.crf) || 30;
    if (ext === '.png') {
      const level = crf <= 23 ? 3 : crf <= 30 ? 6 : 8;
      args.push('-compression_level', String(level));
    } else if (ext === '.jpg' || ext === '.jpeg') {
      const q = crf <= 23 ? 4 : crf <= 30 ? 8 : 12;
      args.push('-q:v', String(q));
    } else if (ext === '.webp') {
      args.push('-crf', String(crf));
    }
  } else if (p.crf) {
    args.push('-crf', p.crf);
  }
  if (p.videoBitrate) args.push('-b:v', p.videoBitrate);

  // 帧率
  if (p.frameRate) args.push('-r', p.frameRate);

  // 滤镜（缩放 + 额外滤镜）
  if (p.scale || p.extraFilters) {
    const filters = [];
    if (p.scale) filters.push(`scale=${p.scale}`);
    if (p.extraFilters) filters.push(p.extraFilters);
    args.push('-vf', filters.join(','));
  }

  // 动图/静态图不需要音频
  if (isAnimatedImage || isStaticImage) {
    args.push('-an');
  } else if (p.audioCodec === 'none') {
    args.push('-an');
  } else if (p.audioCodec) {
    args.push('-c:a', p.audioCodec);
  }

  if (p.audioBitrate && !isAnimatedImage) args.push('-b:a', p.audioBitrate);

  // 动图循环设置
  if (isAnimatedImage) {
    if (ext === '.webp') {
      // WebP 动图循环
      args.push('-loop', '0');
      if (!p.videoCodec) {
        args.push('-c:v', 'libwebp');
      }
    } else if (ext === '.gif') {
      // GIF 循环
      args.push('-loop', '0');
    } else if (ext === '.apng') {
      // APNG 循环播放
      args.push('-plays', '0');
    }
  }

  if (p.customArgs) args.push(...p.customArgs);
  args.push(job.outputPath);
  return args;
}

function updateProgressFromLine(job, line) {
  const timeMatch = line.match(/time=([0-9:.]+)/);
  if (timeMatch) {
    job.progressLabel = timeMatch[1];
  }
  const frameMatch = line.match(/frame=\s*([0-9]+)/);
  if (frameMatch) {
    job.progress = Number(frameMatch[1]);
  }
}

function runFfprobe(inputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      inputPath,
    ];
    const child = spawn('ffprobe', args);
    let data = '';
    let errorData = '';

    child.stdout.on('data', (chunk) => (data += chunk));
    child.stderr.on('data', (chunk) => (errorData += chunk));

    child.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse ffprobe output: ${error.message}`));
        }
      } else {
        reject(new Error(errorData || 'ffprobe error'));
      }
    });
  });
}

async function generatePreview(options) {
  const outputName = `preview-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 6)}.${options.format}`;
  const outputPath = path.join(PREVIEW_DIR, outputName);
  const args = [
    '-y',
    '-ss',
    String(options.seek),
    '-i',
    options.inputPath,
    '-t',
    String(options.duration),
    '-vf',
    `scale=${options.scale}`,
    '-an',
    '-c:v',
    'libvpx-vp9',
    '-pix_fmt',
    options.pixelFormat === 'auto' ? 'yuv420p' : options.pixelFormat,
    outputPath,
  ];

  await runCommand('ffmpeg', args);

  return {
    url: `/previews/${outputName}`,
    path: outputPath,
  };
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    let stderr = '';
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `${cmd} failed`));
    });
    child.on('error', (error) => reject(error));
  });
}

function appendLog(logPath, text) {
  fs.appendFile(logPath, text, () => {});
}

function normalizeJob(job) {
  return {
    id: job.id,
    inputPath: job.inputPath,
    outputPath: job.outputPath,
    outputSize: job.outputSize,
    status: job.status,
    progress: job.progress,
    progressLabel: job.progressLabel,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    endedAt: job.endedAt,
    logPath: path.relative(__dirname, job.logPath),
    error: job.error,
  };
}

async function loadPresets() {
  try {
    const content = await fsp.readFile(PRESET_FILE, 'utf-8');
    presets.data = JSON.parse(content);
  } catch {
    presets.data = [];
  }
}

async function savePresets() {
  await fsp.writeFile(PRESET_FILE, JSON.stringify(presets.data, null, 2));
}

function watchPresetFile() {
  chokidar
    .watch(PRESET_FILE, { ignoreInitial: true })
    .on('change', () => loadPresets());
}

async function cleanupJobSequenceDir(job) {
  if (job?.inputSequence?.dir) {
    const dir = path.resolve(job.inputSequence.dir);
    if (dir.startsWith(path.resolve(SEQUENCE_DIR))) {
      await fsp.rm(dir, { recursive: true, force: true });
      console.log('[Cleanup] removed sequence dir:', path.basename(dir));
    }
  }
}

function getInUsePaths() {
  const paths = new Set();
  for (const job of jobs.values()) {
    if (job.inputPath) paths.add(path.resolve(job.inputPath));
    if (job.outputPath) paths.add(path.resolve(job.outputPath));
    if (job.inputSequence?.dir) paths.add(path.resolve(job.inputSequence.dir));
  }
  return paths;
}

async function runCleanupOnStartup() {
  try {
    await cleanupTempDirectories(false);
    await cleanupLogs(false);
  } catch (error) {
    console.warn('Startup cleanup skipped:', error.message);
  }
}

function scheduleTempCleanup() {
  setInterval(async () => {
    try {
      await cleanupTempDirectories(true);
    } catch (error) {
      console.warn('Temp cleanup skipped:', error.message);
    }
  }, 1000 * 60 * 60);
}

function scheduleLogCleanup() {
  setInterval(async () => {
    try {
      await cleanupLogs(true);
    } catch (error) {
      console.warn('Log cleanup skipped:', error.message);
    }
  }, 1000 * 60 * 60 * 24);
}

async function cleanupTempDirectories(protectInUse = true) {
  const inUse = protectInUse ? getInUsePaths() : new Set();
  const now = Date.now();
  const uploadTtl = TEMP_UPLOAD_TTL_HOURS * 60 * 60 * 1000;
  const sequenceTtl = TEMP_SEQUENCE_TTL_HOURS * 60 * 60 * 1000;
  const previewTtl = TEMP_PREVIEW_TTL_HOURS * 60 * 60 * 1000;

  async function cleanDir(dir, ttl, isSequenceDir = false) {
    let removed = 0;
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const target = path.join(dir, e.name);
      const resolved = path.resolve(target);
      if (inUse.has(resolved)) continue;
      try {
        const stat = await fsp.stat(target);
        if (isSequenceDir && e.isDirectory()) {
          if (now - stat.mtimeMs > sequenceTtl) {
            await fsp.rm(target, { recursive: true, force: true });
            removed++;
          }
        } else if (e.isFile()) {
          if (now - stat.mtimeMs > ttl) {
            await fsp.unlink(target);
            removed++;
          }
        }
      } catch (err) {
        if (err.code !== 'ENOENT') console.warn('Cleanup skip:', target, err.message);
      }
    }
    return removed;
  }

  const u = await cleanDir(UPLOAD_DIR, uploadTtl);
  const s = await cleanDir(SEQUENCE_DIR, sequenceTtl, true);
  const p = await cleanDir(PREVIEW_DIR, previewTtl);
  if (u + s + p > 0) {
    console.log(`[Cleanup] temp: removed ${u} uploads, ${s} sequences, ${p} previews`);
  }
}

async function cleanupLogs(protectInUse = true) {
  const inUse = new Set();
  if (protectInUse) {
    for (const job of jobs.values()) {
      if (job.logPath) inUse.add(path.resolve(job.logPath));
    }
  }
  const cutoff = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;
  try {
    const files = await fsp.readdir(LOG_DIR);
    for (const f of files) {
      const target = path.join(LOG_DIR, f);
      if (inUse.has(path.resolve(target))) continue;
      try {
        const stat = await fsp.stat(target);
        if (stat.mtimeMs < cutoff) {
          await fsp.unlink(target);
          removed++;
        }
      } catch (err) {
        if (err.code !== 'ENOENT') console.warn('Log cleanup skip:', target, err.message);
      }
    }
    if (removed > 0) console.log(`[Cleanup] logs: removed ${removed} files`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function getDirSizeMb(dirPath) {
  let total = 0;
  try {
    const walk = async (dir) => {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) await walk(full);
        else total += (await fsp.stat(full)).size;
      }
    };
    await walk(dirPath);
  } catch (e) {}
  return total / (1024 * 1024);
}

function scheduleDiskUsageCheck() {
  setInterval(async () => {
    try {
      const tempMb = await getDirSizeMb(path.join(__dirname, 'temp'));
      const logMb = await getDirSizeMb(LOG_DIR);
      if (tempMb > TEMP_MAX_SIZE_MB) {
        console.warn(`[Disk] temp 目录超过阈值: ${tempMb.toFixed(1)}MB > ${TEMP_MAX_SIZE_MB}MB`);
      }
      if (logMb > LOG_MAX_SIZE_MB) {
        console.warn(`[Disk] logs 目录超过阈值: ${logMb.toFixed(1)}MB > ${LOG_MAX_SIZE_MB}MB`);
      }
    } catch (e) {
      console.warn('Disk usage check skipped:', e.message);
    }
  }, 1000 * 60 * 60);
}

