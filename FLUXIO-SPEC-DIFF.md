# FLUXIO 设计规范对照差异

> 对照 FLUXIO-COMPONENT-SPEC.md 与当前 fluxio.pen 页面设计值，列出差异项

---

## 1. 颜色 Tokens 差异

| Token (Spec) | Spec 值 | 当前值 | 差异 |
|--------------|---------|--------|------|
| `--fluxio-primary` | `#1E2B45` | `#1E293B` | ⚠️ 主按钮色不同：Spec 偏蓝，当前偏灰 |
| `--fluxio-primary-hover` | `#243455` | `#1D4ED8` (accent-hover) | ⚠️ 未使用 Spec 的 hover 色 |
| `--fluxio-primary-disabled` | `#9CA3AF` | `#E5E5E5` (背景) + `#94A3B8` (文字) | ⚠️ Spec 为单色，当前为背景+文字分离 |
| `--fluxio-success` | `#18BF93` | `#18bf93` | ✅ 一致 |
| `--fluxio-warning` | `#F59E0B` | 未使用 | ⚠️ 设计中未出现 |
| `--fluxio-danger` | `#EF4444` | 未使用 | ⚠️ 设计中未出现 |
| `--fluxio-banner-error-bg` | `#FEF2F2` | 未提取 | 需确认错误 Banner |
| `--fluxio-banner-error-border` | `#FECACA` | 未提取 | 需确认 |
| `--fluxio-banner-error-text` | `#B91C1B` | 未提取 | 需确认 |
| `--fluxio-bg-card-soft` | `#F3F6FA` | `#F8FAFC` | ⚠️ 轻面板色不同 |
| `--fluxio-border-soft` | `#EEF2F7` | `#E5E5E5` / `#E2E8F0` | ⚠️ Spec 有 border-soft，当前未区分 |

---

## 2. 字体 Tokens 差异

| Token (Spec) | Spec 值 | 当前值 | 差异 |
|--------------|---------|--------|------|
| `--fluxio-font-family` | Alibaba PuHuiTi 3.0, PingFang SC... | Alibaba PuHuiTi 3.0 / Inter 混用 | ⚠️ 部分用 Inter，Spec 未提 Inter |
| `--fluxio-font-size-hero` | `56px` | `42px` | ⚠️ Hero 主标题字号偏小 |
| `--fluxio-font-size-h1` | `40px` | 未使用 | ⚠️ 当前最大为 42 |
| `--fluxio-font-size-h2` | `24px` | `24px` | ✅ 一致 |
| `--fluxio-font-size-h3` | `20px` | `20px` | ✅ 一致 |
| `--fluxio-font-size-body-lg` | `18px` | `16px` 为主 | ⚠️ 大正文未用 18 |
| `--fluxio-font-size-body` | `16px` | `16px` | ✅ 一致 |
| `--fluxio-font-size-sm` | `14px` | `14px` | ✅ 一致 |
| `--fluxio-font-size-xs` | `12px` | `12px` | ✅ 一致 |
| `--fluxio-font-weight-bold` | `700` | 未使用 | ⚠️ 当前最大 600 |

---

## 3. 圆角 Tokens 差异

| Token (Spec) | Spec 值 | 当前值 | 差异 |
|--------------|---------|--------|------|
| `--fluxio-radius-sm` | `6px` | `6px` | ✅ 一致 |
| `--fluxio-radius-md` | `8px` | `8px` | ✅ 一致 |
| `--fluxio-radius-lg` | `12px` | `12px` | ✅ 一致 |
| `--fluxio-radius-xl` | `16px` | `16px` | ✅ 一致 |
| `--fluxio-radius-2xl` | `24px` | `24px` | ✅ 一致 |
| `--fluxio-radius-pill` | `999px` | `12px` / `24px` / `100` | ⚠️ **Spec 要求按钮/Tab 用 pill (999px)，当前用 12/24** |

---

## 4. 阴影 Tokens 差异

| Token (Spec) | Spec 值 | 当前值 | 差异 |
|--------------|---------|--------|------|
| `--fluxio-shadow-soft` | `0 8px 24px rgba(15,23,42,0.06)` | 未使用 | ⚠️ 设计中无阴影 |
| `--fluxio-shadow-card` | `0 4px 12px rgba(15,23,42,0.05)` | 未使用 | ⚠️ 设计中无阴影 |
| `--fluxio-shadow-tab-active` | `0 2px 8px rgba(15,23,42,0.08)` | 未使用 | ⚠️ Tab 无阴影 |
| `--fluxio-shadow-button` | `0 4px 12px rgba(30,41,59,0.16)` | 未使用 | ⚠️ 按钮无阴影 |

---

## 5. 间距 Tokens 差异

| Token (Spec) | Spec 值 | 当前值 | 差异 |
|--------------|---------|--------|------|
| `--fluxio-space-2` | `8px` | `8px` | ✅ 一致 |
| `--fluxio-space-3` | `12px` | `12px` | ✅ 一致 |
| `--fluxio-space-4` | `16px` | `16px` | ✅ 一致 |
| `--fluxio-space-5` | `20px` | `20px` | ✅ 一致 |
| `--fluxio-space-6` | `24px` | `24px` | ✅ 一致 |
| `--fluxio-space-8` | `32px` | `32px` | ✅ 一致 |
| `--fluxio-space-10` | `40px` | 部分 40 | ✅ 基本一致 |
| `--fluxio-space-12` | `48px` | `48px` | ✅ 一致 |
| `--fluxio-space-16` | `64px` | `64px` | ✅ 一致 |
| Spec 无 4px | - | `4px` (xs) | 当前多出 xs 档 |

---

## 6. 组件样式差异

### 6.1 PrimaryButton

| 属性 | Spec | 当前 | 差异 |
|------|------|------|------|
| 高度 | 48px / 56px | 48px | ✅ 一致 |
| 圆角 | `--fluxio-radius-pill` (999px) | 12px | ⚠️ **Spec 要求 pill，当前为 12** |
| 背景 | 深色实心/渐变 | 实心 #1E293B | 色值见上 |
| 文字 | 白色，16px，600 | 白色，15px，500 | ⚠️ 字号 16 vs 15，字重 600 vs 500 |

### 6.2 SecondaryButton

| 属性 | Spec | 当前 | 差异 |
|------|------|------|------|
| 高度 | 48px | 48px / 40px (addFileBtn) | ⚠️ addFileBtn 为 40 |

### 6.3 TopTabs

| 属性 | Spec | 当前 | 差异 |
|------|------|------|------|
| 胶囊外壳 | 选中项浮起 | cornerRadius 100 | 当前实现与 Spec 一致 |
| `--fluxio-radius-pill` | 999px | Tab 项 24 | ⚠️ Tab 项应为 pill |

### 6.4 UploadCard

| 属性 | Spec | 当前 | 差异 |
|------|------|------|------|
| 圆角 | 参考 radius-2xl | 24 | ✅ 一致 |
| 背景 | #F8FAFC / #FFFFFF | #FFFFFF | 可选 |
| 边框 | - | rgba(0,0,0,0.06) | Spec 未细定义 |

### 6.5 QualitySlider

| 属性 | Spec | 当前 | 差异 |
|------|------|------|------|
| 档位 | 5 档 | 3 档（体积优先/推荐/清晰优先） | ⚠️ **Spec 要求 5 档，当前 3 档** |

---

## 7. 差异汇总（优先级）

### P0 高优先级

1. **PrimaryButton 圆角**：Spec 要求 `radius-pill` (999px)，当前 12px
2. **PrimaryButton 文字**：Spec 16px/600，当前 15px/500
3. **SecondaryButton 圆角**：Spec 要求 `radius-pill`，当前 12px
4. **TopTabs 项圆角**：Spec 要求 pill，当前 24
5. **QualitySlider**：Spec 5 档，当前 3 档

### P1 中优先级（已定口径）

6. **主按钮色**：Spec #1E2B45
7. **Hero 字号**：**follow 设计稿 42px**（不采用 Spec 56px）
8. **addFileBtn 高度**：Spec 统一 48
9. **阴影**：Spec 定义了 4 种 shadow

### P2 低优先级（已定口径）

10. **fontFamily**：全部使用 Alibaba PuHuiTi 3.0，去除 Inter
11. **颜色**：全部 follow SPEC（禁用 #9CA3AF、bg-card-soft #F3F6FA、border-soft #EEF2F7、primary #1E2B45、primary-hover #243455 等）

---

## 8. 建议

1. **圆角统一**：若采用 Spec 的 pill 风格，需将 PrimaryButton、SecondaryButton、TopTabs 项改为 `radius: 999px`；若保持当前 12/24，建议更新 Spec。
2. **QualitySlider**：扩展为 5 档，或更新 Spec 为 3 档。
3. **阴影**：按 Spec 为卡片、Tab、按钮添加阴影，或从 Spec 中移除阴影定义。
4. **主色**：确认主按钮色为 #1E2B45 还是 #1E293B，统一后更新 Spec 或设计。
