# Fluxio 最小部署方案（单服务器 · 中国友好）

> 面向个人开发者的零运维基础部署指南，目标：Ubuntu 轻量服务器单机部署。

---

## 零、上线前必须确认

### 0.1 最终访问路径：根路径 `/`（MVP 主入口）

| 路径 | 实际返回 | 说明 |
|------|----------|------|
| `/` | `fluxio.html` | **Fluxio 主入口** |
| `/tasks/:taskId` | `fluxio.html` | SPA 路由 |
| `/tasks/:taskId/files/:fileId` | `fluxio.html` | SPA 路由 |
| `/fluxio` 及子路径 | 301 跳转 | 重定向到 `/` 或对应路径 |
| `/legacy` | `index.html` | 原 ffmpeg-tool 界面 |

**结论**：Fluxio 的最终访问路径为 **`/`**，用户访问 `https://your-domain.com/` 即可进入 Fluxio。

---

### 0.2 上传限制：MVP 统一 200MB

| 项目 | 值 |
|------|-----|
| 单文件上限 | 200MB |
| 前后端 | 已统一，`MAX_FILE_SIZE=209715200` |
| Nginx | `client_max_body_size 200M` |

---

### 0.3 temp / logs 清理策略（内置）

| 目录 | 用途 | 默认保留 |
|------|------|----------|
| `temp/uploads` | 上传文件 | 24 小时 |
| `temp/sequences` | 序列帧解压 | 6 小时 |
| `temp/previews` | 预览 | 24 小时 |
| `logs` | 任务日志 | 7 天 |

- 启动时执行一次过期清理
- 每小时执行 temp 清理
- 每天执行 logs 清理
- 任务完成后序列帧目录即时清理
- 正在处理的任务文件受保护，不会被删除

---

## 一、项目架构识别

### 1.1 前端

| 项目 | 说明 |
|------|------|
| **技术栈** | 原生 HTML + CSS + 原生 JavaScript（无框架） |
| **目录** | `public/fluxio.html`、`public/fluxio.css`、`public/fluxio.js` |
| **构建方式** | **无需构建**，静态文件直接部署 |
| **运行方式** | 由 Node 后端 `express.static` 提供静态文件 |

### 1.2 后端

| 项目 | 说明 |
|------|------|
| **技术栈** | Node.js + Express |
| **入口** | `server.js` |
| **构建方式** | 无需构建 |
| **运行方式** | `node server.js`，默认端口 4000 |

### 1.3 存储与依赖

| 项目 | 说明 |
|------|------|
| **文件存储** | 本地文件系统（`temp/uploads`、`temp/sequences`、`temp/previews`、`logs`） |
| **对象存储** | **无**，当前版本不依赖 S3/OSS |
| **数据库** | **无** |
| **任务队列** | 内存队列（`jobs` Map + `queue` 数组） |

---

## 二、temp / logs 目录职责与清理规则

### 2.1 目录职责

| 目录 | 存什么 | 创建者 | 可删除时机 |
|------|--------|--------|------------|
| `temp/uploads` | 普通上传文件 | `/api/upload` | 超过 TTL 且不在用 |
| `temp/sequences` | ZIP 解压后的帧目录 | `/api/upload-sequence` | 任务完成后即时清理，或超过 TTL |
| `temp/previews` | 预览片段 | `/api/preview` | 超过 TTL |
| `logs` | 任务处理日志 | `runFfmpegJob` | 超过保留天数且对应任务已结束 |

### 2.2 清理规则

| 时机 | 行为 |
|------|------|
| **启动时** | 删除超过 TTL 的历史文件 |
| **每小时** | 执行 temp 目录清理 |
| **每天** | 执行 logs 清理 |
| **任务完成/失败** | 序列帧目录即时删除 |

### 2.3 配置项（环境变量）

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `TEMP_UPLOAD_TTL_HOURS` | 24 | uploads 保留小时数 |
| `TEMP_SEQUENCE_TTL_HOURS` | 6 | sequences 保留小时数 |
| `TEMP_PREVIEW_TTL_HOURS` | 24 | previews 保留小时数 |
| `LOG_RETENTION_DAYS` | 7 | logs 保留天数 |
| `TEMP_MAX_SIZE_MB` | 5120 | temp 超过此值时告警（MB） |
| `LOG_MAX_SIZE_MB` | 500 | logs 超过此值时告警（MB） |

---

## 三、环境依赖

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| **Node.js** | 18.x 或 20.x LTS | 运行后端 |
| **FFmpeg** | 4.x 及以上 | 音视频/图片转码 |
| **Nginx** | 1.18+ | 反向代理、HTTPS |
| **PM2** | 最新 | 进程守护、开机自启 |
| **npm** | 随 Node 安装 | 安装依赖 |

---

## 四、前端打包

**结论：无需打包。** 静态文件直接部署。

---

## 五、后端启动命令

```bash
# 开发
npm start

# 生产（PM2）
pm2 start ecosystem.config.cjs
pm2 startup && pm2 save
```

---

## 六、环境变量清单

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | 4000 | 后端监听端口 |
| `NODE_ENV` | 否 | development | 设为 `production` 生产环境 |
| `FFMPEG_ROOT` | 建议 | `$HOME/Desktop` | 文件访问根目录白名单；生产建议 `/var/fluxio/app` |
| `MAX_FILE_SIZE` | 否 | 209715200 (200MB) | 单文件上传上限（字节） |
| `TEMP_UPLOAD_TTL_HOURS` | 否 | 24 | uploads 保留小时数 |
| `TEMP_SEQUENCE_TTL_HOURS` | 否 | 6 | sequences 保留小时数 |
| `TEMP_PREVIEW_TTL_HOURS` | 否 | 24 | previews 保留小时数 |
| `LOG_RETENTION_DAYS` | 否 | 7 | logs 保留天数 |
| `TEMP_MAX_SIZE_MB` | 否 | 5120 | temp 告警阈值（MB） |
| `LOG_MAX_SIZE_MB` | 否 | 500 | logs 告警阈值（MB） |
| `ENABLE_CORS` | 否 | - | 设为 `true` 开启跨域 |

### 5.1 生产环境示例

```bash
export PORT=4000
export NODE_ENV=production
export FFMPEG_ROOT=/var/fluxio/app
export MAX_FILE_SIZE=209715200
```

---

## 七、Nginx 配置

保存为 `/etc/nginx/sites-available/fluxio`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # MVP 上传限制 200MB
    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

---

## 八、Ubuntu 服务器部署步骤（可直接执行）

1. 更新系统：`sudo apt update && sudo apt upgrade -y`
2. 安装 Node.js 20、FFmpeg、Nginx、PM2
3. 创建 `/var/fluxio/app`，上传代码
4. `npm ci --omit=dev`
5. 使用 `ecosystem.config.cjs` 启动（`MAX_FILE_SIZE=209715200`）
6. 配置 Nginx（`client_max_body_size 200M`）
7. 开放 80/443 端口

---

## 九、快速检查清单

- [ ] Node.js 与 FFmpeg 已安装
- [ ] `PORT`、`FFMPEG_ROOT`、`NODE_ENV`、`MAX_FILE_SIZE` 已正确配置
- [ ] PM2 已启动并设置开机自启
- [ ] Nginx 已启用，`client_max_body_size 200M`
- [ ] 能访问 `https://your-domain.com/`（根路径）
- [ ] 上传 + 转换 + 下载流程正常
- [ ] temp / logs 清理策略已生效（可选：观察日志输出）

---

## 十、对象存储相关

**当前不依赖对象存储。** 全部本地文件系统。

---

## 十一、单服务器部署的局限

| 项目 | 说明 |
|------|------|
| **任务状态丢失** | 进程重启后任务列表清空 |
| **单进程转码** | 同时只处理一个任务 |
| **磁盘治理** | 已内置定时清理，超阈值会告警 |

---

## 附录：中国云厂商说明

1. **轻量应用服务器**：1–2 核、2–4GB 可支撑小流量
2. **域名备案**：国内服务器对外提供 Web 服务通常需备案
3. **安全组**：开放 80、443
4. **Node 镜像**：`npm config set registry https://registry.npmmirror.com`
