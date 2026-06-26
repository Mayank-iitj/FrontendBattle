// pricing.js
// Isolated price updater — the only module that touches price DOM nodes.
// Currency/cycle state lives HERE as module-level variables.
// Changing them calls repaintPrices() which mutates ONLY [data-price] textContent.
// Zero parent re-renders. Zero DOM recreation.

import { PRICING, computePrice, formatPrice } from './pricing.config.js';

// Module-level state — not in any framework store or global window object
let currency = 'USD';
let cycle = 'monthly';

// Cache DOM nodes ONCE at init — never re-query
let amountNodes = null;
let periodNodes = null;
let billingToggle = null;
let currencySelect = null;
let monthlyLabel = null;
let annualLabel = null;

/**
 * THE ISOLATION FUNCTION — mutates only price text nodes.
 * DevTools Paint Flashing will show ONLY these spans flashing.
 */
function repaintPrices() {
  for (const node of amountNodes) {
    const tier = PRICING.tiers.find(t => t.id === node.dataset.price);
    if (!tier) continue;
    const value = computePrice(tier.baseMonthly, currency, cycle);
    node.textContent = formatPrice(value, currency);
  }
  for (const p of periodNodes) {
    p.textContent = cycle === 'annual' ? '/mo, billed yearly' : '/mo';
  }
}

function updateToggleLabels() {
  if (!monthlyLabel || !annualLabel) return;
  if (cycle === 'monthly') {
    monthlyLabel.classList.add('active-label');
    annualLabel.classList.remove('active-label');
  } else {
    annualLabel.classList.add('active-label');
    monthlyLabel.classList.remove('active-label');
  }
}

/**
 * Initialize the pricing module.
 * Call AFTER the pricing section HTML is in the DOM.
 */
export function initPricing() {
  // Cache all price-related nodes once
  amountNodes = [...document.querySelectorAll('[data-price]')];
  periodNodes = [...document.querySelectorAll('[data-period]')];
  billingToggle = document.getElementById('billingToggle');
  currencySelect = document.getElementById('currencySel');
  monthlyLabel = document.getElementById('label-monthly');
  annualLabel = document.getElementById('label-annual');

  if (!billingToggle || !currencySelect || amountNodes.length === 0) return;

  // Billing toggle: only mutates cycle + calls repaintPrices
  billingToggle.addEventListener('change', (e) => {
    cycle = e.target.checked ? 'annual' : 'monthly';
    updateToggleLabels();
    repaintPrices(); // ← touches ONLY the price spans
  });

  // Currency select: only mutates currency + calls repaintPrices
  currencySelect.addEventListener('change', (e) => {
    currency = e.target.value;
    repaintPrices(); // ← touches ONLY the price spans
  });

  // Initial fill — prices start empty in HTML, we populate them now
  repaintPrices();
  updateToggleLabels();
}
