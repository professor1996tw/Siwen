# 思聞國學 SIWEN ACADEMY 專案記憶

> 建立日期：2026-05-03
> 用途：紀錄整個建站對話的決策、設定與待辦，方便未來接續對話。
> 注意：本專案與「日央水原商行」無關，是用戶的另一個外部專案。

---

## 一、專案基本資訊

| 項目 | 內容 |
|---|---|
| 客戶／合作夥伴 | 思聞國學（SIWEN ACADEMY） |
| 主題 | 奇門遁甲教學 |
| 用戶角色 | 協助建站、規劃線上課程上架 |
| 技術棧 | 純 HTML + CSS + JS（靜態網站） |
| 預計託管 | GitHub Pages |
| GitHub 帳號 | professor1996tw |
| Repo 名稱 | Siwen |
| 網域 | 對方已申請（阿里雲，待告知具體網址與是否做過 ICP 備案） |
| 網站定位 | **專注課程招生**，已移除命理諮詢業務 |

---

## 二、網站區塊架構（最終版順序）

```
1. Hero                  ─ 主視覺、八卦旋轉動畫
2. Ticker                ─ 三奇六儀跑馬燈
3. About（關於思聞）       ─ 4 條教學承諾
4. Courses（奇門課程）     ─ 4 張課程卡 + 彈窗報名
5. Knowledge（奇門知識）   ─ 4 個分頁教學
6. Applications（學成應用）─ 6 張應用卡（連子頁）
7. Process（諮詢流程）     ─ ⚠️ 還是諮詢相關文案，未改
8. Testimonials（見證）    ─ ⚠️ 有兩則是諮詢案例，未換
9. FAQ                   ─ 8 題 + JSON-LD
10. Contact（報名諮詢）    ─ 表單（無聯絡資訊）
11. Footer               ─ IG / FB 圖示連結
```

---

## 三、課程方案（最終定案）

| 課程 | 售價 | 規格 | 重點 |
|---|---|---|---|
| 奇門遁甲線上課程 | **NT$2,980** | 365 天無限觀看 | 入門最划算 |
| 奇門遁甲研習班 | **NT$25,000** | 2 堂 × 10h（20h） | 12 大實戰主題 |
| 奇門遁甲高階班 | **NT$120,000** | 3 堂 × 10h（30h） | 八大領域 + 法奇門 |
| 研習＋高階套餐 | **NT$130,000** | 5 堂 × 10h（50h） | 省 NT$15,000 |

### 研習班課程內容（12 大實戰主題）
1. 看流年運勢
2. 找物（遺失物 / 方向）
3. 找財方
4. 擇日擇時
5. 預測感情、婚姻
6. 看六親（父母兄弟配偶子女）
7. 預測健康疾病
8. 多選擇情境分析
9. 預測買房 / 租房
10. 預測開公司 / 開店
11. 奇門風水：住家氣場調整
12. 除四害技法基礎

### 高階班課程內容（5 大進階模組）
1. **八大領域精準預測**：婚姻感情、升遷調動、行業選擇、健康疾病、買賣吉凶、學業考試、合夥吉凶、官司訴訟
2. **取用神詳解**：天盤地盤組合、佈局物品、行為風水
3. **奇門穿號碼**
4. **佈局實務 13 大主題**：催財、催官、文昌、考試、桃花、討債、官司、催丁、賣房、健康、小孩聽話、買房、找貴人
5. **法奇門**：請神、書符、用印、踏罡、符咒、上表

---

## 四、開班規則

- 滿 **10 人即開班**（從原本 4 人改成 10 人）
- **滾動式排課**：不固定開課日
- 結業即加入**學員微信群**，老師與學長姐長期答疑
- 開班前 7 日內可全額退費
- 學費可分 3 期

---

## 五、報名表單欄位

### 課程卡片彈窗（modal）
1. 稱呼 ★
2. 電話 ★ ｜ Email ★
3. LINE ID ｜ WeChat ID
4. 出生年月日 ★（date picker）
5. 上課地 ★（依課程動態：線上課程自動帶「線上」、其他三課只給台灣/上海/馬來西亞）
6. 命理基礎（4 級程度）
7. 想對老師說的話（選填）
8. 同意條款 ★

### 下方 Contact 表單（簡化版）
1. 稱呼 ★
2. 電話 ★ ｜ Email ★
3. LINE ID ｜ WeChat ID
4. 對哪個課程有興趣 ★（5 選 1：4 課程 + 還在比較）
5. 想對老師說的話（選填）
6. 同意條款 ★

---

## 六、SEO / AEO 設定

| 項目 | 狀態 |
|---|---|
| title / description / keywords | ✅ 完整 |
| Open Graph + Twitter Card | ✅ |
| canonical / robots | ✅ |
| JSON-LD LocalBusiness | ✅（已拿掉假電話/地址，改加 IG/FB sameAs） |
| JSON-LD Course（4 門）| ✅ |
| JSON-LD FAQPage（8 題）| ✅ |
| Favicon | ✅ logo.png |
| Sitemap.xml | ❌ 待加 |
| robots.txt | ❌ 待加 |

---

## 七、視覺設計

- **Logo**：`images/logo.png`（白色圓形 + 聞字）
- **思聞國學文字**：白色 #ffffff
- **主色**：金色 #d4af37 ／ 金亮 #f5d970 ／ 金深 #a48426
- **底色**：#0a0a0f（暗夜黑）／ #11111a ／ #181826
- **字型**：Noto Serif TC（標題）／ Noto Sans TC（內文）／ Cinzel（英文）
- **設計骨架**：參考 emotiv.com/zh-hant/studio
- **特色元素**：
  - Hero 旋轉八卦三環太極圖
  - About 洛書九宮互動方陣
  - 三奇六儀跑馬燈
  - 課程卡 2×2、應用卡 3×2

---

## 八、社群連結（真實，無 LINE 官方帳號）

- IG：https://www.instagram.com/siwenguoxue/
- FB：https://www.facebook.com/profile.php?id=61577993916492
- ❌ 暫無 LINE 官方帳號
- ❌ 暫無公開電話、地址、Email

---

## 九、檔案架構

```
Siwen website/
├── index.html              （主頁，已完成）
├── PROJECT_MEMORY.md       （本檔案）
├── .gitignore              （排除 backend/）
├── css/
│   └── style.css           （已完成）
├── js/
│   └── script.js           （已完成）
├── images/
│   └── logo.png            （已上傳）
├── applications/           ⚠️ 待用戶建立 6 個子頁面
│   ├── single-question.html  （單事問斷）
│   ├── business.html         （事業 · 創業布局）
│   ├── relationship.html     （感情 · 姻緣合盤）
│   ├── annual.html           （流年 · 年度運勢）
│   ├── fengshui.html         （陽宅 · 居家氣場）
│   └── decision.html         （找物 · 多選擇判斷）
└── backend/                ⚠️ 不可上 GitHub Public
    ├── apps-script.gs        （GAS 程式碼，含 Token）
    └── SETUP.md              （部署指南）
```

---

## 十、立即待辦清單（給用戶）

### A. 表單後端串接（Google Apps Script，已簡化為自動建子資料夾版）
- [x] 建立母資料夾（已建：1Jf-0YWvzUd5I1pceUdZYROpv1TydY6Gp）
- [ ] 開 GAS 專案，貼 `backend/apps-script.gs` 程式碼（所有設定已填好）
- [ ] 跑 testFolderStructure（自動建 5 個子資料夾）
- [ ] 跑 testTelegram、testCreateDoc、testCreateConsultDoc 測試
- [ ] 部署為 Web App（誰可以存取：任何人）
- [ ] 取得 Web App URL，把 HTML 中 `YOUR_GAS_DEPLOY_ID` 替換掉（兩處）
- 詳細指南：`backend/SETUP.md`
- 母資料夾 ID：`1Jf-0YWvzUd5I1pceUdZYROpv1TydY6Gp`
- ⚠️ Bot Token：`8700288531:AAGt7mOc-uL-tad7Frit_4a1clDd1P7SczI`（@yungmarketing_vic_bot）
- ⚠️ Chat ID：`971608531`（@cnn11113333）
- ⚠️ `backend/` 資料夾不可上 GitHub Public（已加 .gitignore）

### B. GitHub Pages 上線
- [ ] 在 GitHub 建 repo `Siwen`（Public、不開 README）
- [ ] 用 web UI 拖檔上傳所有檔案
- [ ] Settings → Pages → main / root → Save
- [ ] 等 1-2 分鐘取得 `https://professor1996tw.github.io/Siwen/`

### C. 自訂網域
- [ ] 跟對方確認阿里雲網域、是否有 ICP 備案
- [ ] 阿里雲 DNS 加 4 個 A 記錄指向 GitHub IP
  - 185.199.108.153 / 109.153 / 110.153 / 111.153
- [ ] 加 CNAME 指向 `professor1996tw.github.io`
- [ ] 專案根目錄建 `CNAME` 檔案，內容 = 網域
- [ ] GitHub repo Settings → Pages → Custom domain
- [ ] 勾選 Enforce HTTPS

### D. 6 個應用子頁面
- [ ] 在 `applications/` 資料夾下建立 6 個 HTML 檔
- [ ] 每頁建議結構：Hero → 介紹 → 真實案例 → 連結回課程 → CTA

---

## 十一、未討論完 / 可優化項目

1. **Process 區塊**：仍是「諮詢流程」（預約→起盤→建議→驗證），可改成「學習流程」（報名→確認→教學→結業社群）
2. **Testimonials**：3 則中有 2 則（林小姐設計師、陳先生餐飲）是諮詢案例，可改成課程學員見證
3. **Hero stats**：「16+ 年命理研習」可考慮改「16+ 年研習奇門」
4. **Sitemap.xml + robots.txt**：尚未建立，做完上線後補
5. **Open Graph 圖片** `og-cover.jpg`：HTML 中有引用但檔案不存在，需做一張 1200×630 給社群分享用

---

## 十二、PressPlay 線上課上架計畫

### 平台選擇結論
- **PressPlay Academy**（勝過 Hahow）
  - 玄學類別師資多、客群已存在
  - 抽成低（約 30-40% vs Hahow 50%）
  - 上架快、不用募資、製作門檻友善

### 簽約注意事項
- 簽**非獨家**版本（保留搬到自己網站的彈性）
- 確認「永久觀看」具體定義（下架條款）
- 確認平台終止合作後學員權利

### 方案選擇
- 選 **「課程專案」**（不選訂閱制）
- 學員一次購買 NT$2,980 永久觀看
- 適合奇門遁甲這種結構化、不需持續更新的內容

### 專案名稱建議（用戶選定後填回）
- **主推**：「奇門遁甲入門｜學會看流年、找財方、預測人生大小事」
- **系列版**：「思聞國學・奇門遁甲教學系列」（如未來要多放幾門課）
- **銷售感**：「奇門遁甲全攻略｜12 大人生實戰主題」
- **差異化**：「正統三元奇門入門課｜不只排盤，學會看見決策路徑」
- ⚠️ 建立後**不可更改**

### 雙軌變現策略（半年後）
- 線上課程專案：一次性收費 NT$2,980（入門引流）
- 訂閱制：NT$500/月（每月解盤直播 + 案例庫 + 私密社群）

---

## 十三、影片防盜建議

- **L1 基礎**：Vimeo Pro + 動態浮水印（NT$3K/年）
- **L2 中度**：Bunny Stream + 簽名 URL
- **L3 進階**：VdoCipher / Widevine DRM（不推薦現階段）
- **手機側拍永遠擋不住** → 重點是動態浮水印 + 法律條款追究

---

## 十四、技術注意事項

1. **路徑問題**：本專案路徑含 emoji（🎯）+ 空格，Write 工具會擋，必須先寫 `outputs/` 再 `cp` 過去
2. **大型 Edit 會被截斷**：HTML 結尾常被切，要用 Python `replace()` 或 bash heredoc
3. **CSS / JS 同上限制**
4. **Formspree 整合**：JS 已寫好 fallback，當 ID 還是 `YOUR_FORM_ID` 時會跳示範 alert

---

## 十五、對話風格 / 用戶偏好

- 用戶不是工程師背景（雖然公司有「系統工程師」部門做日央業務）
- 偏好 GitHub web UI 拖拉，不熟終端機
- 重視 SEO + AEO
- 喜歡簡潔不囉嗦的回覆
- 一律繁體中文
- 不使用 emoji 在文檔內（除非用戶先用）

---

## 十六、版本歷程（主要里程碑）

| 日期 | 變動 |
|---|---|
| 2026-05-03 | 初版建立（深色科技風骨架、9 區塊） |
| 2026-05-03 | 加 SEO/AEO + 課程區 + FAQ |
| 2026-05-03 | logo 替換 + 思聞國學白色 |
| 2026-05-03 | 課程改 4 卡 + 彈窗報名表 |
| 2026-05-03 | 滿 4 人 → 10 人、12 堂 → 2 堂 |
| 2026-05-03 | 命理諮詢移除 → 改學成應用 6 卡 |
| 2026-05-03 | 應用卡加按鈕指向 applications 子頁 |
| 2026-05-03 | navbar 移除聯絡預約、CTA 改立即報名 |
| 2026-05-03 | 表單區左側拿掉聯絡資訊、改 3 步驟流程 |

---

> ⚠️ 重要：此專案並非「日央水原商行」業務，請勿將相關決策寫入日央 memory 系統。

---

## 🆕 v3 改版（2026-05-08）

**5 件事一次完成**（詳見 `💻 系統工程組\memory\dist_20260508_v3官網改版.md`）：

### Q0 全站改名
- 「流年解析」→「奇門本命解析」/ QIMEN FORTUNE → QIMEN BIRTH CHART
- 替換: nav / 區塊註解 / section-label / footer / meta keywords
- HTML id `#qimen-fortune` 保留（避免 SEO 重置）

### Q1 導覽列順序
**新順序**：關於思聞 → 奇門知識 → 學成應用 → 奇門課程 → 常見問題 + [立即報名] [奇門本命解析]
- 新增 `.btn-mystic` 樣式（金邊+流光描邊+八卦光暈 hover）
- 桌面: `.nav-cta-group` 並列；手機: `.nav-mobile-cta` 漢堡選單底部全寬

### Q2 區塊順序大搬家
**新順序**：Hero → Ticker → About → Knowledge → Applications → QimenFortune → Courses → **Gallery** → **Benefits** → FAQ → Contact (v3.1 移除 Process/Testimonials)
- Process（學習流程）骨架：5 步驟（諮詢→報名→確認→授課→結業）
- Testimonials（學員見證）骨架：3 張卡片，內容待補

### Q3 Hero CTA
- 「立即報名課程」→「立即報名」
- 「查看奇門課程」→「奇門本命解析」（.btn-mystic 連 `#qimen-fortune`）

### Q4 教學足跡照片牆 🌟
- 區塊位置：Courses 下方 / Process 上方
- 16 張照片（11 城市 + 2 企業 + 3 課程實況）
- 圖片路徑：`images/gallery/{regions,enterprise,classes}/`
- 方案 A 分層式：Tab 切換 + 5/4/3/2 col 響應 grid + Lightbox
- 命名：`region-{city}.jpg` / `enterprise-{name}.jpg` / `class-{type}.jpg`

### 引擎連動升級（同期）
- v2.5 局數定法改用農曆飛盤公式 `(年支+農曆月+農曆日+時支) mod 9`
- v2.6 用神 xun-specific (廢除 v2.1 universal 戊) + 八門伏吟全本位

### 🆕 v3.1 微調（2026-05-08 同日）
- **移除** Process（學習流程）+ Testimonials（學員見證）兩段骨架
- **新增** Benefits（學會的好處）區塊：6 張理性視角卡片
  - 01 判斷力／02 決策力／03 系統觀／04 觀察力／05 預判力／06 應變力
  - 文案策略：理性不命理（拆解問題・評估時機・看清局勢）
  - 小設計：金色角線 + hover 抬升 + 頂部金色漸層細線
- 詳見 `💻 系統工程組\memory\dist_20260508_v3-1好處區塊.md`

