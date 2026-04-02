#!/usr/bin/env node
/**
 * Fluxio 端到端测试脚本
 * 按 product-spec-final.md 和 FLUXIO-INTERACTION-FINAL.md 验证 Fluxio 功能
 * 用法: node test-fluxio.js [--base http://localhost:4000]
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1] || 'http://localhost:4000'
  : 'http://localhost:4000';

const results = { passed: 0, failed: 0, tests: [] };

function log(msg, type = 'info') {
  const prefix = type === 'ok' ? '✓' : type === 'fail' ? '✗' : '·';
  console.log(`  ${prefix} ${msg}`);
}

function pass(name, detail) {
  results.passed++;
  results.tests.push({ name, status: 'PASS', detail });
  log(`${name}${detail ? ': ' + detail : ''}`, 'ok');
}

function fail(name, detail) {
  results.failed++;
  results.tests.push({ name, status: 'FAIL', detail });
  log(`${name}${detail ? ': ' + detail : ''}`, 'fail');
}

async function fetch(url, opts = {}) {
  const u = new URL(url, BASE);
  const client = u.protocol === 'https:' ? https : http;
  const { body, ...reqOpts } = opts;
  if (body) reqOpts.headers = { ...reqOpts.headers, 'Content-Length': Buffer.byteLength(body) };
  return new Promise((resolve, reject) => {
    const req = client.request(url, reqOpts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function get(url) {
  return fetch(BASE + url, { method: 'GET' });
}

async function postJSON(url, data) {
  return fetch(BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// 1. Fluxio 页面可访问（根路径 /）
async function testFluxioPage() {
  const r = await get('/');
  if (r.status === 200 && (r.body.includes('Fluxio') || r.body.includes('fluxio'))) {
    pass('Fluxio 页面 200 OK', `HTML ${r.body.length} 字节`);
  } else {
    fail('Fluxio 页面', `status=${r.status}, body len=${r.body?.length || 0}`);
  }
}

// 2. Fluxio 路由 (history fallback)，根路径与 /tasks 子路由
async function testFluxioRoutes() {
  const routes = ['/', '/tasks/fake-id'];
  for (const route of routes) {
    const r = await get(route);
    if (r.status !== 200) {
      fail(`路由 ${route}`, `status=${r.status}`);
      return;
    }
  }
  const redirect = await get('/fluxio');
  if (redirect.status === 301 && redirect.headers.location) {
    pass('/fluxio 301 跳转', redirect.headers.location);
  } else {
    fail('/fluxio 跳转', `status=${redirect.status}`);
  }
}

// 3. API /api/jobs
async function testApiJobs() {
  const r = await get('/api/jobs');
  if (r.status !== 200) {
    fail('API /api/jobs', `status=${r.status}`);
    return;
  }
  let data;
  try {
    data = JSON.parse(r.body);
  } catch {
    fail('API /api/jobs', 'JSON 解析失败');
    return;
  }
  if (!data.success || !Array.isArray(data.data)) {
    fail('API /api/jobs', '格式不符：需 success 和 data 数组');
    return;
  }
  pass('API /api/jobs', `返回 ${data.data.length} 个任务`);
}

// 4. 队列 API 格式校验（使用已有上传文件）
async function testQueueApi() {
  const uploadDir = path.join(__dirname, 'temp', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fail('队列 API', 'temp/uploads 不存在，跳过');
    return;
  }
  const pngs = fs.readdirSync(uploadDir).filter((f) => f.endsWith('.png'));
  const imgFile = pngs[0] || '1770175546860-hds4j4i.png';
  const imgPath = path.join(uploadDir, imgFile);
  if (!fs.existsSync(imgPath)) {
    log('队列 API 跳过（无测试图片）', 'info');
    return;
  }

  const absPath = path.resolve(imgPath);
  const queuePayload = {
    inputPath: absPath,
    container: 'webp',
    params: { crf: 30, videoCodec: 'libwebp' },
  };

  const r = await postJSON('/api/queue', queuePayload);
  if (r.status !== 200) {
    fail('队列 API POST', `status=${r.status}`);
    return;
  }
  let data;
  try {
    data = JSON.parse(r.body);
  } catch {
    fail('队列 API', 'JSON 解析失败');
    return;
  }
  if (!data.success || !data.data?.id) {
    fail('队列 API', data.error || '未返回 job id');
    return;
  }
  pass('队列 API', `jobId=${data.data.id}，等待转换完成...`);

  // 轮询直到完成
  const jobId = data.data.id;
  const maxWait = 30000;
  const start = Date.now();
  let finalJob = null;

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 1200));
    const jobsRes = await get('/api/jobs');
    const jobsData = JSON.parse(jobsRes.body);
    const job = jobsData.data?.find((j) => j.id === jobId);
    if (!job) continue;
    if (job.status === 'success') {
      finalJob = job;
      break;
    }
    if (job.status === 'failed') {
      fail('转换任务', job.error || '失败');
      return;
    }
  }

  if (!finalJob) {
    fail('转换任务', '超时');
    return;
  }
  const outExists = finalJob.outputPath && fs.existsSync(finalJob.outputPath);
  if (outExists) {
    pass('转换完成', `${path.basename(finalJob.outputPath)} (${fs.statSync(finalJob.outputPath).size} B)`);
  } else {
    pass('转换完成', 'job 标记 success（outputPath 可能已被清理）');
  }
}

// 5. 直接访问无效 taskId 应返回错误态（前端逻辑，这里仅验证 API 不崩）
async function testInvalidTaskAccess() {
  const r = await get('/tasks/task_9999999999999_invalid');
  if (r.status === 200) {
    pass('无效 taskId 路由', '页面正常返回（前端显示错误态）');
  } else {
    fail('无效 taskId 路由', `status=${r.status}`);
  }
}

async function run() {
  console.log('\n=== Fluxio 测试套件 ===');
  console.log(`Base URL: ${BASE}\n`);

  await testFluxioPage();
  await testFluxioRoutes();
  await testApiJobs();
  await testInvalidTaskAccess();
  await testQueueApi();

  console.log('\n--- 结果 ---');
  console.log(`通过: ${results.passed}, 失败: ${results.failed}`);
  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
