const state = {
  options: null,
  jobs: [],
  presets: [],
  recentPaths: [],
  compare: {
    left: null,
    right: null,
  },
};

const jobForm = document.getElementById('job-form');
const previewBtn = document.getElementById('preview-btn');
const ffprobeBtn = document.getElementById('ffprobe-btn');
const presetList = document.getElementById('preset-list');
const presetNameInput = document.getElementById('preset-name');
const savePresetBtn = document.getElementById('save-preset');
const jobTableBody = document.getElementById('job-table-body');
const previewArea = document.getElementById('preview-area');
const ffprobeOutput = document.getElementById('ffprobe-output');
const rootInfo = document.getElementById('root-info');
const compareForm = document.getElementById('compare-form');
const comparePlayBtn = document.getElementById('compare-play');
const comparePauseBtn = document.getElementById('compare-pause');
const compareResetBtn = document.getElementById('compare-reset');
const videoLeft = document.getElementById('video-left');
const videoRight = document.getElementById('video-right');
const infoLeft = document.getElementById('info-left');
const infoRight = document.getElementById('info-right');
const pathOptions = document.getElementById('path-options');
const presetWebpHqBtn = document.getElementById('preset-webp-hq');
const presetWebpSmallBtn = document.getElementById('preset-webp-small');
const presetApngBtn = document.getElementById('preset-apng');
const presetGifBtn = document.getElementById('preset-gif');
const icnsForm = document.getElementById('icns-form');
const icnsResult = document.getElementById('icns-result');

init();

function init() {
  loadOptions();
  loadPresets();
  loadJobs();
  loadRecentPaths();
  setInterval(loadJobs, 4000);

  jobForm.addEventListener('submit', handleQueueSubmit);
  previewBtn.addEventListener('click', handlePreview);
  ffprobeBtn.addEventListener('click', handleFfprobe);
  savePresetBtn.addEventListener('click', handleSavePreset);
  if (compareForm) {
    compareForm.addEventListener('submit', handleCompareSubmit);
    comparePlayBtn.addEventListener('click', playBoth);
    comparePauseBtn.addEventListener('click', pauseBoth);
    compareResetBtn.addEventListener('click', resetBoth);
  }

  // 文件选择器
  setupFileSelectors();

  // ICNS 转换
  if (icnsForm) {
    icnsForm.addEventListener('submit', handleIcnsConvert);
  }

  // PNG 文件选择器
  const fileInputPng = document.getElementById('file-input-png');
  const pngPathField = document.getElementById('png-path');
  if (fileInputPng && pngPathField) {
    document.querySelectorAll('.file-select-btn[data-target="png-path"]').forEach((btn) => {
      btn.addEventListener('click', () => fileInputPng.click());
    });
    fileInputPng.addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        handleFileUpload(e.target.files[0], pngPathField);
      }
    });
  }

  // 动图预设
  presetWebpHqBtn?.addEventListener('click', () =>
    applyAnimatedPreset('webp-hq')
  );
  presetWebpSmallBtn?.addEventListener('click', () =>
    applyAnimatedPreset('webp-small')
  );
  presetApngBtn?.addEventListener('click', () => applyAnimatedPreset('apng'));
  presetGifBtn?.addEventListener('click', () => applyAnimatedPreset('gif'));
}

async function loadOptions() {
  try {
    const res = await fetchJSON('/api/options');
    state.options = res.data;
    populateSelect('video-codec', res.data.videoCodecs);
    populateSelect('audio-codec', res.data.audioCodecs);
    populateSelect('pixel-format', res.data.pixelFormats);
    rootInfo.textContent = `允许访问根目录：${res.data.rootDir}`;
  } catch (error) {
    notify(error.message, true);
  }
}

async function loadPresets() {
  try {
    const res = await fetchJSON('/api/presets');
    state.presets = res.data;
    renderPresets();
  } catch (error) {
    notify(error.message, true);
  }
}

async function loadJobs() {
  try {
    const res = await fetchJSON('/api/jobs');
    state.jobs = res.data;
    renderJobs();
  } catch (error) {
    notify(error.message, true);
  }
}

function loadRecentPaths() {
  try {
    const raw = localStorage.getItem('ffmpegRecentPaths');
    if (!raw) return;
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      state.recentPaths = list;
      renderPathOptions();
    }
  } catch {
    // ignore
  }
}

function saveRecentPaths() {
  try {
    localStorage.setItem(
      'ffmpegRecentPaths',
      JSON.stringify(state.recentPaths.slice(0, 30))
    );
  } catch {
    // ignore
  }
}

function rememberPath(path) {
  if (!path) return;
  const p = path.trim();
  if (!p) return;
  state.recentPaths = [p, ...state.recentPaths.filter((x) => x !== p)].slice(
    0,
    50
  );
  saveRecentPaths();
  renderPathOptions();
}

function renderPathOptions() {
  if (!pathOptions) return;
  pathOptions.innerHTML = '';
  state.recentPaths.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p;
    pathOptions.appendChild(opt);
  });
}

function populateSelect(id, values) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = '';
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

async function handleQueueSubmit(event) {
  event.preventDefault();
  try {
    const payload = collectFormData();
    await fetchJSON('/api/queue', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    notify('任务已加入队列');
    jobForm.reset();
    loadJobs();
  } catch (error) {
    notify(error.message, true);
  }
}

async function handlePreview() {
  try {
    const inputPath = jobForm.inputPath.value.trim();
    if (!inputPath) {
      return notify('请填写输入路径', true);
    }
     rememberPath(inputPath);
    const seek = prompt('预览起始位置 (秒)', '0') ?? '0';
    const duration = prompt('预览时长 (秒)', '2') ?? '2';
    const res = await fetchJSON('/api/preview', {
      method: 'POST',
      body: JSON.stringify({
        inputPath,
        seek: Number(seek),
        duration: Number(duration),
        scale: '640:-1',
        pixelFormat: jobForm.pixelFormat.value,
      }),
    });
    renderPreview(res.data.url);
    notify('预览已生成');
  } catch (error) {
    notify(error.message, true);
  }
}

async function handleFfprobe() {
  const inputPath = jobForm.inputPath.value.trim();
  if (!inputPath) {
    return notify('请填写输入路径', true);
  }
  try {
    const params = new URLSearchParams({ input: inputPath });
    const res = await fetchJSON(`/api/ffprobe?${params.toString()}`);
    ffprobeOutput.textContent = JSON.stringify(res.data, null, 2);
  } catch (error) {
    notify(error.message, true);
  }
}

function collectFormData() {
  const formData = new FormData(jobForm);
  const inputPath = formData.get('inputPath')?.trim();
  if (!inputPath) throw new Error('输入路径必填');
  rememberPath(inputPath);

  const payload = {
    inputPath,
    outputDir: formData.get('outputDir')?.trim() || undefined,
    outputName: formData.get('outputName')?.trim() || undefined,
    container: formData.get('container') || 'webm',
    params: {},
  };

  const fieldsMap = {
    videoCodec: 'videoCodec',
    pixelFormat: 'pixelFormat',
    crf: 'crf',
    videoBitrate: 'videoBitrate',
    frameRate: 'frameRate',
    width: 'width',
    height: 'height',
    extraFilters: 'extraFilters',
    audioCodec: 'audioCodec',
    audioBitrate: 'audioBitrate',
  };

  Object.entries(fieldsMap).forEach(([formKey, paramKey]) => {
    const value = formData.get(formKey);
    if (value) payload.params[paramKey] = value;
  });

  const customArgs = formData
    .get('customArgs')
    ?.split(',')
    .map((arg) => arg.trim())
    .filter(Boolean);
  if (customArgs?.length) {
    payload.params.customArgs = customArgs;
  }

  return payload;
}

function renderPreview(url) {
  previewArea.innerHTML = '';
  const ext = url.split('.').pop();
  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
    const img = document.createElement('img');
    img.src = url;
    previewArea.appendChild(img);
  } else {
    const video = document.createElement('video');
    video.controls = true;
    video.src = url;
    previewArea.appendChild(video);
  }
}

function renderPresets() {
  presetList.innerHTML = '';
  if (!state.presets.length) {
    const empty = document.createElement('li');
    empty.textContent = '暂无预设';
    presetList.appendChild(empty);
    return;
  }

  state.presets.forEach((preset) => {
    const li = document.createElement('li');
    const title = document.createElement('span');
    title.textContent = preset.name;
    const actions = document.createElement('div');

    const applyBtn = document.createElement('button');
    applyBtn.textContent = '应用';
    applyBtn.addEventListener('click', () => applyPreset(preset));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除';
    deleteBtn.addEventListener('click', () => deletePreset(preset.name));

    actions.appendChild(applyBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(title);
    li.appendChild(actions);
    presetList.appendChild(li);
  });
}

async function handleSavePreset() {
  try {
    const name = presetNameInput.value.trim();
    if (!name) return notify('请输入预设名称', true);
    const params = collectFormData();
    await fetchJSON('/api/presets', {
      method: 'POST',
      body: JSON.stringify({ name, params }),
    });
    presetNameInput.value = '';
    notify('预设已保存');
    loadPresets();
  } catch (error) {
    notify(error.message, true);
  }
}

function applyPreset(preset) {
  const payload = preset.params;

  jobForm.inputPath.value = payload.inputPath || '';
  jobForm.outputDir.value = payload.outputDir || '';
  jobForm.outputName.value = payload.outputName || '';
  jobForm.container.value = payload.container || 'webm';

  Object.entries(payload.params || {}).forEach(([key, value]) => {
    if (jobForm[key]) {
      jobForm[key].value = value;
    }
  });

  if (payload.params?.customArgs?.length) {
    jobForm.customArgs.value = payload.params.customArgs.join(', ');
  } else {
    jobForm.customArgs.value = '';
  }
}

async function deletePreset(name) {
  try {
    await fetchJSON(`/api/presets/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    notify('预设已删除');
    loadPresets();
  } catch (error) {
    notify(error.message, true);
  }
}

async function handleCompareSubmit(event) {
  event.preventDefault();
  try {
    const formData = new FormData(compareForm);
    const leftPath = formData.get('compareA')?.trim();
    const rightPath = formData.get('compareB')?.trim();
    if (!leftPath || !rightPath) {
      return notify('请填写两个视频路径', true);
    }
    rememberPath(leftPath);
    rememberPath(rightPath);

    const [leftInfo, rightInfo] = await Promise.all([
      fetchFileInfo(leftPath),
      fetchFileInfo(rightPath),
    ]);
    state.compare.left = leftInfo;
    state.compare.right = rightInfo;
    renderCompareInfo('left', leftInfo);
    renderCompareInfo('right', rightInfo);

    videoLeft.src = buildStreamUrl(leftInfo.path);
    videoRight.src = buildStreamUrl(rightInfo.path);
    videoLeft.load();
    videoRight.load();
    notify('对比视频已加载');
    playBoth();
  } catch (error) {
    notify(error.message, true);
  }
}

function playBoth() {
  videoLeft?.play?.();
  videoRight?.play?.();
}

function pauseBoth() {
  videoLeft?.pause?.();
  videoRight?.pause?.();
}

function resetBoth() {
  if (videoLeft) videoLeft.currentTime = 0;
  if (videoRight) videoRight.currentTime = 0;
  pauseBoth();
}

async function fetchFileInfo(path) {
  const params = new URLSearchParams({ path });
  const res = await fetchJSON(`/api/file-info?${params.toString()}`);
  return res.data;
}

function buildStreamUrl(path) {
  return `/api/video-stream?path=${encodeURIComponent(path)}&ts=${Date.now()}`;
}

// 动图预设：快速配置 WebP / APNG / GIF 导出参数
function applyAnimatedPreset(type) {
  if (!jobForm) return;
  const form = jobForm;

  // 保留输入/输出目录，只改编码相关字段
  switch (type) {
    case 'webp-hq': {
      form.container.value = 'webp';
      if (form.videoCodec) form.videoCodec.value = 'libwebp';
      if (form.pixelFormat) form.pixelFormat.value = 'yuva420p';
      if (form.crf) form.crf.value = '18';
      if (form.videoBitrate) form.videoBitrate.value = '';
      if (form.frameRate) form.frameRate.value = '24';
      if (form.width) form.width.value = '';
      if (form.height) form.height.value = '';
      if (form.extraFilters) form.extraFilters.value = '';
      if (form.audioCodec) form.audioCodec.value = 'none';
      if (form.audioBitrate) form.audioBitrate.value = '';
      notify('已应用 WebP 高质量预设');
      break;
    }
    case 'webp-small': {
      form.container.value = 'webp';
      if (form.videoCodec) form.videoCodec.value = 'libwebp';
      if (form.pixelFormat) form.pixelFormat.value = 'yuv420p';
      if (form.crf) form.crf.value = '30';
      if (form.videoBitrate) form.videoBitrate.value = '';
      if (form.frameRate) form.frameRate.value = '15';
      if (form.width) form.width.value = '640';
      if (form.height) form.height.value = '';
      if (form.extraFilters) form.extraFilters.value = '';
      if (form.audioCodec) form.audioCodec.value = 'none';
      if (form.audioBitrate) form.audioBitrate.value = '';
      notify('已应用 WebP 小体积预设');
      break;
    }
    case 'apng': {
      form.container.value = 'apng';
      if (form.videoCodec) form.videoCodec.value = '';
      if (form.pixelFormat) form.pixelFormat.value = 'rgba';
      if (form.crf) form.crf.value = '';
      if (form.videoBitrate) form.videoBitrate.value = '';
      if (form.frameRate) form.frameRate.value = '24';
      if (form.width) form.width.value = '';
      if (form.height) form.height.value = '';
      if (form.extraFilters) form.extraFilters.value = '';
      if (form.audioCodec) form.audioCodec.value = 'none';
      if (form.audioBitrate) form.audioBitrate.value = '';
      notify('已应用 APNG 预设');
      break;
    }
    case 'gif': {
      form.container.value = 'gif';
      if (form.videoCodec) form.videoCodec.value = '';
      if (form.pixelFormat) form.pixelFormat.value = 'yuv420p';
      if (form.crf) form.crf.value = '';
      if (form.videoBitrate) form.videoBitrate.value = '';
      if (form.frameRate) form.frameRate.value = '15';
      if (form.width) form.width.value = '640';
      if (form.height) form.height.value = '';
      if (form.extraFilters) form.extraFilters.value = '';
      if (form.audioCodec) form.audioCodec.value = 'none';
      if (form.audioBitrate) form.audioBitrate.value = '';
      notify('已应用 GIF 预设');
      break;
    }
    default:
      break;
  }
}

function renderCompareInfo(side, info) {
  const target = side === 'left' ? infoLeft : infoRight;
  if (!info) {
    target.innerHTML = '<li>未加载</li>';
    return;
  }
  const videoStream =
    info.probe?.streams?.find((s) => s.codec_type === 'video') || {};
  const duration = info.probe?.format?.duration;
  const bitrate = info.probe?.format?.bit_rate;
  const entries = [
    ['路径', info.path],
    ['大小', formatBytes(info.size)],
    ['时长', formatDuration(duration)],
    ['总码率', bitrate ? `${(Number(bitrate) / 1000).toFixed(1)} kbps` : '-'],
    [
      '视频编码',
      videoStream.codec_name
        ? `${videoStream.codec_name} / ${videoStream.codec_long_name || ''}`
        : '-',
    ],
    [
      '分辨率',
      videoStream.width
        ? `${videoStream.width} × ${videoStream.height || '?'}`
        : '-',
    ],
    [
      '帧率',
      videoStream.avg_frame_rate
        ? `${formatFrameRate(videoStream.avg_frame_rate)} fps`
        : '-',
    ],
  ];
  target.innerHTML = entries
    .map(([label, value]) => `<li><strong>${label}：</strong>${value}</li>`)
    .join('');
}

function formatBytes(size) {
  if (!Number.isFinite(size)) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDuration(duration) {
  if (!duration) return '-';
  const sec = Number(duration);
  if (!Number.isFinite(sec)) return '-';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  const ms = Math.round((sec % 1) * 1000)
    .toString()
    .padStart(3, '0');
  return `${minutes}:${seconds}.${ms}`;
}

function formatFrameRate(value) {
  if (!value) return '-';
  if (value.includes('/')) {
    const [num, den] = value.split('/').map(Number);
    if (den && num) return (num / den).toFixed(2);
  }
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '-';
}

function renderJobs() {
  jobTableBody.innerHTML = '';
  if (!state.jobs.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = '暂无任务';
    tr.appendChild(td);
    jobTableBody.appendChild(tr);
    return;
  }

  state.jobs
    .slice()
    .reverse()
    .forEach((job) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${job.id.slice(0, 8)}</td>
        <td><span class="status status-${job.status}">${job.status}</span></td>
        <td>${job.progressLabel || job.progress || '-'}</td>
        <td>
          <div class="job-path">${job.outputPath}</div>
          ${
            job.logPath
              ? `<a href="/${job.logPath}" target="_blank" rel="noopener">日志</a>`
              : ''
          }
        </td>
        <td></td>
      `;
      const actionTd = tr.querySelector('td:last-child');
      if (['queued', 'running'].includes(job.status)) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('click', () => cancelJob(job.id));
        actionTd.appendChild(cancelBtn);
      } else {
        actionTd.textContent = '-';
      }
      jobTableBody.appendChild(tr);
    });
}

async function cancelJob(id) {
  try {
    await fetchJSON(`/api/jobs/${id}/cancel`, { method: 'POST' });
    notify('任务已取消');
    loadJobs();
  } catch (error) {
    notify(error.message, true);
  }
}

function notify(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 200);
  }, 2600);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

// Toast styles
const style = document.createElement('style');
style.textContent = `
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(255,255,255,0.15);
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity .2s ease, transform .2s ease;
  backdrop-filter: blur(10px);
}
.toast.visible {
  opacity: 1;
  transform: translateY(0);
}
.toast-error {
  background: rgba(244, 67, 54, 0.2);
}
`;
document.head.appendChild(style);

// 文件选择器功能
function setupFileSelectors() {
  const fileInputMain = document.getElementById('file-input-main');
  const fileInputCompareA = document.getElementById('file-input-compare-a');
  const fileInputCompareB = document.getElementById('file-input-compare-b');
  const inputPathField = document.getElementById('input-path');
  const compareAPathField = document.getElementById('compare-a-path');
  const compareBPathField = document.getElementById('compare-b-path');

  // 主表单文件选择
  document.querySelectorAll('.file-select-btn[data-target="input-path"]').forEach((btn) => {
    btn.addEventListener('click', () => fileInputMain?.click());
  });
  fileInputMain?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0], inputPathField);
    }
  });

  // 对比 A 文件选择
  document.querySelectorAll('.file-select-btn[data-target="compare-a-path"]').forEach((btn) => {
    btn.addEventListener('click', () => fileInputCompareA?.click());
  });
  fileInputCompareA?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0], compareAPathField);
    }
  });

  // 对比 B 文件选择
  document.querySelectorAll('.file-select-btn[data-target="compare-b-path"]').forEach((btn) => {
    btn.addEventListener('click', () => fileInputCompareB?.click());
  });
  fileInputCompareB?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0], compareBPathField);
    }
  });
}

async function handleFileUpload(file, targetInput) {
  try {
    notify('正在上传文件...', false);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || '上传失败');
    }

    if (targetInput) {
      targetInput.value = data.data.path;
      rememberPath(data.data.path);
      notify(`文件已上传: ${data.data.name}`);
    }
  } catch (error) {
    notify(error.message, true);
  }
}

async function handleIcnsConvert(event) {
  event.preventDefault();
  try {
    const formData = new FormData(icnsForm);
    const pngPath = formData.get('pngPath')?.trim();
    const outputName = formData.get('outputName')?.trim();

    if (!pngPath) {
      return notify('请填写 PNG 文件路径', true);
    }

    rememberPath(pngPath);
    notify('正在转换 ICNS，请稍候...', false);

    const res = await fetchJSON('/api/convert-to-icns', {
      method: 'POST',
      body: JSON.stringify({ pngPath, outputName }),
    });

    icnsResult.innerHTML = `
      <div class="icns-success">
        <p><strong>✅ 转换成功！</strong></p>
        <p>输出文件：<code>${res.data.path}</code></p>
        <p>文件名：${res.data.name}</p>
      </div>
    `;
    notify('ICNS 转换完成');
  } catch (error) {
    icnsResult.innerHTML = `
      <div class="icns-error">
        <p><strong>❌ 转换失败</strong></p>
        <p>${error.message}</p>
      </div>
    `;
    notify(error.message, true);
  }
}

