# Fluxio 设计文件提取值（fluxio.pen）

> 用于与 FLUXIO-COMPONENT-SPEC 对照

**提取日期**: 2025-03-19  
**源文件**: `/Users/n7/Desktop/fluxio.pen`  
**页面数**: 13 个

---

## 1. 设计变量（Variables）

```json
{
  "--accent": "#2563EB",
  "--accent-hover": "#1D4ED8",
  "--bg": "#FAFAFA",
  "--bg-card": "#FFFFFF",
  "--bg-panel": "#F8FAFC",
  "--border": "#E5E5E5",
  "--border-light": "#E2E8F0",
  "--btn-primary": "#1E293B",
  "--gradient-end": "#FED7AA",
  "--gradient-mid": "#FCE7F3",
  "--gradient-start": "#EDE9FE",
  "--radius-2xl": 24,
  "--radius-lg": 12,
  "--radius-md": 8,
  "--radius-sm": 6,
  "--radius-xl": 16,
  "--spacing-2xl": 48,
  "--spacing-3xl": 64,
  "--spacing-lg": 24,
  "--spacing-md": 16,
  "--spacing-sm": 8,
  "--spacing-xl": 32,
  "--spacing-xs": 4,
  "--text-muted": "#94A3B8",
  "--text-primary": "#0A0A0A",
  "--text-secondary": "#64748B"
}
```

---

## 2. 颜色（Colors）

### 2.1 Fill 颜色

| 值 | 用途 |
|---|---|
| `#0A0A0A` | 主标题、选中 Tab 文字、任务名称 |
| `#64748B` | 副标题、次要文字、链接、Tab 未选中 |
| `#94A3B8` | 禁用按钮文字、提示文字、占位文字 |
| `#FFFFFF` | 主按钮文字、卡片背景、Tab 选中背景 |
| `#F8FAFC` | 面板背景、次要按钮背景 |
| `#F1F5F9` | Tab 未选中背景 |
| `#E5E5E5` | 禁用按钮背景、边框 |
| `#E2E8F0` | 卡片边框、分隔线 |
| `#1E293B` | 主按钮背景 |
| `#2563EB` | 链接/强调色（查看、下载） |
| `#ffffff3d` | Tab 容器背景（半透明白） |
| `#cbd5e1` | 拖拽中 uploadBox 边框 |
| `#212d3d` | 深色元素 |
| `#343f4d` | 深色元素 |
| `#18bf93` | 强调色（成功等） |
| `#00000000` | 透明 |
| `rgba(0,0,0,0.06)` | uploadBox 边框 |

### 2.2 Stroke 颜色

| 值 | 用途 |
|---|---|
| `#E5E5E5` | 卡片边框、uploadBox |
| `#E2E8F0` | 面板边框、任务卡片分隔 |
| `#212d3d` | 深色描边 |
| `#cbd5e1` | 拖拽态边框 |
| `#18bf93` | 强调描边 |
| `rgba(0,0,0,0.06)` | uploadBox 边框 |

---

## 3. 字体（Typography）

### 3.1 fontFamily

| 值 | 用途 |
|---|---|
| `Alibaba PuHuiTi 3.0` | 主标题、副标题、按钮、Tab、卡片文字 |
| `Inter` | 输出设置标签、结果区域、禁用按钮 |

### 3.2 fontSize

| 值 | 用途 |
|---|---|
| 42 | Hero 主标题 |
| 24 | 任务列表标题 |
| 20 | 输出设置标题 |
| 16 | Hero 副标题、上传提示 |
| 15 | 按钮文字、任务进度标题 |
| 14 | Tab、卡片标签、链接、进度百分比 |
| 12 | 输出设置标签、结果标签 |

### 3.3 fontWeight

| 值 | 用途 |
|---|---|
| `600` | 主标题、任务列表标题、输出标题 |
| `500` | 副标题、按钮、Tab 选中、标签 |
| `normal` | 次要文字、Tab 未选中 |

---

## 4. 圆角（cornerRadius）

| 值 | 用途 |
|---|---|
| `100` | TopTabs 容器（药丸形） |
| `24` | Tab 项、uploadBox、面板圆角 |
| `16` | 任务卡片、completedCard |
| `12` | 主/次按钮、fileCard、添加文件按钮 |
| `8` | 禁用按钮、图片占位、进度条 |
| `6` | 小元素 |
| `4` | Tab 容器内边距、滑块 |
| `[24,0,0,24]` | 左面板（左上、左下圆角） |
| `[0,24,24,0]` | 右面板（右上、右下圆角） |
| `$--radius-lg` | 变量引用 (12) |
| `$--radius-sm` | 变量引用 (6) |

---

## 5. 间距（Spacing）

### 5.1 padding

| 值 | 用途 |
|---|---|
| `[80,80,80,80]` | 页面主 padding |
| `[64,0,64,0]` | 首页垂直 padding |
| `[64,36,64,36]` | Hero 区域 |
| `[36,64]` / `[35,64]` | uploadSection |
| `[32,32,32,32]` | 左右面板 |
| `[48,48,48,48]` | uploadBox、任务卡片 |
| `[24,64]` | 输出区域、按钮区域 |
| `[24,24]` | Tab 项 |
| `[12,24]` | Tab 内边距 |
| `[4,4,4,4]` | Tab 容器 |
| `[0,24]` | 主/次按钮 |
| `[0,32]` | 上传文件按钮 |
| `[0,64,0,64]` | Tabs 容器 |
| `16` | fileCard |
| `20` | 部分 fileCard（hover 态） |

### 5.2 gap

| 值 | 用途 |
|---|---|
| 48 | Tab 项间距 |
| 36 | 选项组 |
| 24 | 任务卡片、输出设置区块 |
| 20 | uploadBox 内部 |
| 16 | 按钮行、fileCard 内部、文件网格 |
| 12 | 按钮组、输出区块 |
| 8 | Hero 标题与副标题、Tab 内部 |
| 4 | 上传提示与按钮 |

---

## 6. 阴影（Effect / Shadow）

**未发现**：设计中未使用 `effect` 中的 shadow。卡片、按钮等均无阴影。

---

## 7. 按钮（Buttons）

### 7.1 PrimaryButton（主按钮）

| 属性 | 值 |
|-----|-----|
| **名称** | convertBtn / 上传文件按钮 / btnDownAll |
| **height** | 48 |
| **cornerRadius** | 12 |
| **fill** | `#1E293B` |
| **padding** | `[0, 24]` 或 `[0, 32]`（上传按钮） |
| **gap** | 8 |
| **文字** | fill: `#FFFFFF`, fontSize: 15, fontWeight: 500, fontFamily: Alibaba PuHuiTi 3.0 |

### 7.2 SecondaryButton（次要按钮）

| 属性 | 值 |
|-----|-----|
| **名称** | backToHomeBtn / 回到首页 / addFileBtn |
| **height** | 48 或 40（addFileBtn） |
| **cornerRadius** | 12 |
| **fill** | `#F8FAFC` |
| **stroke** | `#E2E8F0`, thickness: 1 |
| **padding** | `[0, 24]` |
| **gap** | 8 |
| **文字** | fill: `#64748B`, fontSize: 15/14, fontWeight: 500, fontFamily: Alibaba PuHuiTi 3.0 |

### 7.3 Disabled Button（禁用按钮）

| 属性 | 值 |
|-----|-----|
| **名称** | 开始转换-禁用 |
| **height** | 40 |
| **cornerRadius** | 8 |
| **fill** | `#E5E5E5` |
| **padding** | `[0, 24]` |
| **文字** | fill: `#94A3B8`, fontSize: 14, fontWeight: 500, fontFamily: Inter |

---

## 8. 背景渐变（Background Gradient）

**页面背景**（所有主页面一致）：

```json
{
  "type": "gradient",
  "gradientType": "linear",
  "rotation": 145,
  "size": { "height": 1 },
  "colors": [
    { "color": "#EDE9FE", "position": 0 },
    { "color": "#FCE7F3", "position": 0.35 },
    { "color": "#FFEDD5", "position": 0.7 },
    { "color": "#FED7AA", "position": 1 }
  ]
}
```

---

## 9. Tab（TopTabs）

### 9.1 Tab 容器（Frame 5）

| 属性 | 值 |
|-----|-----|
| **cornerRadius** | 100 |
| **fill** | `#ffffff3d` |
| **padding** | 4 |
| **gap** | 48 |

### 9.2 Tab 项 - 选中态

| 属性 | 值 |
|-----|-----|
| **cornerRadius** | 24 |
| **fill** | `#ffffffff` |
| **padding** | `[12, 24]` |
| **gap** | 8 |
| **width** | 104 |
| **文字** | fill: `#0A0A0A`, fontSize: 14, fontWeight: 500 |

### 9.3 Tab 项 - 未选中态

| 属性 | 值 |
|-----|-----|
| **cornerRadius** | 24 |
| **fill** | `#F1F5F9`（或 enabled: false 透明） |
| **padding** | `[12, 24]` |
| **文字** | fill: `#64748B`, fontSize: 14, fontWeight: normal |

---

## 10. 卡片（Cards）

### 10.1 UploadCard（uploadBox）

| 属性 | 值 |
|-----|-----|
| **cornerRadius** | 24 |
| **fill** | `#FFFFFF` |
| **stroke** | `rgba(0,0,0,0.06)` 或 `#cbd5e1`（拖拽中）, thickness: 1 |
| **padding** | 48 |
| **gap** | 20 |
| **height** | 360 |
| **width** | 720 |

### 10.2 FileThumbnailCard（fileCard）

| 属性 | 值 |
|-----|-----|
| **cornerRadius** | 12 |
| **fill** | `#FFFFFF` |
| **stroke** | `#E5E5E5`, thickness: 1 |
| **padding** | 16（部分 20） |
| **gap** | 16 |
| **height** | 180 |
| **layout** | vertical |
| **图片占位** | 80×80, cornerRadius: 8 |
| **文字** | fill: `#64748B`, fontSize: 14, fontWeight: normal |

### 10.3 TaskCard（taskCard / completedCard）

| 属性 | 值 |
|-----|-----|
| **cornerRadius** | 16 |
| **fill** | `#F8FAFC` |
| **stroke** | `#E2E8F0`, thickness: 1 |
| **padding** | 48 |
| **gap** | 24 |
| **width** | 720 |

### 10.4 Left Panel / Right Panel

| 属性 | Left Panel | Right Panel |
|-----|------------|-------------|
| **cornerRadius** | [24,0,0,24] | [0,24,24,0] |
| **fill** | `#F8FAFC` | `#FFFFFF` |
| **stroke** | `#E2E8F0`, right: 1 | 无或 `#E5E5E5`, 0 |
| **padding** | 32 | 32 |
| **gap** | 24 | 24 |

---

## 11. 页面列表

| ID | 名称 |
|----|------|
| dG4zA | Fluxio-图片 |
| Uqbpv | Fluxio-输出设置（图片） |
| poS5I | Fluxio-任务列表（进行中） |
| Y236R | Fluxio-任务列表（已完成） |
| eGGRh | Fluxio-查看文件（图片） |
| COYfw | Fluxio-动态图像 |
| yLwdb | Fluxio-视频 |
| boYpz | Fluxio-输出设置（动态图像） |
| h8qKO | Fluxio-输出设置（视频） |
| VRqRA | Fluxio-查看文件（动图） |
| xqFes | Fluxio-查看文件（视频） |
| 3QjEq | Fluxio-空态（拖拽中） |
| hSCp6 | Fluxio-输出设置（图片）- 文件hover |

---

## 12. 完整 JSON 汇总

```json
{
  "variables": {
    "colors": {
      "accent": "#2563EB",
      "accentHover": "#1D4ED8",
      "bg": "#FAFAFA",
      "bgCard": "#FFFFFF",
      "bgPanel": "#F8FAFC",
      "border": "#E5E5E5",
      "borderLight": "#E2E8F0",
      "btnPrimary": "#1E293B",
      "gradientStart": "#EDE9FE",
      "gradientMid": "#FCE7F3",
      "gradientEnd": "#FED7AA",
      "textPrimary": "#0A0A0A",
      "textSecondary": "#64748B",
      "textMuted": "#94A3B8"
    },
    "radius": {
      "sm": 6,
      "md": 8,
      "lg": 12,
      "xl": 16,
      "2xl": 24
    },
    "spacing": {
      "xs": 4,
      "sm": 8,
      "md": 16,
      "lg": 24,
      "xl": 32,
      "2xl": 48,
      "3xl": 64
    }
  },
  "typography": {
    "fontFamily": ["Alibaba PuHuiTi 3.0", "Inter"],
    "fontSize": [12, 14, 15, 16, 20, 24, 42],
    "fontWeight": ["normal", "500", "600"]
  },
  "buttons": {
    "primary": {
      "height": 48,
      "cornerRadius": 12,
      "fill": "#1E293B",
      "text": { "fill": "#FFFFFF", "fontSize": 15, "fontWeight": "500" }
    },
    "secondary": {
      "height": 48,
      "cornerRadius": 12,
      "fill": "#F8FAFC",
      "stroke": "#E2E8F0",
      "text": { "fill": "#64748B", "fontSize": 15, "fontWeight": "500" }
    },
    "disabled": {
      "height": 40,
      "cornerRadius": 8,
      "fill": "#E5E5E5",
      "text": { "fill": "#94A3B8", "fontSize": 14, "fontWeight": "500" }
    }
  },
  "tabs": {
    "container": { "cornerRadius": 100, "fill": "#ffffff3d", "padding": 4, "gap": 48 },
    "itemSelected": { "cornerRadius": 24, "fill": "#FFFFFF", "padding": [12, 24], "text": { "fill": "#0A0A0A", "fontSize": 14, "fontWeight": "500" } },
    "itemUnselected": { "cornerRadius": 24, "fill": "#F1F5F9", "text": { "fill": "#64748B", "fontSize": 14, "fontWeight": "normal" } }
  },
  "cards": {
    "uploadBox": { "cornerRadius": 24, "fill": "#FFFFFF", "stroke": "rgba(0,0,0,0.06)", "padding": 48, "gap": 20, "height": 360 },
    "fileCard": { "cornerRadius": 12, "fill": "#FFFFFF", "stroke": "#E5E5E5", "padding": 16, "gap": 16, "height": 180 },
    "taskCard": { "cornerRadius": 16, "fill": "#F8FAFC", "stroke": "#E2E8F0", "padding": 48, "gap": 24 }
  },
  "gradient": {
    "type": "linear",
    "rotation": 145,
    "colors": [
      { "color": "#EDE9FE", "position": 0 },
      { "color": "#FCE7F3", "position": 0.35 },
      { "color": "#FFEDD5", "position": 0.7 },
      { "color": "#FED7AA", "position": 1 }
    ]
  },
  "shadows": null
}
```
