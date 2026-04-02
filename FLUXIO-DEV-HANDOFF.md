# Fluxio 组件开发与替换 — 交付清单

> 供你提供给 AI/开发方完成 P0 组件开发并替换到线上 fluxio 时使用。

---

## 一、你需提供的文档与资源

### 1. 必选（已有即可直接引用）

| 文档 | 路径 | 用途 |
|------|------|------|
| **待开发组件清单** | `FLUXIO-COMPONENTS-TO-DEVELOP.md` | 组件范围、Spec、实现顺序 |
| **交互规范** | `FLUXIO-INTERACTION-FINAL.md` | 点击、切换、拖拽、状态流转等 |
| **组件清单与映射** | `FLUXIO-COMPONENT-LIST.md` | 设计稿节点 ID、替换位置 |
| **线上代码** | `public/fluxio.html`、`public/fluxio.css`、`public/fluxio.js` | 当前实现，用于替换 |
| **设计稿** | `/Users/n7/Desktop/fluxio.pen` | 视觉参考（需 Pencil 或导出截图） |

### 2. 可选（有则更精确）

| 文档 | 用途 |
|------|------|
| `FLUXIO-COMPONENT-SPEC` 或 `FLUXIO-SPEC-DIFF.md` | 颜色、圆角、间距等设计 Token |
| `FLUXIO-CHANGES-FOR-CODE.md` | 已有代码改动建议 |
| `product-spec-final.md` | 产品逻辑、路由、数据结构 |
| `FLUXIO-INSTANCE-REPLACEMENT-REPORT.md` | 设计稿实例化映射，便于对照 |

### 3. 设计稿访问方式

- **Pencil 设计稿**：`fluxio.pen` 需通过 Pencil 打开，或导出关键页面截图
- **Component Library**：组件库在画布右侧（x:6129），含 PrimaryButton、SecondaryButton、TopTabs、OptionGroup、QualitySlider、Message（4 变体）、TaskListItem（3 变体）

---

## 二、开发任务简述（可直接复制给 AI）

```
任务：完成 Fluxio P0 组件开发并替换到线上 fluxio。

范围（11 个组件）：
- 基础：PrimaryButton、SecondaryButton、TopTabs、OptionGroup、QualitySlider
- 反馈：Message（Success/Error/Info/Warning）、TaskProgressRing、Banner
- 业务：TaskListItem（已完成、转换中、等待中）

要求：
1. 保持现有技术栈：vanilla HTML + CSS + JS（无 React/Vue）
2. 任务列表「转换中」使用环形进度（TaskProgressRing），替换当前线性进度条
3. 按 FLUXIO-COMPONENTS-TO-DEVELOP.md 的 Spec 实现
4. 按 FLUXIO-INTERACTION-FINAL.md 实现交互
5. 替换 public/fluxio.html、fluxio.css、fluxio.js 中对应结构，保持功能不变

参考文档：
- FLUXIO-COMPONENTS-TO-DEVELOP.md（组件清单与 Spec）
- FLUXIO-INTERACTION-FINAL.md（交互规范）
- FLUXIO-COMPONENT-LIST.md（设计稿映射）
```

---

## 三、关键约束（需遵守）

| 项 | 说明 |
|----|------|
| 字体 | Alibaba PuHuiTi 3.0 |
| 主按钮色 | #1E2B45 |
| 圆角 | pill 按钮/Tab 用 999px |
| QualitySlider | 5 档，仅透出「体积优先」「推荐」「清晰优先」 |
| 进度 | 转换中状态用 **环形进度**，非线性 |

---

## 四、交付物预期

1. **fluxio.css**：新增/调整组件样式，使用 CSS 变量
2. **fluxio.html**：用新组件结构替换原有 DOM
3. **fluxio.js**：调整渲染逻辑以使用新 DOM 结构，保持现有功能
