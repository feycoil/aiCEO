/**
 * arbitrage.js — orchestre l'appel LLM + joint les tâches complètes au résultat.
 * Branche aussi le contexte emails (si disponible) dans le prompt.
 */
const fs = require("fs");
const path = require("path");
const { callClaude } = require("./llm");
const { loadEmails, buildEmailBlock, hydrateWithEmails } = require("./emails-context");

const SEED_PATH = path.join(__dirname, "..", "data", "seed.json");
const DECISIONS_PATH = path.join(__dirname, "..", "data", "decisions.json");

function loadSeed() {
  const raw = fs.readFileSync(SEED_PATH, "utf8");
  return JSON.parse(raw);
}

function todayIso() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

async function buildArbitrage({ date } = {}) {
  const seed = loadSeed();
  const today = date || todayIso();
  const contacts = seed.contacts || [];

  // Toutes les tâches ouvertes — le LLM priorise lui-même selon dates et enjeux
  const tasksInScope = seed.tasks.filter(t => !t.done);

  // Charge le contexte email si disponible (import Outlook déjà fait)
  const emailCtx = loadEmails();
  const emailBlock = emailCtx.available
    ? buildEmailBlock({
        tasks: tasksInScope,
        contacts,
        emails: emailCtx.emails,
        summary: emailCtx.summary
      })
    : "";

  const result = await callClaude({
    tasks: tasksInScope,
    projects: seed.projects,
    today,
    events: seed.events || [],
    emailBlock
  });

  // Hydrater les task_id avec la tâche complète + contexte email par item
  const byId = Object.fromEntries(seed.tasks.map(t => [t.id, t]));
  const hydrate = (arr) => (arr || []).map(x => ({ ...x, task: byId[x.task_id] || null }));

  let enriched = {
    date: today,
    summary: result.arbitrage_summary,
    alert: result.alert,
    alert_message: result.alert_message,
    faire: hydrate(result.faire),
    deleguer: hydrate(result.deleguer),
    reporter: hydrate(result.reporter),
    ignored: (result.ignored_task_ids || []).map(id => byId[id]).filter(Boolean),
    meta: {
      ...result._meta,
      emails: emailCtx.available
        ? { available: true, kept: emailCtx.summary?.totals?.kept || 0, unread: emailCtx.summary?.totals?.unread || 0 }
        : { available: false }
    },
    scope: { total_tasks: tasksInScope.length }
  };

  if (emailCtx.available) {
    enriched = hydrateWithEmails(enriched, {
      emails: emailCtx.emails,
      contacts,
      tasksAll: seed.tasks
    });
  }

  return enriched;
}

function saveDecision(decision) {
  let all = [];
  if (fs.existsSync(DECISIONS_PATH)) {
    try { all = JSON.parse(fs.readFileSync(DECISIONS_PATH, "utf8")); }
    catch (e) { all = []; }
  }
  all.push({ ...decision, saved_at: new Date().toISOString() });
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(all, null, 2), "utf8");
  return all.length;
}

function readHistory() {
  if (!fs.existsSync(DECISIONS_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DECISIONS_PATH, "utf8")); }
  catch (e) { return []; }
}

module.exports = { buildArbitrage, saveDecision, readHistory, loadSeed };
