/* ============================================
   思聞國學 SIWEN ACADEMY - Interactions
   ============================================ */

(function () {
  'use strict';

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

  // 動態調整「上課地」：線上課程自動填線上，其他課程只給實體地點
  const updateLocationOptions = (courseName) => {
    const locationField = document.getElementById('cf-location');
    const locationHint = document.getElementById('locationHint');
    if (!locationField || !locationHint) return;
    const isOnline = courseName.includes('線上課程');
    [...locationField.options].forEach((o) => {
      if (o.value === '線上' || o.textContent.includes('線上')) o.remove();
    });
    if (isOnline) {
      const opt = document.createElement('option');
      opt.value = '線上';
      opt.textContent = '線上（自動）';
      opt.selected = true;
      locationField.appendChild(opt);
      locationField.value = '線上';
      locationHint.style.display = 'block';
      locationHint.textContent = '※ 線上課程不需選實體上課地，已自動設為「線上」';
    } else {
      locationField.value = '';
      locationHint.style.display = 'none';
    }
  };

  // courseName === '__CTA__' 表示從「立即報名」按鈕進來，顯示下拉
  // 否則表示從卡片進來，自動帶入並隱藏下拉
  const openModal = (courseName) => {
    if (!modal) return;
    const isFromCTA = courseName === '__CTA__';
    if (courseHint) courseHint.style.display = 'none';

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

  // 課程下拉變動：同步更新 modal 標題顯示 + location 選項 + 諮詢提示
  if (courseSelect) {
    courseSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === '還在比較 / 想諮詢') {
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

  // 立即報名 CTA 按鈕（CTA 模式 → 顯示下拉）
  const ctaBtn = document.getElementById('ctaEnrollBtn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => openModal('__CTA__'));
  }

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
