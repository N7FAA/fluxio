/**
 * Fluxio - 按 product-spec-final.md 实现
 * 路由：/fluxio, /fluxio/tasks/:taskId, /fluxio/tasks/:taskId/files/:fileId
 */

(function () {
  const BASE = '/fluxio';
  const LIMITS = {
    image: { maxFiles: 30, maxTotalMB: 200, maxFileMB: 200 },
    motion: { maxFiles: 10, maxTotalMB: 200, maxFileMB: 200 },
    video: { maxFiles: 10, maxTotalMB: 200, maxFileMB: 200 },
  };

  const TAB_CONFIG = {
    image: {
      label: '图片',
      hintFormat: '支持 PNG、JPG、JPEG、WEBP 格式，单文件不超过 200MB',
      accept: 'image/png,image/jpeg,image/webp',
      formats: [
        { value: 'webp', label: 'WEBP' },
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
      ],
      hasFramerate: false,
    },
    motion: {
      label: '动态图像',
      hintFormat: '支持 GIF、APNG、WEBP、MP4、MOV、WEBM、ZIP 序列帧，单文件不超过 200MB',
      accept: 'image/gif,image/apng,image/webp,video/mp4,video/quicktime,video/webm,.zip,application/zip',
      formats: [
        { value: 'webp', label: 'WEBP' },
        { value: 'apng', label: 'APNG' },
        { value: 'gif', label: 'GIF' },
      ],
      hasFramerate: true,
    },
    video: {
      label: '视频',
      hintFormat: '支持 GIF、APNG、WEBP、MP4、MOV、WEBM、ZIP 序列帧，单文件不超过 200MB',
      accept: 'image/gif,image/apng,image/webp,video/mp4,video/quicktime,video/webm,.zip,application/zip',
      formats: [
        { value: 'webm', label: 'WEBM' },
        { value: 'mp4', label: 'MP4' },
      ],
      hasFramerate: true,
    },
  };

  /* 5 档质量：0%/25%/50%/75%/100%，仅透出体积优先/推荐/清晰优先 */
  const QUALITY_OPTIONS = [
    { value: 'size', crf: 38, label: '体积优先' },
    { value: 'size_small', crf: 34, label: '' },
    { value: 'recommended', crf: 30, label: '推荐' },
    { value: 'quality_small', crf: 26, label: '' },
    { value: 'quality', crf: 23, label: '清晰优先' },
  ];

  const RESOLUTION_OPTIONS = [
    { value: 'original', label: '原始' },
    { value: '0.75', label: '0.75x' },
    { value: '0.5', label: '0.5x' },
  ];

  const FRAMERATE_OPTIONS = [
    { value: 'original', label: '原始' },
    { value: '30', label: '30' },
    { value: '24', label: '24' },
  ];

  let state = {
    currentTab: 'image',
    files: [],
    jobs: new Map(),
    pollTimer: null,
    view: 'home',
    currentTaskId: null,
    tasks: {},
    qualityIndex: 2,
    format: 'webp',
    resolution: 'original',
    framerate: 'original',
  };

  function getRoute() {
    const p = window.location.pathname.replace(/\/$/, '') || '/fluxio';
    if (!p.startsWith('/fluxio')) return { page: 'home' };
    const rest = p.slice('/fluxio'.length).replace(/^\//, '');
    if (!rest) return { page: 'home' };
    const m1 = rest.match(/^tasks\/([^/]+)$/);
    if (m1) return { page: 'task-list', taskId: m1[1] };
    const m2 = rest.match(/^tasks\/([^/]+)\/files\/([^/]+)$/);
    if (m2) return { page: 'file-detail', taskId: m2[1], fileId: m2[2] };
    return { page: 'home' };
  }

  function navigateTo(page, taskId, fileId) {
    let p = BASE;
    if (page === 'task-list' && taskId) p = `${BASE}/tasks/${taskId}`;
    else if (page === 'file-detail' && taskId && fileId) p = `${BASE}/tasks/${taskId}/files/${fileId}`;
    if (window.location.pathname !== p) {
      window.history.pushState({}, '', p);
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDuration(seconds) {
    if (seconds == null || typeof seconds !== 'number' || seconds < 0) return '-';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s} 秒`;
  }

  function formatFrameRate(value) {
    if (!value) return '-';
    if (typeof value === 'string' && value.includes('/')) {
      const [num, den] = value.split('/').map(Number);
      if (den && num) return (num / den).toFixed(2) + ' fps';
    }
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) + ' fps' : '-';
  }

  async function fetchFileInfo(filePath) {
    try {
      const res = await fetch(`/api/file-info?path=${encodeURIComponent(filePath)}`);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  }

  function fetchJSON(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    });
  }

  function notify(msg, isError = false) {
    const el = document.createElement('div');
    el.className = 'fluxio-message fluxio-message--' + (isError ? 'error' : 'success');
    el.innerHTML = '<span class="fluxio-message-icon">' + (isError ? '✕' : '✓') + '</span><span>' + escapeHtml(msg) + '</span>';
    el.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:9999;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function showError(msg) {
    notify(msg, true);
  }

  function hideError() {}

  function showPage(view, taskId, fileId) {
    state.view = view;
    document.querySelectorAll('[data-page]').forEach((el) => {
      el.hidden = el.dataset.page !== view;
    });
    const main = document.querySelector('.fluxio');
    const chrome = document.querySelector('[data-chrome]');
    if (main) {
      main.dataset.view = view || '';
      main.classList.toggle('fluxio--wide', view === 'output-settings');
      main.classList.toggle('fluxio--detail', view === 'file-detail');
    }
    if (chrome) chrome.classList.toggle('fluxio-chrome--hidden', ['output-settings', 'task-list', 'task-error', 'file-detail'].includes(view));
    if (view === 'output-settings') {
      updateOutputOptionsForTab();
      renderFileGrid();
    }
    if (view === 'task-list') {
      state.currentTaskId = taskId || state.currentTaskId;
      renderResults();
    }
    if (view === 'task-error') {
      state.currentTaskId = null;
    }
    if (view === 'file-detail') {
      state.currentTaskId = taskId || state.currentTaskId;
      renderFileDetail(taskId, fileId);
    }
  }

  function goHome() {
    const fromOutputSettings = state.view === 'output-settings';
    const sourceTab = !fromOutputSettings && (state.currentTaskId && state.tasks[state.currentTaskId]
      ? state.tasks[state.currentTaskId].sourceTab
      : (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('fluxio_current_task_source_tab')));
    state.files = [];
    state.jobs.clear();
    state.currentTaskId = null;
    stopPolling();
    hideError();
    if (sourceTab) {
      const tabMap = { image: 'image', animated: 'motion', video: 'video' };
      state.currentTab = tabMap[sourceTab] || 'image';
      const tabs = document.querySelectorAll('.fluxio-tab');
      const hintFormatEl = document.querySelector('[data-hint-format]');
      const fileInput = document.querySelector('[data-file-input]');
      tabs.forEach((t) => {
        t.classList.toggle('fluxio-tab--active', t.dataset.tab === state.currentTab);
      });
      const cfg = TAB_CONFIG[state.currentTab];
      if (hintFormatEl) hintFormatEl.textContent = cfg?.hintFormat || '';
      if (fileInput) fileInput.accept = cfg?.accept || '';
    }
    navigateTo('home');
    showPage('home');
    updateOutputOptionsForTab();
  }

  function renderOptionGroup(container, options, name, selected) {
    if (!container) return;
    const val = options.some((o) => o.value === selected) ? selected : (options[0]?.value || '');
    if (name === 'format') state.format = val;
    else if (name === 'resolution') state.resolution = val;
    else if (name === 'framerate') state.framerate = val;
    container.innerHTML = options.map((opt) => `
      <label class="fluxio-option-item">
        <input type="radio" name="${name}" value="${escapeHtml(opt.value)}" ${opt.value === val ? 'checked' : ''}>
        <span>${escapeHtml(opt.label)}</span>
      </label>
    `).join('');
    container.querySelectorAll('input').forEach((radio) => {
      radio.addEventListener('change', () => {
        state[name] = radio.value;
      });
    });
  }

  function updateOutputOptionsForTab() {
    const cfg = TAB_CONFIG[state.currentTab];
    const formatOpts = document.querySelector('[data-format-options]');
    const framerateWrap = document.querySelector('[data-framerate-wrap]');
    const resolutionOpts = document.querySelector('[data-resolution-options]');

    if (formatOpts && cfg?.formats?.length) {
      renderOptionGroup(formatOpts, cfg.formats, 'format', state.format);
    }
    if (framerateWrap) {
      framerateWrap.hidden = !cfg?.hasFramerate;
      if (cfg?.hasFramerate) {
        const frOpts = framerateWrap.querySelector('[data-framerate-options]');
        if (frOpts) renderOptionGroup(frOpts, FRAMERATE_OPTIONS, 'framerate', state.framerate);
      }
    }
    if (resolutionOpts) {
      renderOptionGroup(resolutionOpts, RESOLUTION_OPTIONS, 'resolution', state.resolution);
    }
    updateQualitySliderUI();
  }

  function updateQualitySliderUI() {
    const track = document.querySelector('[data-quality-track]');
    const fill = document.querySelector('[data-quality-fill]');
    const thumb = document.querySelector('[data-quality-thumb]');
    if (!track || !fill || !thumb) return;
    const pct = (state.qualityIndex / 4) * 100;
    fill.style.width = pct + '%';
    thumb.style.left = pct + '%';
  }

  function initQualitySlider() {
    const track = document.querySelector('[data-quality-track]');
    const fill = document.querySelector('[data-quality-fill]');
    const thumb = document.querySelector('[data-quality-thumb]');
    if (!track || !fill || !thumb) return;

    function setFromPosition(clientX) {
      const rect = track.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      const idx = Math.round(pct * 4);
      state.qualityIndex = idx;
      updateQualitySliderUI();
    }

    track.addEventListener('click', (e) => {
      if (e.target === thumb) return;
      setFromPosition(e.clientX);
    });

    let dragging = false;
    thumb.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
    });
    document.addEventListener('mousemove', (e) => {
      if (dragging) setFromPosition(e.clientX);
    });
    document.addEventListener('mouseup', () => { dragging = false; });

    updateQualitySliderUI();
  }

  function getQualityValue() {
    return QUALITY_OPTIONS[state.qualityIndex]?.value || 'recommended';
  }

  function getQualityCrf() {
    return QUALITY_OPTIONS[state.qualityIndex]?.crf ?? 30;
  }

  function getPreviewUrl(file) {
    if (file.isSequence) return null;
    const name = file.path.split(/[/\\]/).pop();
    return name ? '/uploads/' + encodeURIComponent(name) : null;
  }

  function renderFileGrid() {
    const grid = document.querySelector('[data-file-grid]');
    if (!grid) return;

    grid.innerHTML = state.files
      .map((f, i) => {
        const previewUrl = getPreviewUrl(f);
        const ext = (f.name || '').toLowerCase().split('.').pop();
        const isVideo = ['mp4', 'webm', 'mov', 'gif', 'webp', 'apng'].includes(ext);
        const previewHtml = previewUrl
          ? isVideo
            ? `<video class="fluxio-file-card-preview" src="${previewUrl}" muted playsinline></video>`
            : `<img class="fluxio-file-card-preview" src="${previewUrl}" alt="">`
          : `<div class="fluxio-file-card-placeholder"></div>`;
        const name = safeDisplayName(f.name);
        const lastDot = name.lastIndexOf('.');
        const nameBase = lastDot > 0 ? name.slice(0, lastDot) : name;
        const nameExt = lastDot > 0 ? name.slice(lastDot) : '';
        const nameHtml = nameExt
          ? `<span class="fluxio-file-card-name-base">${escapeHtml(nameBase)}</span><span class="fluxio-file-card-name-ext">${escapeHtml(nameExt)}</span>`
          : `<span class="fluxio-file-card-name-base">${escapeHtml(name)}</span>`;
        return `
      <div class="fluxio-file-card" data-file-index="${i}">
        <button type="button" class="fluxio-file-card-delete" data-delete="${i}" aria-label="删除">×</button>
        <div class="fluxio-file-card-preview-wrap">${previewHtml}</div>
        <div class="fluxio-file-card-name">${nameHtml}</div>
      </div>
    `;
      })
      .join('');

    grid.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const i = parseInt(btn.dataset.delete, 10);
        state.files.splice(i, 1);
        hideError();
        if (state.files.length === 0) {
          goHome();
        } else {
          renderFileGrid();
          updateConvertButton();
        }
        refreshTabUI();
      });
    });

    updateConvertButton();
  }

  /* W-022 清空后停留输出设置页，不跳转主页 */
  function clearAllFiles() {
    state.files = [];
    renderFileGrid();
    updateConvertButton();
    refreshTabUI();
  }

  function escapeHtml(s) {
    if (s == null || s === '') return '';
    const str = String(s);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function safeDisplayName(name) {
    if (name == null || name === '') return '未知';
    const str = String(name);
    try {
      if (/[\x00-\x1f\x7f]/.test(str) || /�/.test(str)) {
        return str.replace(/[\x00-\x1f\x7f�]/g, '') || '未知';
      }
      return str;
    } catch {
      return '未知';
    }
  }

  function updateConvertButton() {
    document.querySelectorAll('[data-convert-btn], [data-convert-btn-panel]').forEach((btn) => {
      btn.disabled = state.files.length === 0;
    });
  }

  function getCompressionRatio(originalBytes, outputBytes) {
    if (!originalBytes || originalBytes <= 0) return null;
    if (outputBytes >= originalBytes) return null;
    const pct = Math.round((1 - outputBytes / originalBytes) * 100);
    return pct > 0 ? pct : null;
  }

  function getPreviewType(outputName) {
    const ext = (outputName || '').toLowerCase().split('.').pop();
    if (['gif', 'apng'].includes(ext)) return 'motion';
    if (['mp4', 'webm'].includes(ext)) return 'video';
    return 'image';
  }

  function renderResults() {
    const list = document.querySelector('[data-result-list]');
    const placeholder = document.querySelector('[data-results-placeholder]');
    const statusEl = document.querySelector('[data-results-status]');
    const downloadAllBtn = document.querySelector('[data-download-all-btn]');

    if (!list || !placeholder) return;

    const task = state.currentTaskId && state.tasks[state.currentTaskId];
    const fileToJob = task?.fileToJob || {};
    const taskFiles = task?.files || [];
    const jobEntries = taskFiles.map((file, i) => {
      const fileId = `file_${i}`;
      const jobId = fileToJob[fileId];
      return jobId ? [jobId, state.jobs.get(jobId), file, fileId] : null;
    }).filter(Boolean);

    const items = jobEntries.map(([jobId, job, file, fileId]) => {
      if (!job) return '';
      const fileInfo = file || state.files.find((x) => x.path === job.inputPath) || { name: '未知', size: 0 };
      const displayName = fileInfo.name || (job.inputPath ? job.inputPath.split(/[/\\]/).pop() : null) || '未知';
      const outputName = job.outputPath ? job.outputPath.split(/[/\\]/).pop() : '';
      const status = job.status;
      /* T-011 T-012 进度限制在 0%~100% */
      const progress = Math.min(100, Math.max(0, Number(job.progress) || 0));

      if (status === 'success') {
        const downloadUrl = '/uploads/' + encodeURIComponent(outputName);
        const originalBytes = fileInfo.size || 0;
        const outputBytes = job.outputSize || 0;
        const ratio = getCompressionRatio(originalBytes, outputBytes);
        const sizeText = originalBytes > 0 && outputBytes > 0
          ? (ratio !== null
            ? `${formatSize(originalBytes)} → ${formatSize(outputBytes)}，压缩 ${ratio}%`
            : `${formatSize(originalBytes)} → ${formatSize(outputBytes)}`)
          : outputBytes > 0
            ? `输出 ${formatSize(outputBytes)}`
            : '转换完成';
        const previewType = getPreviewType(outputName);
        const previewHtml =
          previewType === 'image'
            ? `<img class="fluxio-result-preview fluxio-result-preview--img" src="${downloadUrl}" alt="${escapeHtml(outputName)}">`
            : previewType === 'motion'
              ? `<img class="fluxio-result-preview fluxio-result-preview--poster" src="${downloadUrl}" alt="${escapeHtml(outputName)}">`
              : `<video class="fluxio-result-preview fluxio-result-preview--poster" src="${downloadUrl}" preload="metadata" muted playsinline></video>`;
        return `
          <li class="fluxio-result-item fluxio-result-item--success">
            <div class="fluxio-result-preview-wrap">${previewHtml}</div>
            <div class="fluxio-result-item-info">
              <div class="fluxio-result-item-name">${escapeHtml(safeDisplayName(outputName))}</div>
              <div class="fluxio-result-item-size">
                <span class="fluxio-result-success-icon" aria-hidden="true">✓</span>
                <span>${sizeText}</span>
              </div>
            </div>
            <div class="fluxio-result-item-actions">
              <button type="button" class="fluxio-result-link fluxio-result-view" data-task-id="${state.currentTaskId}" data-file-id="${fileId}">查看</button>
              <a class="fluxio-result-link" href="${downloadUrl}" download>下载</a>
            </div>
          </li>
        `;
      }

      if (status === 'running') {
        const previewUrl = getPreviewUrl(fileInfo);
        const ext = (fileInfo.name || '').toLowerCase().split('.').pop();
        const isVideo = ['mp4', 'webm', 'mov', 'gif', 'webp', 'apng'].includes(ext);
        const previewHtml = previewUrl
          ? isVideo
            ? `<video class="fluxio-result-preview fluxio-result-preview--poster" src="${previewUrl}" preload="metadata" muted playsinline></video>`
            : `<img class="fluxio-result-preview fluxio-result-preview--poster" src="${previewUrl}" alt="">`
          : '<div class="fluxio-file-card-placeholder"></div>';
        const ringRadius = 18;
        const circumference = 2 * Math.PI * ringRadius;
        const dashOffset = circumference - (progress / 100) * circumference;
        const taskName = outputName || displayName;
        return `
          <li class="fluxio-result-item fluxio-result-item--converting">
            <div class="fluxio-result-preview-wrap">${previewHtml}</div>
            <div class="fluxio-result-item-info">
              <div class="fluxio-result-item-name">${escapeHtml(safeDisplayName(taskName))}</div>
              <div class="fluxio-result-item-meta">转换中</div>
            </div>
            <div class="fluxio-progress-ring" title="${progress}%">
              <svg viewBox="0 0 40 40">
                <circle class="fluxio-progress-ring-track" cx="20" cy="20" r="${ringRadius}"/>
                <circle class="fluxio-progress-ring-fill" cx="20" cy="20" r="${ringRadius}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"/>
              </svg>
              <span class="fluxio-progress-ring-text">${progress}%</span>
            </div>
          </li>
        `;
      }

      if (status === 'queued') {
        const previewUrl = getPreviewUrl(fileInfo);
        const ext = (fileInfo.name || '').toLowerCase().split('.').pop();
        const isVideo = ['mp4', 'webm', 'mov', 'gif', 'webp', 'apng'].includes(ext);
        const previewHtml = previewUrl
          ? isVideo
            ? `<video class="fluxio-result-preview fluxio-result-preview--poster" src="${previewUrl}" preload="metadata" muted playsinline></video>`
            : `<img class="fluxio-result-preview fluxio-result-preview--poster" src="${previewUrl}" alt="">`
          : '<div class="fluxio-file-card-placeholder"></div>';
        const taskName = outputName || displayName;
        return `
          <li class="fluxio-result-item fluxio-result-item--waiting">
            <div class="fluxio-result-preview-wrap">${previewHtml}</div>
            <div class="fluxio-result-item-info">
              <div class="fluxio-result-item-name">${escapeHtml(safeDisplayName(taskName))}</div>
              <div class="fluxio-result-item-meta">等待中</div>
            </div>
            <span class="fluxio-result-waiting-label">等待中</span>
          </li>
        `;
      }

      if (status === 'failed') {
        const taskName = outputName || displayName;
        return `
          <li class="fluxio-result-item fluxio-result-item--failed">
            <div class="fluxio-result-item-info">
              <div class="fluxio-result-item-name">${escapeHtml(safeDisplayName(taskName))}</div>
              <div class="fluxio-result-item-meta" style="color:var(--fluxio-danger)">失败: ${escapeHtml(job.error || '未知错误')}</div>
            </div>
          </li>
        `;
      }

      return '';
    });

    list.innerHTML = items.join('');
    placeholder.hidden = items.length > 0;

    const taskJobIds = Object.values(fileToJob);
    const taskJobs = taskJobIds.map((id) => state.jobs.get(id)).filter(Boolean);
    const hasRunning = taskJobs.some((j) => j.status === 'running' || j.status === 'queued');
    const successCount = taskJobs.filter((j) => j.status === 'success').length;
    const total = taskJobs.length;
    const allComplete = total > 0 && !hasRunning;

    if (statusEl) {
      const running = taskJobs.filter((j) => j.status === 'running' || j.status === 'queued');
      const completed = taskJobs.filter((j) => j.status === 'success').length;
      statusEl.hidden = total === 0;
      if (hasRunning) {
        statusEl.textContent = `正在处理中（${completed}/${total}）`;
      } else if (total > 0) {
        statusEl.textContent = `已完成（${completed}/${total}）`;
      }
    }

    /* T-006 单条任务也显示下载全部 */
    if (downloadAllBtn) {
      downloadAllBtn.disabled = !allComplete;
    }

    list.querySelectorAll('.fluxio-result-view').forEach((btn) => {
      btn.addEventListener('click', () => {
        const taskId = btn.dataset.taskId;
        const fileId = btn.dataset.fileId;
        if (taskId && fileId) navigateTo('file-detail', taskId, fileId);
        showPage('file-detail', taskId, fileId);
      });
    });
  }

  async function downloadAll() {
    const task = state.currentTaskId && state.tasks[state.currentTaskId];
    if (!task) return;
    const fileToJob = task.fileToJob || {};
    const jobIds = Object.entries(fileToJob)
      .sort(([a], [b]) => parseInt(a.replace('file_', ''), 10) - parseInt(b.replace('file_', ''), 10))
      .map(([, id]) => id)
      .filter((id) => {
        const j = state.jobs.get(id);
        return j && j.status === 'success';
      });
    if (jobIds.length < 2) return;
    for (const jobId of jobIds) {
      const job = state.jobs.get(jobId);
      if (!job?.outputPath) continue;
      const name = job.outputPath.split(/[/\\]/).pop();
      const url = '/uploads/' + encodeURIComponent(name);
      const a = document.createElement('a');
      a.href = url;
      a.download = name || 'output';
      a.click();
      await new Promise((r) => setTimeout(r, 300));
    }
    notify('已开始下载 ' + jobIds.length + ' 个文件');
  }

  async function getDimensions(inputPath) {
    try {
      const res = await fetch(`/api/ffprobe?input=${encodeURIComponent(inputPath)}`);
      const json = await res.json();
      if (!json.success || !json.data?.streams) return null;
      const video = json.data.streams.find((s) => s.width && s.height);
      return video ? { width: video.width, height: video.height } : null;
    } catch {
      return null;
    }
  }

  function buildScaleParam(resolution, dims) {
    if (resolution === 'original' || !dims) return null;
    const factor = parseFloat(resolution);
    const h = Math.round(dims.height * factor);
    return { width: -1, height: h };
  }

  async function startConvert() {
    const format = state.format || 'webp';
    const resolution = state.resolution || 'original';
    const framerate = state.framerate || 'original';
    const crf = getQualityCrf();
    const container = format;
    const fileToJob = {};

    for (let i = 0; i < state.files.length; i++) {
      const file = state.files[i];
      let scaleParam = null;
      const dims = file.isSequence && file.width && file.height
        ? { width: file.width, height: file.height }
        : await getDimensions(file.path);
      if (resolution !== 'original' && dims) {
        const scale = buildScaleParam(resolution, dims);
        if (scale) scaleParam = scale;
      }

      const params = { crf };
      if (scaleParam) params.width = scaleParam.width;
      if (scaleParam) params.height = scaleParam.height;

      if (state.currentTab === 'image') {
        if (container === 'webp') params.videoCodec = 'libwebp';
      } else if (state.currentTab === 'motion') {
        if (container === 'webp') params.videoCodec = 'libwebp';
        if (framerate !== 'original') params.frameRate = framerate;
        else if (file.isSequence) params.frameRate = '24';
      } else if (state.currentTab === 'video') {
        if (container === 'mp4') {
          params.videoCodec = 'libx264';
          params.audioCodec = file.isSequence ? 'none' : 'aac';
        } else if (container === 'webm') {
          params.videoCodec = 'libvpx-vp9';
          params.audioCodec = file.isSequence ? 'none' : 'libopus';
        }
        if (framerate !== 'original') params.frameRate = framerate;
        else if (file.isSequence) params.frameRate = '24';
      }

      const payload = file.isSequence
        ? {
            inputSequence: {
              dir: file.path,
              pattern: file.pattern || '%04d.png',
              frameCount: file.frameCount,
            },
            container,
            outputDir: undefined,
            params,
          }
        : {
            inputPath: file.path,
            container,
            outputDir: undefined,
            params,
          };

      try {
        const res = await fetchJSON('/api/queue', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.success && res.data) {
          const fileId = `file_${i}`;
          state.jobs.set(res.data.id, { ...res.data, inputPath: file.path, fileId });
          fileToJob[fileId] = res.data.id;
        }
      } catch (err) {
        notify('创建任务失败: ' + (err.message || '未知错误'), true);
      }
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const sourceTab = state.currentTab === 'motion' ? 'animated' : state.currentTab;
    state.tasks[taskId] = {
      sourceTab,
      files: [...state.files],
      fileToJob,
    };
    state.currentTaskId = taskId;
    try {
      sessionStorage.setItem('fluxio_current_task_source_tab', sourceTab);
      sessionStorage.setItem(`fluxio_task_${taskId}_source_tab`, sourceTab);
    } catch (e) {}
    navigateTo('task-list', taskId);
    showPage('task-list', taskId);
    renderResults();
    startPolling();
  }

  function startPolling() {
    if (state.pollTimer) return;
    state.pollTimer = setInterval(pollJobs, 1500);
  }

  function stopPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  async function pollJobs() {
    try {
      const res = await fetch('/api/jobs');
      const json = await res.json();
      if (!json.success || !json.data) return;

      let hasActive = false;
      for (const j of json.data) {
        if (state.jobs.has(j.id)) {
          const prev = state.jobs.get(j.id);
          state.jobs.set(j.id, { ...prev, ...j });
          if (j.status === 'running' || j.status === 'queued') hasActive = true;
        }
      }

      renderResults();
      if (!hasActive) stopPolling();
    } catch (e) {
      console.error('Poll error', e);
    }
  }

  function getVideoDuration(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      video.src = url;
    });
  }

  function isMotionFile(f) {
    const t = (f.type || '').toLowerCase();
    const name = (f.name || '').toLowerCase();
    return (
      (t.startsWith('image/') && (t.includes('gif') || t.includes('apng') || t.includes('webp'))) ||
      t.startsWith('video/') ||
      t === 'application/zip' ||
      name.endsWith('.zip')
    );
  }

  async function uploadFiles(fileList) {
    hideError();
    const all = Array.from(fileList || []);
    let files;
    if (state.currentTab === 'image') {
      files = all.filter((f) => (f.type || '').startsWith('image/'));
      if (files.length === 0 && all.length > 0) {
        showError('格式不符：当前 Tab 仅支持 PNG、JPG、WEBP 格式，请重新选择文件');
        return;
      }
    } else if (state.currentTab === 'motion' || state.currentTab === 'video') {
      files = all.filter(isMotionFile);
      if (files.length === 0 && all.length > 0) {
        showError('格式不符：当前 Tab 仅支持 GIF、APNG、WEBP、MP4、MOV、WEBM、ZIP 序列帧，请重新选择文件');
        return;
      }
    } else {
      files = all;
    }
    if (files.length === 0) return;

    const limits = LIMITS[state.currentTab] || LIMITS.image;
    const maxFileBytes = limits.maxFileMB * 1024 * 1024;
    let currentTotal = state.files.reduce((s, f) => s + (f.size || 0), 0);
    const maxTotalBytes = limits.maxTotalMB * 1024 * 1024;
    const slotsLeft = limits.maxFiles - state.files.length;

    if (files.length > slotsLeft) {
      showError(`文件数量超限：当前 Tab 最多 ${limits.maxFiles} 个文件，还可添加 ${slotsLeft} 个`);
      return;
    }

    const maxDurationSec = state.currentTab === 'motion' ? 20 : state.currentTab === 'video' ? 60 : null;

    for (const file of files) {
      const fileSize = file.size || 0;
      const isZip = (file.name || '').toLowerCase().endsWith('.zip') || (file.type || '') === 'application/zip';
      const ext = (file.name || '').toLowerCase().split('.').pop();
      const isVideoOrMotion = ['mp4', 'webm', 'mov', 'gif', 'apng', 'webp'].includes(ext);

      if (maxDurationSec && !isZip && isVideoOrMotion) {
        const duration = await getVideoDuration(file);
        if (duration != null && duration > maxDurationSec) {
          notify(`${file.name} 时长超过限制（${state.currentTab === 'motion' ? '动态图像' : '视频'} Tab 上限 ${maxDurationSec} 秒）`, true);
          continue;
        }
      }

      if (!isZip && fileSize > maxFileBytes) {
        notify(`文件过大：${file.name} 超过 ${limits.maxFileMB}MB 限制`, true);
        continue;
      }
      if (currentTotal + fileSize > maxTotalBytes) {
        showError(`总大小超限：单任务总大小不得超过 ${limits.maxTotalMB >= 1024 ? limits.maxTotalMB / 1024 + 'GB' : limits.maxTotalMB + 'MB'}`);
        return;
      }
      const apiUrl = isZip && (state.currentTab === 'motion' || state.currentTab === 'video')
        ? '/api/upload-sequence'
        : '/api/upload';

      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch(apiUrl, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const addedSize = d.isSequence ? fileSize : (d.size || 0);
          currentTotal += addedSize;
          if (d.isSequence) {
            state.files.push({
              path: d.path,
              name: d.name,
              size: fileSize,
              isSequence: true,
              frameCount: d.frameCount,
              pattern: d.pattern,
              width: d.width,
              height: d.height,
            });
          } else {
            state.files.push({
              path: d.path,
              name: d.name,
              size: d.size,
            });
          }
        } else {
          notify(json.error || '上传失败', true);
        }
      } catch (err) {
        notify('上传失败: ' + (err.message || '未知错误'), true);
      }
    }

    if (state.view === 'home' && state.files.length > 0) {
      showPage('output-settings');
    } else if (state.view === 'output-settings') {
      renderFileGrid();
      updateConvertButton();
    }
    refreshTabUI();
  }

  async function renderFileDetail(taskId, fileId) {
    const contentEl = document.querySelector('[data-file-detail-content]');
    const preview = document.querySelector('[data-view-preview]');
    const infoList = document.querySelector('[data-view-info]');
    if (!contentEl || !preview || !infoList) return;

    const task = taskId && state.tasks[taskId];
    const fileToJob = task?.fileToJob || {};
    const jobId = fileToJob[fileId];
    const job = jobId ? state.jobs.get(jobId) : null;
    const fileIndex = fileId ? parseInt(String(fileId).replace('file_', ''), 10) : -1;
    const file = task?.files?.[fileIndex];

    if (!task || !job || job.status !== 'success') {
      if (state.currentTaskId && state.tasks[state.currentTaskId]) {
        navigateTo('task-list', state.currentTaskId);
        showPage('task-list', state.currentTaskId);
      } else {
        goHome();
      }
      return;
    }

    const outputName = job.outputPath ? job.outputPath.split(/[/\\]/).pop() : '';
    const url = '/uploads/' + encodeURIComponent(outputName);
    const ext = (outputName || '').toLowerCase().split('.').pop();
    const sourceTab = task.sourceTab || state.currentTab;
    const isImage = sourceTab === 'image';
    const isMotion = sourceTab === 'animated' || sourceTab === 'motion';
    const isVideo = sourceTab === 'video';

    if (isMotion && !isImage) {
      preview.className = 'fluxio-view-preview fluxio-view-preview--motion';
      preview.innerHTML = '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(safeDisplayName(outputName)) + '">';
    } else if (isVideo && !isImage) {
      preview.className = 'fluxio-view-preview fluxio-view-preview--video';
      preview.innerHTML = '<video src="' + escapeHtml(url) + '" controls playsinline preload="auto"></video>';
    } else {
      preview.className = 'fluxio-view-preview';
      preview.innerHTML = '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(safeDisplayName(outputName)) + '">';
    }

    infoList.innerHTML = '<div class="fluxio-view-info-row"><span class="fluxio-view-info-value">加载中…</span></div>';

    /* F-017~F-020 从输出文件 probe 获取元信息，避免缺失 */
    let width = null;
    let height = null;
    let duration = null;
    let frameRate = null;
    const fileInfo = job.outputPath ? await fetchFileInfo(job.outputPath) : null;
    if (fileInfo?.probe) {
      const probe = fileInfo.probe;
      const videoStream = (probe.streams || []).find((s) => s.width != null && s.height != null);
      if (videoStream) {
        width = videoStream.width;
        height = videoStream.height;
        if (videoStream.avg_frame_rate) frameRate = formatFrameRate(videoStream.avg_frame_rate);
      }
      const dur = probe.format?.duration;
      if (dur != null) duration = parseFloat(dur);
    }
    const sizeStr = (width != null && height != null) ? `${width} × ${height}` : '-';
    const durationStr = (duration != null && !isNaN(duration) && duration > 0) ? formatDuration(duration) : '-';
    const frameRateStr = frameRate || '-';

    const inputName = job.inputPath ? job.inputPath.split(/[/\\]/).pop() : '';
    const inputExt = (inputName && inputName.includes('.') ? inputName.split('.').pop() : '').toUpperCase();
    const outputExt = (ext || '').toUpperCase();
    const formatText = inputExt && outputExt ? `${inputExt} → ${outputExt}` : outputExt || '-';

    let items;
    if (isImage) {
      items = [
        ['文件名', outputName || '-'],
        ['格式', formatText],
        ['尺寸', sizeStr],
        ['大小', formatSize(job.outputSize || 0)],
      ];
    } else if (isMotion) {
      items = [
        ['文件名', outputName || '-'],
        ['格式', formatText],
        ['尺寸', sizeStr],
        ['大小', formatSize(job.outputSize || 0)],
        ['帧率', frameRateStr],
      ];
    } else if (isVideo) {
      items = [
        ['文件名', outputName || '-'],
        ['格式', formatText],
        ['尺寸', sizeStr],
        ['大小', formatSize(job.outputSize || 0)],
        ['时长', durationStr],
        ['帧率', frameRateStr],
      ];
    } else {
      items = [
        ['文件名', outputName || '-'],
        ['格式', formatText],
        ['尺寸', sizeStr],
        ['大小', formatSize(job.outputSize || 0)],
      ];
    }
    infoList.innerHTML = items
      .map(([k, v]) => `<div class="fluxio-view-info-row"><span class="fluxio-view-info-label">${escapeHtml(k)}：</span><span class="fluxio-view-info-value">${escapeHtml(String(v))}</span></div>`)
      .join('');
  }

  function refreshTabUI() {
    updateOutputOptionsForTab();
  }

  function applyRoute() {
    const route = getRoute();
    if (route.page === 'home') {
      showPage('home');
      return;
    }
    if (route.page === 'task-list') {
      const task = route.taskId && state.tasks[route.taskId];
      if (task) {
        state.currentTaskId = route.taskId;
        showPage('task-list', route.taskId);
        startPolling();
      } else {
        showPage('task-error');
      }
      return;
    }
    if (route.page === 'file-detail') {
      state.currentTaskId = route.taskId;
      showPage('file-detail', route.taskId, route.fileId);
      return;
    }
    showPage('home');
  }

  function init() {
    const tabs = document.querySelectorAll('.fluxio-tab');
    const hintFormatEl = document.querySelector('[data-hint-format]');
    const fileInput = document.querySelector('[data-file-input]');
    const uploadBtn = document.querySelector('[data-upload-btn]');
    const uploadBox = document.querySelector('[data-upload-box]');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        if (!tabId || !TAB_CONFIG[tabId]) return;
        if (tabId === state.currentTab) return;

        if (state.files.length > 0) {
          const ok = window.confirm('切换分类将清空当前已上传文件和设置，是否继续？');
          if (!ok) return;
          state.files = [];
          hideError();
          if (state.view === 'output-settings') {
            navigateTo('home');
            showPage('home');
          }
        }

        state.currentTab = tabId;
        tabs.forEach((t) => t.classList.remove('fluxio-tab--active'));
        tab.classList.add('fluxio-tab--active');

        const cfg = TAB_CONFIG[tabId];
        if (hintFormatEl) hintFormatEl.textContent = cfg?.hintFormat || '';
        if (fileInput) fileInput.accept = cfg?.accept || '';

        refreshTabUI();
      });
    });

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        uploadFiles(e.target.files);
        e.target.value = '';
      });
    }

    if (uploadBox) {
      uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('fluxio-upload-box--dragover');
      });
      uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('fluxio-upload-box--dragover');
      });
      uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('fluxio-upload-box--dragover');
        if (state.currentTab === 'image' || state.currentTab === 'motion' || state.currentTab === 'video') {
          uploadFiles(e.dataTransfer.files);
        }
      });
    }

    const clearBtn = document.querySelector('[data-clear-btn]');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearAllFiles);
    }

    const addBtn = document.querySelector('[data-add-btn]');
    if (addBtn && fileInput) {
      addBtn.addEventListener('click', () => fileInput.click());
    }

    const convertBtnPanel = document.querySelector('[data-convert-btn-panel]');
    if (convertBtnPanel) {
      convertBtnPanel.addEventListener('click', startConvert);
    }

    const downloadAllBtn = document.querySelector('[data-download-all-btn]');
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', downloadAll);
    }

    const backHomeBtn = document.querySelector('[data-back-home-btn]');
    if (backHomeBtn) {
      backHomeBtn.addEventListener('click', goHome);
    }

    const backHomeBtnPanel = document.querySelector('[data-back-home-btn-panel]');
    if (backHomeBtnPanel) {
      backHomeBtnPanel.addEventListener('click', goHome);
    }

    const taskErrorBack = document.querySelector('[data-task-error-back]');
    if (taskErrorBack) taskErrorBack.addEventListener('click', goHome);

    const fileDetailBack = document.querySelector('[data-file-detail-back]');
    if (fileDetailBack) {
      fileDetailBack.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else if (state.currentTaskId) {
          navigateTo('task-list', state.currentTaskId);
          showPage('task-list', state.currentTaskId);
        }
      });
    }

    const fileDetailBackTask = document.querySelector('[data-file-detail-back-task]');
    if (fileDetailBackTask) {
      fileDetailBackTask.addEventListener('click', () => {
        const taskId = state.currentTaskId;
        if (taskId && state.tasks[taskId]) {
          navigateTo('task-list', taskId);
          showPage('task-list', taskId);
        } else {
          goHome();
        }
      });
    }

    const fileDetailBackHome = document.querySelector('[data-file-detail-back-home]');
    if (fileDetailBackHome) fileDetailBackHome.addEventListener('click', goHome);

    window.addEventListener('popstate', applyRoute);

    refreshTabUI();
    initQualitySlider();
    applyRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
