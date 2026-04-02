# 视频格式支持说明

## 📋 当前界面支持的容器格式

目前工具界面中预设了以下 5 种常用容器格式：

1. **webm** - WebM 格式（VP8/VP9/AV1，适合 Web 播放）
2. **mp4** - MP4 格式（H.264/H.265，最通用）
3. **mov** - QuickTime 格式（macOS/iOS 常用）
4. **mkv** - Matroska 格式（开源，支持多音轨/字幕）
5. **gif** - GIF 动画格式（无音频）

---

## 🎬 实际支持的输入格式

由于工具基于 FFmpeg，**理论上可以处理 FFmpeg 支持的所有视频/音频格式**，包括但不限于：

### 常见视频格式
- **MP4** (.mp4) - H.264, H.265, MPEG-4
- **AVI** (.avi) - 各种编码
- **MOV** (.mov) - QuickTime
- **MKV** (.mkv) - Matroska
- **WebM** (.webm) - VP8, VP9, AV1
- **FLV** (.flv) - Flash Video
- **WMV** (.wmv) - Windows Media
- **MPEG** (.mpg, .mpeg) - MPEG-1, MPEG-2
- **3GP** (.3gp) - 移动设备格式
- **OGV** (.ogv) - Ogg Theora
- **M4V** (.m4v) - iTunes 视频
- **TS** (.ts) - MPEG Transport Stream
- **VOB** (.vob) - DVD 视频
- **RM/RMVB** (.rm, .rmvb) - RealMedia
- **ASF** (.asf) - Advanced Streaming Format
- **MKV** (.mkv) - Matroska
- **AV1** (.av1) - AOMedia Video 1

### 音频格式（可作为输入）
- **MP3** (.mp3)
- **AAC** (.aac, .m4a)
- **FLAC** (.flac)
- **WAV** (.wav)
- **OGG** (.ogg)
- **WMA** (.wma)
- **OPUS** (.opus)
- **AC3** (.ac3)
- **DTS** (.dts)

### 图像序列
- **PNG 序列** (.png)
- **JPEG 序列** (.jpg, .jpeg)
- **BMP 序列** (.bmp)
- **TIFF 序列** (.tiff)

---

## 🎯 支持的视频编码器

当前工具支持以下视频编码器（可在界面中选择）：

1. **libvpx-vp9** - VP9 编码（WebM，高质量，适合 Web）
2. **libvpx** - VP8 编码（WebM，兼容性好）
3. **libx264** - H.264/AVC 编码（MP4，最通用）
4. **libx265** - H.265/HEVC 编码（MP4，高压缩率）
5. **copy** - 直接复制，不重新编码（快速，保持原质量）

### FFmpeg 还支持的其他编码器（可通过自定义参数使用）

- **libaom-av1** - AV1 编码（最新，最高效）
- **libsvtav1** - SVT-AV1 编码（快速 AV1）
- **libtheora** - Theora 编码（OGG）
- **libvpx-vp8** - VP8 编码
- **mpeg4** - MPEG-4 编码
- **mjpeg** - Motion JPEG
- **h264_nvenc** - NVIDIA 硬件加速 H.264
- **hevc_nvenc** - NVIDIA 硬件加速 HEVC
- **h264_videotoolbox** - macOS 硬件加速 H.264
- **hevc_videotoolbox** - macOS 硬件加速 HEVC

---

## 🎵 支持的音频编码器

当前工具支持以下音频编码器：

1. **aac** - AAC 编码（MP4，高质量）
2. **libopus** - Opus 编码（WebM，低延迟）
3. **libvorbis** - Vorbis 编码（OGG，开源）
4. **copy** - 直接复制，不重新编码
5. **none** - 无音频轨道

### FFmpeg 还支持的其他音频编码器

- **mp3** - MP3 编码
- **flac** - FLAC 无损编码
- **pcm** - PCM 无损
- **ac3** - AC-3 编码
- **eac3** - Enhanced AC-3
- **dts** - DTS 编码

---

## 🎨 支持的像素格式

当前工具支持以下像素格式：

1. **yuv420p** - YUV 4:2:0（最常用，兼容性最好）
2. **yuv422p** - YUV 4:2:2（更好的色彩，文件稍大）
3. **yuv444p** - YUV 4:4:4（最佳色彩，文件最大）
4. **yuva420p** - YUV 4:2:0 + Alpha（支持透明度）
5. **yuva422p** - YUV 4:2:2 + Alpha
6. **yuva444p** - YUV 4:4:4 + Alpha
7. **rgba** - RGBA（支持透明度）

---

## 🔧 如何扩展支持的格式

### 方法 1: 修改界面添加更多容器格式

编辑 `public/index.html`，在容器格式选择中添加：

```html
<select name="container">
  <option value="webm">webm</option>
  <option value="mp4">mp4</option>
  <option value="mov">mov</option>
  <option value="mkv">mkv</option>
  <option value="gif">gif</option>
  <option value="avi">avi</option>      <!-- 新增 -->
  <option value="flv">flv</option>     <!-- 新增 -->
  <option value="ogv">ogv</option>      <!-- 新增 -->
  <option value="m4v">m4v</option>     <!-- 新增 -->
  <!-- 更多格式... -->
</select>
```

### 方法 2: 使用自定义参数

即使界面中没有的格式，你也可以：

1. 选择任意容器格式（如 webm）
2. 在"自定义参数"中输入：
   ```
   -f,avi
   ```
3. 输出文件名改为 `.avi` 扩展名

### 方法 3: 直接修改输出文件名

1. 选择任意容器格式
2. 将输出文件名改为目标格式扩展名（如 `.flv`）
3. FFmpeg 会根据文件扩展名自动选择容器格式

---

## 📊 格式兼容性矩阵

| 容器格式 | 视频编码器 | 音频编码器 | 用途 |
|---------|----------|-----------|------|
| **webm** | VP8, VP9, AV1 | Opus, Vorbis | Web 播放，开源 |
| **mp4** | H.264, H.265 | AAC, MP3 | 通用，兼容性最好 |
| **mov** | H.264, H.265, ProRes | AAC | macOS/iOS |
| **mkv** | 几乎所有 | 几乎所有 | 开源，功能强大 |
| **gif** | GIF | 无 | 动画图片 |
| **avi** | 几乎所有 | 几乎所有 | 旧格式，兼容性好 |
| **flv** | H.264, VP6 | MP3, AAC | Flash 视频 |
| **ogv** | Theora | Vorbis | Ogg 容器 |

---

## ⚠️ 注意事项

### 1. 编码器与容器兼容性

某些编码器只能用于特定容器：
- **VP8/VP9/AV1** → 主要用于 WebM
- **H.264/H.265** → 主要用于 MP4/MOV
- **Theora** → 主要用于 OGG/OGV

### 2. 浏览器播放支持

- **WebM (VP9/Opus)** - Chrome, Firefox, Edge ✅
- **MP4 (H.264/AAC)** - 所有浏览器 ✅
- **MOV** - Safari ✅，其他浏览器 ⚠️
- **MKV** - 需要插件或转码 ⚠️
- **GIF** - 所有浏览器 ✅

### 3. 文件大小

- **H.265** > **H.264** > **VP9** > **VP8**（压缩率）
- **yuv444p** > **yuv422p** > **yuv420p**（文件大小）
- **CRF 值越小** → 质量越高 → 文件越大

---

## 🚀 推荐配置

### Web 播放（最佳兼容性）
- **容器**: MP4
- **视频编码**: libx264
- **音频编码**: aac
- **像素格式**: yuv420p
- **CRF**: 23-28

### Web 播放（最佳质量）
- **容器**: WebM
- **视频编码**: libvpx-vp9
- **音频编码**: libopus
- **像素格式**: yuv420p 或 yuv422p
- **CRF**: 24-30

### 高质量存档
- **容器**: MKV
- **视频编码**: libx265
- **音频编码**: copy（保持原音频）
- **像素格式**: yuv422p 或 yuv444p
- **CRF**: 18-22

### 快速转换（不重新编码）
- **视频编码**: copy
- **音频编码**: copy
- 仅改变容器格式，速度最快

---

## 📝 总结

- **界面预设**: 5 种常用格式（webm, mp4, mov, mkv, gif）
- **实际支持**: FFmpeg 支持的所有格式（100+ 种）
- **扩展方式**: 修改界面或使用自定义参数
- **推荐**: 根据用途选择合适的容器和编码器组合

如需支持更多格式，可以：
1. 修改界面添加更多选项
2. 使用自定义参数
3. 直接修改输出文件扩展名


