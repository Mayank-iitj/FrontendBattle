// motion.js
// Entry orchestration via WAAPI — ≤ 500ms total, opacity + translateY only.
// Respects prefers-reduced-motion.

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SEQUENCE = [
  // [selector, delayMs, durationMs]
  ['.site-header',   0,   500],
  ['#hero .hero-badge', 100, 500],
  ['#hero h1',      200,   600],
  ['#hero .hero-sub', 300, 500],
  ['#hero .hero-cta', 400, 500],
  ['#hero .hero-meta', 500, 400],
  ['#hero .hero-visual', 200, 800],
  ['#hero .hero-stats', 600, 600],
];

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Expo out

export function runEntryOrchestration() {
  if (REDUCED) {
    // Honor prefers-reduced-motion: make everything immediately visible
    for (const [sel] of SEQUENCE) {
      const el = document.querySelector(sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    }
    removeLoader();
    return;
  }

  for (const [sel, delay, duration] of SEQUENCE) {
    const el = document.querySelector(sel);
    if (!el) continue;
    el.animate(
      [
        { opacity: 0, transform: 'translateY(24px) scale(0.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      {
        duration,
        delay,
        easing: EASING,
        fill: 'both',
      }
    );
  }

  // Loader fades out after content starts appearing
  removeLoader();
}

function removeLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  if (REDUCED) {
    loader.remove();
    return;
  }

  loader.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 200, delay: 80, easing: 'ease-out', fill: 'forwards' }
  ).finished.then(() => loader.remove());
}

// ── Scroll-triggered reveal for below-fold sections ───────

export function initScrollReveal() {
  if (REDUCED) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
