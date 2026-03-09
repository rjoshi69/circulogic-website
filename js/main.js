/**
 * CircuLogic — main.js
 * Pure vanilla JS. No dependencies.
 * Handles: navbar scroll, mobile nav, scroll reveal,
 *          hero stat counters, closed loop diagram interactions,
 *          metric card gauge animations, contact form thank-you state.
 */

'use strict';

/* ──────────────────────────────────────────────
   1. Navbar — scroll solidify
   ────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is already scrolled
})();


/* ──────────────────────────────────────────────
   2. Mobile Navigation Hamburger
   ────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('nav-drawer');

function closeDrawer() {
  if (!hamburger || !navDrawer) return;
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  navDrawer.classList.remove('open');
}

(function initMobileNav() {
  if (!hamburger || !navDrawer) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navDrawer.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      navDrawer.classList.add('open');
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      navDrawer.classList.contains('open') &&
      !navDrawer.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeDrawer();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
})();


/* ──────────────────────────────────────────────
   3. Scroll Reveal — Intersection Observer
   ────────────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Also trigger score bars if inside a metric card
          const bar = entry.target.querySelector('.score-bar');
          if (bar) {
            entry.target.classList.add('visible');
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   4. Hero Stat Counter Animation
   Fires on page load with a short delay
   ────────────────────────────────────────────── */
(function initStatCounters() {
  const stats = [
    { id: 'stat-1', target: 890,  prefix: '$', suffix: 'B', decimal: 0 },
    { id: 'stat-2', target: 16.5, prefix: '',  suffix: '%', decimal: 1 },
    { id: 'stat-3', target: 66,   prefix: '',  suffix: '%', decimal: 0 },
  ];

  const duration = 1800; // ms
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animateCounter(el, startVal, endVal, prefix, suffix, decimals) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = startVal + (endVal - startVal) * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Delay slightly so page has rendered
  setTimeout(() => {
    stats.forEach(({ id, target, prefix, suffix, decimal }) => {
      const el = document.getElementById(id);
      if (el) animateCounter(el, 0, target, prefix, suffix, decimal);
    });
  }, 400);
})();


/* ──────────────────────────────────────────────
   5. Closed Loop Diagram — Node Hover Interactions
   ────────────────────────────────────────────── */
(function initLoopDiagram() {
  const diagram   = document.getElementById('loop-diagram');
  const tooltip   = document.getElementById('stage-tooltip');
  const ttNum     = document.getElementById('tt-num');
  const ttTitle   = document.getElementById('tt-title');
  const ttDesc    = document.getElementById('tt-desc');
  const container = document.querySelector('.loop-container');

  if (!diagram || !tooltip || !container) return;

  const nodes = diagram.querySelectorAll('.loop-node');

  nodes.forEach((node) => {
    // Highlight ring on hover
    node.addEventListener('mouseenter', (e) => {
      const stage = node.getAttribute('data-stage');
      const title = node.getAttribute('data-title');
      const desc  = node.getAttribute('data-desc');

      // Update tooltip
      ttNum.textContent   = 'STAGE ' + String(stage).padStart(2, '0');
      ttTitle.textContent = title;
      ttDesc.textContent  = desc;

      // Position tooltip — use getBoundingClientRect relative to container
      const nodeEl = node.querySelector('circle');
      if (nodeEl) {
        const nodeRect  = nodeEl.getBoundingClientRect();
        const contRect  = container.getBoundingClientRect();

        let left = nodeRect.left - contRect.left + nodeRect.width / 2;
        let top  = nodeRect.top  - contRect.top  - tooltip.offsetHeight - 12;

        // Keep tooltip inside container horizontally
        const maxLeft = contRect.width - 260;
        left = Math.max(10, Math.min(left - 120, maxLeft));

        // If tooltip would go above container, show below
        if (top < 0) {
          top = nodeRect.bottom - contRect.top + 8;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top  = top  + 'px';
      }

      tooltip.classList.add('visible');

      // Scale up the inner circle
      const innerCircles = node.querySelectorAll('circle');
      innerCircles.forEach((c) => {
        c.style.transition = 'opacity 200ms';
      });
      node.style.opacity = '1';
      const ring = node.querySelector('.node-ring');
      if (ring) ring.setAttribute('stroke-opacity', '1');
    });

    node.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });

    // Keyboard accessibility
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        node.dispatchEvent(new MouseEvent('mouseenter'));
        setTimeout(() => node.dispatchEvent(new MouseEvent('mouseleave')), 3000);
      }
    });
  });

  // Hide tooltip when mouse leaves container entirely
  container.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
})();


/* ──────────────────────────────────────────────
   6. Metric Card Gauge Bars
   Triggered via IntersectionObserver when cards enter view
   ────────────────────────────────────────────── */
(function initMetricGauges() {
  const cards = document.querySelectorAll('.metric-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  cards.forEach((card) => observer.observe(card));
})();


/* ──────────────────────────────────────────────
   7. Contact Form — Thank You State
   Intercepts submit, shows animated thank-you.
   In production, wire to Formspree by removing
   preventDefault and setting correct action URL.
   ────────────────────────────────────────────── */
(function initContactForm() {
  const form      = document.getElementById('contact-form');
  const fields    = document.getElementById('form-fields');
  const thankyou  = document.getElementById('form-thankyou');
  if (!form || !fields || !thankyou) return;

  form.addEventListener('submit', (e) => {
    // e.preventDefault(); // Remove this line when using real Formspree endpoint

    // Basic validation
    const name    = document.getElementById('f-name');
    const company = document.getElementById('f-company');
    const email   = document.getElementById('f-email');
    const role    = document.getElementById('f-role');

    let valid = true;

    [name, company, email, role].forEach((el) => {
      if (!el) return;
      const val = el.value.trim();
      if (!val || (el.type === 'email' && !val.includes('@'))) {
        el.style.borderColor = 'var(--danger)';
        el.style.boxShadow   = '0 0 0 3px rgba(255,77,109,0.1)';
        valid = false;
        el.addEventListener('input', () => {
          el.style.borderColor = '';
          el.style.boxShadow   = '';
        }, { once: true });
      }
    });

    if (!valid) return;

    // Show thank you state
    fields.style.transition  = 'opacity 300ms';
    fields.style.opacity     = '0';
    fields.style.pointerEvents = 'none';

    setTimeout(() => {
      fields.style.display = 'none';
      thankyou.classList.add('visible');
      thankyou.style.opacity = '0';
      thankyou.style.transition = 'opacity 400ms';
      requestAnimationFrame(() => {
        thankyou.style.opacity = '1';
      });
    }, 320);

    /*
      PRODUCTION NOTE:
      ════════════════
      To actually submit to Formspree, either:
      a) Remove e.preventDefault() above and set the correct action URL
         on the <form> element in index.html, OR
      b) Use fetch() to POST to Formspree:

      const data = new FormData(form);
      fetch('https://formspree.io/f/YOUR_ID', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(r => {
        if (r.ok) { showThankyou(); }
        else { showError(); }
      });
    */
  });
})();


/* ──────────────────────────────────────────────
   8. Smooth scroll for anchor links
   (supplements native CSS scroll-behavior)
   ────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ──────────────────────────────────────────────
   9. Hero loop — subtle continuous rotation glow
   ────────────────────────────────────────────── */
(function initHeroLoop() {
  // The SVG animations are handled declaratively in the SVG.
  // This adds a slight parallax offset to the hero visual on scroll.
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual) return;

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
