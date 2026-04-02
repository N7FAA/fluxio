# Fluxio 组件整理清单

> 基于 FLUXIO-COMPONENT-SPEC、设计稿 fluxio.pen、FLUXIO-INTERACTION-FINAL 整理，供前端实现参考。

---

## 一、按优先级分组

### P0 核心组件（优先实现）

| 序号 | 组件名 | 类型 | 用途 | 对应设计稿 | 关键 Spec |
|------|--------|------|------|------------|-----------|
| 1 | PrimaryButton | 基础 | 主操作（开始转换、下载全部、上传文件） | 各页主按钮 | 48px 高、pill 圆角、#1E2B45、16px/600 |
| 2 | SecondaryButton | 基础 | 次操作（回到首页、添加文件） | 各页次按钮 | 48px 高、pill 圆角、addFileBtn 48px |
| 3 | TopTabs | 基础 | 首页分类切换（图片/动态图像/视频） | Tabs 区域 | pill 圆角、选中浮起 |
| 4 | OptionGroup | 基础 | 格式/分辨率/帧率单选组 | formatSection、resSection | 单选 + 文字、横向排列 |
| 5 | QualitySlider | 基础 | 五档质量滑块 | qualitySection | 5 档、仅透出 3 文案、25%/75% 可拖拽 |
| 6 | Banner | 反馈 | 错误/成功提示横幅 | 顶部条 | error/warning/success 变体 |
| 6a | Message | 反馈 | 全局浮层消息（success/error/info/warning） | Component Library | 白底、黑字、状态色图标、12px 圆角、轻边框 |
| 7 | TaskProgressRing | 反馈 | 处理中环形进度 | 任务列表项 | queued/processing/completed/failed |
| 8 | TaskListItem | 业务 | 任务列表单条结果 | 任务列表项 | 3 种状态：已完成/转换中/等待中，转换中用环形进度 |
| ~~9~~ | ~~FileInfoPanel~~ | ~~业务~~ | ~~文件详情右侧信息区~~ | ~~infoPanel~~ | **已删除，前端单独实现** |
| ~~10~~ | ~~DetailPreviewPanel~~ | ~~业务~~ | ~~文件详情左侧预览区~~ | ~~contentArea~~ | **已删除，前端单独实现** |

### P1 页面容器组件

| 序号 | 组件名 | 类型 | 用途 | 对应设计稿 | 关键 Spec |
|------|--------|------|------|------------|-----------|
| 11 | UploadCard | 业务 | 首页上传空态卡片 | uploadSection + UploadCard | 主提示+格式说明+上传按钮 |
| 12 | UploadDropzone | 业务 | 拖拽中上传态 | P04 拖拽态 | 高亮边框+拖拽文案 |
| 13 | WorkbenchPanel | 业务 | 输出设置主工作台容器 | Left Panel + Right Panel | 左侧文件区+右侧设置+底部操作 |
| 14 | OutputSettingsPanel | 业务 | 输出设置右侧面板 | Right Panel | 格式+帧率+分辨率+质量+按钮 |
| 15 | TaskHeader | 业务 | 任务列表头部 | 任务列表顶部 | 标题+状态+数量+下载全部 |

### P2 补充组件

| 序号 | 组件名 | 类型 | 用途 | 对应设计稿 | 关键 Spec |
|------|--------|------|------|------------|-----------|
| 16 | TextLinkButton | 基础 | 文字链接（查看/下载） | 任务列表、详情页 | #2563EB、16px/14px、无背景 |
| 17 | StatusBadge | 反馈 | 状态文案/标识 | 任务列表项 | 已完成/处理中/排队中/失败 |
| 18 | BackButton | 基础 | 详情页返回 | 详情页左上 | 箭头按钮、轻背景 |
| 19 | FileThumbnailCard | 业务 | 工作台文件展示卡 | fileCard1~N | 缩略图+文件名+删除、12px 圆角 |
| 20 | PageBackground | 布局 | 页面背景渐变容器 | 全页根容器 | 渐变背景 |

---

## 二、按页面引用

| 页面 | 组件 |
|------|------|
| P01 首页-图片空态 | PageBackground, TopTabs, UploadCard, PrimaryButton, Banner |
| P02 首页-动态图像空态 | 同上 |
| P03 首页-视频空态 | 同上 |
| P04 首页-拖拽中 | PageBackground, TopTabs, UploadDropzone |
| P05 图片工作台 | PageBackground, WorkbenchPanel, FileThumbnailCard, OutputSettingsPanel, OptionGroup×2, QualitySlider, PrimaryButton, SecondaryButton, Banner |
| P06 动态图像工作台 | 同上 + OptionGroup×3（格式/帧率/分辨率） |
| P07 视频工作台 | 同上 |
| P08 任务列表-进行中 | PageBackground, TaskHeader, TaskListItem, TaskProgressRing, SecondaryButton, Banner |
| P09 任务列表-已完成 | PageBackground, TaskHeader, TaskListItem, PrimaryButton, SecondaryButton, TextLinkButton |
| P10~P12 文件详情 | PageBackground, BackButton（前端单独实现） |

---

## 三、设计稿节点映射（fluxio.pen）

### 已替换为组件的 P0 元素

| 组件 | 组件库 ID | 替换位置 |
|------|-----------|----------|
| PrimaryButton | yyqqm | 开始转换(dynDw)、上传文件(zQRJW) |
| SecondaryButton | 1sUps | 回到首页(dynDw) |
| TopTabs | lisop | MbxOs(Tabs) |
| OptionGroup | tgJOr | formatSection(I5afS) |
| QualitySlider | xspUh | qualitySection(TUQRe) |
| TaskListItem | b2n1f / 2YNxO / MKIeM | 任务列表项(V4xNa, JX6Kr, o9Alq, Lq6eS) |

**TaskListItem 变体**（3 种状态）：
- **已完成** (b2n1f)：缩略图 + 文件名 + 大小对比（`5.9 MB → 63.2 KB 压缩98% \| 1920 × 1080`）+ 查看、下载
- **转换中** (2YNxO)：缩略图 + 文件名 +「转换中」+ 右侧 **TaskProgressRing 环形进度** + 百分比（如 75%）
- **等待中** (MKIeM)：缩略图 + 文件名 +「等待中」+ 右侧「等待中」文案，无进度条、无查看/下载
| ~~FileInfoPanel~~ | ~~3qo3e~~ | **已删除** |
| ~~DetailPreviewPanel~~ | ~~yypeT~~ | **已删除** |

### 组件库

- **KkO7p**：Component Library（x:6129），包含上述 7 个可复用组件（不含 FileInfoPanel、DetailPreviewPanel）
- **Message 变体**：KgiL9(Success)、OsyiP(Error)、wWbgJ(Info)、fqxHj(Warning)

---

## 四、实现顺序建议

1. **设计 Token**：先建立 CSS 变量（颜色、字体、圆角、间距），见 FLUXIO-COMPONENT-SPEC §1
2. **P0 基础组件**：PrimaryButton、SecondaryButton、TopTabs、OptionGroup、QualitySlider
3. **P0 反馈组件**：Banner、TaskProgressRing
4. **P0 业务组件**：TaskListItem（3 种状态，转换中需 TaskProgressRing 环形进度）
5. **P1 容器**：UploadCard、UploadDropzone、WorkbenchPanel、OutputSettingsPanel、TaskHeader
6. **P2 补充**：TextLinkButton、StatusBadge、BackButton、FileThumbnailCard、PageBackground

---

## 五、口径约束（必须遵守）

- **字体**：全部 Alibaba PuHuiTi 3.0
- **Hero 字号**：42px（设计稿）
- **颜色**：全部 follow FLUXIO-COMPONENT-SPEC §1.1
- **QualitySlider**：5 档，仅透出体积优先/推荐/清晰优先，25%/75% 支持拖拽无文案
- **交互**：以 FLUXIO-INTERACTION-FINAL 为准
