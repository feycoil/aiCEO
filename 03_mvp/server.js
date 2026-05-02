/**


 * server.js â€” backend Express local pour aiCEO v0.5.


 * Usage : npm start â†’ http://localhost:3001


 *


 * Port 3001 alignÃ© sur DOSSIER-SPRINT-S2 Â§1 (contrat dogfood) â€” ADR S2.00.


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


const eveningRouter   = require("./src/routes/evening");


const weeklyReviewsRouter = require("./src/routes/weekly-reviews");


const bigRocksRouter      = require("./src/routes/big-rocks");


const systemRouter        = require("./src/routes/system");


const assistantRouter     = require("./src/routes/assistant");
const preferencesRouter   = require("./src/routes/preferences");
const knowledgeRouter     = require("./src/routes/knowledge");
// S6.36 : axes orthogonaux Domain + Company sur projets
const domainsRouter       = require("./src/routes/domains");
const companiesRouter     = require("./src/routes/companies");
// S6.41 : connecteurs sources de donnees (Outlook live + Gmail/GCal/Teams/Slack backlog V1.x)
const connectorsRouter    = require("./src/routes/connectors");



const app = express();


const PORT = Number(process.env.PORT) || 3001;






// === Sécurité headers (S6.5 Lot 8) ===
app.use((req, res, next) => {
  // Local mono-user, headers minimum sain
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  // CSP : permissif pour MVP local, restrictif via inline scripts/styles autorises
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +  // unsafe-inline car Claude Design a des scripts inline
    "style-src 'self' 'unsafe-inline'; " +    // styles inline aussi
    "img-src 'self' data:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  next();
});

app.use(express.json({ limit: "2mb" }));


// Convergence v0.6 (S6.2)  redirect / vers hub avant le static
app.get("/", (req, res) => res.redirect("/v07/pages/index.html")); // S6.15 bascule v07 = defaut
// S6.22 Lot 15 : Cache-Control no-store sur les fichiers v07 pour forcer
// le navigateur a re-fetcher a chaque load (etait coince sur 304 Not Modified).
app.use("/v07", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.use(express.static(path.join(__dirname, "public"), { etag: false, lastModified: false }));





// --- Routes pages cockpit (S2) â€” URLs propres ---


// Alias routes principales â†’ v0.6
app.get("/cockpit", (req, res) => res.redirect("/v07/pages/index.html"));
app.get("/hub",     (req, res) => res.redirect("/v07/pages/hub.html"));
app.get("/legacy",  (req, res) => {
  // ConservÃ© pour accÃ¨s debug aux pages v0.5
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


app.get("/agenda", (req, res) => {


  res.sendFile(path.join(__dirname, "public", "agenda.html"));


});


app.get("/revues", (req, res) => {


  res.sendFile(path.join(__dirname, "public", "revues", "index.html"));


});


app.get("/assistant", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "assistant.html"));
});
app.get("/groupes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "groupes.html"));
});
app.get("/projets", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "projets.html"));
});
app.get("/projet", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "projet.html"));
});
app.get("/contacts", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contacts.html"));
});
app.get("/decisions", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "decisions.html"));
});



// --- API ---





app.get("/api/health", (req, res) => {
  // S5.03 â€” Health enrichi (uptime + memory + db size + counts + last sync Outlook)
  const result = {
    ok: true,
    demo: !process.env.ANTHROPIC_API_KEY || process.env.DEMO_MODE === "1",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    version: "v0.5",
    uptime_s: Math.round(process.uptime()),
    memory: {
      rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heap_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  };
  // DB size
  try {
    const dbPath = process.env.AICEO_DB_OVERRIDE || path.join(__dirname, "data", "aiceo.db");
    if (fs.existsSync(dbPath)) {
      result.db = { path: path.basename(dbPath), size_kb: Math.round(fs.statSync(dbPath).size / 1024) };
    }
  } catch (e) { /* swallow */ }
  // Counts depuis SQLite
  try {
    const { getDb } = require("./src/db");
    const db = getDb();
    result.counts = {
      tasks: db.prepare("SELECT COUNT(*) AS n FROM tasks").get().n,
      decisions: db.prepare("SELECT COUNT(*) AS n FROM decisions").get().n,
      projects: db.prepare("SELECT COUNT(*) AS n FROM projects").get().n,
      contacts: db.prepare("SELECT COUNT(*) AS n FROM contacts").get().n,
      conversations: db.prepare("SELECT COUNT(*) AS n FROM assistant_conversations").get().n
    };
  } catch (e) { result.counts_error = String(e.message || e); }
  // Last sync Outlook
  try {
    const sumPath = path.join(__dirname, "data", "emails-summary.json");
    if (fs.existsSync(sumPath)) {
      const ageMin = Math.round((Date.now() - fs.statSync(sumPath).mtimeMs) / 60000);
      result.outlook = { last_sync_min_ago: ageMin, level: ageMin < 240 ? "ok" : ageMin < 1440 ? "warn" : "critical" };
    } else {
      result.outlook = { level: "absent" };
    }
  } catch (e) { /* swallow */ }
  res.json(result);
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


app.use("/api/evening",   eveningRouter);


app.use("/api/weekly-reviews", weeklyReviewsRouter);


app.use("/api/big-rocks",      bigRocksRouter);


app.use("/api/system",         systemRouter);
app.use("/api/preferences",    preferencesRouter);
app.use("/api/knowledge",      knowledgeRouter);
// S6.36 : axes Domain + Company
app.use("/api/domains",        domainsRouter);
app.use("/api/companies",      companiesRouter);
// S6.41 : connecteurs (Outlook live + 4 placeholders)
app.use("/api/connectors",     connectorsRouter);


app.use("/api/assistant",      assistantRouter);

// S6.22 Lot 8 : double-mount /api/ pour exposer les 5 routes LLM frontend
// (llm-status, coaching-question, decision-recommend, auto-draft-review, effects-propagation)
// aux URLs courtes attendues par le frontend (Cockpit banner + Coaching + Decisions + Revues).
// Bug racine : sans ce mount, /api/llm-status renvoyait 404 -> safeFetch retournait null
// -> banner Cockpit forcait "Mode degrade" meme avec ANTHROPIC_API_KEY presente.
app.use("/api",                assistantRouter);



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


  console.log(`  -> http://localhost:${PORT}`);
  console.log(`  -> mode : ${demo ? "DEMO (pas de cle API)" : "REEL - " + (process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6")}`);
  console.log(`  -> API REST SQLite : /api/{tasks,decisions,contacts,projects,groups,events}`);
  console.log(`-----------------------------------------`);
  console.log(`  -> http://localhost:${PORT}/legacy   (debug pages v0.5)`);
});
