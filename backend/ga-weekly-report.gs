/* ============================================================
 * 思聞國學 - GA4 週報自動化（Google Apps Script）
 * ------------------------------------------------------------
 * 功能：
 *   1. 每週一 09:00 自動跑 GA4 Data API
 *   2. 抓取過去 7 天的核心數據 + 思聞專屬指標
 *   3. 格式化成 TG 訊息推送給老闆
 *
 * 部署前準備：
 *   ① Apps Script 編輯器 → 服務 (Services) → 加入「Google Analytics Data API」
 *   ② 確認 GA Property ID 正確（思聞 = 536783810）
 *   ③ 加入週一 09:00 的時間觸發器（Trigger）
 *
 * ⚠️ 安全提醒：本檔案含 Bot Token，請勿公開分享
 * ============================================================ */

// ========== 設定區 ==========

const GA_PROPERTY_ID = '536783810';   // 思聞 GA4 Property ID（不是 Measurement ID）
const TG_BOT_TOKEN   = '8700288531:AAGt7mOc-uL-tad7Frit_4a1clDd1P7SczI';
const TG_CHAT_ID     = '971608531';   // 老闆個人 TG
const SITE_NAME      = '思聞國學官網';
const TZ             = 'Asia/Taipei';

// ========== 主入口 ==========

/**
 * 主函式：每週一 09:00 由 Trigger 自動呼叫
 */
function sendWeeklyReport() {
  try {
    const data = collectWeeklyData();
    const msg = formatReport(data);
    sendTelegram(msg);
    Logger.log('週報已送出');
  } catch (err) {
    Logger.log('錯誤: ' + err);
    sendTelegram('⚠️ GA 週報生成失敗\n\n錯誤訊息：' + err.toString().substring(0, 500));
  }
}

/**
 * 手動測試用 - 直接跑這個看 TG 收不收得到
 */
function testReport() {
  sendWeeklyReport();
}

// ========== 資料收集 ==========

function collectWeeklyData() {
  const property = 'properties/' + GA_PROPERTY_ID;

  // 1. 本週總計
  const summary = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' }
    ]
  }, property);

  // 2. 每日流量
  const daily = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  }, property);

  // 3. 流量來源
  const channels = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  }, property);

  // 4. 熱門頁面 Top 10
  const pages = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'pageTitle' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' }
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  }, property);

  // 5. Top 5 國家
  const countries = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'country' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' }
    ],
    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
    limit: 5
  }, property);

  // 6. EXTRA: CTA 點擊總數
  // 註：細分 enroll / birthchart 需在 GA4 後台註冊 event_label 為自訂維度
  const ctaClicks = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { value: 'cta_click' }
      }
    }
  }, property);

  // 7. EXTRA: 本命解析提交
  const birthchartSubmits = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { value: 'birthchart_submit' }
      }
    }
  }, property);

  // 8. EXTRA: 報名表提交
  const formSubmits = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { value: 'form_submit' }
      }
    }
  }, property);

  // 9. EXTRA: Section view 總數
  // 註：哪個 section 最熱門需在 GA4 後台註冊 section_name 為自訂維度
  const sectionViews = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { value: 'section_view' }
      }
    }
  }, property);

  return { summary, daily, channels, pages, countries, ctaClicks, birthchartSubmits, formSubmits, sectionViews };
}

// ========== 格式化 ==========

function formatReport(d) {
  const lines = [];
  lines.push(`📊 ${SITE_NAME} GA 週報（最近 7 天）`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');

  // 本週總計
  const sumRow = (d.summary.rows || [])[0];
  if (sumRow) {
    const pv = num(sumRow.metricValues[0].value);
    const users = num(sumRow.metricValues[1].value);
    const sessions = num(sumRow.metricValues[2].value);
    const bounce = (parseFloat(sumRow.metricValues[3].value) * 100).toFixed(1);
    lines.push('');
    lines.push('📈 【本週總計】');
    lines.push(`瀏覽 ${pv} | 訪客 ${users} | 工作階段 ${sessions}`);
    lines.push(`平均跳出率 ${bounce}%`);
  }

  // 每日流量
  lines.push('');
  lines.push('📅 【每日流量】');
  (d.daily.rows || []).forEach(r => {
    const dateRaw = r.dimensionValues[0].value;  // YYYYMMDD
    const dateFmt = dateRaw.substring(4, 6) + '/' + dateRaw.substring(6, 8);
    const pv = num(r.metricValues[0].value);
    const u = num(r.metricValues[1].value);
    const s = num(r.metricValues[2].value);
    const b = (parseFloat(r.metricValues[3].value) * 100).toFixed(0);
    lines.push(`${dateFmt}：瀏覽 ${pv} | 訪客 ${u} | 工作階段 ${s} | 跳出 ${b}%`);
  });

  // 流量來源
  lines.push('');
  lines.push('🌐 【流量來源】');
  const chMap = {
    'Direct': '直接流量',
    'Organic Social': '自然社群',
    'Organic Search': '自然搜尋',
    'Organic Video': '自然影片',
    'Referral': '推薦連結',
    'Paid Search': '付費搜尋',
    'Paid Social': '付費社群',
    'Email': '電子郵件',
    'Unassigned': '未分類'
  };
  (d.channels.rows || []).forEach(r => {
    const ch = r.dimensionValues[0].value;
    const u = num(r.metricValues[0].value);
    const s = num(r.metricValues[1].value);
    const chName = ch + ' ' + (chMap[ch] || '');
    lines.push(`• ${chName.trim()}：訪客 ${u} | 工作階段 ${s}`);
  });

  // 熱門頁面 Top 10（一頁式網站可能只有一頁，留著保留結構）
  lines.push('');
  lines.push('🏆 【熱門頁面 Top 10】');
  if ((d.pages.rows || []).length > 0) {
    d.pages.rows.forEach((r, i) => {
      const title = (r.dimensionValues[0].value || '').substring(0, 40);
      const pv = num(r.metricValues[0].value);
      const u = num(r.metricValues[1].value);
      lines.push(`${i + 1}. ${title}`);
      lines.push(`   瀏覽 ${pv} | 訪客 ${u}`);
    });
  } else {
    lines.push('（一頁式網站，無多頁資料）');
  }

  // Top 5 國家
  lines.push('');
  lines.push('🌏 【Top 5 來源國家】');
  (d.countries.rows || []).forEach((r, i) => {
    const country = r.dimensionValues[0].value;
    const u = num(r.metricValues[0].value);
    const s = num(r.metricValues[1].value);
    lines.push(`${i + 1}. ${country}：${u} 訪客（${s} 工作階段）`);
  });

  // EXTRA: 思聞核心指標
  lines.push('');
  lines.push('🎯 【思聞核心指標 EXTRA】');
  // CTA 點擊總數
  const ctaRow = (d.ctaClicks.rows || [])[0];
  const ctaCnt = ctaRow ? num(ctaRow.metricValues[0].value) : '0';
  lines.push(`• CTA 點擊：${ctaCnt} 次（含立即報名 + 奇門本命解析）`);

  // 本命解析提交
  const bcRow = (d.birthchartSubmits.rows || [])[0];
  const bcCnt = bcRow ? num(bcRow.metricValues[0].value) : '0';
  lines.push(`• 本命解析提交：${bcCnt} 次`);

  // 報名表提交
  const fmRow = (d.formSubmits.rows || [])[0];
  const fmCnt = fmRow ? num(fmRow.metricValues[0].value) : '0';
  lines.push(`• 報名/諮詢表提交：${fmCnt} 次`);

  // Section view 總數
  const svRow = (d.sectionViews.rows || [])[0];
  const svCnt = svRow ? num(svRow.metricValues[0].value) : '0';
  lines.push(`• Section view 總數：${svCnt} 次（用戶滾入區塊累計）`);

  // 結尾
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('ℹ️ 名詞說明');
  lines.push('・瀏覽：頁面被看的總次數（PV）');
  lines.push('・訪客：不重複的人數');
  lines.push('・工作階段：造訪次數（同一人 30 分鐘內算一次）');
  lines.push('・跳出率：只看一個事件就走的比例（越低越好）');
  lines.push('・CTA 點擊：用戶按下任一 CTA 按鈕（立即報名 / 奇門本命解析）');
  lines.push('・本命解析提交：用戶實際填出生時辰排盤的次數（核心轉換指標）');
  lines.push('・Section view：用戶滾動到任一區塊累計次數');
  lines.push('（如要細分 CTA 種類 / 個別區塊熱度，需先在 GA4 註冊自訂維度）');
  lines.push('');
  lines.push('自動產生於每週一 09:00');

  return lines.join('\n');
}

// ========== Telegram 推送 ==========

function sendTelegram(text) {
  // Telegram 訊息上限 4096 字元，超過要切片
  const MAX = 4000;
  const url = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';

  if (text.length <= MAX) {
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { chat_id: TG_CHAT_ID, text: text },
      muteHttpExceptions: true
    });
    return;
  }

  // 訊息太長 → 切多段送
  const parts = [];
  for (let i = 0; i < text.length; i += MAX) {
    parts.push(text.substring(i, i + MAX));
  }
  parts.forEach((part, idx) => {
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { chat_id: TG_CHAT_ID, text: `(${idx + 1}/${parts.length})\n${part}` },
      muteHttpExceptions: true
    });
    Utilities.sleep(500);
  });
}

// ========== 工具 ==========

function num(v) {
  return Number(v || 0).toLocaleString();
}

// ========== 排程設定（首次部署跑一次）==========

/**
 * 安裝週一 09:00 自動觸發器
 * 部署完跑這個一次就好
 */
function installWeeklyTrigger() {
  // 先清掉舊的
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendWeeklyReport') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 建新 trigger: 每週一 09:00 (Asia/Taipei)
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .inTimezone(TZ)
    .create();

  Logger.log('週一 09:00 觸發器已建立');
}

/**
 * 移除觸發器（不需要時用）
 */
function removeWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendWeeklyReport') {
      ScriptApp.deleteTrigger(t);
    }
  });
  Logger.log('觸發器已移除');
}
