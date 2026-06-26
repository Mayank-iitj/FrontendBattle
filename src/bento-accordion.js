// bento-accordion.js
// Handles:
//  1. Rendering FEATURES array into both .bento and .accordion containers
//  2. Accordion open/close with aria-expanded (CSS does the animation)
//  3. Context-lock: when viewport crosses into mobile, opens the last-hovered bento index

import { FEATURES } from './features.config.js';
import { ICONS } from './icons.js';

// Module-level context state
let activeIndex = 0;

// ── Render helpers ─────────────────────────────────────────

function renderBentoCard(feature) {
  const card = document.createElement('div');
  card.className = 'bento-card';
  card.dataset.node = feature.id;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', feature.title);
  if (feature.span) {
    if (feature.span.col > 1) card.classList.add(`col-span-${feature.span.col}`);
    if (feature.span.row > 1) card.classList.add(`row-span-${feature.span.row}`);
  }
  card.innerHTML = `
    <div class="bento-icon">${ICONS[feature.icon] ?? ''}</div>
    <h3 class="bento-title">${feature.title}</h3>
    <p class="bento-body">${feature.body}</p>
  `;
  return card;
}

function renderAccordionItem(feature) {
  const item = document.createElement('div');
  item.className = 'acc-item';
  item.dataset.node = feature.id;
  item.setAttribute('aria-expanded', 'false');

  const triggerId = `acc-trigger-${feature.id}`;
  const panelId = `acc-panel-${feature.id}`;

  item.innerHTML = `
    <button
      class="acc-trigger"
      id="${triggerId}"
      aria-expanded="false"
      aria-controls="${panelId}"
    >
      <span class="acc-trigger-left">
        <span class="acc-icon">${ICONS[feature.icon] ?? ''}</span>
        <span>${feature.title}</span>
      </span>
      <span class="chevron">${ICONS['chevron-down']}</span>
    </button>
    <div
      class="acc-panel"
      id="${panelId}"
      role="region"
      aria-labelledby="${triggerId}"
    >
      <div class="acc-panel-inner">
        <div class="acc-panel-content">${feature.body}</div>
      </div>
    </div>
  `;
  return item;
}

// ── Open a specific accordion item ─────────────────────────

export function openAccordion(index) {
  document.querySelectorAll('.acc-item').forEach(item => {
    const isTarget = Number(item.dataset.node) === index;
    const trigger = item.querySelector('.acc-trigger');
    item.setAttribute('aria-expanded', String(isTarget));
    if (trigger) trigger.setAttribute('aria-expanded', String(isTarget));
  });
}

// ── Init ───────────────────────────────────────────────────

export function initFeatures() {
  const bentoContainer = document.querySelector('.bento');
  const accordionContainer = document.querySelector('.accordion');

  if (!bentoContainer || !accordionContainer) return;

  // Render both views from the single FEATURES array
  for (const feature of FEATURES) {
    bentoContainer.appendChild(renderBentoCard(feature));
    accordionContainer.appendChild(renderAccordionItem(feature));
  }

  // ── Bento: track last-hovered/focused index (context-lock state)
  bentoContainer.querySelectorAll('[data-node]').forEach(card => {
    const i = Number(card.dataset.node);

    card.addEventListener('mouseenter', () => {
      activeIndex = i;
      // Visual highlight
      bentoContainer.querySelectorAll('.bento-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });

    card.addEventListener('focusin', () => {
      activeIndex = i;
      bentoContainer.querySelectorAll('.bento-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active');
    });
  });

  // ── Accordion: click handler (pure JS — no library)
  accordionContainer.querySelectorAll('.acc-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.acc-item');
      const isOpen = item.getAttribute('aria-expanded') === 'true';
      const targetIndex = Number(item.dataset.node);

      // Close all first
      accordionContainer.querySelectorAll('.acc-item').forEach(i => {
        i.setAttribute('aria-expanded', 'false');
        i.querySelector('.acc-trigger')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (unless it was already open)
      if (!isOpen) {
        item.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-expanded', 'true');
        activeIndex = targetIndex; // keep context in sync for reverse transition
      }
    });
  });

  // ── Context-lock: matchMedia listener
  // When viewport crosses INTO mobile (max-width: 767px),
  // open the accordion panel at the last-hovered bento index.
  const mq = window.matchMedia('(max-width: 767px)');

  mq.addEventListener('change', (e) => {
    if (e.matches) {
      // Crossed into mobile → transfer bento context to accordion
      openAccordion(activeIndex);
    }
    // Crossing back to desktop: CSS hides accordion, shows bento.
    // activeIndex is already correct from accordion taps above.
  });

  // Open first item by default on mobile if already in mobile viewport
  if (mq.matches) {
    openAccordion(0);
  }
}
