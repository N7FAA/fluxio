# Fluxio 与后端集成要点

## 路由（Express 示例）

```js
const STATIC_DIR = path.join(__dirname, 'public');

app.get(/^\/fluxio(\/.*)?$/, (_, res) =>
  res.sendFile(path.join(STATIC_DIR, 'fluxio.html')));
app.get(/^\/fluxio\/tasks\/[^/]+$/, (_, res) =>
  res.sendFile(path.join(STATIC_DIR, 'fluxio.html')));
app.get(/^\/fluxio\/tasks\/[^/]+\/files\/[^/]+$/, (_, res) =>
  res.sendFile(path.join(STATIC_DIR, 'fluxio.html')));
app.get(/^\/fluxio\/tasks\/?$/, (_, res) => res.redirect(301, '/fluxio'));

app.use(express.static(STATIC_DIR));
```

## 前端依赖的 API

- `POST /api/upload`、`POST /api/upload-sequence`
- `POST /api/queue`
- `GET /api/jobs`
- `GET /api/ffprobe`、`GET /api/file-info`
- 静态：`/uploads/*`（下载结果）

完整实现见项目根目录 `server.js`。
