# Fluxio 线上代码改动说明

> 供根据设计稿与规范更新线上代码时参考。依据：Phase 1–7 开发记录（93e0be31）、FLUXIO-COMPONENT-SPEC、FLUXIO-INTERACTION-FINAL、FLUXIO-COMPONENT-LIST。

---

## 一、CSS 变量与样式（fluxio.css）

### 1.1 颜色 Token 更新

在 `:root` 中新增或替换：

```css
/* 主色（P0 已定） */
--fluxio-btn-primary: #1E2B45;        /* 原 #1E293B */
--fluxio-btn-primary-hover: #243455;  /* 新增 */
--fluxio-btn-primary-disabled: #9CA3AF; /* 新增，禁用态 */

/* 背景与边框（P2） */
--fluxio-bg-panel: #F3F6FA;           /* 原 #F8FAFC，轻面板 */
--fluxio-border: #E2E8F0;            /* 普通边框 */
--fluxio-border-soft: #EEF2F7;       /* 浅边框，新增 */
```

### 1.2 圆角 Token

```css
--fluxio-radius-pill: 999px;         /* 新增，按钮/Tab 用 */
```

### 1.3 字体

```css
/* 全局字体（P2：全部 Alibaba PuHuiTi） */
body, .fluxio {
  font-family: "Alibaba PuHuiTi 3.0", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
}
```

### 1.4 组件样式

| 组件 | 选择器 | 修改项 |
|------|--------|--------|
| 主按钮 | `.fluxio-btn--primary` | `border-radius: 999px`；`background: var(--fluxio-btn-primary)`；`font-size: 16px`；`font-weight: 600` |
| 次按钮 | `.fluxio-btn--secondary` | `border-radius: 999px`；`height: 48px` |
| 添加文件按钮 | `.fluxio-add-btn` | `height: 48px`（原 40px） |
| Tab 项 | `.fluxio-tab` | `border-radius: 999px`（原 24px） |
| 文件卡片 | `.fluxio-file-card` | `border-radius: 12px`（保持 12 圆角，非 pill） |

### 1.5 Hero 标题

```css
.fluxio-title {
  font-size: 42px;  /* 设计稿，不采用 Spec 56px */
}
```

---

## 二、质量滑块（QualitySlider）

### 2.1 档位规则

- **5 档**：0%、25%、50%、75%、100%
- **透出文案**：仅 3 项：体积优先（0%）、推荐（50%）、清晰优先（100%）
- **25% / 75%**：不显示文案，仅支持拖拽至该位置
- **默认值**：推荐（50%）

### 2.2 前端实现

**方案 A：下拉改为滑块**

将 `fluxio.html` 中质量选择：

```html
<!-- 原：下拉 -->
<select class="fluxio-select" data-quality>
  <option value="recommended">推荐</option>
  <option value="size">体积优先</option>
  <option value="quality">清晰优先</option>
</select>
```

改为滑块 UI（或保留下拉但扩展选项）：

- 选项值：`size`(0%)、`size_small`(25%)、`recommended`(50%)、`quality_small`(75%)、`quality`(100%)
- 文案仅显示：体积优先、推荐、清晰优先；25%/75% 可选但不显示「偏小」「偏清晰」

**方案 B：保持下拉，扩展为 5 档**

```html
<select class="fluxio-select" data-quality>
  <option value="size">体积优先</option>
  <option value="size_small">体积优先</option>   <!-- 25%，value 区分 -->
  <option value="recommended" selected>推荐</option>
  <option value="quality_small">清晰优先</option> <!-- 75% -->
  <option value="quality">清晰优先</option>
</select>
```

更推荐：用滑块 UI，仅透出 3 个文案，5 档可拖拽。

### 2.3 CRF 映射（fluxio.js）

```javascript
const QUALITY_MAP = {
  size: 38,           // 0% 体积优先
  size_small: 34,     // 25% 偏小
  recommended: 30,    // 50% 推荐
  quality_small: 26,  // 75% 偏清晰
  quality: 23,        // 100% 清晰优先
};
```

### 2.4 后端（server.js）

若 queue 仍用 crf 数字，需支持 5 档的 CRF 映射。当前 30/35/23 可扩展为 5 档，见 FLUXIO-FEASIBILITY 质量档位表。

---

## 三、HTML 结构

### 3.1 添加文件按钮高度

确保 `data-add-btn` 对应按钮有 `height: 48px`（通过 CSS 或内联样式）。

### 3.2 禁用按钮样式

若存在禁用态主按钮，需使用 `--fluxio-btn-primary-disabled: #9CA3AF`。

---

## 四、交互与逻辑（fluxio.js）

### 4.1 已确认规则（无需改）

- taskId：`task_${timestamp}_${random}`
- fileId：`file_0`、`file_1`...
- sourceTab：state + sessionStorage
- 直接访问：若状态不存在，显示错误态
- 下载全部：全部完成后可点击，逐个下载
- 回到首页：清空状态，保留 sourceTab
- Tab 切换确认：有文件时弹确认
- 文件详情：独立路由，时长/帧率有则显示

### 4.2 需修改

1. **质量档位**：从 3 档改为 5 档，更新 `QUALITY_MAP` 与 UI 取值逻辑
2. **主按钮色**：若硬编码 `#1E293B`，改为 `#1E2B45` 或 `var(--fluxio-btn-primary)`

---

## 五、组件清单（实现参考）

实现时可参考 FLUXIO-COMPONENT-LIST.md，优先实现 P0 组件：

| 组件 | 关键 Spec |
|------|-----------|
| PrimaryButton | 48px、pill、#1E2B45、16px/600 |
| SecondaryButton | 48px、pill、addFileBtn 48px |
| TopTabs | pill、选中浮起 |
| QualitySlider | 5 档、仅透出 3 文案、25%/75% 可拖拽 |
| 文件卡片 | 12px 圆角（非 pill） |

---

## 六、文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `fluxio.css` | 修改 | 颜色、圆角、字体、组件样式 |
| `fluxio.html` | 修改 | 质量滑块 UI（若改为滑块） |
| `fluxio.js` | 修改 | QUALITY_MAP 5 档、质量取值 |
| `server.js` | 可选 | 5 档 CRF 映射（若后端需区分） |

---

## 七、参考文档

- `FLUXIO-INTERACTION-FINAL.md`：交互与实现口径
- `FLUXIO-COMPONENT-LIST.md`：组件清单与设计稿映射
- `FLUXIO-FEASIBILITY.md` §3.4：质量档位 CRF 映射
- `FLUXIO-SPEC-DIFF.md`：设计 Spec 差异
