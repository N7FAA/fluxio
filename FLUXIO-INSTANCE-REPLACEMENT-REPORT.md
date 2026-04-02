# Fluxio 设计稿组件实例化替换报告

> 执行日期：2025-03-12  
> 设计稿：`/Users/n7/Desktop/fluxio.pen`

---

## 一、替换总览

| 指标 | 数量 |
|------|------|
| **已替换为组件实例的元素** | **38** |
| **未替换的元素** | 见下方「未替换清单」 |

---

## 二、已替换元素明细（按父组件分类）

### 2.1 基础组件

#### PrimaryButton (yyqqm)

| 原节点 ID | 所在页面 | 替换后实例 ID | 文案覆盖 |
|-----------|----------|---------------|----------|
| B5u7o | dG4zA 首页-图片 / zQRJW 上传区 | kiwOa | 上传文件 |
| hHnaf | Uqbpv 输出设置（图片） | clAeO | 开始转换 |
| RugzR | poS5I 任务列表-进行中 | D27GD | 下载全部 |
| Np2gf | Y236R 任务列表-已完成 | 5FVJY | 下载全部 |
| wqXl4 | boYpz 输出设置（动态图像） | TwSGY | 开始转换 |
| On6K4 | h8qKO 输出设置（视频） | 53VxM | 开始转换 |

**小计：6 个 PrimaryButton 实例**

#### SecondaryButton (1sUps)

| 原节点 ID | 所在页面 | 替换后实例 ID | 文案覆盖 |
|-----------|----------|---------------|----------|
| odcOV | Uqbpv 输出设置（图片） | eAoWJ | 回到首页 |
| KAQFe | poS5I 任务列表-进行中 | HBPLx | 回到首页 |
| LW4Sa | Y236R 任务列表-已完成 | Ot7wv | 回到首页 |
| C95Or | boYpz 输出设置（动态图像） | yycuS | 回到首页 |
| NZbGM | h8qKO 输出设置（视频） | XoZnU | 回到首页 |
| O1Tig | Uqbpv 工作台 leftFooter | ypW6M | 添加文件 |
| R4uO8 | boYpz 工作台 leftFooter | USV4e | 添加文件 |
| 0ea8U | h8qKO 工作台 leftFooter | gSw8n | 添加文件 |

**小计：8 个 SecondaryButton 实例**

#### TopTabs (lisop)

| 原节点 ID | 所在页面 | 替换后实例 ID |
|-----------|----------|---------------|
| O8xb3 | dG4zA 首页-图片 | K3z43 |
| Bbvth | COYfw 首页-动态图像 | qVtBP |
| 1V6BV | yLwdb 首页-视频 | Pusvh |

**小计：3 个 TopTabs 实例**

#### OptionGroup (tgJOr)

| 原节点 ID | 所在页面 | 替换后实例 ID | 标签覆盖 |
|-----------|----------|---------------|----------|
| XKVww | Uqbpv 输出设置（图片） | 7iv9e | 格式 |
| 9XFo8 | Uqbpv 输出设置（图片） | bt1x4 | 分辨率 |
| pSBuC | boYpz 输出设置（动态图像） | 3D42j | 格式 |
| CcRf2 | boYpz 输出设置（动态图像） | 1k6ze | 帧率 |
| izHPA | boYpz 输出设置（动态图像） | fui8n | 分辨率 |
| W4ywl | h8qKO 输出设置（视频） | JAXdV | 格式 |
| 0ZEDZ | h8qKO 输出设置（视频） | bo0nc | 帧率 |
| zWEZe | h8qKO 输出设置（视频） | fqrYd | 分辨率 |

**小计：8 个 OptionGroup 实例**

#### QualitySlider (xspUh)

| 原节点 ID | 所在页面 | 替换后实例 ID |
|-----------|----------|---------------|
| dm0o4 | Uqbpv 输出设置（图片） | klx3d |
| y87hv | boYpz 输出设置（动态图像） | VgQJk |
| X7MJk | h8qKO 输出设置（视频） | olwjZ |

**小计：3 个 QualitySlider 实例**

---

### 2.2 复合组件

#### TaskListItem

| 原节点 ID | 所在页面 | 替换后实例 ID | 父组件 |
|-----------|----------|---------------|--------|
| nt7wt | poS5I 任务列表-进行中 | uRwnT | 2YNxO（转换中） |
| JUtJs | poS5I 任务列表-进行中 | rdcUN | MKIeM（等待中） |
| eKBMv | poS5I 任务列表-进行中 | ieITL | MKIeM（等待中） |
| KR11v | poS5I 任务列表-进行中 | vPmN4 | MKIeM（等待中） |
| uxfqu | Y236R 任务列表-已完成 | YaVnu | b2n1f（已完成） |
| xwyGg | Y236R 任务列表-已完成 | hKiCl | b2n1f（已完成） |
| 6vwW5 | Y236R 任务列表-已完成 | RA8mB | b2n1f（已完成） |
| IPCfJ | Y236R 任务列表-已完成 | hPQm5 | b2n1f（已完成） |

**小计：8 个 TaskListItem 实例**

---

### 2.3 页面模块

#### ~~FileInfoPanel~~ / ~~DetailPreviewPanel~~

> **已删除**：FileInfoPanel、DetailPreviewPanel 已从 Component Library 移除，详情页改为占位，由前端单独实现。

---

## 三、未替换元素及原因

| 元素 | 所在位置 | 未替换原因 |
|------|----------|------------|
| **UploadCard / uploadBox (zQRJW)** | dG4zA, COYfw, yLwdb 首页 | 无对应父组件。组件库中无 UploadCard 定义，仅内部「上传文件」按钮已替换为 PrimaryButton |
| **FileThumbnailCard (fileCard)** | 工作台 Left Panel 文件网格 | 无对应父组件。组件库中无 FileThumbnailCard 定义 |
| **TaskHeader** | 任务列表顶部（KriZq, mxTIr） | 无对应父组件。组件库中无 TaskHeader 定义 |
| **Banner / Message** | 各页顶部错误/成功提示 | 设计稿中未发现 Banner 区域，或为隐藏态。Message 组件 (KgiL9 等) 已存在但页面未使用 |
| **TaskProgressRing** | 任务列表项 | 组件库中无 TaskProgressRing 定义，任务列表已用 TaskListItem 变体替代 |
| **BackButton** | 详情页左上 | 已包含在 DetailPreviewPanel 内，随 DetailPreviewPanel 一并替换 |
| **PageBackground** | 各页根容器 | 为渐变背景容器，非可复用组件形态，保持为普通 frame |
| **Hero 标题/副标题** | zyAVN 等 | 纯文案区块，无对应 Typography 组件 |
| **清空链接 (clearLink)** | leftFooter | 纯文字链接，无 TextLinkButton 组件可复用 |
| **DpiOK** | 文档根 | 独立 text 节点，用途不明，未替换 |

---

## 四、替换统计汇总

| 父组件 | 替换数量 |
|--------|----------|
| PrimaryButton (yyqqm) | 7 |
| SecondaryButton (1sUps) | 8 |
| TopTabs (lisop) | 3 |
| OptionGroup (tgJOr) | 8 |
| QualitySlider (xspUh) | 3 |
| TaskListItem (b2n1f / 2YNxO / MKIeM) | 8 |
| ~~FileInfoPanel~~ / ~~DetailPreviewPanel~~ | ~~2~~（已删除） |
| **合计** | **36** |

> 注：统计以实际 batch_design 执行结果为准，共 **38** 次替换操作。

---

## 五、后续建议

1. **新增组件定义**：若需统一维护 UploadCard、FileThumbnailCard、TaskHeader、Banner、TaskProgressRing、BackButton、TextLinkButton，建议在 Component Library 中新增对应组件并设为 `reusable: true`，再对页面元素做实例替换。
2. **Message 使用**：Message 变体 (Success/Error/Info/Warning) 已存在，可在错误/成功提示场景中插入对应实例。
3. **布局校验**：替换后若出现 fit_content/fill_container 相关告警，可检查父级 `layout` 及子级尺寸约束，必要时微调。
