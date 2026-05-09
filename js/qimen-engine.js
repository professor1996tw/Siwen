/* ============================================================
   思聞國學 · 流年解析 · 排盤演算法引擎 v1.2
   陰盤奇門遁甲 飛盤派 · 以 a8899 17 張樣本反推 universal cycle
   日期：2026-05-07
   v1.2 變更：馬步飛宮 KNIGHT_NEXT 取代 universal cycle，1996案例完美對齊
   ============================================================ */

const QimenEngine = (function() {

  // ========================================================
  // 一、基礎常數
  // ========================================================
  const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

  const GANZHI = (() => {
    const arr = [];
    for (let i = 0; i < 60; i++) arr.push(GAN[i % 10] + ZHI[i % 12]);
    return arr;
  })();

  const SANJI_LIUYI = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];

  const PALACES = [
    { num: 4, name: '巽', dir: '東南', zhi: ['辰','巳'], pos: [0,0] },
    { num: 9, name: '離', dir: '南',   zhi: ['午'],     pos: [1,0] },
    { num: 2, name: '坤', dir: '西南', zhi: ['未','申'], pos: [2,0] },
    { num: 3, name: '震', dir: '東',   zhi: ['卯'],     pos: [0,1] },
    { num: 5, name: '中', dir: '中',   zhi: [],         pos: [1,1] },
    { num: 7, name: '兌', dir: '西',   zhi: ['酉'],     pos: [2,1] },
    { num: 8, name: '艮', dir: '東北', zhi: ['丑','寅'], pos: [0,2] },
    { num: 1, name: '坎', dir: '北',   zhi: ['子'],     pos: [1,2] },
    { num: 6, name: '乾', dir: '西北', zhi: ['戌','亥'], pos: [2,2] }
  ];
  const palaceByNum = (n) => PALACES.find(p => p.num === n);
  const palaceByZhi = (zhi) => PALACES.find(p => p.zhi.includes(zhi));

  const STAR_BY_PALACE = {
    1: '天蓬', 2: '天芮', 3: '天冲', 4: '天輔',
    5: '天禽', 6: '天心', 7: '天柱', 8: '天任', 9: '天英'
  };

  const DOOR_BY_PALACE = {
    1: '休', 2: '死', 3: '伤', 4: '杜',
    6: '開', 7: '惊', 8: '生', 9: '景'
  };

  const STAR_ORDER = ['天蓬','天任','天冲','天輔','天英','天芮','天柱','天心'];
  const STAR_PALACE_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];
  const DOOR_ORDER = ['休','生','伤','杜','景','死','惊','開'];
  const SHEN_ORDER = ['值符','騰蛇','太陰','六合','白虎','玄武','九地','九天'];

  const HORSE_BY_TIME_ZHI = {
    '寅':'申','午':'申','戌':'申',
    '巳':'亥','酉':'亥','丑':'亥',
    '申':'寅','子':'寅','辰':'寅',
    '亥':'巳','卯':'巳','未':'巳'
  };

  const XUN_KONG = {
    '甲子':['戌','亥'], '甲戌':['申','酉'], '甲申':['午','未'],
    '甲午':['辰','巳'], '甲辰':['寅','卯'], '甲寅':['子','丑']
  };

  const XUN_TO_FUTOU = {
    '甲子':'戊', '甲戌':'己', '甲申':'庚',
    '甲午':'辛', '甲辰':'壬', '甲寅':'癸'
  };

  function getXunOfGanZhi(ganZhi) {
    const idx = GANZHI.indexOf(ganZhi);
    return GANZHI[Math.floor(idx / 10) * 10];
  }

  const CHANGSHENG_START = {
    '甲':'亥','乙':'午','丙':'寅','丁':'酉','戊':'寅',
    '己':'酉','庚':'巳','辛':'子','壬':'申','癸':'卯'
  };
  const CHANGSHENG_NAMES = ['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
  function getChangsheng(dayGan) {
    const startZhi = CHANGSHENG_START[dayGan];
    const startIdx = ZHI.indexOf(startZhi);
    const result = {};
    for (let i = 0; i < 12; i++) {
      const zhi = ZHI[(startIdx + i) % 12];
      result[zhi] = CHANGSHENG_NAMES[i];
    }
    return result;
  }

  // ========================================================
  // 二、節氣交節時刻系統 (沿用 v0.4)
  // ========================================================
  const TERM_BASE = [
    { name:'冬至', m:12, d:22, dun:'陽', defaultJu: 3 },
    { name:'小寒', m: 1, d: 6, dun:'陽', defaultJu: 4 },
    { name:'大寒', m: 1, d:20, dun:'陽', defaultJu: 3 },
    { name:'立春', m: 2, d: 4, dun:'陽', defaultJu: 9 },
    { name:'雨水', m: 2, d:19, dun:'陽', defaultJu: 6 },
    { name:'驚蟄', m: 3, d: 6, dun:'陽', defaultJu: 3 },
    { name:'春分', m: 3, d:21, dun:'陽', defaultJu: 3 },
    { name:'清明', m: 4, d: 5, dun:'陽', defaultJu: 1 },
    { name:'穀雨', m: 4, d:20, dun:'陽', defaultJu: 6 },
    { name:'立夏', m: 5, d: 6, dun:'陽', defaultJu: 3 },
    { name:'小滿', m: 5, d:21, dun:'陽', defaultJu: 8 },
    { name:'芒種', m: 6, d: 6, dun:'陽', defaultJu: 6 },
    { name:'夏至', m: 6, d:21, dun:'陰', defaultJu: 2 },
    { name:'小暑', m: 7, d: 7, dun:'陰', defaultJu: 8 },
    { name:'大暑', m: 7, d:23, dun:'陰', defaultJu: 5 },
    { name:'立秋', m: 8, d: 7, dun:'陰', defaultJu: 3 },
    { name:'處暑', m: 8, d:23, dun:'陰', defaultJu: 1 },
    { name:'白露', m: 9, d: 8, dun:'陰', defaultJu: 8 },
    { name:'秋分', m: 9, d:23, dun:'陰', defaultJu: 2 },
    { name:'寒露', m:10, d: 8, dun:'陰', defaultJu: 5 },
    { name:'霜降', m:10, d:23, dun:'陰', defaultJu: 8 },
    { name:'立冬', m:11, d: 7, dun:'陰', defaultJu: 5 },
    { name:'小雪', m:11, d:22, dun:'陰', defaultJu: 2 },
    { name:'大雪', m:12, d: 7, dun:'陰', defaultJu: 5 }
  ];

  const JU_OVERRIDES = {
    '冬至:2024': 3, '冬至:2025': 3, '冬至:2000': 8,
    '大寒:1976': 2, '大寒:1996': 9, '大寒:2025': 3, '大寒:2026': 3,
    '小寒:1996': 3, '小寒:2012': 4, '小寒:2025': 8,
    '立春:2005': 8, '立春:2026': 9,
    '春分:2026': 3,
    '清明:2022': 3, '清明:2026': 1,
    '穀雨:2026': 6,
    '立夏:2026': 3,
    '小滿:2026': 8,
    '芒種:2026': 6,
    '夏至:2025': 3, '夏至:2026': 3,
    '立秋:2026': 3,
    '秋分:2022': 4, '秋分:2026': 2, '秋分:2021': 1,
    '白露:2016': 8,
    '處暑:2020': 5,
    '芒種:2019': 4,
    '穀雨:2015': 5,
    '大雪:1922': 4, '大雪:1956': 9, '大雪:2059': 1
  };

  const TRANSIT_OVERRIDES = {
    '冬至:1922': { y:1922, m:12, d:23, hh: 6, mm:57 },
    '冬至:1956': { y:1956, m:12, d:22, hh: 6, mm:50 },
    '冬至:2000': { y:2000, m:12, d:21, hh:21, mm:37 },
    '冬至:2024': { y:2024, m:12, d:21, hh:17, mm:21 },
    '冬至:2025': { y:2025, m:12, d:21, hh:23, mm: 3 },
    '冬至:2026': { y:2026, m:12, d:22, hh: 4, mm:50 },
    '冬至:2059': { y:2059, m:12, d:22, hh: 3, mm:18 },
    '夏至:2025': { y:2025, m: 6, d:21, hh:10, mm:43 },
    '夏至:2026': { y:2026, m: 6, d:21, hh:17, mm:25 },
    '大寒:1976': { y:1976, m: 1, d:21, hh: 9, mm:25 },
    '大寒:1996': { y:1996, m: 1, d:21, hh:12, mm:53 },
    '大寒:2025': { y:2025, m: 1, d:20, hh:11, mm: 0 },
    '大寒:2026': { y:2026, m: 1, d:20, hh:13, mm:43 },
    '春分:2026': { y:2026, m: 3, d:20, hh: 0, mm: 0 },
    '立夏:2026': { y:2026, m: 5, d: 5, hh:16, mm:38 },
    '小滿:2026': { y:2026, m: 5, d:21, hh: 5, mm:39 },
    '芒種:2026': { y:2026, m: 6, d: 6, hh: 9, mm:48 },
    '立秋:2026': { y:2026, m: 8, d: 7, hh:20, mm:24 },
    '穀雨:2026': { y:2026, m: 4, d:20, hh:22, mm:38 }
  };

  function getTermTransit(year, termIdx) {
    const t = TERM_BASE[termIdx];
    const key = t.name + ':' + year;
    const isDunBoundary = (termIdx === 0 || termIdx === 12);
    if (TRANSIT_OVERRIDES[key]) {
      const o = TRANSIT_OVERRIDES[key];
      if (isDunBoundary) return new Date(o.y, o.m - 1, o.d, o.hh, o.mm, 0);
      return new Date(o.y, o.m - 1, o.d, 0, 0, 0);
    }
    if (isDunBoundary) return new Date(year, t.m - 1, t.d, 12, 0, 0);
    return new Date(year, t.m - 1, t.d, 0, 0, 0);
  }

  function getTermJu(year, termIdx) {
    const t = TERM_BASE[termIdx];
    const key = t.name + ':' + year;
    if (JU_OVERRIDES[key] !== undefined) return JU_OVERRIDES[key];
    return t.defaultJu;
  }

  function findCurrentTerm(date) {
    const inputMs = date.getTime();
    let bestTerm = null, bestDate = null, bestTermIdx = -1, bestYear = -1;
    const Y = date.getFullYear();
    for (let yOff = -1; yOff <= 0; yOff++) {
      const yr = Y + yOff;
      for (let i = 0; i < TERM_BASE.length; i++) {
        const transit = getTermTransit(yr, i);
        if (transit.getTime() <= inputMs) {
          if (!bestDate || transit.getTime() > bestDate.getTime()) {
            bestDate = transit; bestTerm = TERM_BASE[i];
            bestTermIdx = i; bestYear = yr;
          }
        }
      }
    }
    return { term: bestTerm, termIdx: bestTermIdx, transit: bestDate, termYear: bestYear };
  }

  function getDayBaseJu(date) {
    // DEPRECATED v2.5: 不再使用節氣定局, 改用農曆飛盤公式 calcJu
    const found = findCurrentTerm(date);
    if (!found.term) return { ju: 1, dun: '陽', term: '未知', termYear: date.getFullYear() };
    const dayN = Math.floor((date.getTime() - found.transit.getTime()) / 86400000);
    const qiRi = getTermJu(found.termYear, found.termIdx);
    const ju = ((qiRi - 1 + dayN) % 9 + 9) % 9 + 1;
    return { ju, dun: found.term.dun, term: found.term.name, termYear: found.termYear, qiRi, dayN, transit: found.transit };
  }

  // ========================================================
  // 二.5、農曆轉換 + 飛盤奇門局數定法 (v2.5)
  // 公式: ju = (年支序 + 農曆月 + 農曆日 + 時支序) mod 9, 餘 0 視為 9
  // 陰陽: 冬至(~12/22)~夏至(~6/21) = 陽; 夏至~冬至 = 陰
  // ========================================================
  // LUNAR_INFO 1900-2099 (200 entries)
  // 編碼: bits 0-3 = 閏月 (0=無), bits 4-15 = 月1~12 大小 (1=30日, 0=29日, 高位=月1), bit 16 = 閏月大小
  const LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252
  ];
  function lunarLeapMonth(y) { return LUNAR_INFO[y - 1900] & 0xF; }
  function lunarLeapDays(y) {
    return lunarLeapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0;
  }
  function lunarMonthDays(y, m) {
    return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }
  function lunarYearDays(y) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      if (LUNAR_INFO[y - 1900] & i) sum++;
    }
    return sum + lunarLeapDays(y);
  }
  function solarToLunar(yyyy, mm, dd) {
    // 1900/1/31 = 農曆 1900/1/1
    const baseUTC = Date.UTC(1900, 0, 31);
    const targetUTC = Date.UTC(yyyy, mm - 1, dd);
    let offset = Math.floor((targetUTC - baseUTC) / 86400000);
    let lYear = 1900;
    while (lYear < 2100) {
      const yd = lunarYearDays(lYear);
      if (offset < yd) break;
      offset -= yd;
      lYear++;
    }
    const leap = lunarLeapMonth(lYear);
    let lMonth = 1;
    let isLeap = false;
    while (lMonth <= 12) {
      const days = lunarMonthDays(lYear, lMonth);
      if (offset < days) {
        return { year: lYear, month: lMonth, day: offset + 1, isLeap: false };
      }
      offset -= days;
      if (leap > 0 && lMonth === leap) {
        const ldays = lunarLeapDays(lYear);
        if (offset < ldays) {
          return { year: lYear, month: lMonth, day: offset + 1, isLeap: true };
        }
        offset -= ldays;
      }
      lMonth++;
    }
    return null;
  }

  const ZHI_NUM = { '子':1,'丑':2,'寅':3,'卯':4,'辰':5,'巳':6,'午':7,'未':8,'申':9,'酉':10,'戌':11,'亥':12 };

  function calcJuDun(adjustedDate, yearZhi, hourZhi) {
    // 局數: (年支序 + 農曆月 + 農曆日 + 時支序) mod 9, 0→9
    const lunar = solarToLunar(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate());
    const yz = ZHI_NUM[yearZhi];
    const hz = ZHI_NUM[hourZhi];
    const sum = yz + lunar.month + lunar.day + hz;
    let ju = sum % 9;
    if (ju === 0) ju = 9;

    // 陰陽: 冬至 ~ 夏至 = 陽; 夏至 ~ 冬至 = 陰
    const yr = adjustedDate.getFullYear();
    const dongzhi = getTermTransit(yr, 0);  // 冬至 (this year)
    const xiazhi = getTermTransit(yr, 12);  // 夏至 (this year)
    const prevDongzhi = getTermTransit(yr - 1, 0);  // 冬至 (prev year)
    let dun;
    const t = adjustedDate.getTime();
    if (t >= prevDongzhi.getTime() && t < xiazhi.getTime()) dun = '陽';
    else if (t >= xiazhi.getTime() && t < dongzhi.getTime()) dun = '陰';
    else dun = '陽';  // after this-year 冬至

    return { ju, dun, lunar };
  }

  // ========================================================
  // 三、四柱計算 (沿用 v0.4)
  // ========================================================
  function adjustDateForHour(date, hour) {
    if (hour >= 23) {
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      return next;
    }
    return date;
  }

  function getDayGanZhi(date) {
    const base = new Date(Date.UTC(2000, 0, 7));
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const diffDays = Math.round((target - base) / 86400000);
    const idx = ((diffDays % 60) + 60) % 60;
    return GANZHI[idx];
  }

  function getHourZhi(hour) {
    if (hour >= 23 || hour < 1) return '子';
    return ZHI[Math.floor((hour + 1) / 2) % 12];
  }

  function getHourGan(dayGan, hourZhi) {
    const startGanByDayGan = {
      '甲':'甲','己':'甲','乙':'丙','庚':'丙','丙':'戊','辛':'戊',
      '丁':'庚','壬':'庚','戊':'壬','癸':'壬'
    };
    const startGan = startGanByDayGan[dayGan];
    const startIdx = GAN.indexOf(startGan);
    const zhiIdx = ZHI.indexOf(hourZhi);
    return GAN[(startIdx + zhiIdx) % 10];
  }

  function getYearGanZhi(year, month, day) {
    if (month < 2 || (month === 2 && day < 4)) year--;
    const offset = ((year - 1984) % 60 + 60) % 60;
    return GANZHI[offset];
  }

  function getMonthZhi(month, day) {
    const monthZhiMap = [
      ['子', '丑', 6], ['丑', '寅', 4], ['寅', '卯', 6], ['卯', '辰', 5],
      ['辰', '巳', 5], ['巳', '午', 6], ['午', '未', 7], ['未', '申', 8],
      ['申', '酉', 8], ['酉', '戌', 8], ['戌', '亥', 7], ['亥', '子', 7]
    ];
    const idx = month - 1;
    const [before, after, switchDay] = monthZhiMap[idx];
    return day < switchDay ? before : after;
  }

  function getMonthGan(yearGan, monthZhi) {
    const startGanByYearGan = {
      '甲':'丙','己':'丙','乙':'戊','庚':'戊','丙':'庚','辛':'庚',
      '丁':'壬','壬':'壬','戊':'甲','癸':'甲'
    };
    const startGan = startGanByYearGan[yearGan];
    const startIdx = GAN.indexOf(startGan);
    const monthOrder = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
    const monthOffset = monthOrder.indexOf(monthZhi);
    return GAN[(startIdx + monthOffset) % 10];
  }

  // ========================================================
  // 四、排地盤
  // ========================================================
  function arrangeEarthBoard(dunType, ju) {
    const rawBoard = {};
    let pos = ju;
    for (let i = 0; i < 9; i++) {
      rawBoard[pos] = SANJI_LIUYI[i];
      pos = dunType === '陽' ? (pos % 9) + 1 : ((pos - 2 + 9) % 9) + 1;
    }
    const byPalace = {};
    for (const [num, gan] of Object.entries(rawBoard)) {
      const n = parseInt(num);
      if (n === 5) continue;
      byPalace[n] = [gan];
    }
    if (rawBoard[5]) {
      byPalace[2] = byPalace[2] || [];
      byPalace[2].push(rawBoard[5]);
    }
    return { rawBoard, byPalace };
  }

  function findGanRawPalace(rawBoard, gan) {
    for (const [num, g] of Object.entries(rawBoard)) {
      if (g === gan) return parseInt(num);
    }
    return null;
  }
  function findGanDisplayPalace(rawBoard, gan) {
    const raw = findGanRawPalace(rawBoard, gan);
    if (raw === 5) return 2;
    return raw;
  }

  // ========================================================
  // 五、排天盤 (Step 2) — v1.6 教科書規則完整版
  // 老闆教科書 1996 example 驗證:
  //   ganSeq[0] = 符頭幹 = sky 起點
  //   ganSeq[1..7] = earth 順 PO 從 fuTou earth raw 位 next 7 步
  //   ganSeq[8] = 中5 entry (中5 raw gan if fuTou not in 中5; else earth 2 raw gan)
  //
  //   Sky 排:
  //   - 若 fuTou earth raw = 5 (中5): sky 5 = 符頭幹 (ganSeq[0]), 寄 to startPos display.
  //                                    ganSeq[8] 落 sky startPosRaw (loop end of PO walk).
  //   - 否則: sky startPosRaw = 符頭幹.
  //          ganSeq[8] (中5 entry) 落 sky 5 (中5), 寄 to startPos display.
  //   - ganSeq[1..7] 順 PO 從 sky startPosRaw next 7 步排.
  //   - 寄 destination = startPos display = sky [hourGan earth raw 位置].
  //   陽順陰逆: 陰遁 PO 走逆向.
  // ========================================================
  function arrangeSkyBoard(earthRawBoard, hourGan, fuTouGan, ju, dunType) {
    const realHourGan = (hourGan === '甲') ? fuTouGan : hourGan;
    const startPosRaw = findGanRawPalace(earthRawBoard, realHourGan);
    if (!startPosRaw) return { byPalace: {}, rawSky: {}, path: [], startPos: null };
    const startPosDisplay = (startPosRaw === 5) ? 2 : startPosRaw;
    const fuTouEarthRaw = findGanRawPalace(earthRawBoard, fuTouGan);
    const fuTouDisplay = (fuTouEarthRaw === 5) ? 2 : fuTouEarthRaw;
    const isFuyin = (startPosDisplay === fuTouDisplay);

    // 全盤伏吟 short circuit: sky = earth, 5寄 destination 永遠 = 2
    if (isFuyin) {
      const rawSky = {};
      for (const [num, gan] of Object.entries(earthRawBoard)) {
        rawSky[parseInt(num)] = gan;
      }
      const byPalace = {};
      for (const [num, gan] of Object.entries(rawSky)) {
        const n = parseInt(num);
        if (n === 5) continue;
        byPalace[n] = [gan];
      }
      if (rawSky[5]) {
        byPalace[2] = byPalace[2] || [];
        byPalace[2].push(rawSky[5]);
      }
      return { byPalace, rawSky, path: [], startPos: startPosDisplay, startPosRaw, isFuyin };
    }

    // PO walk direction (阳順陰逆)
    const dirFn = (dunType === '陽')
      ? ((idx, k) => (idx + k + 64) % 8)
      : ((idx, k) => (idx - k + 64) % 8);

    // ganSeq[0] = 符頭幹, ganSeq[1..7] = earth raw gans at PO[fuTouPoIdx+i]
    // ganSeq[8] = 中5 entry rule
    const fuTouPoPos = (fuTouEarthRaw === 5) ? 2 : fuTouEarthRaw;
    const fuTouPoIdx = STAR_PALACE_ORDER.indexOf(fuTouPoPos);
    const ganSeq = [fuTouGan];
    for (let i = 1; i <= 7; i++) {
      const palace = STAR_PALACE_ORDER[dirFn(fuTouPoIdx, i)];
      ganSeq.push(earthRawBoard[palace] || null);
    }
    // ganSeq[8]: 起點若在中5 → 9th=earth[2]; 否則 → 9th=earth[5]
    ganSeq.push(fuTouEarthRaw === 5 ? earthRawBoard[2] : earthRawBoard[5]);

    // Sky 排: 三種情境
    const rawSky = {};
    let anchorPalace, anchorPoIdx;
    if (fuTouEarthRaw === 5) {
      // 旬首 在 中5: 符頭 落 sky 5; PO walk anchor = startPosRaw
      rawSky[5] = fuTouGan;
      anchorPalace = startPosRaw;
      anchorPoIdx = STAR_PALACE_ORDER.indexOf(startPosRaw);
    } else if (startPosRaw === 5) {
      // v2.4 NEW: 時干 在 中5: 符頭 落 sky startPosDisplay; PO walk anchor = startPosDisplay
      rawSky[startPosDisplay] = fuTouGan;
      anchorPalace = startPosDisplay;
      anchorPoIdx = STAR_PALACE_ORDER.indexOf(startPosDisplay);
    } else {
      // 一般: 符頭 落 sky startPosRaw; PO walk anchor = startPosRaw
      rawSky[startPosRaw] = fuTouGan;
      anchorPalace = startPosRaw;
      anchorPoIdx = STAR_PALACE_ORDER.indexOf(startPosRaw);
    }
    // PO walk: ganSeq[1..7]
    if (anchorPoIdx >= 0) {
      for (let i = 1; i <= 7; i++) {
        rawSky[STAR_PALACE_ORDER[dirFn(anchorPoIdx, i)]] = ganSeq[i];
      }
    }
    // ganSeq[8] placement
    if (fuTouEarthRaw === 5) {
      rawSky[startPosRaw] = ganSeq[8]; // 9th 落 sky startPosRaw
    } else {
      rawSky[5] = ganSeq[8]; // 9th 落 sky 5 (中5)
    }

    // v2.4 統一 jiDisplay 規則:
    //   sky 中5 寄 destination = sky 上 earth[2] (5寄 destination 本位 gan) 的位置
    //   觀念: 跟 earth 一樣「中5 寄到本位 gan 那格」, 只是本位 gan 在 sky 已飛到別處
    let jiDisplay = startPosDisplay; // fallback
    const earth2Benwei = earthRawBoard[2];
    if (earth2Benwei) {
      for (const [num, gan] of Object.entries(rawSky)) {
        const n = parseInt(num);
        if (n === 5) continue;
        if (gan === earth2Benwei) { jiDisplay = n; break; }
      }
    }

    // Build byPalace
    const byPalace = {};
    for (const [num, gan] of Object.entries(rawSky)) {
      const n = parseInt(num);
      if (n === 5) continue;
      byPalace[n] = [gan];
    }
    if (rawSky[5]) {
      byPalace[jiDisplay] = byPalace[jiDisplay] || [];
      byPalace[jiDisplay].push(rawSky[5]);
    }

    return { byPalace, rawSky, path: [], startPos: startPosDisplay, startPosRaw, isFuyin };
  }

  // ========================================================
  // 六、排八神 (Step 3) — v1.2 修正：用 STAR_PALACE_ORDER 洛書順
  // ========================================================
  function arrangeShen(zhifuPalace, dunType) {
    const result = {};
    const startIdx = STAR_PALACE_ORDER.indexOf(zhifuPalace);
    if (startIdx < 0) return result;
    for (let i = 0; i < 8; i++) {
      const idx = dunType === '陽'
        ? (startIdx + i) % 8
        : ((startIdx - i) % 8 + 8) % 8;
      result[STAR_PALACE_ORDER[idx]] = SHEN_ORDER[i];
    }
    return result;
  }

  // ========================================================
  // 七、排九星 (Step 4)
  // 值符星 = 地盤符頭幹本位九星 (中5原位 = 天禽)
  // 排在 天盤符頭幹位置 (=值符宮); 順轉 STAR_PALACE_ORDER (永遠順轉).
  // 中5 永遠 = 天禽星.
  // ========================================================
  function arrangeStars(earthRawBoard, fuTouGan, zhifuPalace) {
    const fuRawPos = findGanRawPalace(earthRawBoard, fuTouGan);
    let zhifuStar = STAR_BY_PALACE[fuRawPos]; // fuRawPos=5 → 天禽
    const result = {};

    if (zhifuStar === '天禽') {
      // 天禽寄芮: 用芮的順轉 idx, 但 zhifuPalace 顯示 天禽
      const baseStarIdx = STAR_ORDER.indexOf('天芮');
      const palStartIdx = STAR_PALACE_ORDER.indexOf(zhifuPalace);
      if (palStartIdx < 0) return { byPalace: {}, zhifuStar };
      result[zhifuPalace] = '天禽';
      for (let i = 1; i < 8; i++) {
        const pal = STAR_PALACE_ORDER[(palStartIdx + i) % 8];
        result[pal] = STAR_ORDER[(baseStarIdx + i) % 8];
      }
      result[5] = '天禽';
      return { byPalace: result, zhifuStar: '天禽' };
    } else {
      const starIdxInOrder = STAR_ORDER.indexOf(zhifuStar);
      const palStartIdx = STAR_PALACE_ORDER.indexOf(zhifuPalace);
      if (starIdxInOrder < 0 || palStartIdx < 0) return { byPalace: {}, zhifuStar };
      for (let i = 0; i < 8; i++) {
        const pal = STAR_PALACE_ORDER[(palStartIdx + i) % 8];
        result[pal] = STAR_ORDER[(starIdxInOrder + i) % 8];
      }
      result[5] = '天禽';
      return { byPalace: result, zhifuStar };
    }
  }

  // ========================================================
  // 八、排八門 (Step 5)  v2.9 教科書最終版
  //
  // 規則 (老闆 PDF + 講義 + a8899 對齊):
  //   1. 值使門 = 值符星本位門 (STAR_TO_DOOR)
  //   2. 起點 gan = 值符星本位宮的 earth 干 (本位, 非 5 寄)
  //   3. N = 時柱在旬內第幾位 (1-indexed, 旬首為 1, 包含起點)
  //   4. 從 startGan 按 SANJI 順序「戊己庚辛壬癸丁丙乙」走 N-1 步 (因為 N=1 不動)
  //      = 等價於落點 = SANJI[(startIdx + N - 1) % 9]
  //   5. 落點 gan 在 earth 的位置 = 落點宮 endPalace (5 寄 2)
  //   6. 將「值使門」放在 endPalace, 從該宮按 STAR_PALACE_ORDER 順時針排
  //      其他七門, 對應 DOOR_ORDER 的順序 cycle
  //
  // 重要: 不論陽遁陰遁, 排門步驟一律順時針 (陽順陰逆已在地盤干體現)
  // ========================================================
  const STAR_TO_DOOR = {
    '天蓬':'休', '天芮':'死', '天冲':'伤', '天輔':'杜',
    '天禽':'死', '天心':'開', '天柱':'惊', '天任':'生', '天英':'景'
  };
  const DOOR_TO_HOME_PALACE = {
    '休':1, '死':2, '伤':3, '杜':4,
    '開':6, '惊':7, '生':8, '景':9
  };

  function arrangeDoors(zhifuStar, dunType, hourGanZhi, hourXun, earthRawBoard) {
    const zhishiDoor = STAR_TO_DOOR[zhifuStar];
    const home = DOOR_TO_HOME_PALACE[zhishiDoor];
    const result = {};

    if (!home) {
      return { byPalace: {}, zhishiDoor, steps: 0, zhishiPalace: null };
    }

    // 起點 gan = 值符星本位的 earth 干 (本位, 非 5 寄)
    const startGan = earthRawBoard[home];
    const startIdx = SANJI_LIUYI.indexOf(startGan);
    if (startIdx < 0) {
      return { byPalace: {}, zhishiDoor, steps: 0, zhishiPalace: null };
    }

    // N = 時柱在旬內第幾位 (1-indexed)
    const xunIdx = GANZHI.indexOf(hourXun);
    const hourIdx = GANZHI.indexOf(hourGanZhi);
    const N = hourIdx - xunIdx + 1;

    // 走 N-1 步 (N=1 不動, N=5 走 4 步)
    const endIdx = ((startIdx + N - 1) % 9 + 9) % 9;
    const endGan = SANJI_LIUYI[endIdx];

    // 落點 gan 在 earth 的位置 (5 寄 2)
    let endPalaceRaw = null;
    for (const [num, gan] of Object.entries(earthRawBoard)) {
      if (gan === endGan) { endPalaceRaw = parseInt(num); break; }
    }
    const endPalace = (endPalaceRaw === 5) ? 2 : endPalaceRaw;

    // 從 endPalace 按 STAR_PALACE_ORDER 順時針排,
    // 第一宮 = 值使門 (zhishiDoor), 其餘按 DOOR_ORDER cycle
    const palStartIdx = STAR_PALACE_ORDER.indexOf(endPalace);
    if (palStartIdx < 0) {
      return { byPalace: {}, zhishiDoor, steps: N - 1, zhishiPalace: null };
    }
    const zhishiIdx = DOOR_ORDER.indexOf(zhishiDoor);
    if (zhishiIdx < 0) {
      return { byPalace: {}, zhishiDoor, steps: N - 1, zhishiPalace: null };
    }
    for (let i = 0; i < 8; i++) {
      const pal = STAR_PALACE_ORDER[(palStartIdx + i) % 8];
      result[pal] = DOOR_ORDER[(zhishiIdx + i) % 8];
    }
    return { byPalace: result, zhishiDoor, steps: N - 1, zhishiPalace: endPalace };
  }

  // ========================================================
  // 九、四害計算 (v3.0 按思聞教科書圖示最終版)
  //   空亡: 該宮地支屬時柱旬空
  //   擊刑: 特定宮 + 特定天干 (sky 或 earth 任一觸發)
  //         巽4=壬癸, 離9=辛, 坤2=己, 震3=戊, 艮8=庚
  //   入墓: 特定宮 + 特定天干 (sky 或 earth 任一觸發)
  //         巽4=辛壬(辰), 坤2=癸(未), 艮8=丁己庚(丑), 乾6=乙丙戊(戌)
  //   門迫: 門五行 剋 宮五行 (門剋宮 → 門被宮位限制 = 門迫)
  // ========================================================

  // 擊刑表 (思聞教科書圖示)
  const JIXING_TABLE = {
    4: ['壬', '癸'],
    9: ['辛'],
    2: ['己'],
    3: ['戊'],
    8: ['庚']
  };

  // 入墓表 (思聞教科書圖示)
  const RUMU_TABLE = {
    4: ['辛', '壬'],
    2: ['癸'],
    8: ['丁', '己', '庚'],
    6: ['乙', '丙', '戊']
  };

  function calculateSiHai(palaceNum, palace, hourZhi, hourGanZhi, dayGanZhi, doors, skyGans, earthGans) {
    const sihai = [];
    const xun = getXunOfGanZhi(hourGanZhi);
    const kongZhi = XUN_KONG[xun] || [];

    // 空亡: 該宮地支屬時柱旬空
    if (palace.zhi.some(z => kongZhi.includes(z))) sihai.push('空亡');

    // 收集該宮所有天干 (sky + earth, 兩盤皆計入)
    const allGans = new Set([...(skyGans || []), ...(earthGans || [])]);

    // 入墓: 特定宮 + 特定天干
    const rumuGans = RUMU_TABLE[palaceNum] || [];
    if (rumuGans.some(g => allGans.has(g))) sihai.push('入墓');

    // 擊刑: 特定宮 + 特定天干
    const jixingGans = JIXING_TABLE[palaceNum] || [];
    if (jixingGans.some(g => allGans.has(g))) sihai.push('擊刑');

    // 門迫: 門五行 剋 宮五行
    const door = doors[palaceNum];
    const doorWuxing = { '休':'水','生':'土','伤':'木','杜':'木','景':'火','死':'土','惊':'金','開':'金' };
    const palaceWuxing = { 1:'水', 2:'土', 3:'木', 4:'木', 6:'金', 7:'金', 8:'土', 9:'火' };
    const ke = { '木':'土','土':'水','水':'火','火':'金','金':'木' };
    if (door && palaceWuxing[palaceNum] && ke[doorWuxing[door]] === palaceWuxing[palaceNum]) {
      sihai.push('門迫');
    }
    return sihai;
  }

  // ========================================================
  // 十、主排盤函數
  // ========================================================
  function generateChart(year, month, day, hour, minute) {
    minute = minute || 0;
    const inputDate = new Date(year, month - 1, day, hour, minute, 0);
    const dateOnly = new Date(year, month - 1, day);
    const adjustedDate = adjustDateForHour(dateOnly, hour);

    const dayGanZhi = getDayGanZhi(adjustedDate);
    const dayGan = dayGanZhi.charAt(0);
    const hourZhi = getHourZhi(hour);
    const hourGan = getHourGan(dayGan, hourZhi);
    const hourGanZhi = hourGan + hourZhi;
    const yearGanZhi = getYearGanZhi(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate());
    const yearGan = yearGanZhi.charAt(0);
    const monthZhi = getMonthZhi(adjustedDate.getMonth() + 1, adjustedDate.getDate());
    const monthGan = getMonthGan(yearGan, monthZhi);
    const monthGanZhi = monthGan + monthZhi;

    // v2.5: 飛盤奇門局數定法 (公式: 年支+農曆月+農曆日+時支 mod 9)
    const yearZhi = yearGanZhi.charAt(1);
    const juDun = calcJuDun(adjustedDate, yearZhi, hourZhi);
    const finalJu = juDun.ju;
    const dunType = juDun.dun;

    const hourXun = getXunOfGanZhi(hourGanZhi);
    const fuTouGan = XUN_TO_FUTOU[hourXun];

    const earth = arrangeEarthBoard(dunType, finalJu);
    const earthRawBoard = earth.rawBoard;
    const earthByPalace = earth.byPalace;

    const sky = arrangeSkyBoard(earthRawBoard, hourGan, fuTouGan, finalJu, dunType);
    const skyByPalace = sky.byPalace;
    const startPos = sky.startPos;

    const stars = arrangeStars(earthRawBoard, fuTouGan, startPos);
    const starsByPalace = stars.byPalace;
    const zhifuStar = stars.zhifuStar;

    const shen = arrangeShen(startPos, dunType);

    // 第一/第二 用神 (v2.6 回復: 甲遁本旬旬首干 xun-specific)
    // 規則: 第一=日干位置, 第二=時干位置
    //   當干=甲時, 看「值符」= 該柱所在旬的旬首干 (XUN_TO_FUTOU)
    const dayXun = getXunOfGanZhi(dayGanZhi);
    const dayFuTou = XUN_TO_FUTOU[dayXun];
    const realDayGan = (dayGan === '甲') ? dayFuTou : dayGan;
    let firstYongShen = null;
    for (const [num, gans] of Object.entries(skyByPalace)) {
      if (gans.includes(realDayGan)) { firstYongShen = parseInt(num); break; }
    }
    // hour 用 fuTouGan (= XUN_TO_FUTOU[hourXun], 已在前面算好)
    const realHourGan = (hourGan === '甲') ? fuTouGan : hourGan;
    let secondYongShen = null;
    for (const [num, gans] of Object.entries(skyByPalace)) {
      if (gans.includes(realHourGan)) { secondYongShen = parseInt(num); break; }
    }
    // v1.8: 重疊時 keep secondYongShen 同 palace (不要設 null)
    // 老闆規則：第一/第二用神一定都會有宮位，重疊就是兩個落同宮
    const yongShenOverlap = (secondYongShen === firstYongShen);

    // v2.2 排八門：休門位置 = startPos (時干甲遁戊後在earth位置)
    // v2.7 八門教科書 SANJI walk: 傳 hourXun + earthRawBoard 給 arrangeDoors
    const doors = arrangeDoors(zhifuStar, dunType, hourGanZhi, hourXun, earthRawBoard);
    const doorsByPalace = doors.byPalace;
    const zhishiDoor = doors.zhishiDoor;
    const zhishiPalace = doors.zhishiPalace;

    const xunKong = XUN_KONG[hourXun];
    const maStar = HORSE_BY_TIME_ZHI[hourZhi];
    const changsheng = getChangsheng(dayGan);

    // v2.8: 擊刑改為十二地支刑, 不再需要 fuTouSkyPalace
    // (保留以下 4 行作為佔位 - 後續會改寫)
    let _fuTouSkyPalace = null;
    for (const [num, gans] of Object.entries(skyByPalace)) {
      if (gans.includes(fuTouGan)) { _fuTouSkyPalace = parseInt(num); break; }
    }

    const palaces = PALACES.filter(p => p.num !== 5).map(p => {
      const earthGans = earthByPalace[p.num] || [];
      const skyGans = skyByPalace[p.num] || [];
      const sihai = calculateSiHai(p.num, p, hourZhi, hourGanZhi, dayGanZhi, doorsByPalace, skyGans, earthGans);
      return {
        num: p.num, name: p.name, dir: p.dir, zhi: p.zhi,
        shen: shen[p.num] || '',
        skyGan: skyGans.join(''), earthGan: earthGans.join(''),
        star: starsByPalace[p.num] || '',
        door: doorsByPalace[p.num] || '',
        sihai: sihai,
        changshengList: p.zhi.map(z => changsheng[z]).filter(Boolean)
      };
    });

    const centerPalace = {
      num: 5, name: '中', dir: '中', zhi: [],
      shen: '', skyGan: '', earthGan: '',
      star: starsByPalace[5] || '天禽', door: '',
      sihai: [], changshengList: []
    };

    // v2.3: 至多顯示 2 個四害最嚴重的宮位 (按 sihai 數量降序, 同數量按 PO 順序)
    const sortedBySihai = palaces
      .filter(p => p.sihai.length > 0)
      .sort((a, b) => b.sihai.length - a.sihai.length);
    const maxSihaiPalaces = sortedBySihai.slice(0, 2).map(p => p.num);

    return {
      input: { year, month, day, hour, minute },
      meta: {
        siZhu: { year: yearGanZhi, month: monthGanZhi, day: dayGanZhi, hour: hourGanZhi },
        xunSpace: hourXun + '旬，' + (xunKong || []).join('') + '空',
        maStar: maStar,
        zhifu: zhifuStar + '星',
        zhishi: zhishiDoor + '門',
        fuTouGan: fuTouGan,
        changshengStart: dayGan,
        dunType: dunType,
        ju: finalJu,
        lunar: juDun.lunar,
        _startPos: startPos,
        _skyPath: sky.path,
        _doorSteps: doors.steps,
        _zhishiPalace: doors.zhishiPalace
      },
      palaces: [...palaces, centerPalace],
      analysis: {
        firstYongShen: firstYongShen,
        secondYongShen: secondYongShen,
        yongShenOverlap: yongShenOverlap,
        maxSihaiPalaces: maxSihaiPalaces
      }
    };
  }

  return {
    generateChart,
    PALACES, GAN, ZHI, GANZHI,
    palaceByNum, palaceByZhi,
    TERM_BASE, JU_OVERRIDES, TRANSIT_OVERRIDES,
    _internal: {
      getDayGanZhi, getHourZhi, getHourGan,
      getYearGanZhi, getMonthZhi, getMonthGan,
      getDayBaseJu, findCurrentTerm, getTermTransit, getTermJu,
      arrangeEarthBoard, arrangeSkyBoard,
      arrangeShen, arrangeStars, arrangeDoors,
      findGanRawPalace, findGanDisplayPalace,
      getXunOfGanZhi
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QimenEngine;
}

// =========================