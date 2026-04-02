# Fluxio 颜色映射与缺失对照

> 已校正：theme 变量、design 映射、fluxio.css、fluxio.js

---

## 一、Theme 变量（已校正）


| 变量名                            | 值         | 说明           |
| ------------------------------ | --------- | ------------ |
| `--accent`                     | #0090fc   | 强调色          |
| `--btn-primary`                | #1f2125ff | 主按钮          |
| `--bg-panel`                   | #F8FAFC   | 面板背景         |
| `--border`                     | #E5E5E5   | 边框           |
| `--fluxio-success`             | #18bf93   | 成功态          |
| `--fluxio-warning`             | #ffa524   | 警告态          |
| `--fluxio-danger`              | #ff5454   | 错误/危险态       |
| `--fluxio-primary-disabled`    | #9CA3AF   | 主按钮禁用        |
| `--fluxio-banner-error-bg`     | #FEF2F2   | 错误 Banner 背景 |
| `--fluxio-banner-error-border` | #FECACA   | 错误 Banner 边框 |
| `--fluxio-banner-error-text`   | #B91C1B   | 错误 Banner 文字 |
| `--fluxio-tab-inactive`        | #F1F5F9   | Tab 未选背景     |


---

## 二、设计稿 Message 映射


| 元素         | 使用变量                                 |
| ---------- | ------------------------------------ |
| 背景/文字/边框   | $--bg-card、$--text-primary、$--border |
| Success 图标 | $--fluxio-success                    |
| Error 图标   | $--fluxio-danger                     |
| Info 图标    | $--accent                            |
| Warning 图标 | $--fluxio-warning                    |


---

## 三、fluxio.css 映射


| 位置           | 使用变量                                               |
| ------------ | -------------------------------------------------- |
| 渐变           | --fluxio-gradient-start/mid/mid2/end               |
| 错误 Banner    | --fluxio-banner-error-bg/border/text               |
| 失败态 hover    | --fluxio-danger                                    |
| Toast notify | --fluxio-banner-error-* / --fluxio-success-bg/text |


---

## 四、fluxio.js 映射


| 位置             | 使用变量                                                               |
| -------------- | ------------------------------------------------------------------ |
| notify() 背景/文字 | var(--fluxio-banner-error-bg/text) / var(--fluxio-success-bg/text) |
| 失败态 meta 文字    | var(--fluxio-danger)                                               |


