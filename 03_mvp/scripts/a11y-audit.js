#!/usr/bin/env node
/**
 * a11y-audit.js — Audit accessibilite axe-core CLI sur les pages refondues v0.6
 *
 * Usage : npm run a11y:audit
 *
 * Cible : WCAG AA cockpit/arbitrage/evening = 0 finding critique (S6.3.7)
 *
 * Pre-requis :
 *   - npm install --save-dev @axe-core/cli
 *   - Serveur lance (npm start) sur localhost:4747
 *
 * Pages auditees (ordre de criticite v0.6) :
 *   - /                  (cockpit) — WCAG AA cible
 *   - /arbitrage         (arbitrage matinal) — WCAG AA cible
 *   - /evening           (boucle du soir) — WCAG AA cible
 *   - /taches            (Eisenhower)
 *   - /agenda            (drag-drop hebdo)
 *   - /revues/           (revues hebdo)
 *   - /assistant         (chat live SSE)
 *   - /groupes           (registres)
 *   - /projets, /projet  (registres)
 *   - /contacts          (registres)
 *   - /decisions         (registres)
 *   - /components.html   (gallery — composants visibles)
 */

const { execSync } = require("node:child_process");
const path = require("node:path");

const BASE_URL = process.env.AICEO_URL || "http://localhost:4747";

const PAGES = [
  { path: "/",             priority: "AA-cible", critical: true },
  { path: "/arbitrage",    priority: "AA-cible", critical: true },
  { path: "/evening",      priority: "AA-cible", critical: true },
  { path: "/taches",       priority: "AA",       critical: false },
  { path: "/agenda",       priority: "AA",       critical: false },
  { path: "/revues/",      priority: "AA",       critical: false },
  { path: "/assistant",    priority: "AA",       critical: false },
  { path: "/groupes",      priority: "AA",       critical: false },
  { path: "/projets",      priority: "AA",       critical: false },
  { path: "/projet?id=1",  priority: "AA",       critical: false },
  { path: "/contacts",     priority: "AA",       critical: false },
  { path: "/decisions",    priority: "AA",       critical: false },
  { path: "/components.html", priority: "AA",    critical: false }
];

console.log("=== Audit a11y v0.6 (axe-core CLI) ===");
console.log(`Base URL : ${BASE_URL}`);
console.log(`Pages    : ${PAGES.length}`);
console.log("");

let passed = 0, failed = 0, criticalFails = 0;

for (const page of PAGES) {
  const url = BASE_URL + page.path;
  console.log(`[${page.priority}] ${url}`);
  try {
    // axe-core CLI : exit 0 = pas de violation, exit 1 = violations
    execSync(`npx axe ${url} --tags wcag2a,wcag2aa --exit`, { stdio: "inherit" });
    console.log(`  [OK] ${url}`);
    passed++;
  } catch (e) {
    console.log(`  [FAIL] ${url} — exit ${e.status || "?"}`);
    failed++;
    if (page.critical) criticalFails++;
  }
  console.log("");
}

console.log("=== Resume ===");
console.log(`  Passees      : ${passed}`);
console.log(`  Echecs       : ${failed}`);
console.log(`  Echecs critiques (cockpit/arbitrage/evening) : ${criticalFails}`);

if (criticalFails > 0) {
  console.error("");
  console.error("[FAIL] Audit a11y v0.6 - critique. Voir DOSSIER-V06.md S6 critere acceptation.");
  process.exit(1);
}

console.log("");
console.log("[OK] Audit a11y termine.");
