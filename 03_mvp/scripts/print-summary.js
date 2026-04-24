#!/usr/bin/env node
/**
 * print-summary.js — lit data/emails-summary.json et affiche un digest
 * lisible dans le terminal, pour contrôler l'import Outlook avant
 * de lancer l'arbitrage.
 */
const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "data", "emails-summary.json");
if (!fs.existsSync(p)) {
  console.error("✗ data/emails-summary.json introuvable — normalize-emails.js n'a pas tourné ?");
  process.exit(1);
}

const s = JSON.parse(fs.readFileSync(p, "utf8"));
const t = s.totals || {};

const line = "─".repeat(60);
console.log("");
console.log(line);
console.log(`  Digest emails — fenêtre ${s.window_days || 30} jours`);
console.log(line);
console.log(`  Bruts extraits  : ${t.raw ?? "?"}`);
console.log(`  Utiles gardés   : ${t.kept ?? "?"}`);
console.log(`  Filtrés (bruit) : ${t.filtered_noise ?? "?"}`);
console.log(`  Non lus         : ${t.unread ?? 0}`);
console.log(`  Flagués         : ${t.flagged ?? 0}`);
console.log("");

if (Array.isArray(s.top_senders) && s.top_senders.length) {
  console.log("  Top expéditeurs");
  s.top_senders.slice(0, 10).forEach((e, i) => {
    const n = String(e.count).padStart(3, " ");
    const key = (e.key || "?").padEnd(40, " ").slice(0, 40);
    console.log(`   ${String(i + 1).padStart(2, " ")}. ${n}  ${key}`);
  });
  console.log("");
}

if (Array.isArray(s.per_account) && s.per_account.length) {
  console.log("  Volume par compte Outlook");
  s.per_account.forEach(e => {
    const c = String(e.count).padStart(3, " ");
    console.log(`   ${c}  ${e.key}`);
  });
  console.log("");
}

if (Array.isArray(s.per_project) && s.per_project.length) {
  console.log("  Volume par projet inféré");
  s.per_project.forEach(e => {
    const c = String(e.count).padStart(3, " ");
    console.log(`   ${c}  ${e.key}`);
  });
  console.log("");
}

if (Array.isArray(s.per_day) && s.per_day.length) {
  const days = s.per_day.slice(-14);
  const max = Math.max(1, ...days.map(d => d.count));
  console.log("  Volume par jour (14 derniers)");
  days.forEach(d => {
    const bar = "█".repeat(Math.round((d.count / max) * 28));
    console.log(`   ${d.day}  ${String(d.count).padStart(3, " ")}  ${bar}`);
  });
  console.log("");
}

console.log(line);
console.log(`  ✓ Import OK — lance maintenant start.bat pour l'arbitrage`);
console.log(line);
console.log("");
