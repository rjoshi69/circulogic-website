/**
 * CircuLogic — main.js (v2 · Warm redesign)
 * Pure vanilla JS. No dependencies.
 * Handles: navbar scroll, mobile nav, scroll reveal,
 *          hero stat counters, closed loop tooltip,
 *          metric gauges, contact form thank-you.
 */

'use strict';

/* ── 1. Navbar shadow on scroll ───────────────────────────── */
(function () {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 2. Mobile hamburger ──────────────────────────────────── */
var hamburger = document.getElementById('hamburger');
var navDrawer = document.getElementById('nav-drawer');

function closeDrawer() {
  if (!hamburger || !navDrawer) return;
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  navDrawer.classList.remove('open');
}

(function () {
  if (!hamburger || !navDrawer) return;
  hamburger.addEventListener('click', function () {
    var isOpen = navDrawer.classList.contains('open');
    if (isOpen) { closeDrawer(); }
    else {
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      navDrawer.classList.add('open');
    }
  });
  document.addEventListener('click', function (e) {
    if (navDrawer.classList.contains('open') && !navDrawer.contains(e.target) && !hamburger.contains(e.target)) closeDrawer();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
})();

/* ── 3. Scroll reveal ─────────────────────────────────────── */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(function (el) { observer.observe(el); });
})();

/* ── 4. Hero stat counters ────────────────────────────────── */
(function () {
  var stats = [
    { id: 'stat-1', target: 890,  prefix: '$', suffix: 'B', decimal: 0 },
    { id: 'stat-2', target: 16.5, prefix: '',  suffix: '%', decimal: 1 },
    { id: 'stat-3', target: 66,   prefix: '',  suffix: '%', decimal: 0 }
  ];
  var duration = 1600;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function animate(el, end, pre, suf, dec) {
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var v = end * ease(p);
      el.textContent = pre + v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  setTimeout(function () {
    stats.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) animate(el, s.target, s.prefix, s.suffix, s.decimal);
    });
  }, 350);
})();

/* ── 5. Closed loop diagram tooltips ──────────────────────── */
(function () {
  var diagram = document.getElementById('loop-diagram');
  var tooltip = document.getElementById('stage-tooltip');
  var ttNum   = document.getElementById('tt-num');
  var ttTitle = document.getElementById('tt-title');
  var ttDesc  = document.getElementById('tt-desc');
  var cont    = document.querySelector('.loop-container');
  if (!diagram || !tooltip || !cont) return;

  var nodes = diagram.querySelectorAll('.loop-node');
  nodes.forEach(function (node) {
    node.addEventListener('mouseenter', function () {
      var stage = node.getAttribute('data-stage');
      var title = node.getAttribute('data-title');
      var desc  = node.getAttribute('data-desc');
      ttNum.textContent   = 'STAGE ' + String(stage).padStart(2, '0');
      ttTitle.textContent = title;
      ttDesc.textContent  = desc;

      var circle   = node.querySelector('circle');
      var nodeRect = circle.getBoundingClientRect();
      var contRect = cont.getBoundingClientRect();
      var left = nodeRect.left - contRect.left + nodeRect.width / 2 - 120;
      var top  = nodeRect.top  - contRect.top  - tooltip.offsetHeight - 10;
      left = Math.max(8, Math.min(left, contRect.width - 252));
      if (top < 0) top = nodeRect.bottom - contRect.top + 8;
      tooltip.style.left = left + 'px';
      tooltip.style.top  = top + 'px';
      tooltip.classList.add('visible');
    });
    node.addEventListener('mouseleave', function () { tooltip.classList.remove('visible'); });
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        node.dispatchEvent(new MouseEvent('mouseenter'));
        setTimeout(function () { node.dispatchEvent(new MouseEvent('mouseleave')); }, 3000);
      }
    });
  });
  cont.addEventListener('mouseleave', function () { tooltip.classList.remove('visible'); });
})();

/* ── 6. Metric card gauge bars ────────────────────────────── */
(function () {
  var cards = document.querySelectorAll('.metric-card');
  if (!cards.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  cards.forEach(function (c) { observer.observe(c); });
})();

/* ── 7. Contact form thank-you ────────────────────────────── */
(function () {
  var form     = document.getElementById('contact-form');
  var fields   = document.getElementById('form-fields');
  var thankyou = document.getElementById('form-thankyou');
  if (!form || !fields || !thankyou) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Remove when using real Formspree endpoint

    var required = [
      document.getElementById('f-name'),
      document.getElementById('f-company'),
      document.getElementById('f-email'),
      document.getElementById('f-role')
    ];
    var valid = true;
    required.forEach(function (el) {
      if (!el) return;
      var v = el.value.trim();
      if (!v || (el.type === 'email' && v.indexOf('@') === -1)) {
        el.style.borderColor = '#B8860B';
        el.style.boxShadow   = '0 0 0 3px rgba(184,134,11,0.1)';
        valid = false;
        el.addEventListener('input', function () { el.style.borderColor = ''; el.style.boxShadow = ''; }, { once: true });
      }
    });
    if (!valid) return;

    fields.style.transition    = 'opacity 300ms';
    fields.style.opacity       = '0';
    fields.style.pointerEvents = 'none';
    setTimeout(function () {
      fields.style.display = 'none';
      thankyou.classList.add('visible');
      thankyou.style.opacity    = '0';
      thankyou.style.transition = 'opacity 400ms';
      requestAnimationFrame(function () { thankyou.style.opacity = '1'; });
    }, 320);
  });
})();

/* ── 8. Smooth scroll for anchor links ────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
})();
