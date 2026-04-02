# Fluxio 项目管理与流程规划

> 单人开发 · Cursor + Pencil 全链路 · 目标：完成 PRD 全部功能 · 优化 Token 调用量

---

## 一、Token 优化原则

| 原则 | 做法 |
|------|------|
| **小任务单次完成** | 每个任务 1 个明确产出，1 次对话内完成 |
| **精准引用** | 用 `@文件路径` 或 `@文件夹` 指定上下文，避免「整个项目」 |
| **设计先行** | Pencil 先出稿，再写代码，减少反复修改 |
| **增量文件** | 新建 fluxio.* 不碰 index/app.js，降低 diff 成本 |
| **决策留痕** | 在本文档或 TASKS.md 记录进度，新会话直接引用 |
| **Grep 优先** | 查逻辑用 grep，少用「读整个文件」 |
| **单文件编辑** | 一次会话只改 1～2 个文件 |

---

## 二、阶段与里程碑

```
Phase 0: 设计稿 (Pencil)     → 产出：.pen 设计文件
Phase 1: 基础框架            → 产出：fluxio.html + 路由
Phase 2: 图片 Tab            → 产出：图片转换闭环
Phase 3: 动态图像 Tab        → 产出：动图转换闭环
Phase 4: 视频 Tab            → 产出：视频转换闭环
Phase 5: 序列帧 ZIP          → 产出：后端解析 + 前端支持
Phase 6: 批量与体验          → 产出：多文件、拖拽、错误态
Phase 7: 结果区增强          → 产出：预览、压缩比、下载全部
```

---

## 三、Phase 0：Pencil 设计稿（建议 2～3 次会话）

### 0.1 设计范围

| 页面/状态 | 说明 |
|-----------|------|
| 首页 - 空态 | Tab + 上传区文案 + 输出设置置灰 |
| 首页 - 有文件 | 文件列表 + 输出设置激活 |
| 首页 - 处理中 | 进度条、状态文案 |
| 首页 - 有结果 | 结果卡片、查看/下载 |
| 错误态 | 格式不符、文件过大等提示 |

### 0.2 会话规划（降低 Token）

**会话 1**：只做「首页布局」  
- 打开 Pencil，新建或打开 .pen  
- 提示词：「按 FLUXIO-MVP-PLAN 的「3.2.1 页面结构」画 Fluxio 首页线框：顶部标题、Tab、上传区、文件列表、输出设置、结果区。参考 PRODUCT-SPEC 的布局建议。」  
- 产出：主布局框架

**会话 2**：补齐三个 Tab 的文案与上传区  
- 提示词：「在现有布局上，为图片/动态图像/视频三个 Tab 分别设置上传区文案和格式说明，参考 PRD 的 Tab 与输入输出关系。」  
- 产出：Tab 文案与格式说明

**会话 3**：结果区与状态  
- 提示词：「添加结果区：单文件卡片（文件名、大小、压缩比、查看/下载按钮）。添加处理中态：进度条、状态文案。」  
- 产出：结果区与状态

### 0.3 设计规范（建议单独建一页）

- 主色、字阶、间距、圆角（可参考 PRODUCT-SPEC 5.3）  
- 一次定好，后续实现直接引用

---

## 四、Phase 1：基础框架（1 次会话）

**目标**：`/fluxio` 可访问，页面骨架可渲染。

**上下文**：`@ffmpeg-tool/server.js` `@ffmpeg-tool/public/`

**任务**：
1. 在 server.js 中加 `app.get('/fluxio', ...)` 返回 fluxio.html  
2. 新建 `public/fluxio.html`：基础结构（标题、Tab、占位区）  
3. 新建 `public/fluxio.css`：基础样式（可复用 styles.css 变量）  
4. 新建 `public/fluxio.js`：空壳，仅 Tab 切换逻辑  

**提示词示例**：
```
在 ffmpeg-tool 中新增 Fluxio 页面。按 FLUXIO-MVP-PLAN 的 3.3 路由方案：
1. server.js 添加 /fluxio 路由返回 fluxio.html
2. 新建 public/fluxio.html，包含：标题「Fluxio · 让动效轻松落地」、三个 Tab（图片/动态图像/视频）、上传区占位、输出设置占位、结果区占位
3. 新建 fluxio.css 和 fluxio.js，实现 Tab 切换
参考：FLUXIO-MVP-PLAN 3.2.1 页面结构
```

---

## 五、Phase 2：图片 Tab（1～2 次会话）

**目标**：图片 Tab 上传 → 转换 → 下载 闭环。

**会话 1**：上传 + 文件列表  
- 上下文：`@fluxio.html` `@fluxio.js` `@server.js`（仅 upload、queue 相关）  
- 任务：上传区（点击+拖拽）、调用 `/api/upload`、文件列表展示、删除  
- 提示词：「在 fluxio 图片 Tab 中实现上传：点击和拖拽调用 POST /api/upload，返回的 path/name/size 展示在文件列表，支持删除。参考 server.js 的 upload 接口。」  

**会话 2**：输出设置 + 转换 + 下载  
- 上下文：`@fluxio.js` `@server.js`（queue、jobs 相关）  
- 任务：输出格式（PNG/JPG/WEBP）、分辨率、质量；调用 queue；轮询 jobs；结果下载  
- 提示词：「在 fluxio 图片 Tab 中：输出设置（格式 PNG/JPG/WEBP、分辨率、质量），点击开始转换调用 POST /api/queue，轮询 GET /api/jobs，成功后用 /uploads/文件名 下载。参数映射见 FLUXIO-MVP-PLAN 3.2.3 图片 Tab。」  

---

## 六、Phase 3：动态图像 Tab（1 次会话）

**目标**：动图 Tab 闭环。

**上下文**：`@fluxio.html` `@fluxio.js` `@FLUXIO-MVP-PLAN.md`（3.2.3 动态图像 Tab）

**任务**：按 Tab 切换上传区文案；输出格式 GIF/APNG/WEBP；帧率；参数映射与 queue 调用  

**提示词**：
```
动态图像 Tab：输入支持 GIF/APNG/WEBP/MP4/MOV/WEBM，输出格式 GIF/APNG/WEBP，增加帧率选项（原始/30/24）。
参数映射：container=gif|apng|webp，params.frameRate，params.crf。
复用 Phase 2 的上传逻辑，按 Tab 切换时更新 upload 的 accept 和文案。
```

---

## 七、Phase 4：视频 Tab（1 次会话）

**目标**：视频 Tab 闭环。

**任务**：输出格式 MP4/WEBM；参数映射；与动态图像共享输入格式  

**提示词**：
```
视频 Tab：输入同动态图像，输出格式 MP4/WEBM。参数映射见 FLUXIO-MVP-PLAN 3.2.3 视频 Tab。
复用上传和输出设置逻辑，仅调整格式选项。
```

---

## 八、Phase 5：序列帧 ZIP（2 次会话）

**目标**：支持上传 ZIP 序列帧并转换。

**会话 1**：后端  
- 上下文：`@server.js`  
- 任务：新增 `/api/upload-sequence` 或扩展 upload 逻辑；解压 ZIP；校验命名、尺寸、帧数；返回帧信息  
- 提示词：「按 PRD 序列帧规范：ZIP 内 PNG/JPG 按 前缀_编号 命名（如 demo_0001.png），同一 ZIP 前缀一致、编号 4-6 位、位数一致、从 0001 连续，校验尺寸一致、帧数≤600。在 server 中实现解析逻辑，返回帧列表或临时路径。」  

**会话 2**：前端  
- 任务：上传 ZIP 时走新接口；动态图像/视频 Tab 支持 ZIP 输入  
- 提示词：「fluxio 支持 ZIP 序列帧上传：调用新接口，上传成功后展示帧数等信息，转换时传序列帧路径给 queue。」  

---

## 九、Phase 6：批量与体验（2 次会话）

**会话 1**：多文件  
- 任务：支持多文件上传（PRD 限制：图片 30、动图/视频 10）；队列顺序处理；结果区展示多文件  
- 提示词：「fluxio 支持批量：图片 Tab 最多 30 文件，动图/视频最多 10，总大小按 PRD。逐个调用 queue，轮询时展示所有任务状态。」  

**会话 2**：拖拽、错误态、校验  
- 任务：拖拽上传；格式/大小/时长超限提示；PRD 校验规则  
- 提示词：「完善 fluxio：拖拽上传、格式不符/文件过大/时长超限时显示 PRD 规定的错误文案。前端校验 + 后端校验。」  

---

## 十、Phase 7：结果区增强（1 次会话）

**任务**：原始/输出大小、压缩比；图片/动图预览；视频播放；下载全部（ZIP 打包）  

**提示词**：
```
fluxio 结果区：展示原始大小、输出大小、压缩比。图片用 img 预览，动图用 video loop，视频用 video 播放。
支持「下载全部」：多文件时打包成 ZIP 下载（需后端支持或前端逐个下载）。
```

---

## 十一、会话提示词模板（复用）

每次新会话开始时，可先发：

```
项目：Fluxio 格式转换工具，基于 ffmpeg-tool。
当前阶段：[Phase X]
任务：[具体任务]
参考文档：@PROJECT-PLAN.md @FLUXIO-MVP-PLAN.md
相关文件：@具体文件路径
```

---

## 十二、进度追踪（建议维护）

在项目根目录建 `TASKS.md`，格式：

```markdown
## Phase 0 设计
- [ ] 首页布局
- [ ] Tab 文案
- [ ] 结果区与状态

## Phase 1 框架
- [ ] 路由 + fluxio.html
- [ ] Tab 切换

## Phase 2 图片 Tab
- [ ] 上传
- [ ] 转换 + 下载
...
```

每完成一项勾选，新会话直接引用「当前做到 Phase X 的 Y」。

---

## 十三、Token 估算与节奏

| Phase | 预估会话数 | 单会话预估 Token | 建议节奏 |
|-------|------------|------------------|----------|
| 0 | 2～3 | 5k～15k | 集中 1 天 |
| 1 | 1 | 3k～8k | 0.5 天 |
| 2 | 2 | 8k～15k/次 | 1 天 |
| 3 | 1 | 5k～10k | 0.5 天 |
| 4 | 1 | 4k～8k | 0.5 天 |
| 5 | 2 | 10k～20k/次 | 1～2 天 |
| 6 | 2 | 8k～15k/次 | 1 天 |
| 7 | 1 | 8k～15k | 0.5 天 |
| **合计** | **12～14** | **约 80k～150k** | **约 6～8 天** |

**省 Token 技巧**：
- 设计稿一次性在 Pencil 完成，减少「设计→代码」来回
- 每 Phase 完成后再开下一 Phase，避免跨 Phase 混谈
- 遇到复杂逻辑时，先拆成「只改一个文件」的小任务

---

## 十四、文件结构（最终）

```
ffmpeg-tool/
├── public/
│   ├── index.html          # 现有
│   ├── app.js
│   ├── styles.css
│   ├── fluxio.html         # 新增
│   ├── fluxio.js           # 新增
│   └── fluxio.css          # 新增
├── server.js               # 仅加 /fluxio 路由，Phase 5 可能加序列帧接口
├── PROJECT-PLAN.md         # 本文档
├── TASKS.md                # 进度追踪（建议）
├── FLUXIO-MVP-PLAN.md
└── PRODUCT-SPEC.md
```

设计稿（Pencil）建议放在 `ffmpeg-tool/designs/fluxio.pen` 或项目外单独目录。
