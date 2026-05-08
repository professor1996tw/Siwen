/* ============================================================
   思聞國學 · 奇門本命解析 · UI 渲染與互動
   v3.4 雙層模組架構 + 整合敘事
   ============================================================ */

(function() {
  'use strict';

  // ---------- 工具：取得宮位地支對應年份 ----------
  function calculateYearsForPalace(palaceZhi, currentYear) {
    const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    function yearToZhi(year) {
      return ZHI[(year - 4) % 12];
    }
    const years = [];
    for (const zhi of palaceZhi) {
      let pastYear = currentYear - 1;
      while (pastYear > currentYear - 13) {
        if (yearToZhi(pastYear) === zhi) { years.push(pastYear); break; }
        pastYear--;
      }
      let futureYear = currentYear;
      while (futureYear < currentYear + 13) {
        if (yearToZhi(futureYear) === zhi) { years.push(futureYear); break; }
        futureYear++;
      }
    }
    return years.sort((a, b) => a - b);
  }

  // ---------- 工具：清理盤干字串（去除「一」「—」等空值符號）----------
  function cleanGans(str) {
    if (!str) return [];
    return String(str).split(/[／/]/).map(g => g.trim()).filter(g => g && g !== '一' && g !== '—' && g !== '-');
  }

  // ---------- 工具：取得用神宮位的元素資訊 ----------
  function getPalaceElements(palace) {
    const T = QimenTemplates;
    if (!palace) return null;
    const palaceInfo = T.palace[palace.num] || { name: '', dir: '', wuxing: '', label: '' };
    const shenDesc = T.shen[palace.shen] || '';
    const starInfo = T.star[palace.star] || {};
    const doorKey = (palace.door || '').replace(/門$/, '');
    const doorInfo = T.door[doorKey] || {};
    const earthGans = cleanGans(palace.earthGan);
    const skyGans = cleanGans(palace.skyGan);
    return {
      palaceInfo, shenDesc, star: palace.star, starInfo,
      door: doorKey, doorInfo,
      earthGans, skyGans, sihai: palace.sihai || []
    };
  }

  // ---------- 工具：特殊組合判斷（亮點提示, v3.5 擴 25 條）----------
  function buildHighlights(palace) {
    const notes = [];
    const star = palace.star || '';
    const door = (palace.door || '').replace(/門$/, '');
    const shen = palace.shen || '';
    const num = palace.num;
    const sihai = palace.sihai || [];

    // ==== 死門類 ====
    if (door === '死') {
      if (star === '天柱') notes.push('特別亮點：「<strong>死門 + 天柱</strong>」是命中「<strong>法律執法格</strong>」，律師、法官、紀律管理、合約把關領域有先天優勢');
      else if (star === '天輔') notes.push('特別亮點：「<strong>死門 + 天輔</strong>」是命中「<strong>文化研究格</strong>」，適合考古、歷史、修復、學術研究這類「靜下來深挖」的領域');
      else if (star === '天蓬') notes.push('特別亮點：「<strong>死門 + 天蓬</strong>」是命中「<strong>暗中清算格</strong>」，情報、會計查帳、徵信、資產清算領域格外有力');
      else notes.push('八門帶有「<strong>感情死心踏地、做事有始有終</strong>」的特質——責任感強、不易移情、馬拉松型耐性，但也要小心過度執著、放不下舊事');
      if (num === 4 || num === 9) notes.push('死門落感情主位，是「<strong>死心踏地的戀愛觀</strong>」——一旦認定就深情款款，但要小心無法放手');
      if (num === 2 || num === 8) notes.push('死門落財位，是「<strong>守財型命格</strong>」——不容易破財但也較難快速擴張，適合穩健投資');
      if (sihai.includes('空亡')) notes.push('死門配空亡，需特別留意「事情拖延、結不了案」的傾向，重要合約簽訂多預留時間');
    }

    // ==== 景門類 ====
    if (door === '景') {
      if (star === '天輔' || star === '天英') notes.push('特別亮點：這是命中「<strong>讀書求名格</strong>」的徵兆——學業、考試、發表這類「外顯文采」場域格外有力');
      else if (star === '天心') notes.push('特別亮點：「<strong>景門 + 天心</strong>」是命中「<strong>名門高才格</strong>」，適合走專業顧問、智庫、決策幕僚路線');
      else notes.push('八門呈現「<strong>文采外顯</strong>」之象，利於考試、發表、求名、需要「被看見」的場域');
      if (num === 9) notes.push('景門落離9宮，是「<strong>公眾舞台型</strong>」最佳格局，演講、教學、媒體曝光有先天優勢');
    }

    // ==== 開門類 ====
    if (door === '開') {
      if (star === '天心') notes.push('特別亮點：「<strong>開門 + 天心</strong>」是命中「<strong>經營決策格</strong>」，適合 CEO、決策者、戰略型角色');
      else if (star === '天蓬') notes.push('特別亮點：「<strong>開門 + 天蓬</strong>」是「<strong>開拓型業務格</strong>」，業務、外交、跑動性強的工作有優勢');
      else notes.push('八門呈現「<strong>開門納客</strong>」，是經營生意、拓展人脈、走入公眾舞台的有利格局');
      if (num === 6) notes.push('開門落乾6宮，是「<strong>領導決策最旺位</strong>」，主管、高位、權威領域得心應手');
    }

    // ==== 杜門類 ====
    if (door === '杜') {
      if (star === '天心' || star === '天蓬') notes.push('特別亮點：「<strong>杜門 + 智囊星</strong>」是命中「<strong>機密研究格</strong>」，適合鑽研技術、機要工作、深度學問');
      else if (star === '天柱') notes.push('特別亮點：「<strong>杜門 + 天柱</strong>」是「<strong>紀律研究格</strong>」，紀律部隊、規範訂定、SOP 制度建構有優勢');
      else notes.push('八門呈現「<strong>收藏內斂</strong>」，是適合深耕專業、長期累積、不喜浮誇的命格');
    }

    // ==== 伤門類 ====
    if (door === '伤') {
      if (star === '天冲') notes.push('特別亮點：「<strong>伤門 + 天冲</strong>」是命中「<strong>武職競爭格</strong>」，運動、軍警、業務競爭領域有先天優勢');
      else if (star === '天英') notes.push('特別亮點：「<strong>伤門 + 天英</strong>」是「<strong>高調挑戰格</strong>」，適合敢拚、敢出風頭的競爭性場域');
      else notes.push('八門帶有「<strong>剛猛進取</strong>」的鋒利，敢正面交鋒、不畏挑戰');
    }

    // ==== 休門類 ====
    if (door === '休') {
      if (star === '天禽' && shen === '值符') notes.push('特別亮點：「<strong>天禽守值符 + 休門</strong>」是命中極為難得的「<strong>君臨格</strong>」——主德高望重、群眾自然依附，但要保持謙遜不驕');
      else if (num === 1) notes.push('休門落坎1宮，是「<strong>智者沉穩本格</strong>」，深思熟慮、流動如水的決策力');
      else notes.push('八門呈現「<strong>動靜平衡</strong>」，能衝得快也停得住，是長期續航力強的命格');
    }

    // ==== 惊門類 ====
    if (door === '惊') {
      if (star === '天心') notes.push('特別亮點：「<strong>惊門 + 天心</strong>」是命中「<strong>智辯型</strong>」，律師、辯論、危機公關領域有先天優勢');
      else if (star === '天柱') notes.push('特別亮點：「<strong>惊門 + 天柱</strong>」是「<strong>糾紛調解格</strong>」，訴訟、調解、仲裁領域有優勢');
      else notes.push('八門帶有「<strong>突發應變</strong>」的敏銳，臨機反應快、口才便給');
    }

    // ==== 生門類 ====
    if (door === '生') {
      if (num === 8) notes.push('特別亮點：「<strong>生門落艮8宮</strong>」是「<strong>起步最旺位</strong>」，創業、求職、轉職、求子等「啟動性」事務最佳契機');
      else if (star === '天英') notes.push('特別亮點：「<strong>生門 + 天英</strong>」是「<strong>創業展演格</strong>」，自帶舞台魅力的創業者');
      else notes.push('八門呈現「<strong>萬物萌動</strong>」，是創業、求職、求子等「啟動性」事務的最佳契機');
    }

    // ==== 獨立星象類 ====
    if (star === '天輔' && door !== '景' && door !== '死') {
      notes.push('星象上利於「<strong>文化、教育、創作</strong>」相關領域發揮');
    }

    return notes;
  }

  // ---------- 段 1：第一用神宮位特質 ----------
  function buildSection1(chart) {
    const T = QimenTemplates;
    const palace = chart.palaces.find(p => p.num === chart.analysis.firstYongShen);
    if (!palace) return '<p>本盤第一用神宮位無明確落點，建議重新檢視出生時辰。</p>';

    const E = getPalaceElements(palace);
    const parts = [];

    // 1. 宮位開場
    parts.push(`<p>您的第一用神（命中核心力量）落在 <strong>${E.palaceInfo.name}</strong>——${E.palaceInfo.dir}位、五行屬${E.palaceInfo.wuxing}，是${E.palaceInfo.label}。</p>`);

    // 2. 八神（顯名 + 描述）
    if (E.shenDesc) {
      parts.push(`<p>此宮 <strong>${palace.shen}</strong> 坐鎮——${E.shenDesc}。</p>`);
    }

    // 3. 整合段：九星 + 八門 + 天干 織成核心氣質
    const traits = [];
    if (E.starInfo.trait) traits.push(E.starInfo.trait);
    if (E.doorInfo.trait) traits.push(E.doorInfo.trait);
    const tones = [];
    if (E.starInfo.tone) tones.push(E.starInfo.tone);
    if (E.doorInfo.tone) tones.push(E.doorInfo.tone);

    let integratedHtml = '<p>整體能量呈現「<strong>' + traits.join('、') + '</strong>」的核心特質：' + tones.join('，') + '。';

    const ganDescs = [];
    for (const g of E.skyGans) if (T.gan[g]) ganDescs.push(T.gan[g]);
    for (const g of E.earthGans) if (T.gan[g] && !ganDescs.includes(T.gan[g])) ganDescs.push(T.gan[g]);
    if (ganDescs.length) {
      integratedHtml += `骨子裡帶有「${ganDescs.slice(0, 2).join('、')}」的色彩，` +
        '這讓您在處事時，外顯氣質與內在底蘊都自有一番韻味。';
    }
    integratedHtml += '</p>';
    parts.push(integratedHtml);

    // 陰影提醒（八門 shadow 屬性 v3.5）
    if (E.doorInfo.shadow) {
      parts.push(`<p><em>提醒：${E.doorInfo.shadow}。</em></p>`);
    }

    // 4. 特殊亮點
    const highlights = buildHighlights(palace);
    if (highlights.length) {
      parts.push(`<p>${highlights.join('；')}。</p>`);
    }

    // 5. 四害判斷
    if (E.sihai.length === 0) {
      parts.push(`<p><em>${T.noSihai}。</em>建議把人生重心放在此宮主導的領域，這裡是您天賦最容易發揮的核心戰場。</p>`);
    } else {
      parts.push(`<p>本宮逢「<strong>${E.sihai.join('、')}</strong>」：${E.sihai.map(s => T.sihai[s]).filter(Boolean).join('；')}。是命格主軸的關鍵考驗，需要特別留意。</p>`);
    }

    return parts.join('\n');
  }

  // ---------- 段 2：第二用神宮位狀態 ----------
  function buildSection2(chart) {
    const T = QimenTemplates;
    const palace = chart.palaces.find(p => p.num === chart.analysis.secondYongShen);
    if (!palace) return '<p>本盤第二用神宮位無明確落點。</p>';

    const isOverlap = chart.analysis.yongShenOverlap;
    const E = getPalaceElements(palace);
    const parts = [];

    if (isOverlap) {
      parts.push(`<p>您的第二用神（時干能量）與第一用神 <strong>同落 ${E.palaceInfo.name}</strong>——${T.combo.overlap}。</p>`);
      parts.push(`<p>能量雙重疊加在 ${E.palaceInfo.label}上，意味著您在這個領域的力度比一般人強，但也容易把所有期待都壓在同一處，建議刻意培養其他面向的興趣與人脈，避免「單一賽道」的風險。</p>`);
      return parts.join('\n');
    }

    parts.push(`<p>您的第二用神（輔助資源）落在 <strong>${E.palaceInfo.name}</strong>——${E.palaceInfo.dir}位、五行屬${E.palaceInfo.wuxing}，是${E.palaceInfo.label}。</p>`);

    if (E.shenDesc) {
      parts.push(`<p>輔位由 <strong>${palace.shen}</strong> 主導——${E.shenDesc}。這是您可借用的外在資源與環境支援。</p>`);
    }

    const traits = [];
    if (E.starInfo.trait) traits.push(E.starInfo.trait);
    if (E.doorInfo.trait) traits.push(E.doorInfo.trait);
    const tones = [];
    if (E.starInfo.tone) tones.push(E.starInfo.tone);
    if (E.doorInfo.tone) tones.push(E.doorInfo.tone);

    let integratedHtml = '<p>輔位能量呈現「<strong>' + traits.join('、') + '</strong>」的傾向：' + tones.join('，') + '。';

    const ganDescs = [];
    for (const g of E.skyGans) if (T.gan[g]) ganDescs.push(T.gan[g]);
    if (ganDescs.length) {
      integratedHtml += `搭配「${ganDescs.slice(0, 2).join('、')}」的氣質色彩，是您在外境中可以借力的方向。`;
    }
    integratedHtml += '</p>';
    parts.push(integratedHtml);

    const highlights = buildHighlights(palace);
    if (highlights.length) {
      parts.push(`<p>${highlights.join('；')}。</p>`);
    }

    if (E.sihai.length === 0) {
      parts.push(`<p><em>輔位無四害侵擾，能量穩定。</em>外境支援不缺，可放心倚靠這個方向取得助力。</p>`);
    } else {
      parts.push(`<p>輔位逢「<strong>${E.sihai.join('、')}</strong>」，需提防：${E.sihai.map(s => T.sihai[s]).filter(Boolean).join('；')}。倚靠此宮的外援時要多留個心眼。</p>`);
    }

    return parts.join('\n');
  }

  // ---------- 段 3：四害落宮對應年份 ----------
  function buildSection3(chart, currentYear) {
    const T = QimenTemplates;
    const maxPalaces = chart.analysis.maxSihaiPalaces;
    if (!maxPalaces || maxPalaces.length === 0) {
      return '<p><em>本盤整體格局清明，未見明顯四害集中之宮位。是命中相對平穩之局，這也意味著您比一般人少一些「重大坎」，但相對地也需自己主動創造突破點。</em></p>';
    }

    const parts = [];
    parts.push('<p>本盤需特別留意的宮位（按四害密度排序，至多顯示兩處）：</p>');

    for (const palaceNum of maxPalaces) {
      const palace = chart.palaces.find(p => p.num === palaceNum);
      if (!palace) continue;
      const palaceInfo = T.palace[palaceNum];
      const years = calculateYearsForPalace(palace.zhi, currentYear);
      const sihaiNames = palace.sihai;

      let block = `<p><strong>${palaceInfo ? palaceInfo.name : palace.name + palace.num + '宮'}</strong>（地支 ${palace.zhi.join('、')}）逢「<strong>${sihaiNames.join('、')}</strong>」`;
      if (years.length > 0) {
        block += `，對應年份為 <strong>${years.join('、')}</strong>`;
      }
      block += '。';
      const warningKey = sihaiNames[0];
      if (T.yearWarning[warningKey]) {
        block += T.yearWarning[warningKey] + '。';
      }
      block += '</p>';
      parts.push(block);
    }

    parts.push('<p><em>過去年份您可回想驗證、未來年份可提前布局。「知道有坑」就是最大的優勢——避得開、繞得過，比硬碰硬好得多。</em></p>');

    return parts.join('\n');
  }

  // ---------- 段 4：本命解析建議（5 段架構）----------
  function buildSection4(chart) {
    const T = QimenTemplates;
    const fyPalace = chart.palaces.find(p => p.num === chart.analysis.firstYongShen);
    const syPalace = chart.palaces.find(p => p.num === chart.analysis.secondYongShen);
    const isOverlap = chart.analysis.yongShenOverlap;
    const totalSihai = chart.palaces.reduce((sum, p) => sum + (p.sihai ? p.sihai.length : 0), 0);

    const fourCorners = [1, 3, 7, 9];   // 坎震兌離 = 四正
    const fourSides = [2, 4, 6, 8];      // 坤巽乾艮 = 四隅
    const isBothFour = fyPalace && syPalace && fourCorners.includes(fyPalace.num) && fourCorners.includes(syPalace.num);
    const isBothEight = fyPalace && syPalace && fourSides.includes(fyPalace.num) && fourSides.includes(syPalace.num);

    // 整體基調
    let overallKey;
    if (!fyPalace) overallKey = 'neutral';
    else if (fyPalace.sihai.length === 0 && totalSihai <= 1) overallKey = 'veryGood';
    else if (fyPalace.sihai.length === 0 && totalSihai <= 3) overallKey = 'good';
    else if (totalSihai <= 4) overallKey = 'neutral';
    else if (totalSihai <= 6) overallKey = 'cautious';
    else overallKey = 'warning';

    const parts = [];

    // 命格定位（精簡版, 一句話）
    let posSummary = '';
    if (isOverlap) {
      posSummary = T.combo.overlap;
    } else if (isBothFour) {
      posSummary = T.combo.bothFour;
    } else if (isBothEight) {
      posSummary = T.combo.bothEight;
    } else {
      posSummary = T.combo.mixedPosition;
    }
    parts.push(`<p><strong>命格定位 ─</strong> ${posSummary}。</p>`);

    // 天賦領域（v3.5.1：split + flatten + 去重，統一分隔符）
    const skillTokens = [];
    if (fyPalace) {
      const fyStarSkill = (T.star[fyPalace.star] || {}).skill;
      const fyDoorKey = (fyPalace.door || '').replace(/門$/, '');
      const fyDoorSkill = (T.door[fyDoorKey] || {}).skill;
      if (fyStarSkill) skillTokens.push(...fyStarSkill.split(/[、\/／]/).map(s => s.trim()).filter(Boolean));
      if (fyDoorSkill) skillTokens.push(...fyDoorSkill.split(/[、\/／]/).map(s => s.trim()).filter(Boolean));
    }
    const uniqSkills = [...new Set(skillTokens)];
    if (uniqSkills.length) {
      parts.push(`<p><strong>天賦領域 ─</strong> 命中能量最容易匯聚的方向是「<strong>${uniqSkills.join('、')}</strong>」相關領域，順著走、阻力最小。</p>`);
    }

    // 四害提示（精簡版）
    let sihaiSummary;
    if (totalSihai === 0) {
      sihaiSummary = '本盤格局清明，是「不需特別躲坑、但需主動創造突破點」的命格。';
    } else if (fyPalace && fyPalace.sihai.length === 0) {
      sihaiSummary = '主用神宮清明，惟需留意上段所列宮位對應年份，提前布局即可。';
    } else if (fyPalace && fyPalace.sihai.length > 0 && syPalace && syPalace.sihai.length > 0) {
      sihaiSummary = '兩用神宮都受四害，命格主軸需特別留意，凡事多預留緩衝。';
    } else {
      sihaiSummary = '局部宮位有四害侵擾，重大決策時放慢、多方求證。';
    }
    parts.push(`<p><strong>四害提示 ─</strong> ${sihaiSummary}</p>`);

    // 整體基調（用 overall + closing 簡化合併）
    parts.push(`<p><strong>整體建議 ─</strong> ${T.overall[overallKey]} 命格本身不決定一切，「知命」的目的是「用命」——建議結合流年盤定期檢視，本命盤是骨架、流年盤才是當下肉身。</p>`);

    parts.push(`<p class="cta-line">${T.cta}</p>`);
    parts.push(`<p class="disclaimer">${T.disclaimer}</p>`);

    return parts.join('\n');
  }

  // ---------- 渲染九宮盤面 ----------
  function renderChart(chart, container) {
    const meta = chart.meta;
    const input = chart.input;
    const fy = chart.analysis.firstYongShen;
    const sy = chart.analysis.secondYongShen;

    let html = `
      <div class="qm-chart-meta">
        <div class="qm-meta-row"><span>陽曆：</span><strong>${input.year}年${input.month}月${input.day}日 ${String(input.hour).padStart(2,'0')}:${String(input.minute).padStart(2,'0')}</strong></div>
        <div class="qm-meta-row"><span>四柱：</span><strong>${meta.siZhu.year} ${meta.siZhu.month} ${meta.siZhu.day} ${meta.siZhu.hour}</strong></div>
        <div class="qm-meta-row"><span>${meta.dunType}遁 ${meta.ju}局</span><span>${meta.xunSpace}</span><span>馬星：${meta.maStar}</span></div>
        <div class="qm-meta-row"><span>值符：${meta.zhifu}</span><span>值使：${meta.zhishi}</span></div>
      </div>
    `;

    const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

    html += '<div class="qm-grid">';
    for (const row of layout) {
      for (const num of row) {
        const p = chart.palaces.find(x => x.num === num);
        let cls = 'qm-cell';
        if (num === fy) cls += ' qm-yongshen-1';
        if (num === sy) cls += ' qm-yongshen-2';
        if (num === 5) cls += ' qm-center';

        if (num === 5) {
          html += `<div class="${cls}"><div class="qm-palace-num">${p.num}</div><div class="qm-palace-name">${p.name}宮</div></div>`;
        } else {
          html += `
            <div class="${cls}">
              <div class="qm-palace-num">${p.name}${p.num}・${p.dir}</div>
              <div class="qm-row qm-shen">${p.shen || '—'}</div>
              <div class="qm-row qm-gan">${p.skyGan || '—'}<span class="qm-gan-sep">／</span>${p.earthGan || '—'}</div>
              <div class="qm-row qm-star">${p.star}</div>
              <div class="qm-row qm-door">${p.door}門</div>
              <div class="qm-row qm-zhi">${p.zhi.join('・')}</div>
              ${p.sihai.length > 0 ? `<div class="qm-row qm-sihai">${p.sihai.join('・')}</div>` : ''}
            </div>
          `;
        }
      }
    }
    html += '</div>';

    container.innerHTML = html;
  }

  // ---------- 渲染解析 ----------
  function renderAnalysis(chart, container, currentYear) {
    const html = `
      <div class="qm-analysis">
        <div class="qm-section">
          <h4 class="qm-section-title">一・第一用神宮位特質</h4>
          <div class="qm-section-body">${buildSection1(chart)}</div>
        </div>
        <div class="qm-section">
          <h4 class="qm-section-title">二・第二用神宮位狀態</h4>
          <div class="qm-section-body">${buildSection2(chart)}</div>
        </div>
        <div class="qm-section">
          <h4 class="qm-section-title">三・四害落宮對應年份</h4>
          <div class="qm-section-body">${buildSection3(chart, currentYear)}</div>
        </div>
        <div class="qm-section">
          <h4 class="qm-section-title">四・本命解析建議</h4>
          <div class="qm-section-body">${buildSection4(chart)}</div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

  // ---------- 表單事件處理 ----------
  function init() {
    const form = document.getElementById('qm-form');
    if (!form) return;

    const chartContainer = document.getElementById('qm-chart-output');
    const analysisContainer = document.getElementById('qm-analysis-output');
    const resultWrap = document.getElementById('qm-result');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const fd = new FormData(form);
      const year = parseInt(fd.get('year'));
      const month = parseInt(fd.get('month'));
      const day = parseInt(fd.get('day'));
      let hour = fd.get('hour');
      const minute = parseInt(fd.get('minute')) || 0;

      if (hour === '' || hour === 'unknown') {
        hour = 12;
      } else {
        hour = parseInt(hour);
      }

      if (!year || !month || !day || isNaN(hour)) {
        alert('請完整填寫年月日時');
        return;
      }

      try {
        const chart = QimenEngine.generateChart(year, month, day, hour, minute);
        const currentYear = new Date().getFullYear();

        renderChart(chart, chartContainer);
        renderAnalysis(chart, analysisContainer, currentYear);

        resultWrap.style.display = 'block';
        resultWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        console.error('排盤錯誤:', e);
        alert('排盤計算錯誤：' + e.message);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
