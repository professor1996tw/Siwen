/* ============================================
   思聞國學 SIWEN ACADEMY - Interactions
   ============================================ */

(function () {
  'use strict';

  // ---------- PressPlay 線上課程 URL (上架後替換) ----------
  const PRESSPLAY_URL = '#'; // TODO: PressPlay 課程上線後替換為真實 URL

  // ---------- Navbar scroll effect ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav toggle ----------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close on link click
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ---------- Reveal on scroll ----------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // ---------- Knowledge tabs ----------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
      tabPanels.forEach((p) => p.classList.toggle('active', p.id === target));
    });
  });

  // ---------- Smooth scroll w/ navbar offset ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Generic form validator ----------
  const validateForm = (form, options = {}) => {
    const required = form.querySelectorAll('[required]');
    let ok = true;
    let firstBad = null;
    required.forEach((field) => {
      let bad = false;
      if (field.type === 'checkbox') {
        bad = !field.checked;
      } else if (field.type === 'radio') {
        const group = form.querySelectorAll(`input[name="${field.name}"]`);
        bad = ![...group].some((r) => r.checked);
      } else {
        bad = !field.value.trim();
      }
      if (bad) {
        ok = false;
        if (!firstBad) firstBad = field;
      }
    });
    // 至少要勾一個時段（課程表單）
    if (options.requireTimeSlot) {
      const timeChecked = form.querySelectorAll('input[name="time"]:checked');
      if (timeChecked.length === 0) ok = false;
    }
    if (!ok && firstBad) firstBad.focus();
    return ok;
  };

  // ---------- Contact form (Formspree) ----------
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(form)) {
        alert('請完整填寫必填欄位，並勾選同意條款。');
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '送出中…';
      submitBtn.disabled = true;

      try {
        const formData = new URLSearchParams();
        new FormData(form).forEach((v, k) => formData.append(k, v));
        const action = form.action;
        if (action.includes('YOUR_FORM_ID') || action.includes('YOUR_GAS_DEPLOY_ID')) {
          const name = form.querySelector('#f-name').value;
          alert(name + ' 您好！\n\n預約申請已送出，思聞國學將於 24 小時內與您聯繫。\n\n⚠️ 注意：表單尚未接 Formspree，請依說明替換 YOUR_FORM_ID_2。');
          form.reset();
          return;
        }
        const response = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          alert('預約申請已送出！\n思聞國學將於 24 小時內與您聯繫。');
          form.reset();
        } else {
          throw new Error('送出失敗');
        }
      } catch (err) {
        alert('送出失敗，請稍後再試或加 LINE @siwen-academy 直接聯絡。');
        console.error(err);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ---------- Course enrollment modal ----------
  const modal = document.getElementById('enrollModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalCourseName = document.getElementById('modalCourseName');
  const courseSelect = document.getElementById('cf-course');
  const courseField = document.getElementById('cf-course-field');
  const courseHint = document.getElementById('course-consult-hint');
  const ppBlock = document.getElementById('press-play-block');
  const formRest = document.getElementById('cf-form-rest');

  // 切換 modal 內 PressPlay 模式：選「線上課程」時隱藏表單、顯示 PressPlay 卡片
  const togglePressPlayMode = (isOnline) => {
    if (ppBlock) ppBlock.hidden = !isOnline;
    if (formRest) formRest.hidden = isOnline;
  };

  // v4.1: 所在地改為兩個獨立輸入框 (國家 + 城市), 不再自動填「線上」
  // 線上課程已切到 PressPlay 模式 (表單整組隱藏), 不會觸發此函式
  const updateLocationOptions = () => { /* noop: kept for backward compat with existing call sites */ };

  // courseName === '__CTA__' 表示從「立即報名」按鈕進來，顯示下拉
  // 否則表示從卡片進來，自動帶入並隱藏下拉
  const openModal = (courseName) => {
    if (!modal) return;
    const isFromCTA = courseName === '__CTA__';
    if (courseHint) courseHint.style.display = 'none';
    // 每次開 modal 都重置 PressPlay 模式
    togglePressPlayMode(false);

    if (isFromCTA) {
      // 立即報名 CTA：顯示課程下拉、清空選擇
      if (courseField) courseField.style.display = '';
      if (courseSelect) {
        courseSelect.value = '';
        courseSelect.required = true;
      }
      modalTitle.textContent = '立即報名';
      modalCourseName.textContent = '請於下方選擇您想報名的課程';
      // 清掉 location 線上選項（等使用者選課再決定）
      updateLocationOptions('');
    } else {
      // 從卡片進來：隱藏下拉、自動帶入 + 設 location
      if (courseField) courseField.style.display = 'none';
      if (courseSelect) {
        courseSelect.value = courseName;
        courseSelect.required = false; // hidden field 不強制
      }
      modalTitle.textContent = '報名 ' + courseName.split(' NT')[0];
      modalCourseName.textContent = courseName;
      updateLocationOptions(courseName);
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => {
      const firstInput = modal.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 350);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  // 課程下拉變動：同步更新 modal 標題顯示 + location 選項 + 諮詢提示 + PressPlay 切換
  if (courseSelect) {
    courseSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      const isOnline = value.includes('線上課程');
      togglePressPlayMode(isOnline);

      if (isOnline) {
        // 線上課程：顯示 PressPlay 卡片，隱藏表單其他欄位
        if (courseHint) courseHint.style.display = 'none';
        if (modalCourseName) modalCourseName.textContent = '線上課程・前往 PressPlay';
        updateLocationOptions('');
      } else if (value === '還在比較 / 想諮詢') {
        if (courseHint) courseHint.style.display = 'block';
        if (modalCourseName) modalCourseName.textContent = '還在比較 / 想諮詢';
        updateLocationOptions('');
      } else if (value) {
        if (courseHint) courseHint.style.display = 'none';
        if (modalCourseName) modalCourseName.textContent = value;
        updateLocationOptions(value);
      } else {
        if (courseHint) courseHint.style.display = 'none';
        if (modalCourseName) modalCourseName.textContent = '請於下方選擇您想報名的課程';
        updateLocationOptions('');
      }
    });
  }

  // 各卡片的「報名」按鈕（卡片模式 → 自動帶入課程）
  document.querySelectorAll('.course-enroll-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.course-card');
      const courseName = (card && card.dataset.course) || '課程';
      openModal(courseName);
    });
  });

  // 立即報名 CTA 按鈕（Hero + Navbar 兩處共用，CTA 模式 → 顯示下拉）
  document.querySelectorAll('.cta-enroll-btn').forEach((btn) => {
    btn.addEventListener('click', () => openModal('__CTA__'));
  });

  // PressPlay 連結初始化（兩處：modal 內 CTA、課程卡片「立即訂閱」）
  // + GA 事件：每次點擊送 click_pressplay event
  document.querySelectorAll('#course-online-link, #pp-cta').forEach((el) => {
    el.href = PRESSPLAY_URL;
    el.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click_pressplay', {
          event_category: 'engagement',
          event_label: el.id === 'pp-cta' ? 'modal_pressplay_cta' : 'course_card_subscribe',
          link_url: PRESSPLAY_URL
        });
      }
    });
  });

  // 關閉
  if (modal) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  // ---------- Course enrollment form (Formspree) ----------
  const courseForm = document.getElementById('courseForm');
  if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(courseForm)) {
        alert('請完整填寫必填欄位並同意條款。');
        return;
      }
      const submitBtn = courseForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '送出中…';
      submitBtn.disabled = true;

      try {
        const formData = new URLSearchParams();
        new FormData(courseForm).forEach((v, k) => formData.append(k, v));
        const action = courseForm.action;

        // 如果還沒設 GAS / Formspree endpoint，就改用前端示範
        if (action.includes('YOUR_FORM_ID') || action.includes('YOUR_GAS_DEPLOY_ID')) {
          const name = courseForm.querySelector('#cf-name').value;
          const course = courseInput.value;
          alert(name + ' 同學您好！\n\n您報名的課程：' + course + '\n\n感謝您的報名意願！開班時間確定後，我們會以 LINE 或 Email 通知您。\n\n⚠️ 注意：表單尚未接 Formspree，請依說明在 HTML 中替換 YOUR_FORM_ID。');
          courseForm.reset();
          closeModal();
          return;
        }

        const response = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          alert('報名意願已送出！\n我們會在 24 小時內以 LINE 或 Email 與您聯繫。');
          courseForm.reset();
          closeModal();
        } else {
          throw new Error('送出失敗');
        }
      } catch (err) {
        alert('送出失敗，請稍後再試或直接加 LINE @siwen-academy 聯絡我們。');
        console.error(err);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ---------- Subtle parallax on bagua ----------
  const bagua = document.querySelector('.bagua-orbit');
  if (bagua) {
    let target = 0, current = 0;
    window.addEventListener('scroll', () => {
      target = Math.min(window.scrollY * 0.05, 60);
    }, { passive: true });
    const tick = () => {
      current += (target - current) * 0.08;
      bagua.style.transform = 'translateY(calc(-50% + ' + current + 'px))';
      requestAnimationFrame(tick);
    };
    tick();
  }
})();

/* ============================================================
   GALLERY · 教學足跡照片牆 (v3 新增)
   ============================================================ */
(function() {
  'use strict';
  const tabs = document.querySelectorAll('.gallery-tab');
  const items = document.querySelectorAll('.gallery-item');
  if (!tabs.length || !items.length) return;

  // Tab 切換
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const filter = tab.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('is-hidden');
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });

  // Lightbox
  let lightbox = document.querySelector('.gallery-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
      <button class="gallery-lightbox-close" aria-label="關閉">×</button>
      <img alt="" />
      <div class="gallery-lightbox-caption"></div>
    `;
    document.body.appendChild(lightbox);
  }
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('.gallery-lightbox-caption');
  const lbClose = lightbox.querySelector('.gallery-lightbox-close');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const cap = item.querySelector('figcaption');
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = cap ? cap.textContent.trim() : '';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLb() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lbImg.parentNode) closeLb();
  });
  lbClose.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLb();
  });
})();

/* ============================================================
   GA4 EVENT TRACKING (v3.6 新增)
   一頁式網站行為追蹤：nav 點擊 / section view / CTA / 表單提交
   ============================================================ */
(function() {
  'use strict';
  // 沒有 gtag 就跳過（例：本地測試或 GA 未啟用）
  if (typeof gtag !== 'function') return;

  // ---------- 1. NAV 點擊事件 ----------
  document.querySelectorAll('.nav-links a, .nav-mobile-cta a, .nav-mobile-cta button').forEach(el => {
    el.addEventListener('click', () => {
      const label = (el.getAttribute('href') || '').replace('#', '') || el.textContent.trim();
      gtag('event', 'nav_click', {
        event_category: 'navigation',
        event_label: label,
        link_text: el.textContent.trim()
      });
    });
  });

  // ---------- 2. SECTION VIEW 事件（IntersectionObserver） ----------
  const seenSections = new Set();
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.4 && !seenSections.has(entry.target.id)) {
        seenSections.add(entry.target.id);
        gtag('event', 'section_view', {
          event_category: 'engagement',
          event_label: entry.target.id || entry.target.className,
          section_name: entry.target.id
        });
      }
    });
  }, { threshold: [0.4] });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

  // ---------- 3. CTA 按鈕點擊 ----------
  document.querySelectorAll('.btn-primary, .btn-mystic, .cta-enroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      let label = 'unknown';
      if (btn.classList.contains('cta-enroll-btn')) label = 'enroll';
      else if (btn.classList.contains('btn-mystic')) label = 'birthchart';
      else if (btn.classList.contains('btn-primary')) label = 'primary';
      gtag('event', 'cta_click', {
        event_category: 'conversion',
        event_label: label,
        button_text: btn.textContent.trim().substring(0, 30)
      });
    });
  });

  // ---------- 4. 表單提交 ----------
  // 4a. 本命解析表單
  const qmForm = document.getElementById('qm-form');
  if (qmForm) {
    qmForm.addEventListener('submit', () => {
      gtag('event', 'birthchart_submit', {
        event_category: 'conversion',
        event_label: 'qimen_birthchart'
      });
    });
  }
  // 4b. 報名表
  const cf = document.getElementById('cf-form') || document.querySelector('form[action*="apply"], form[action*="form"]');
  document.querySelectorAll('form').forEach(form => {
    if (form.id === 'qm-form') return; // 上面已處理
    form.addEventListener('submit', () => {
      const formId = form.id || 'unknown_form';
      gtag('event', 'form_submit', {
        event_category: 'conversion',
        event_label: formId
      });
    });
  });

  // ---------- 5. Gallery 圖片點擊 ----------
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const cap = item.querySelector('figcaption');
      gtag('event', 'gallery_open', {
        event_category: 'engagement',
        event_label: cap ? cap.textContent.trim() : 'unknown'
      });
    });
  });

  // ---------- 6. FAQ 展開 ----------
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        const summary = item.querySelector('summary');
        gtag('event', 'faq_open', {
          event_category: 'engagement',
          event_label: summary ? summary.textContent.trim().substring(0, 50) : 'unknown'
        });
      }
    });
  });

  // ---------- 7. 滾動深度（25/50/75/100%） ----------
  const scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', () => {
    const scrollPct = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    [25, 50, 75, 100].forEach(milestone => {
      if (scrollPct >= milestone && !scrollMilestones[milestone]) {
        scrollMilestones[milestone] = true;
        gtag('event', 'scroll_depth', {
          event_category: 'engagement',
          event_label: milestone + '%',
          scroll_pct: milestone
        });
      }
    });
  }, { passive: true });
})();

/* ============================================================
   FENGSHUI STACK 互動 (v3.9 三張 PNG 疊層)
   - layer ↔ info-card 雙向 hover 綁定
   - hover 該層 → 該圖亮 + 其他暗
   - hover 卡片 → 對應層亮 + 其他暗
   ============================================================ */
(function() {
  'use strict';
  const wrap = document.querySelector('.fs-image-wrap');
  const layers = document.querySelectorAll('.fs-layer');
  const cards = document.querySelectorAll('.fs-info-card[data-floor]');
  if (!layers.length || !cards.length) return;

  function setActive(floor) {
    layers.forEach(l => {
      if (l.dataset.floor === floor) l.classList.add('is-active');
      else l.classList.remove('is-active');
    });
    cards.forEach(c => {
      if (c.dataset.floor === floor) c.classList.add('is-active');
      else c.classList.remove('is-active');
    });
    if (wrap) wrap.classList.add('is-hovering');
  }

  function clearActive() {
    layers.forEach(l => l.classList.remove('is-active'));
    cards.forEach(c => c.classList.remove('is-active'));
    if (wrap) wrap.classList.remove('is-hovering');
  }

  // layer 自身 hover
  layers.forEach(layer => {
    layer.addEventListener('mouseenter', () => setActive(layer.dataset.floor));
    layer.addEventListener('mouseleave', clearActive);
  });

  // card → layer
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => setActive(card.dataset.floor));
    card.addEventListener('mouseleave', clearActive);
  });
})();
