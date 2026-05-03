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

  // ---------- Contact form ----------
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) {
        alert('請完整填寫必填欄位，並勾選同意條款。');
        return;
      }
      const name = form.querySelector('#f-name').value;
      alert(name + ' 您好！\n\n預約申請已送出，思聞國學將於 24 小時內與您聯繫。\n（此為前端示範，實際串接需後端服務）');
      form.reset();
    });
  }

  // ---------- Course enrollment form ----------
  const courseForm = document.getElementById('courseForm');
  if (courseForm) {
    courseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(courseForm)) {
        alert('請完整填寫必填欄位、選擇課程與上課地，並同意條款。');
        return;
      }
      const name = courseForm.querySelector('#cf-name').value;
      const course = courseForm.querySelector('input[name="course"]:checked').value;
      const location = courseForm.querySelector('#cf-location').value;
      alert(name + ' 同學您好！\n\n您報名的課程：' + course + '\n上課地：' + location + '\n\n感謝您的報名意願！開班時間確定後，我們會以 LINE 或 Email 通知您。\n（此為前端示範，實際串接需後端服務）');
      courseForm.reset();
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
