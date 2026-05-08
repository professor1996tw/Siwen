# 思聞國學 表單後端部署指南

> Google Apps Script 自動建檔到 Drive + Telegram 通知
> **簡化版**：只需要 1 個母資料夾 ID，子資料夾自動建立

---

## 📁 預期最終結構（GAS 自動建立）

```
你的 Google Drive/
└── [母資料夾]
    ├── 報名/
    │   ├── 線上課程/
    │   ├── 研習班/
    │   ├── 高階班/
    │   └── 研習+高階/
    └── 諮詢/
```

母資料夾你已建好：
👉 https://drive.google.com/drive/folders/1Jf-0YWvzUd5I1pceUdZYROpv1TydY6Gp

---

## 🚀 部署步驟（4 步，約 10 分鐘）

### Step 1：建立 Google Apps Script

1. 開 [script.google.com](https://script.google.com)
2. 點「**新增專案**」
3. 名稱改成「思聞國學表單後端」
4. 把預設的 `function myFunction()` 整段刪掉
5. 開啟 `apps-script.gs`（同資料夾下的檔案），**全部複製貼上**
6. 確認設定區的 3 個值已正確（**都已填好，不用改**）：
   ```javascript
   const PARENT_FOLDER_ID = '1Jf-0YWvzUd5I1pceUdZYROpv1TydY6Gp';
   const TG_BOT_TOKEN = '8700288531:...';
   const TG_CHAT_ID   = '971608531';
   ```
7. 按 Ctrl+S 儲存

### Step 2：第一次授權 + 測試

1. 函式選單選 **`testFolderStructure`**
2. 按「**執行**」
3. 第一次會跳授權視窗：
   - 點「審查權限」→ 選你的 Google 帳號
   - 看到「Google 尚未驗證這個應用程式」→ 點「**進階**」→「**前往 思聞國學表單後端 (不安全)**」→ 全部允許
4. 執行成功後，回 Google Drive 看母資料夾，**5 個子資料夾應該都自動建好了** ✅

### Step 3：測試 Telegram + 建檔

1. 函式選單選 **`testTelegram`** → 執行 → 看 Telegram 是否收到測試訊息
2. 函式選單選 **`testCreateDoc`** → 執行 → 看：
   - Drive 的「報名/研習班/」應該出現一個測試文件
   - Telegram 收到一筆「測試學員」通知
3. 再選 **`testCreateConsultDoc`** → 執行 → 看：
   - Drive 的「諮詢/」應該出現一個測試文件
   - Telegram 收到一筆「測試訪客」通知
4. 都成功後，**手動刪掉 3 個測試文件**

### Step 4：部署為 Web App

1. 右上角「**部署 → 新增部署作業**」
2. 點齒輪圖示 → 選「**網路應用程式**」
3. 設定：
   - 說明：思聞表單後端 v1
   - 執行身分：**我（你的 email）**
   - 誰可以存取：**任何人**（重要！）
4. 點「部署」
5. 複製 **Web App URL**：`https://script.google.com/macros/s/AKfy.../exec`
6. **記下中間那串 ID**（`AKfy...exec` 的中間段）

### Step 5：把網站表單接到 GAS

1. 開 `index.html`
2. Ctrl+H 全文取代：
   - 找：`YOUR_GAS_DEPLOY_ID`
   - 換成你 Step 4 拿到的 ID（共 2 處）
3. 存檔，上傳到 GitHub
4. 等 GitHub Pages 更新（1-2 分鐘）

---

## 🧪 上線實測

1. 開你的網站
2. 點「立即報名」→ 選課程 → 填假資料送出
3. 應該立刻：
   - ✅ 網站跳出「送出成功」
   - ✅ Telegram 跳通知（含 Doc 連結）
   - ✅ Drive 對應子資料夾出現新 Doc

---

## 🔧 常見問題

**Q1：表單送出沒反應？**
- 檢查 GAS 部署設定的「誰可以存取」是否設「**任何人**」
- 重新部署一次（**新增部署作業**，不是「管理部署作業」）取得**新的 URL**

**Q2：Doc 沒進對的資料夾？**
- 跑 `testFolderStructure` 重建結構
- 確認 `PARENT_FOLDER_ID` 是母資料夾 ID 不是子資料夾

**Q3：Telegram 沒收到？**
- 確認你有先跟 Bot 說過至少一句話（讓它有權限傳訊息給你）
- 跑 `testTelegram` 測試

**Q4：未來想換 Bot 或母資料夾？**
- 編輯 GAS 程式碼最上面 3 個常數
- 重新部署（**新增部署作業**）

---

## ⚠️ 安全提醒

1. `apps-script.gs` 含 Telegram Bot Token + Chat ID
2. **不要把 `backend/` 上傳到 GitHub Public**（已加 .gitignore）
3. 如果 Token 外流：找 @BotFather 跑 `/revoke` 重發

---

## 📊 收到的資料範例

### Telegram 訊息
```
🔔 思聞國學・新報名

📂 高階班
👤 陳同學 (0912-345-678)
📧 chen@gmail.com
💬 LINE: chen123
💼 奇門遁甲高階班 NT$120,000
📍 台灣
🎂 1990/6/15 巳時 09:00-11:00

📄 查看文件 ← 點直接跳 Doc
```

### Google Doc 內容
```
【思聞國學 - 高階班 報名】
提交時間：2026-05-05 14:32:18

【基本資料】
姓名：陳同學
電話：0912-345-678
Email：chen@gmail.com
LINE ID：chen123
WeChat ID：-

【課程／服務】
選擇：奇門遁甲高階班 NT$120,000
上課地：台灣
命理基礎：完全沒接觸過

【出生年月日時 / 命盤】
1990 年 6 月 15 日　巳時 09:00-11:00

【想對老師說的話】
希望能應用在創業擇日
```
