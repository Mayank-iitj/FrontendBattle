// features.config.js — maps to the exact provided SVG keys in icons.js

export const FEATURES = [
  {
    id: 0,
    icon: 'arrow-path',          // arrow-path.svg — ingest / refresh loop
    title: 'Ingest Anything',
    body: 'Connect to 200+ sources — databases, SaaS apps, event streams, and flat files — with zero-ETL connectors. Schema inference handles the rest automatically.',
    span: { col: 2, row: 2 },
  },
  {
    id: 1,
    icon: 'cube-16-solid',        // cube-16-solid.svg — AI agent / 3D model
    title: 'AI Agents',
    body: 'Describe an outcome in plain language. Fluxion\'s AI agents decompose goals into tasks, write the transformation logic, and ship to production.',
    span: { col: 2, row: 1 },
  },
  {
    id: 2,
    icon: 'chart-pie',            // chart-pie.svg — observe / analytics
    title: 'Observe & Govern',
    body: 'Full data lineage, real-time pipeline health, anomaly alerts, and immutable audit logs — your data team\'s control tower.',
    span: { col: 1, row: 1 },
  },
  {
    id: 3,
    icon: 'arrow-trending-up',    // arrow-trending-up.svg — scale / growth
    title: 'Scale on Demand',
    body: 'Serverless execution scales from zero to billions of rows with no infra overhead. Pay only for what runs.',
    span: { col: 1, row: 1 },
  },
  {
    id: 4,
    icon: 'link-solid',           // link-solid.svg — team / integrations
    title: 'Built for Teams',
    body: 'Role-based access, shared workspaces, version-controlled pipelines, and Git-native workflows. Ship together, safely.',
    span: { col: 2, row: 1 },
  },
];
