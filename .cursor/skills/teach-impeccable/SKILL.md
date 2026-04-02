---
name: teach-impeccable
description: Provides design suggestions and recommendations for the current design file. Use when the user asks for design advice, 设计稿建议, 设计建议, or wants feedback on the current design.
---

# 设计稿建议 (Design Advice)

When the user asks for design suggestions for the current design file, follow this workflow.

## Step 1: Get Design Context

1. **If working with Pencil (.pen file)**:
   - Call `get_editor_state` to identify the active design file and selection
   - Call `batch_get` to inspect the selected node or key frames (Component Library, pages)
   - Call `get_variables` for design tokens (colors, spacing)
   - Optionally `get_screenshot` for visual verification

2. **If working with HTML/CSS**:
   - Read the relevant fluxio.html, fluxio.css, and any component files
   - Identify the current structure and styles

## Step 2: Analyze Across Dimensions

Evaluate the design and provide suggestions in these areas:

### 视觉层级 (Visual Hierarchy)
- 主次是否清晰？用户能否在 2 秒内找到主操作？
- 尺寸、颜色、位置是否传达正确的重要性？
- 是否存在视觉竞争？

### 信息架构 (Information Architecture)
- 结构是否直观？相关内容是否合理分组？
- 是否一次呈现过多选择？（认知负荷）
- 导航是否清晰可预期？

### 组件与一致性 (Components & Consistency)
- 是否复用组件而非重复绘制？
- 间距、圆角、字体是否统一？
- 是否有未实例化的应组件化元素？

### 状态与边界 (States & Edge Cases)
- 空态、加载态、错误态、成功态是否都有考虑？
- 交互反馈是否明确？

### 可访问性 (Accessibility)
- 对比度是否足够？
- 可点击区域是否足够大？
- 是否有必要的语义/标签？

### 设计规范 (Design Spec Alignment)
- 是否符合 FLUXIO-COMPONENT-SPEC、FLUXIO-INTERACTION-FINAL？
- 字体、颜色、圆角是否遵循既定 Token？

## Step 3: Output Format

Structure suggestions as:

```markdown
## 设计稿建议

### 整体印象
[1–2 句概括：做得好的地方 + 最大改进机会]

### 优先建议（按影响排序）
1. **[问题名称]**  
   - 现状：…  
   - 建议：…  
   - 原因：…

2. …

### 次要观察
- …

### 可考虑的改进方向
- …
```

- 直接、具体，避免模糊表述
- 每个建议说明「现状」「建议」「原因」
- 按影响排序，优先 3–5 条
- 可引用 Pencil 节点 ID 或 HTML 选择器便于定位
