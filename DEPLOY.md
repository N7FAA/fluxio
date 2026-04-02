# FFmpeg 工具部署指南

本工具支持多种部署方式，可根据需求选择最适合的平台。

## 📋 部署前准备

1. **确保代码已提交到 Git 仓库**（GitHub/GitLab/Bitbucket）
2. **准备环境变量配置**（参考 `env.example`）

## 🚀 部署方式

### 方式 1: Docker 部署（推荐）

Docker 部署最简单，支持所有主流云平台。

#### 本地测试 Docker

```bash
# 构建镜像
docker build -t ffmpeg-tool .

# 运行容器
docker run -p 4000:4000 \
  -e PORT=4000 \
  -e FFMPEG_ROOT=/app/temp/uploads \
  -v $(pwd)/temp:/app/temp \
  -v $(pwd)/logs:/app/logs \
  ffmpeg-tool
```

#### 使用 Docker Compose

```bash
docker-compose up -d
```

#### 部署到云平台

**Railway**
1. 注册 [Railway](https://railway.app)
2. 点击 "New Project" -> "Deploy from GitHub repo"
3. 选择你的仓库
4. Railway 会自动检测 Dockerfile 并部署
5. 在项目设置中添加环境变量

**Fly.io**
```bash
# 安装 flyctl
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 初始化（会创建 fly.toml）
fly launch

# 部署
fly deploy
```

**DigitalOcean App Platform**
1. 登录 [DigitalOcean](https://cloud.digitalocean.com)
2. 创建新 App -> 选择 GitHub 仓库
3. 选择 Dockerfile 作为构建方式
4. 配置环境变量
5. 部署

---

### 方式 2: Heroku 部署

Heroku 支持直接部署 Node.js 应用。

#### 步骤

1. **安装 Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# 或访问 https://devcenter.heroku.com/articles/heroku-cli
```

2. **登录并创建应用**
```bash
heroku login
heroku create your-app-name
```

3. **添加 FFmpeg Buildpack**
```bash
heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
heroku buildpacks:add heroku/nodejs
```

4. **设置环境变量**
```bash
heroku config:set NODE_ENV=production
heroku config:set FFMPEG_ROOT=/app/temp/uploads
heroku config:set MAX_FILE_SIZE=209715200
```

5. **部署**
```bash
git push heroku main
```

**注意**: Heroku 免费版已停止，需要付费计划。

---

### 方式 3: VPS 服务器部署（Ubuntu/Debian）

适合有自己服务器的用户。

#### 步骤

1. **SSH 连接到服务器**
```bash
ssh user@your-server-ip
```

2. **安装 Node.js 和 FFmpeg**
```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 FFmpeg
sudo apt-get update
sudo apt-get install -y ffmpeg
```

3. **克隆项目**
```bash
git clone https://github.com/your-username/ffmpeg-tool.git
cd ffmpeg-tool
npm install --production
```

4. **使用 PM2 管理进程**
```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start server.js --name ffmpeg-tool

# 设置开机自启
pm2 startup
pm2 save
```

5. **配置 Nginx 反向代理**（可选）
```nginx
# /etc/nginx/sites-available/ffmpeg-tool
# Fluxio 主入口在根路径 /，上传限制 200MB
server {
    listen 80;
    server_name your-domain.com;
    client_max_body_size 200M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ffmpeg-tool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **配置 SSL（Let's Encrypt）**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 方式 4: Railway 部署（最简单）

Railway 提供免费额度，部署简单。

1. 访问 [railway.app](https://railway.app) 并登录（支持 GitHub 登录）
2. 点击 "New Project" -> "Deploy from GitHub repo"
3. 选择你的仓库
4. Railway 会自动检测 Dockerfile
5. 在 "Variables" 标签页添加环境变量：
   - `PORT=4000`（Railway 会自动设置）
   - `NODE_ENV=production`
   - `FFMPEG_ROOT=/app/temp/uploads`
6. 部署完成后，Railway 会提供一个 `.railway.app` 域名

---

### 方式 5: Render 部署

1. 访问 [render.com](https://render.com) 并登录
2. 点击 "New" -> "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Docker（推荐）或 Node
5. 添加环境变量
6. 如果使用 Docker，Render 会自动检测 Dockerfile

---

## 🔒 安全建议

### 生产环境配置

1. **限制文件大小**（MVP 默认 200MB）
```bash
MAX_FILE_SIZE=209715200  # 200MB
```

2. **设置访问限制**
   - 使用 Nginx 配置 IP 白名单
   - 或添加身份验证中间件

3. **定期清理临时文件**
   - 工具已内置预览文件清理（1小时）
   - 建议添加定时任务清理上传文件：
```bash
# crontab -e
0 2 * * * find /app/temp/uploads -type f -mtime +1 -delete
```

4. **监控和日志**
   - 使用 PM2 监控（VPS）
   - 或使用云平台的监控服务

---

## 📊 资源需求

- **内存**: 至少 512MB（推荐 1GB+）
- **CPU**: 1 核心（推荐 2 核心+）
- **存储**: 根据使用情况，建议至少 10GB
- **带宽**: 根据并发用户数

---

## 🐛 常见问题

### FFmpeg 未找到

确保服务器已安装 FFmpeg：
```bash
ffmpeg -version
```

如果使用 Docker，FFmpeg 已包含在镜像中。

### 文件上传失败

检查：
1. `MAX_FILE_SIZE` 环境变量
2. 服务器磁盘空间
3. 文件权限

### 视频无法播放

检查：
1. 文件路径是否正确
2. MIME 类型是否正确
3. 浏览器控制台错误信息

---

## 🔄 更新部署

### Docker
```bash
docker-compose pull
docker-compose up -d
```

### Heroku
```bash
git push heroku main
```

### Railway/Render
自动从 Git 仓库更新，或手动触发重新部署。

### VPS (PM2)
```bash
git pull
pm2 restart ffmpeg-tool
```

---

## 📝 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务器端口 | 4000 |
| `FFMPEG_ROOT` | 允许访问的根目录 | `~/Desktop` |
| `MAX_FILE_SIZE` | 最大文件大小（字节） | 209715200 (200MB, MVP) |
| `ENABLE_CORS` | 启用跨域 | false |
| `NODE_ENV` | 环境模式 | development |

---

## 🎯 推荐部署方案

- **个人使用/小规模**: Railway（免费额度，简单）
- **中等规模**: Render 或 Fly.io
- **大规模/企业**: VPS + Docker + Nginx
- **快速测试**: Docker Compose 本地运行

---

## 📞 获取帮助

如遇问题，请检查：
1. 服务器日志
2. 浏览器控制台
3. FFmpeg 版本兼容性

祝部署顺利！🚀


