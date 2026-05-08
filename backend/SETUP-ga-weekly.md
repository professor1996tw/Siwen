# GA 週報自動化部署指南

> 每週一 09:00 自動推送 GA4 週報到老闆 TG（同一個 Bot：8700288531）

---

## 📋 部署步驟（約 10 分鐘）

### Step 1：建立新的 Apps Script 專案

1. 開 [script.google.com](https://script.google.com)
2. 點「**新增專案**」
3. 名稱改成「**思聞國學 GA 週報**」（跟現有的「思聞表單後端」分開，避免互相干擾）
4. 把預設 `function myFunction()` 整段刪掉
5. 複製 `ga-weekly-report.gs` 全部內容貼上
6. Ctrl+S 儲存

### Step 2：啟用 Google Analytics Data API

⚠️ **這一步最容易漏，跑不過會報錯**

1. 在 Apps Script 編輯器左側面板找「**服務 (Services)**」（齒輪圖示旁的「+」）
2. 點「**+**」
3. 找到「**Google Analytics Data API**」
4. 識別碼保持預設「`AnalyticsData`」
5. 版本選最新（v1beta）
6. 點「新增」

### Step 3：第一次測試（手動跑）

1. 函式選單選 **`testReport`**
2. 點「**執行**」
3. 第一次會跳授權視窗：
   - 點「審查權限」→ 選你的 Google 帳號
   - 看到「Google 尚未驗證」→ 點「**進階**」→「**前往 思聞國學 GA 週報 (不安全)**」→ 全部允許
4. 等 5-15 秒
5. 看 TG 是否收到週報訊息

### Step 4：安裝週一 09:00 自動觸發器

1. 函式選單選 **`installWeeklyTrigger`**
2. 點「執行」
3. 看 Logs（執行紀錄）有「週一 09:00 觸發器已建立」就 OK
4. 在編輯器左側點「**觸發條件**」（鬧鐘圖示）確認看到一條 `sendWeeklyReport - 週一 09:00`

✅ **部署完成。下週一 09:00 會自動寄第一份正式週報。**

---

## 🧪 維護常用函式

| 函式 | 用途 |
|---|---|
| `testReport` | 手動跑一次完整流程，TG 立即收到 |
| `installWeeklyTrigger` | 重新安裝/重設週一觸發器 |
| `removeWeeklyTrigger` | 暫停自動週報 |

---

## 🔧 常見問題

### Q1：執行時報錯「AnalyticsData is not defined」

→ Step 2 沒做。回去檢查「服務」是否有加入「Google Analytics Data API」。

### Q2：報錯「Permission denied」或「invalid_grant」

→ Apps Script 的 Google 帳號**必須有思聞 GA 資源的存取權**。
- 方法 1：用建 GA 帳戶的同一個 Google email 跑 Apps Script（最簡單）
- 方法 2：把 Apps Script 用的 email 加進 GA → 管理 → 資源使用者管理 → 新增使用者（給「**檢視者**」權限即可）

### Q3：TG 沒收到訊息

→ 確認：
1. 老闆有先跟 Bot（@思聞國學表單通知 之類的）說過話（讓它有權限傳訊息）
2. Bot Token + Chat ID 沒打錯（跟現有 form bot 同一個就 OK）
3. 開 Apps Script 編輯器看「執行紀錄」有沒有錯誤

### Q4：週報資料是空的（全部 0）

→ 兩個可能：
- GA 串流還沒開始收資料（網站還沒部署到 siwen.site，或剛部署不到 24 小時）
- GA Property ID 填錯（思聞應該是 536783810）

### Q5：想改頻率（例如改成日報、月報）

→ 改 `installWeeklyTrigger` 函式：

```javascript
// 日報：每天 09:00
ScriptApp.newTrigger('sendWeeklyReport')
  .timeBased()
  .everyDays(1)
  .atHour(9)
  .inTimezone(TZ)
  .create();

// 月報：每月 1 號 09:00
ScriptApp.newTrigger('sendWeeklyReport')
  .timeBased()
  .onMonthDay(1)
  .atHour(9)
  .inTimezone(TZ)
  .create();
```

順便把報表的日期區間也要改（把 `7daysAgo` 改成 `30daysAgo` 之類）。

---

## ⚠️ 安全提醒

- `ga-weekly-report.gs` 含 Telegram Bot Token，**不要上傳 GitHub Public**
- backend/ 已加進 .gitignore
- 想換 Bot 或 Chat：編輯設定區常數 → 重存即可（不用重部署）

---

## 📊 每週你會在 TG 收到什麼

```
📊 思聞國學官網 GA 週報（最近 7 天）
━━━━━━━━━━━━━━━━━━━━

📈 【本週總計】
瀏覽 X | 訪客 Y | 工作階段 Z
平均跳出率 X%

📅 【每日流量】
05/01：瀏覽 X | 訪客 Y | 工作階段 Z | 跳出 W%
（共 7 天）

🌐 【流量來源】
• Direct 直接流量：訪客 X | 工作階段 Y
• Organic Social 自然社群：...
（依管道分組）

🏆 【熱門頁面 Top 10】
（思聞一頁式網站可能只有首頁，但結構保留）

🌏 【Top 5 來源國家】
1. Taiwan：X 訪客（Y 工作階段）
2. ...

🎯 【思聞核心指標 EXTRA】
• CTA 點擊：enroll X | birthchart Y
• 本命解析提交：X 次
• 報名/諮詢表提交：X 次

📍 【熱門區塊 Top 5】（被滾入視野次數）
1. 奇門課程：X 次
2. 學會的好處：X 次
3. ...

━━━━━━━━━━━━━━━━━━━━
ℹ️ 名詞說明...
自動產生於每週一 09:00
```
