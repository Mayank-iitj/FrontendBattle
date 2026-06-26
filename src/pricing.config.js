// pricing.config.js
// Multi-dimensional pricing matrix — ALL displayed prices are computed from here.
// No literal price values appear anywhere in HTML markup.

export const PRICING = {
  annualDiscount: 0.20, // flat 20% off when billed annually

  currencies: {
    USD: { symbol: "$", tariff: 1,    locale: "en-US" },
    EUR: { symbol: "€", tariff: 0.92, locale: "de-DE" },
    INR: { symbol: "₹", tariff: 83,   locale: "en-IN" },
  },

  tiers: [
    {
      id: "starter",
      name: "Starter",
      baseMonthly: 19,
      blurb: "For solo builders",
      features: [
        "1 workspace",
        "5 automations",
        "200+ source connectors",
        "Community support",
        "Basic observability",
      ],
      highlighted: false,
      cta: "Start free trial",
    },
    {
      id: "pro",
      name: "Pro",
      baseMonthly: 49,
      blurb: "For scaling teams",
      features: [
        "Unlimited automations",
        "AI agents (GPT-4o + Claude)",
        "Advanced lineage tracking",
        "Priority support (< 4h SLA)",
        "Team permissions & audit log",
      ],
      highlighted: true,
      cta: "Start for free",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      baseMonthly: 129,
      blurb: "For data orgs",
      features: [
        "SSO + governance controls",
        "Dedicated compute infra",
        "Custom AI model integration",
        "24/7 SLA with named CSM",
        "On-prem / VPC deployment",
      ],
      highlighted: false,
      cta: "Contact sales",
    },
  ],
};

/**
 * Compute the displayed price for a tier.
 * @param {number} baseMonthly - base USD monthly price from the matrix
 * @param {string} currencyKey - key into PRICING.currencies
 * @param {"monthly"|"annual"} cycle - billing cycle
 * @returns {number} computed price in the target currency
 */
export function computePrice(baseMonthly, currencyKey, cycle) {
  const { tariff } = PRICING.currencies[currencyKey];
  const monthly = baseMonthly * tariff;
  return cycle === "annual" ? monthly * (1 - PRICING.annualDiscount) : monthly;
}

/**
 * Format a computed price value with the correct currency symbol + locale.
 * @param {number} value
 * @param {string} currencyKey
 * @returns {string} formatted price string, e.g. "$39" or "₹3,237"
 */
export function formatPrice(value, currencyKey) {
  const { symbol, locale } = PRICING.currencies[currencyKey];
  return symbol + Math.round(value).toLocaleString(locale);
}
