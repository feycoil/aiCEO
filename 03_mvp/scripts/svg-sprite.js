#!/usr/bin/env node
/**
 * svg-sprite.js — Genere _shared/icons.svg sprite a partir de lucide-static
 *
 * Usage : npm run svg:sprite
 *
 * Sortie : 03_mvp/public/_shared/icons.svg (sprite SVG avec 30 icones inventoriees v0.6)
 *
 * Pre-requis :
 *   - npm install --save-dev lucide-static
 *
 * Usage HTML :
 *   <svg class="c-icon"><use href="/_shared/icons.svg#icon-home"/></svg>
 *
 * Liste 30 icones v0.6 (S6.1.6) :
 *   - Navigation (9) : home, calendar, list-todo, briefcase, users, archive, settings, help-circle, log-out
 *   - Actions (11)   : plus, edit, trash, save, search, filter, refresh, download, upload, copy, share
 *   - Status (6)     : check, x, info, alert-circle, alert-triangle, clock
 *   - Coaching (4)   : sun, moon, target, sparkles
 */

const fs = require("node:fs");
const path = require("node:path");

const ICONS = [
  // Navigation
  "home", "calendar", "list-todo", "briefcase", "users", "archive", "settings", "help-circle", "log-out",
  // Actions
  "plus", "edit", "trash-2", "save", "search", "filter", "refresh-cw", "download", "upload", "copy", "share-2",
  // Status (note: + 1 par rapport a la liste pour completude)
  "check", "x", "info", "alert-circle", "alert-triangle", "clock",
  // Coaching
  "sun", "moon", "target", "sparkles"
];

const OUT_PATH = path.resolve(__dirname, "..", "public", "_shared", "icons.svg");

console.log("=== svg:sprite ===");
console.log(`Icones a inclure : ${ICONS.length}`);
console.log(`Output           : ${OUT_PATH}`);
console.log("");

let lucideIcons;
try {
  lucideIcons = require("lucide-static/icons.json");
} catch (e) {
  console.error("[FAIL] lucide-static non installe.");
  console.error("       Lance : npm install --save-dev lucide-static");
  process.exit(1);
}

const symbols = [];
let missing = [];

for (const iconName of ICONS) {
  const icon = lucideIcons[iconName];
  if (!icon) {
    console.warn(`  [WARN] Icone introuvable dans lucide-static : ${iconName}`);
    missing.push(iconName);
    continue;
  }
  // icon.toString() ou icon["body"] selon version. lucide-static expose "icon" string.
  const body = typeof icon === "string" ? icon : (icon.body || "");
  symbols.push(`  <symbol id="icon-${iconName}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n    ${body}\n  </symbol>`);
  console.log(`  [OK] icon-${iconName}`);
}

if (missing.length > 0) {
  console.error("");
  console.error(`[FAIL] ${missing.length} icones manquantes : ${missing.join(", ")}`);
  console.error("       Verifier les noms officiels sur https://lucide.dev/icons/");
  process.exit(1);
}

const sprite = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  aiCEO icons.svg — Sprite SVG genere par svg-sprite.js
  Source : lucide-static
  Stroke : 1.5 (cf. CONTRIBUTING-V06.md)
  Usage HTML : <svg class="c-icon"><use href="/_shared/icons.svg#icon-NAME"/></svg>
  Date generation : ${new Date().toISOString()}
  Icones : ${ICONS.length}
-->
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols.join("\n")}
</svg>
`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, sprite, "utf-8");

console.log("");
console.log(`[OK] Sprite genere : ${OUT_PATH}`);
console.log(`     Taille : ${sprite.length} chars`);
