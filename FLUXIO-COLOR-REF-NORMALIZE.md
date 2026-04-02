# Fluxio 设计稿颜色引用规范化报告

> 将硬编码 fill/stroke 替换为 Variable 引用，仅做引用规范化，不改变视觉效果

---

## 一、替换总数

**共 156 处** 硬编码颜色已替换为 Variable 引用

---

## 二、各 Variable 被复用次数

| Variable | 复用次数 | 原硬编码值 |
|----------|----------|------------|
| `$--bg-panel` | 9 | #F8FAFC |
| `$--bg-card` | 48 | #FFFFFF / #ffffffff |
| `$--border` | 42 | #E2E8F0 / #E5E5E5 |
| `$--text-primary` | 14 | #0A0A0A |
| `$--text-secondary` | 18 | #64748B |
| `$--text-muted` | 6 | #94A3B8 |
| `$--fluxio-tab-inactive` | 16 | #F1F5F9 |
| `$--fluxio-primary-disabled` | 2 | #9CA3AF |
| `$--btn-primary` | 1 | #1f2125ff |

---

## 三、替换明细

### $--bg-panel (12次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| Component/SecondaryButton (1sUps) | fill | #F8FAFC |
| Component/DetailPreviewPanel (yypeT) | fill | #F8FAFC |
| Left Panel (JN9NT) | fill | #F8FAFC |
| Left Panel (6RzBc) | fill | #F8FAFC |
| Left Panel (xlbkJ) | fill | #F8FAFC |
| completedCard (3bMrz) | fill | #F8FAFC |
| taskCard (VXa9b) | fill | #F8FAFC |
| Left Panel (9YKKp) | fill | #F8FAFC |
| Component/DetailPreviewPanel (k7XTA) | fill | #F8FAFC |

### $--bg-card (48次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| Tab-图片 (tWSqf) | fill | #ffffffff |
| Component/FileInfoPanel (3qo3e) | fill | #FFFFFF |
| Right Panel (u2ja0) | fill | #FFFFFF |
| Right Panel (tcP2A) | fill | #FFFFFF |
| Right Panel (1nJa3) | fill | #FFFFFF |
| Right Panel (R2kzn) | fill | #FFFFFF |
| Right Panel (svo9s) | fill | #FFFFFF |
| uploadBox (zQRJW) | fill | #FFFFFF |
| uploadBox (zQRJW) | fill | #FFFFFF |
| uploadBox (0nY52) | fill | #FFFFFF |
| uploadBox (RS5Fv) | fill | #FFFFFF |
| uploadBox (xN6y4) | fill | #FFFFFF |
| convertBtnText (zdMgj) | fill | #FFFFFF |
| convertBtnText (vqILR) | fill | #FFFFFF |
| fileCard1~4 (c0TkO, DRbPD, BITGw, v5e9l, 1HGw8) | fill | #FFFFFF |
| fileCard1~4 (sXHap, 4FNQ2, Efoa1, ncU4T, 71vnN) | fill | #FFFFFF |
| fileCard1~4 (HOZu0, LgJAs, woTNj, aJ9oK, otLjj) | fill | #FFFFFF |
| fileCard1~4 (m8qQ1, wjTMm, 95APW, HGVyS, 2SL14) | fill | #FFFFFF |
| fileCard1~4 (VicJ8, FDeTh, QNXFL, fdbBr, 50WUd) | fill | #FFFFFF |
| fileCard1~4 (svIdM, V2bO1, k19c3, 06ORD, 2wFT7) | fill | #FFFFFF |

### $--border (42次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| Component/SecondaryButton (1sUps) | stroke.fill | #E2E8F0 |
| Component/TaskListItem (b2n1f) | stroke.fill | #E2E8F0 |
| Component/DetailPreviewPanel (yypeT) | stroke.fill | #E2E8F0 |
| Component/DetailPreviewPanel (k7XTA) | stroke.fill | #E2E8F0 |
| Component/FileInfoPanel (3qo3e) | stroke.fill | #E5E5E5 |
| Component/FileInfoPanel (svo9s) | stroke.fill | #E5E5E5 |
| Component/QualitySlider (jiYs1) | fill | #E5E5E5 |
| Left Panel (JN9NT, 6RzBc, xlbkJ) | stroke.fill | #E2E8F0 |
| completedCard (3bMrz) | stroke.fill | #E2E8F0 |
| taskCard (VXa9b) | stroke.fill | #E2E8F0 |
| Left Panel (9YKKp) | stroke.fill | #E2E8F0 |
| formatSelect, resSelect, qualitySelect (xhx7n, G0wQ8, HplBi) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (xhx7n, G0wQ8, HplBi) | stroke.fill | #E5E5E5 |
| formatSelect, resSelect, qualitySelect (wCCmt, KcRBT, WhwLk) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (wCCmt, KcRBT, WhwLk) | stroke.fill | #E5E5E5 |
| formatSelect, resSelect, qualitySelect (KYybe, WWnmO, CjLOB) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (KYybe, WWnmO, CjLOB) | stroke.fill | #E5E5E5 |
| formatSelect, resSelect, qualitySelect (MG4T7, R0o6M, iSPM3) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (MG4T7, R0o6M, iSPM3) | stroke.fill | #E5E5E5 |
| fileCard1~4 (c0TkO, DRbPD, BITGw, v5e9l, 1HGw8) | stroke.fill | #E5E5E5 |
| fileCard1~4 (sXHap, 4FNQ2, Efoa1, ncU4T, 71vnN) | stroke.fill | #E5E5E5 |
| fileCard1~4 (HOZu0, LgJAs, woTNj, aJ9oK, otLjj) | stroke.fill | #E5E5E5 |
| fileCard1~4 (m8qQ1, wjTMm, 95APW, HGVyS, 2SL14) | stroke.fill | #E5E5E5 |
| fileCard1~4 (VicJ8, FDeTh, QNXFL, fdbBr, 50WUd) | stroke.fill | #E5E5E5 |
| fileCard1~4 (svIdM, V2bO1, k19c3, 06ORD, 2wFT7) | stroke.fill | #E5E5E5 |

### $--text-primary (14次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| formatWebp (p7rMm) | fill | #0A0A0A |
| 推荐 (dqu3E) | fill | #0A0A0A |
| task1Name (O6njG) | fill | #0A0A0A |
| 图片 (kgNRV) | fill | #0A0A0A |
| infoTitle (HnkZB) | fill | #0A0A0A |
| heroTitle (ef9mZ) | fill | #0A0A0A |
| heroTitle (JR8vm) | fill | #0A0A0A |
| heroTitle (yxoSP) | fill | #0A0A0A |
| outputTitle (qMWZK) | fill | #0A0A0A |
| backIcon (GPYQn) | fill | #0A0A0A |

### $--text-secondary (18次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| 格式 (yjQkO) | fill | #64748B |
| 回到首页 (mXjVY) | fill | #64748B |
| 动态图像 (gdG7o) | fill | #64748B |
| 视频 (aRYwj) | fill | #64748B |
| outputLabel (OPpuF, i3PnD, YMznD, U35NR) | fill | #64748B |
| heroSubtitle (B182s, X2lN8, 8Xhhf) | fill | #64748B |
| uploadText (3kYWH) | fill | #64748B |
| resultLabel (sn8iL, AatQW) | fill | #64748B |
| infoLine1~3 (e8Tia, wx1uO, 7f9Pf, OC79p, IuR7l, Ss760) | fill | #64748B |

### $--text-muted (6次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| 体积优先 (bfBOL) | fill | #94A3B8 |
| 清晰优先 (mIsze) | fill | #94A3B8 |
| formatJpg (9Na6L) | fill | #94A3B8 |
| formatPng (JScWi) | fill | #94A3B8 |
| uploadHint (L4cuk) | fill | #94A3B8 |
| resultEmpty (62ao9, 2CEHf) | fill | #94A3B8 |

### $--fluxio-tab-inactive (16次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| Tab-动态图像 (lotVh) | fill.color | #F1F5F9 |
| Tab-视频 (viylf) | fill.color | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (xhx7n, G0wQ8, HplBi) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (wCCmt, KcRBT, WhwLk) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (KYybe, WWnmO, CjLOB) | fill | #F1F5F9 |
| formatSelect, resSelect, qualitySelect (MG4T7, R0o6M, iSPM3) | fill | #F1F5F9 |

### $--fluxio-primary-disabled (2次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| 开始转换-禁用 (zEOHr) | fill | #9CA3AF |
| 开始转换-禁用 (J3oCy) | fill | #9CA3AF |

### $--btn-primary (1次)

| 对象名 | 属性 | 原值 |
|--------|------|------|
| Component/PrimaryButton (yyqqm) | fill | #1f2125ff |

---

## 四、未替换（不满足条件）

- **rgba(0,0,0,0.06)**：无对应 Variable
- **#cbd5e1**：无对应 Variable
- **#ffffff3d**：半透明，不处理
- **#299eff**：与 --accent 不一致
- **#1E2B45**：B5u7o 使用，与 --btn-primary 当前值 #1f2125ff 不一致
- **gradient 内 stop**：按规则不处理
