/**
 * server.js — backend Express local pour aiCEO v0.5.
 * Usage : npm start → http://localhost:3001
 *
 * Port 3001 aligné sur DOSSIER-SPRINT-S2 §1 (contrat dogfood) — ADR S2.00.
 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { buildArbitrage, saveDecision, readHistory, loadSeed } = require("./src/arbitrage");
const { generateDraft, saveDraft, readDrafts, resolveContactsForTask, loadTeam } = require("./src/drafts");
const { latestArbitrageFor, saveEvening, readEvenings, buildEveningSummary } = require("./src/evening");
const { loadEmails, contextForTask } = require("./src/emails-context");

// --- Routes REST SQLite (Sprint S1) ---
const tasksRouter     = require("./src/routes/tasks");
const decisionsRouter = require("./src/routes/decisions");
const contactsRouter  = require("./src/routes/contacts");
const projectsRouter  = require("./src/routes/projects");
const groupsRouter    = require("./src/routes/groups");
const eventsRouter    = require("./src/routes/events");
const cockpitRouter   = require("./src/routes/cockpit");
const arbitrageRouter = require("./src/routes/arbitrage");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// --- Routes pages cockpit (S2) — URLs propres ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/evening", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "evening.html"));
});
app.get("/arbitrage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "arbitrage.html"));
});
app.get("/taches", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "taches.html"));
});

// --- API ---

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    demo: !process.env.ANTHROPIC_API_KEY || process.env.DEMO_MODE === "1",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"
  });
});

// --- API REST SQLite (Sprint S1) ---
//   /api/tasks, /api/decisions, /api/contacts, /api/projects, /api/groups, /api/events
app.use("/api/tasks",     tasksRouter);
app.use("/api/decisions", decisionsRouter);
app.use("/api/contacts",  contactsRouter);
app.use("/api/projects",  projectsRouter);
app.use("/api/groups",    groupsRouter);
app.use("/api/events",    eventsRouter);
app.use("/api/cockpit",   cockpitRouter);
app.use("/api/arbitrage", arbitrageRouter);

// --- Legacy seed (compat arbitrage UI tant que la migration n'est pas finalisee) ---
app.get("/api/seed", (req, res) => {
  try {
    const seed = loadSeed();
    res.json({ tasks: seed.tasks, projects: seed.projects, events: seed.events, contacts: seed.contacts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/decide", (req, res) => {
  try {
    const count = saveDecision(req.body || {});
    res.json({ ok: true, total_decisions: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/history", (req, res) => {
  res.json({ history: readHistory() });
});

// --- Reseed endpoint (utile si data.js a change) ---
app.post("/api/reseed", (req, res) => {
  try {
    const { execSync } = require("child_process");
    const out = execSync("node scripts/extract-data.js", { cwd: __dirname, encoding: "utf8" });
    res.json({ ok: true, message: out.trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Delegation : genere un brouillon de mail ---
app.post("/api/delegate", async (req, res) => {
  try {
    const { task_id, reason } = req.body || {};
    if (!task_id) return res.status(400).json({ error: "task_id requis" });
    const seed = loadSeed();
    const task = (seed.tasks_all || seed.tasks).find(t => t.id === task_id);
    if (!task) return res.status(404).json({ error: `Tache ${task_id} introuvable` });
    const project = (seed.projects || []).find(p => p.id === task.project) || null;
    const contacts = resolveContactsForTask(task, seed.contacts || []);

    const { emails, available: emailsAvailable } = loadEmails();
    const since = new Date(Date.now() - 7 * 86400e3).toISOString();
    const emailContext = emailsAvailable
      ? contextForTask(task, emails, seed.contacts || [], since)
      : null;

    const draft = await generateDraft({ task, project, contacts, reason, emailContext });
    const team = loadTeam();
    res.json({
      task_id,
      project: project ? { id: project.id, name: project.name } : null,
      candidates: contacts.map(c => ({ id: c.id, name: c.name, email: c.email, role: c.role })),
      team_suggestions: team.map(m => ({ name: m.name, email: m.email, role: m.role, delegable_for: m.delegable_for })),
      draft
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/delegate/save", (req, res) => {
  try {
    const record = saveDraft(req.body || {});
    res.json({ ok: true, saved: record });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/delegate/history", (req, res) => {
  res.json({ drafts: readDrafts() });
});

// --- Boucle du soir ---
app.get("/api/evening/context", (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const arb = latestArbitrageFor(date);
    if (!arb) return res.json({ date, arbitrage: null, message: "Aucun arbitrage ce jour - lancez la vue matinale d'abord." });
    const seed = loadSeed();
    const byId = Object.fromEntries((seed.tasks_all || seed.tasks).map(t => [t.id, t]));
    const hydrate = (arr) => (arr || []).map(x => ({ ...x, task: byId[x.task_id] || null }));
    res.json({
      date,
      arbitrage: {
        summary: arb.summary,
        faire: hydrate(arb.faire),
        deleguer: hydrate(arb.deleguer),
        reporter: hydrate(arb.reporter)
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/evening", (req, res) => {
  try {
    const body = req.body || {};
    const arb = latestArbitrageFor(body.date);
    const summary = buildEveningSummary({
      outcomes: body.outcomes || [],
      arbitrage: arb,
      mood: body.mood,
      energy: body.energy
    });
    const record = saveEvening({ ...body, summary });
    res.json({ ok: true, summary, saved_at: record.saved_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/evening/history", (req, res) => {
  res.json({ evenings: readEvenings() });
});

// --- Emails ingeres (optionnel - si normalize-emails.js a tourne) ---
app.get("/api/emails/summary", (req, res) => {
  const p = path.join(__dirname, "data", "emails-summary.json");
  if (!fs.existsSync(p)) return res.json({ available: false, hint: "Lancez scripts/fetch-outlook.ps1 puis node scripts/normalize-emails.js" });
  try {
    res.json({ available: true, ...JSON.parse(fs.readFileSync(p, "utf8")) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
  const demo = !process.env.ANTHROPIC_API_KEY || process.env.DEMO_MODE === "1";
  console.log(`\n--------------------------------------`);
  console.log(`  aiCEO v0.5 - copilote executif`);
  console.log(`  -> http://localhost:${PORT}          (matin - arbitrage)`);
  console.log(`  -> http://localhost:${PORT}/evening  (soir - debrief)`);
  console.log(`  -> mode : ${demo ? "DEMO (pas de cle API)" : "REEL - " + (process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6")}`);
  console.log(`  -> API REST SQLite : /api/{tasks,decisions,contacts,projects,groups,events}`);
  console.log(`--------------------------------------\n`);
});
