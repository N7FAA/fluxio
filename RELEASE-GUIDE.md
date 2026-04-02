# FFmpeg 工具：做成应用并打包上线全流程

本文档梳理两种路线：**① 线上 Web 应用** 与 **② 桌面应用打包分发**，可按需求选一条或两条都做。

---

## 一、路线总览

| 方式 | 适合场景 | 用户使用方式 |
|------|----------|--------------|
| **Web 上线** | 分享链接、多设备访问、无需安装 | 打开网址即可用 |
| **桌面应用** | 本地安装、离线可用、更像「软件」 | 下载安装包，双击打开 |

---

## 二、路线 A：Web 应用上线（已有能力，补齐流程）

目标：把当前项目部署到公网，任何人通过浏览器访问。

### 步骤概览

1. **准备代码与仓库**
   - 在项目根目录执行：`git init`（若尚未初始化）
   - 添加 `.gitignore`，提交代码，推送到 GitHub/GitLab
   - 确保 `README.md`、`DEPLOY.md` 能说明如何部署

2. **选一个托管平台并部署**
   - **Railway**（推荐起步）  
     - 登录 [railway.app](https://railway.app) → New Project → Deploy from GitHub  
     - 选择本仓库，Railway 会识别 `Dockerfile` 自动构建、部署  
     - 在 Variables 里可设：`NODE_ENV=production`、`FFMPEG_ROOT=/app/temp/uploads` 等（见 `env.example`）  
     - 部署完成后会得到 `xxx.railway.app` 域名，即「线上地址」
   - **Render / Fly.io / 自建 VPS**  
     - 详见项目内 `DEPLOY.md`，步骤类似：连仓库 → 选 Docker 或 Node → 配置环境变量 → 部署

3. **绑定自定义域名（可选）**
   - 在托管平台里添加 Custom Domain，按提示把 DNS 指到平台给的 CNAME
   - 若需 HTTPS，一般平台会自动签发证书

4. **上线后检查**
   - 访问首页、上传小文件、跑一次转码、看队列与预览是否正常
   - 检查 `temp/`、`logs/` 是否按预期工作（或按平台文档做持久化）

**结果**：你得到一个「格式转换工具」的网址，例如 `https://your-app.railway.app`，这就是 Web 应用的「上线」。

---

## 三、路线 B：桌面应用打包分发（Electron 方案）

目标：用户下载一个「应用」（.app / .exe），双击打开即可使用，无需自己装 Node 或 FFmpeg（或由应用内引导安装）。

### 1. 技术选型简述

- **Electron**：用现有 HTML/CSS/JS 做界面，内嵌 Chromium；主进程可起 Node 服务（当前 Express 服务），或直接调 FFmpeg 二进制。  
- **FFmpeg**：  
  - 方案 A：打包 FFmpeg 二进制进应用（macOS 可放 `.app/Contents/Resources/bin/ffmpeg`），应用内用绝对路径调用。  
  - 方案 B：首次启动检测，未安装则提示用户安装（如跳转官网或 Homebrew 说明）。

下面按「打包 FFmpeg + Express 进 Electron」的思路写步骤。

### 2. 项目结构建议

在现有 `ffmpeg-tool` 同级或子目录建 Electron 壳，例如：

```text
ffmpeg-tool/
  server.js          # 现有
  public/            # 现有
  package.json       # 现有
  electron/          # 新增：Electron 主进程
    main.js
  resources/          # 可选：存放 ffmpeg、ffprobe 二进制
    darwin-x64/
    darwin-arm64/
```

或单独建一个 `ffmpeg-tool-app/` 仓库，把 `ffmpeg-tool` 作为子目录或 npm 依赖引入。

### 3. 安装依赖

在项目根目录（或 Electron 项目根）：

```bash
npm install --save-dev electron electron-builder
```

- **electron**：桌面壳。  
- **electron-builder**：打 .dmg/.app（macOS）、.exe/安装包（Windows）。

### 4. 新增 Electron 主进程（main 进程）

新建 `electron/main.js`（或项目根下的 `main.js`），做三件事：

1. 创建窗口，加载页面（开发时 `http://localhost:4000`，打包后用 `file://` 或 Express 提供的 `http://127.0.0.1:端口`）。  
2. 启动 Express：在 main 里 `require('./server.js')` 或 `spawn('node', ['server.js'])`，并保证 FFmpeg 路径指向打包进去的二进制（或系统 PATH）。  
3. 窗口关闭时退出 Node 进程（`app.quit()`）。

示例逻辑（仅作结构参考）：

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;
let mainWindow = null;

function startServer() {
  const serverPath = path.join(__dirname, '..', 'server.js');
  serverProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: '4000' },
    cwd: path.join(__dirname, '..'),
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1200, height: 800 });
  mainWindow.loadURL('http://localhost:4000');
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  startServer();
  setTimeout(createWindow, 1000); // 等服务起来
});

app.on('quit', () => {
  if (serverProcess) serverProcess.kill();
});
```

实际项目中需根据你当前 `server.js` 的启动方式（是否自己 listen）、静态文件路径做调整；若打包后资源路径变化，需用 `__dirname` 或 `process.resourcesPath` 解析到 `public`、FFmpeg 等。

### 5. 配置 package.json

在 **项目根** 的 `package.json` 里增加或修改：

```json
{
  "main": "electron/main.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:4000 && electron .\"",
    "dist": "electron-builder",
    "dist:mac": "electron-builder --mac",
    "dist:win": "electron-builder --win"
  },
  "build": {
    "appId": "com.yourname.ffmpeg-tool",
    "productName": "FFmpeg 格式转换工具",
    "directories": { "output": "dist" },
    "files": ["server.js", "public/**", "electron/**", "node_modules/**"],
    "extraResources": [
      { "from": "resources/ffmpeg-darwin-arm64", "to": "bin/ffmpeg" },
      { "from": "resources/ffprobe-darwin-arm64", "to": "bin/ffprobe" }
    ],
    "mac": {
      "category": "public.app-category.utilities",
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    }
  }
}
```

说明：

- `main` 指向 Electron 主进程入口。  
- `files` 决定哪些会打进安装包；若 FFmpeg 用 extraResources，需在运行时从 `process.resourcesPath` 读路径。  
- `extraResources` 仅示例；实际要放对应平台的 ffmpeg/ffprobe，并保证 server 或子进程用这个路径调用。

### 6. 准备 FFmpeg 二进制（若打包进应用）

- macOS：从 [evermeet.cx/ffmpeg](https://evermeet.cx/ffmpeg/) 或自编译，取 `ffmpeg`、`ffprobe`，按架构放到 `resources/darwin-arm64`、`resources/darwin-x64`。  
- Windows：从 [gyan.dev/ffmpeg](https://www.gyan.dev/ffmpeg/builds/) 下载 release，解压出 `bin/ffmpeg.exe`、`ffprobe.exe`，放到 `resources/win32-x64` 等。  
- 在 server 或 Electron main 里，根据 `process.platform`、`process.arch` 拼出 FFmpeg 路径，替换当前直接调用 `ffmpeg` 的方式。

### 7. 本地打包

```bash
npm run dist:mac    # 生成 .dmg / .app
# 或
npm run dist:win    # 生成 Windows 安装包
```

产物在 `dist/` 下。

### 8. macOS 签名与公证（否则用户打开会被拦截）

- **开发者账号**：Apple Developer Program（年费）。  
- **签名**：在 `build` 里配置 `mac.identity`、`mac.hardenedRuntime` 等，或通过环境变量 `CSC_NAME` 指定证书；`electron-builder` 会帮你签。  
- **公证（Notarization）**：  
  - 用 `xcrun notarytool submit dist/xxx.dmg --keychain-profile AC_PASSWORD --wait`（或 Xcode Organizer）上传 dmg。  
  - 公证通过后执行 `xcrun stapler staple dist/xxx.dmg`。  
- 未签名/未公证时，用户需在「系统设置 → 隐私与安全性」里手动允许，或 `xattr -cr /Applications/YourApp.app`。

### 9. 分发方式

- **直接分发**：把 .dmg（Mac）或 .exe/安装包（Windows）放到自己网站、网盘或 GitHub Releases，用户下载安装。  
- **Mac App Store**：需按 Apple 规范（沙盒、权限、审核），改动会较多，通常不选。  
- **Setapp 等**：若上第三方分发平台，按平台要求打包即可。

---

## 四、流程小结（按你要的结果选）

### 只想「有个网址，大家都能用」

1. 代码推送到 Git 仓库。  
2. Railway / Render / Fly.io 任选一个，连仓库，用 Docker 或 Node 部署。  
3. 配置环境变量（见 `env.example`）。  
4. 得到域名，分享链接即可。  

详细见项目内 **DEPLOY.md**。

### 想要「一个可安装的桌面应用」

1. 用 Electron 包一层：主进程启动 Express + 开窗口加载当前 Web 界面。  
2. 决定 FFmpeg 是打包进应用还是提示用户安装，并实现路径解析。  
3. 在 `package.json` 配置 `electron-builder`，准备图标（.icns / .ico）。  
4. 执行 `npm run dist:mac` 或 `dist:win` 打出安装包。  
5. （推荐）macOS 做代码签名 + 公证，再分发 dmg/app。  
6. 通过网站/Releases 提供下载。

### 两条都做

- 同一套前后端代码：Web 版部署到云；桌面版用 Electron 加载同一套界面，仅运行环境从「远程服务器」变成「本机 Express + 本机 FFmpeg」。

---

## 五、检查清单（上线前）

- [ ] 环境变量（端口、根目录、文件大小限制）已按生产环境配置  
- [ ] 敏感信息（若有）不写死在代码里  
- [ ] 错误提示友好、不暴露内部路径  
- [ ] 版权与开源协议（如 README、关于页）写清楚  
- [ ] 桌面版：在干净系统上测试安装与卸载  
- [ ] 桌面版：macOS 签名/公证后再对外分发  

按上述步骤，你可以把当前「格式转换工具」做成：**仅 Web 上线**、**仅桌面应用**，或 **两者都有** 的完整产品。
