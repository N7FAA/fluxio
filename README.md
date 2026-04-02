# FFmpeg 可视化工具

一个基于 Web 的 FFmpeg 视频转换工具，支持批量处理、队列管理、预设保存和视频对比功能。

![FFmpeg Tool](https://img.shields.io/badge/FFmpeg-Tool-green)
![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)

## ✨ 功能特性

- 🎬 **可视化配置**: 通过 Web 界面配置所有 FFmpeg 参数
- 📁 **文件管理**: 支持文件上传和路径选择
- 📋 **任务队列**: 自动排队执行转换任务，支持取消和进度查看
- 💾 **预设管理**: 保存和复用常用参数组合
- 👁️ **视频预览**: 生成缩略图或预览片段
- 🔍 **视频对比**: 同时播放两个视频，对比画质和参数
- 📊 **实时监控**: 查看任务状态、进度和详细日志
- 🔒 **安全控制**: 路径白名单、参数验证、防止命令注入

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/your-username/ffmpeg-tool.git
cd ffmpeg-tool

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:4000

### 使用 Docker

```bash
# 构建镜像
npm run docker:build

# 运行容器
npm run docker:run

# 或使用 docker-compose
docker-compose up -d
```

## 📦 部署到线上

本工具支持多种部署方式，详见 [DEPLOY.md](./DEPLOY.md)

### 推荐平台

- **Railway** - 最简单，免费额度，自动部署
- **Render** - 免费计划，支持 Docker
- **Fly.io** - 全球边缘部署
- **VPS** - 完全控制，适合大规模使用

### 快速部署到 Railway

1. Fork 或推送代码到 GitHub
2. 访问 [railway.app](https://railway.app)
3. 点击 "New Project" -> "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测 Dockerfile 并部署
6. 添加环境变量（可选）

## 🛠️ 系统要求

- Node.js 18+ 或 Docker
- FFmpeg 已安装并在 PATH 中（Docker 版本已包含）
- 至少 512MB 内存（推荐 1GB+）

## 📖 使用说明

### 基本转换

1. 在"输入与输出"面板填写文件路径或点击"选择文件"上传
2. 配置视频/音频参数（编码器、CRF、分辨率等）
3. 点击"加入队列"开始转换
4. 在"任务队列"面板查看进度

### 视频对比

1. 在"视频对比"面板选择两个视频文件
2. 点击"加载并播放"
3. 使用控制按钮同步播放/暂停
4. 查看对比信息（文件大小、码率、分辨率等）

### 预设管理

1. 配置好参数后，在"预设管理"面板输入名称
2. 点击"保存当前表单为预设"
3. 下次使用时点击"应用"快速填充参数

## ⚙️ 配置选项

通过环境变量配置：

```bash
PORT=4000                    # 服务器端口
FFMPEG_ROOT=/path/to/root    # 允许访问的根目录
MAX_FILE_SIZE=209715200      # 最大文件大小（字节，MVP 默认 200MB）
ENABLE_CORS=false            # 是否启用跨域
NODE_ENV=production          # 环境模式
```

完整配置说明见 [env.example](./env.example)

## 🔒 安全说明

- 所有文件路径都经过验证，只能访问指定目录
- FFmpeg 参数使用白名单过滤，防止命令注入
- 上传文件大小可配置限制
- 生产环境建议配置反向代理和 HTTPS

## 📝 开发

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC License

## 🙏 致谢

- [FFmpeg](https://ffmpeg.org/) - 强大的多媒体处理工具
- [Express](https://expressjs.com/) - Web 框架
- [Multer](https://github.com/expressjs/multer) - 文件上传处理

---

**注意**: 本工具需要服务器端安装 FFmpeg。使用 Docker 部署时已自动包含。


