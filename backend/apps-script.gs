/* ============================================================
 * 思聞國學 - 表單後端（Google Apps Script Web App）
 * ------------------------------------------------------------
 * 功能：
 *   1. 收網站表單 POST
 *   2. 自動在母資料夾下建立子資料夾結構（若不存在）
 *   3. 建 Google Doc 到對應子資料夾
 *   4. 透過 Telegram Bot 發訊息通知
 *
 * 資料夾結構（自動建立）：
 *   思聞國學母資料夾/
 *     ├── 報名/
 *     │   ├── 線上課程/
 *     │   ├── 研習班/
 *     │   ├── 高階班/
 *     │   └── 研習+高階/
 *     └── 諮詢/
 *
 * 檔名規則：
 *   報名 → YYYYMMDD_姓名
 *   諮詢 → YYYYMMDD_主題_姓名
 *
 * ⚠️ 安全提醒：本檔案含 Bot Token，請勿公開分享
 * ============================================================ */

// ========== 設定區（只需要 1 個 ID）==========

// 母資料夾 ID（思聞國學母資料夾，所有檔案的根）
const PARENT_FOLDER_ID = '1Jf-0YWvzUd5I1pceUdZYROpv1TydY6Gp';

// Telegram Bot 設定（已填好）
const TG_BOT_TOKEN = '8700288531:AAGt7mOc-uL-tad7Frit_4a1clDd1P7SczI';
const TG_CHAT_ID   = '971608531';

const TZ = 'Asia/Taipei';

// ========== 入口函式 ==========

function doPost(e) {
  try {
    const d = e.parameter;
    const formType = d.form_type || 'enroll';   // enroll | consult
    const course = d.course || d.service || '';
    
    // 決定檔名
    const dateStr = Utilities.formatDate(new Date(), TZ, 'yyyyMMdd');
    const name = sanitize(d.name || '未具名');
    let fileName, headerLabel, folderKey;

    if (formType === 'consult') {
      folderKey = '諮詢';
      headerLabel = '課程諮詢';
      const topic = courseToTopic(course);
      fileName = `${dateStr}_${topic}_${name}`;
    } else {
      folderKey = courseToFolderKey(course);
      headerLabel = `${folderKey} 報名`;
      fileName = `${dateStr}_${name}`;
    }
    
    // 建 Doc
    const doc = DocumentApp.create(fileName);
    writeDocBody(doc, d, headerLabel, course);
    doc.saveAndClose();
    
    // 移到對應資料夾（自動建立路徑）
    const targetFolder = resolveFolder(formType, course);
    const file = DriveApp.getFileById(doc.getId());
    targetFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Telegram 通知
    sendTelegram(folderKey, formType, d, course, doc.getUrl());
    
    return jsonResponse({ ok: true, file: fileName, folder: folderKey, url: doc.getUrl() });
  } catch (err) {
    try { sendTelegramRaw('❌ *表單錯誤*\n```\n' + err.toString() + '\n```'); } catch (e2) {}
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({ ok: true, message: '思聞國學表單後端運作中 ✓' });
}

// ========== 資料夾路由 ==========

function resolveFolder(formType, course) {
  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  
  if (formType === 'consult') {
    return getOrCreateFolder(parent, '諮詢');
  }
  
  // enroll 類：母 → 報名 → 課程子資料夾
  const enrollRoot = getOrCreateFolder(parent, '報名');
  const subName = courseToFolderKey(course);
  return getOrCreateFolder(enrollRoot, subName);
}

function getOrCreateFolder(parent, name) {
  const iter = parent.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return parent.createFolder(name);
}

function courseToFolderKey(course) {
  if (course.includes('線上課程')) return '線上課程';
  if (course.includes('研習班+高階') || course.includes('套餐')) return '研習+高階';
  if (course.includes('研習班')) return '研習班';
  if (course.includes('高階班')) return '高階班';
  return '其他';
}

function courseToTopic(course) {
  // 諮詢檔名用的「主題」摘要
  if (course.includes('線上課程')) return '線上';
  if (course.includes('研習班+高階') || course.includes('套餐')) return '套餐';
  if (course.includes('研習班')) return '研習';
  if (course.includes('高階班')) return '高階';
  if (course.includes('比較') || course.includes('諮詢')) return '比較中';
  return '一般諮詢';
}

function sanitize(s) {
  return s.replace(/[\\/:*?"<>|]/g, '').trim() || '未具名';
}

// ========== Doc 內容 ==========

function writeDocBody(doc, d, headerLabel, course) {
  const body = doc.getBody();
  body.appendParagraph(`【思聞國學 - ${headerLabel}】`)
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`提交時間：${Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss')}`);
  body.appendParagraph('');

  body.appendParagraph('【基本資料】').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`姓名：${d.name || '-'}`);
  body.appendParagraph(`電話：${d.phone || '-'}`);
  body.appendParagraph(`Email：${d.email || '-'}`);
  body.appendParagraph(`LINE ID：${d.line || '-'}`);
  body.appendParagraph(`WeChat ID：${d.wechat || '-'}`);
  body.appendParagraph('');

  body.appendParagraph('【課程／服務】').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`選擇：${course || '-'}`);
  if (d.location) body.appendParagraph(`上課地：${d.location}`);
  if (d.exp) body.appendParagraph(`命理基礎：${d.exp}`);
  body.appendParagraph('');

  if (d.birth_year || d.birth_month || d.birth_day || d.birth_hour) {
    body.appendParagraph('【出生年月日時 / 命盤】').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const y = d.birth_year || '-';
    const m = d.birth_month || '-';
    const dd = d.birth_day || '-';
    const h = d.birth_hour || '未填時辰';
    body.appendParagraph(`${y} 年 ${m} 月 ${dd} 日　${h}`);
    body.appendParagraph('');
  }

  body.appendParagraph('【想對老師說的話 / 問題或備註】').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(d.message || d.question || '（無）');
}

// ========== Telegram 通知 ==========

function sendTelegram(folderKey, formType, d, course, docUrl) {
  const typeLabel = (formType === 'consult') ? '諮詢' : '報名';
  const lines = [
    `🔔 *思聞國學・新${typeLabel}*`,
    '',
    `📂 *${folderKey}*`,
    `👤 ${d.name || '-'} (${d.phone || '無電話'})`,
    `📧 ${d.email || '-'}`,
  ];
  if (d.line) lines.push(`💬 LINE: ${d.line}`);
  if (d.wechat) lines.push(`💬 WeChat: ${d.wechat}`);
  lines.push(`💼 ${course || '-'}`);
  if (d.location) lines.push(`📍 ${d.location}`);
  if (d.birth_year) {
    lines.push(`🎂 ${d.birth_year}/${d.birth_month || '?'}/${d.birth_day || '?'} ${d.birth_hour || ''}`);
  }
  lines.push('');
  lines.push(`📄 [查看文件](${docUrl})`);

  sendTelegramRaw(lines.join('\n'));
}

function sendTelegramRaw(text) {
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: 'post',
    payload: {
      chat_id: TG_CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: 'true'
    },
    muteHttpExceptions: true
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== 測試函式（可在 GAS 編輯器執行）==========

function testTelegram() {
  sendTelegramRaw('🧪 *測試訊息*\n如果你收到這則訊息，代表 Bot 設定成功！');
}

function testCreateDoc() {
  // 模擬一筆研習班報名
  const fakeEvent = {
    parameter: {
      form_type: 'enroll',
      course: '奇門遁甲研習班 NT$25,000',
      name: '測試學員',
      phone: '0912-345-678',
      email: 'test@example.com',
      line: 'test123',
      wechat: '',
      location: '台灣',
      exp: '完全沒接觸過',
      birth_year: '1990',
      birth_month: '6',
      birth_day: '15',
      birth_hour: '巳時 09:00-11:00',
      message: '希望能應用在創業擇日'
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}

function testCreateConsultDoc() {
  // 模擬一筆諮詢
  const fakeEvent = {
    parameter: {
      form_type: 'consult',
      service: '還在比較 / 想諮詢',
      name: '測試訪客',
      phone: '0912-000-000',
      email: 'visitor@example.com',
      question: '想了解四種課程差別'
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}

function testFolderStructure() {
  // 檢查或建立完整資料夾結構
  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  Logger.log('母資料夾：' + parent.getName());
  
  const enroll = getOrCreateFolder(parent, '報名');
  Logger.log('  報名/');
  ['線上課程', '研習班', '高階班', '研習+高階'].forEach(n => {
    getOrCreateFolder(enroll, n);
    Logger.log('    ' + n + '/');
  });
  
  getOrCreateFolder(parent, '諮詢');
  Logger.log('  諮詢/');
  
  Logger.log('✓ 結構建立完成');
}
