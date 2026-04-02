# Fluxio 待开发组件清单（最终版）

> 基于设计稿 fluxio.pen、FLUXIO-COMPONENT-LIST、FLUXIO-INTERACTION-FINAL 整理。  
> 更新日期：2025-03-12

---

## 一、范围说明

| 类别 | 说明 |
|------|------|
| **已排除** | FileInfoPanel、DetailPreviewPanel — 由前端单独实现，不纳入组件开发 |
| **进度形态** | 任务列表「转换中」状态：**线性进度 → 环形进度**（TaskProgressRing） |
| **需实现** | Message（4 变体）、TaskListItem（3 种状态）、TaskProgressRing |

---

## 二、待开发组件清单（按优先级）

### P0 基础组件（5 个）

| 序号 | 组件名 | 设计稿 ID | 关键 Spec | 说明 |
|------|--------|-----------|-----------|------|
| 1 |  **PrimaryButton** | yyqqm | 48px 高、pill 圆角、#1E2B45、16px/600 | 主操作按钮 |
| 2 | **SecondaryButton** | 1sUps | 48px 高、pill 圆角、addFileBtn 48px | 次操作按钮 |
| 3 | **TopTabs** | lisop | pill 圆角、选中浮起 | 图片/动态图像/视频切换 |
| 4 | **OptionGroup** | tgJOr | 单选 + 文字、横向排列 | 格式/分辨率/帧率 |
| 5 | **QualitySlider** | xspUh | 5 档、仅透出 3 文案、25%/75% 可拖拽 | 质量滑块 |

---

### P0 反馈组件（5 个）

| 序号 | 组件名 | 设计稿 ID | 关键 Spec | 说明 |
|------|--------|-----------|-----------|------|
| 6 | **Message** | KgiL9 / OsyiP / wWbgJ / fqxHj | 白底、黑字、状态色图标、12px 圆角、轻边框 | 4 变体：Success / Error / Info / Warning |
| 7 | **TaskProgressRing** | 待新增 | 环形进度、queued/processing/completed/failed | 替换当前线性进度条 |
| 8 | **Banner** | 待新增 | 顶部条、error/warning/success 变体 | 错误/成功提示横幅 |

---

### P0 业务组件（3 个 TaskListItem 变体）

| 序号 | 组件名 | 设计稿 ID | 关键 Spec | 说明 |
|------|--------|-----------|-----------|------|
| 9 | **TaskListItem/已完成** | b2n1f | 缩略图 + 文件名 + 大小对比（含压缩%）+ 查看、下载 | 已完成态 |
| 10 | **TaskListItem/转换中** | 2YNxO | 缩略图 + 文件名 +「转换中」+ **TaskProgressRing 环形进度** + 百分比 | 使用 **环形进度**，非线性 |
| 11 | **TaskListItem/等待中** | MKIeM | 缩略图 + 文件名 +「等待中」+ 右侧「等待中」文案 | 无进度条 |

---

### ~~P1 / P2 组件~~（不开发）

> UploadCard、UploadDropzone、WorkbenchPanel、OutputSettingsPanel、TaskHeader、TextLinkButton、StatusBadge、BackButton、FileThumbnailCard、PageBackground — **已排除，不纳入开发**。

---

## 三、设计稿变更摘要

| 变更项 | 说明 |
|--------|------|
| 删除 FileInfoPanel | 已从 Component Library 移除，详情页用占位替代 |
| 删除 DetailPreviewPanel | 已从 Component Library 移除，详情页用占位替代 |
| 进度形态 | TaskListItem/转换中 使用 **环形进度**（TaskProgressRing），线上线性进度需替换 |

---

## 四、实现顺序建议

1. **设计 Token**：CSS 变量（颜色、字体、圆角、间距）
2. **P0 基础组件**：PrimaryButton、SecondaryButton、TopTabs、OptionGroup、QualitySlider
3. **P0 反馈组件**：Message（4 变体）、**TaskProgressRing**、Banner
4. **P0 业务组件**：TaskListItem（已完成、转换中、等待中）

---

## 五、口径约束

- **字体**：全部 Alibaba PuHuiTi 3.0
- **Hero 字号**：42px（设计稿）
- **颜色**：follow FLUXIO-COMPONENT-SPEC §1.1
- **QualitySlider**：5 档，仅透出体积优先/推荐/清晰优先，25%/75% 可拖拽无文案
- **交互**：以 FLUXIO-INTERACTION-FINAL 为准
- **任务列表进度**：**环形进度**（TaskProgressRing），非线性
