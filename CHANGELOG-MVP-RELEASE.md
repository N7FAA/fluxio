# Fluxio MVP 上线前统一整理 · 变更摘要

## 一、根路径 `/` 的实际改法

| 项目 | 改动 |
|------|------|
| **主入口** | `GET /`、`/tasks/:taskId`、`/tasks/:taskId/files/:fileId` 均返回 `fluxio.html` |
| **旧路径** | `GET /fluxio` 及 `/fluxio/*` → **301 跳转**到 `/` 或对应路径 |
| **旧工具** | `GET /legacy` 返回 `index.html`（原 ffmpeg-tool） |
| **兜底** | 未匹配路由统一返回 `fluxio.html` |

---

## 二、原 `/fluxio` 如何处理

- **301 重定向**：`/fluxio` → `/`，`/fluxio/tasks/xxx` → `/tasks/xxx`
- 保留旧链接可访问性
- 不再以 `/fluxio` 为主入口

---

## 三、文件限制如何统一到 200MB

| 层级 | 改动 |
|------|------|
| **后端** | `MAX_FILE_SIZE` 默认 `209715200`（200MB） |
| **前端** | `LIMITS` 各 Tab 的 `maxFileMB`、`maxTotalMB` 均为 `200` |
| **前端提示** | 各 Tab `hintFormat` 增加「单文件不超过 200MB」 |
| **Nginx** | `client_max_body_size 200M` |

---

## 四、Nginx、后端、前端是否已同步一致

| 项目 | 状态 |
|------|------|
| Nginx 配置 | 已更新：根路径 `/`，`client_max_body_size 200M` |
| 后端 server.js | 已更新：路由、默认 `MAX_FILE_SIZE`、清理策略 |
| 前端 fluxio.js | 已更新：`BASE`、`getRoute`、`navigateTo`、`LIMITS`、提示文案 |
| 前端 fluxio.html | 已更新：默认提示「单文件不超过 200MB」 |

---

## 五、temp / logs 各目录职责

| 目录 | 用途 | 默认保留 | 清理时机 |
|------|------|----------|----------|
| `temp/uploads` | 上传文件 | 24h | 启动时 + 每小时 |
| `temp/sequences` | 序列帧解压 | 6h | 任务结束后即时 + 每小时 |
| `temp/previews` | 预览片段 | 24h | 启动时 + 每小时 |
| `logs` | 任务日志 | 7 天 | 启动时 + 每天 |

---

## 六、清理时机

| 时机 | 行为 |
|------|------|
| **启动时** | 执行一次 temp + logs 过期清理 |
| **每小时** | temp 目录清理（保护在用文件） |
| **每天** | logs 清理（保护在用任务日志） |
| **任务完成/失败** | 序列帧目录即时删除 |
| **每小时** | 磁盘占用检查，超阈值打告警日志 |

---

## 七、涉及的代码文件

| 文件 | 改动概要 |
|------|----------|
| `server.js` | 路由调整、`MAX_FILE_SIZE`、清理与配置逻辑 |
| `public/fluxio.js` | `BASE`、`getRoute`、`navigateTo`、`LIMITS`、提示文案 |
| `public/fluxio.html` | 默认 `data-hint-format` |
| `ecosystem.config.cjs` | `MAX_FILE_SIZE=209715200` |
| `env.example` | 新增清理相关环境变量 |
| `nginx-fluxio.conf.example` | 200M、根路径说明 |
| `test-fluxio.js` | 路由改为 `/`、`/tasks/xxx` |
| `DEPLOYMENT-MINIMAL.md` | 全量更新 |

---

## 八、涉及的文档文件

| 文件 | 改动概要 |
|------|----------|
| `DEPLOYMENT-MINIMAL.md` | 路径、限制、清理策略、环境变量 |
| `env.example` | `MAX_FILE_SIZE`、`TEMP_*`、`LOG_*` |
| `nginx-fluxio.conf.example` | `client_max_body_size 200M` |
| `CHANGELOG-MVP-RELEASE.md` | 本变更摘要 |

---

## 九、仍存在的风险和后续建议

| 风险 | 说明 |
|------|------|
| 任务状态不持久 | 重启后任务列表清空，进行中任务会失败 |
| 单进程转码 | 同时只处理一个任务，高并发会排队 |
| 序列帧 ZIP 内存 | 大 ZIP 解压可能带来较高内存占用 |
| 测试依赖已有文件 | `test-fluxio.js` 依赖 `temp/uploads` 中已有文件，启动清理可能删掉，导致转换测试失败 |

### 后续建议

1. 上线前在本机 `npm start` 后手动验证：根路径 `/`、上传 200MB 限制、/fluxio 301、/legacy。
2. 关注 `temp`、`logs` 目录大小及告警日志。
3. 有需要时通过环境变量微调 TTL 和告警阈值。
