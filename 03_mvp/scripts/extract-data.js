/**
 * extract-data.js
 * Lit ../../assets/data.js (code browser avec window.AICEO)
 * et produit ../data/seed.json utilisable côté serveur.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_JS = path.join(__dirname, "..", "..", "assets", "data.js");
const OUT = path.join(__dirname, "..", "data", "seed.json");

const src = fs.readFileSync(DATA_JS, "utf8");

// Sandbox minimal : on simule window.AICEO
const sandbox = { window: {}, console, Date };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

const A = sandbox.window.AICEO || {};

const out = {
  extracted_at: new Date().toISOString(),
  groups:    A.GROUPS    || [],
  projects:  A.PROJECTS  || [],
  tasks:     (A.TASKS    || []).filter(t => !t.done), // uniquement les actives
  tasks_all: A.TASKS     || [],
  events:    A.EVENTS    || [],
  decisions: A.DECISIONS || [],
  contacts:  A.CONTACTS  || [],
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
console.log(`✓ Extracted ${out.tasks.length} tâches actives, ${out.events.length} événements, ${out.projects.length} projets → ${OUT}`);
