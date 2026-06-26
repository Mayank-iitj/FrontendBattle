// main.js — Entry point
// Order: styles → features → pricing → motion → then lazy-load Three.js canvas

import './style.css';
import { initFeatures } from './bento-accordion.js';
import { initPricing } from './pricing.js';
import { runEntryOrchestration, initScrollReveal } from './motion.js';

// ── Header scroll effect ───────────────────────────────────
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Mobile nav toggle ──────────────────────────────────────
function initMobileNav() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    nav.style.display = isOpen ? 'flex' : 'none';
  });

  // Close on nav link click
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── CTA form ───────────────────────────────────────────────
function initCtaForm() {
  const form = document.getElementById('ctaForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('ctaEmail')?.value;
    const btn = document.getElementById('cta-submit');
    if (btn && email) {
      btn.textContent = '✓ You\'re on the list!';
      btn.disabled = true;
      btn.style.background = 'var(--c-success)';
    }
  });
}

// ── Keyboard / anchor smooth scroll fix ───────────────────
function initAnchorNav() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Main init sequence ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Critical-path inits (synchronous, fast)
  initHeader();
  initMobileNav();
  initFeatures();   // renders bento + accordion from FEATURES array
  initPricing();    // fills price nodes, wires controls
  initCtaForm();
  initAnchorNav();

  // Motion — WAAPI entry orchestration (≤500ms total)
  runEntryOrchestration();
  initScrollReveal();

  // Lazy-load Three.js canvases AFTER first paint
  // Using requestIdleCallback for best TTI
  const loadCanvases = () => {
    import('./three-liquid-bg.js').then(({ initLiquidBg }) => initLiquidBg()).catch(e => console.error('Liquid BG failed:', e));
    import('./three-can-showcase.js').then(({ initCanShowcase }) => initCanShowcase()).catch(e => console.error('Can Showcase failed:', e));
    // Skipping other original scenes as we pivot to Ciao Energy
    // import('./three-features.js').then(({ initFeaturesScene }) => initFeaturesScene()).catch(e => console.error('Features scene failed:', e));
    // import('./three-pricing.js').then(({ initPricingScene }) => initPricingScene()).catch(e => console.error('Pricing scene failed:', e));
    // import('./three-social.js').then(({ initSocialScene }) => initSocialScene()).catch(e => console.error('Social scene failed:', e));
    // import('./three-cta.js').then(({ initCtaScene }) => initCtaScene()).catch(e => console.error('CTA scene failed:', e));
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadCanvases, { timeout: 2000 });
  } else {
    setTimeout(loadCanvases, 100);
  }
});
