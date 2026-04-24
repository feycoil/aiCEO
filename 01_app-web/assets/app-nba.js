/* ============================================================
   aiCEO — app-nba.js v3.1 (23 avril 2026)
   Moteur d'incitation naturelle : NBA + ambient pulses + rituals
   + shortcut reveal. 100% localStorage, 100% offline.

   Dépend de window.AICEO (app.js v3). Additif : si non chargé,
   l'app v3 marche inchangée. Aucune API existante modifiée.
   ============================================================ */
(function(){
  "use strict";
  if (!window.AICEO){ console.warn("[aiCEO] app-nba.js chargé avant app.js"); return; }
  const A = window.AICEO;

  // ========================================================
  // 0. Energy & time helpers
  // ========================================================
  A.getEnergy = function(){
    const override = A.getStorePath("journey.energyOverride");
    if (override && override.until && new Date(override.until) > new Date()){
      return override.level;
    }
    const h = new Date().getHours();
    if (h >= 7 && h < 11)  return "deep";
    if (h >= 11 && h < 17) return "medium";
    return "light";
  };
  A.setEnergy = function(level){
    const until = new Date(Date.now() + 2*3600*1000).toISOString();
    A.setStorePath("journey.energyOverride", { level, until });
  };

  function nowHHMM(){ const d=new Date(); return d.getHours()*60 + d.getMinutes(); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function isoWeek(d){
    d = d || new Date();
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = (t.getDay() + 6) % 7;
    t.setDate(t.getDate() - dayNum + 3);
    const firstThu = new Date(t.getFullYear(), 0, 4);
    const wk = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getDay() + 6) % 7)) / 7);
    return t.getFullYear() + "-W" + String(wk).padStart(2,"0");
  }

  // ========================================================
  // 1. NBA — Next Best Action
  // ========================================================
  A.nba = function(ctx){
    ctx = ctx || {};
    const now    = ctx.now    || new Date();
    const page   = ctx.page   || (document.body && document.body.dataset.page) || "";
    const energy = ctx.energy || A.getEnergy();
    const minutes = now.getHours()*60 + now.getMinutes();

    const tasks      = (A.TASKS_ALL ? A.TASKS_ALL() : []) || [];
    const openTasks  = tasks.filter(t => !t.done);
    const proposals  = (A.PROPOSALS_ALL ? A.PROPOSALS_ALL() : []) || [];
    const decisions  = (A.DECISIONS || []);
    const events     = (A.EVENTS || []);
    const history    = A.getStorePath("journey.nbaHistory", []) || [];
    const ignoredRecent = new Set(
      history
        .filter(h => h.accepted === false && (Date.now() - new Date(h.ts).getTime()) < 2*3600*1000)
        .map(h => h.itemId)
    );

    const today = todayISO();
    const candidates = [];

    // ---- Tâches ----
    openTasks.forEach(t => {
      let score = 0;
      const dueDays = t.due ? A.daysUntil(t.due) : null;

      if (t.type === "drop") return;
      if (ignoredRecent.has("task:" + t.id)) score -= 25;

      if (t.starred && t.due === today) score += 100;           // Focus Now du jour
      if (t.priority === "critical" && t.due === today) score += 75;
      if (dueDays !== null && dueDays < 0)             score += 40;
      if (t.energy === energy)                         score += 15;

      const ctxHour = minutes < 11*60 ? "deep-work" : (minutes >= 16*60 ? "email" : null);
      if (ctxHour && t.context === ctxHour)            score += 10;

      // Base : une tâche critique reste candidate même sans date
      if (t.priority === "critical")                   score += 20;
      if (t.priority === "high")                       score += 10;

      if (score > 0){
        candidates.push({
          kind: "task",
          id: "task:" + t.id,
          title: t.title,
          reason: reasonForTask(t, dueDays, energy, ctxHour),
          estimatedMin: t.estimatedMin || null,
          url: "taches.html#" + t.id,
          action: "openTaskDrawer:" + t.id,
          score
        });
      }
    });

    // ---- Propositions IA ----
    proposals.filter(p => (p.status || "pending") === "pending").forEach(p => {
      let score = 0;
      if (ignoredRecent.has("prop:" + p.id)) score -= 25;
      if (p.urgency === "now")   score += 85;
      if (p.urgency === "today") score += 60;
      score += 15; // base — toute propo vaut la peine
      candidates.push({
        kind: "proposal",
        id: "prop:" + p.id,
        title: p.title,
        reason: p.rationale || "Proposition du copilote prête à arbitrer.",
        estimatedMin: p.estimatedMin || 3,
        url: "assistant.html#" + p.id,
        action: "openAssistant:" + p.id,
        score
      });
    });

    // ---- Events imminents avec prep_needed ----
    events.forEach(e => {
      if (!e.prep_needed || !e.date) return;
      const evTime = new Date(e.date + (e.time ? "T" + e.time : "T09:00"));
      const diffMin = (evTime - now) / 60000;
      if (diffMin < 0 || diffMin > 240) return;
      const hasLinkedTask = openTasks.some(t => t.linkedEvent === e.id);
      if (hasLinkedTask) return;
      candidates.push({
        kind: "event",
        id: "event:" + e.id,
        title: "Préparer : " + e.title,
        reason: "RDV dans " + Math.round(diffMin) + " min sans prépa.",
        estimatedMin: 15,
        url: "agenda.html#" + e.id,
        action: "openEventDrawer:" + e.id,
        score: 90 - Math.floor(diffMin / 30)
      });
    });

    // ---- Décisions dormantes ----
    if (page !== "decisions"){
      decisions.filter(d => d.status === "to-execute").forEach(d => {
        if (!d.createdAt) return;
        const days = Math.floor((Date.now() - new Date(d.createdAt).getTime()) / 86400000);
        if (days < 7) return;
        candidates.push({
          kind: "decision",
          id: "dec:" + d.id,
          title: d.title,
          reason: "Décision en attente depuis " + days + " jours.",
          estimatedMin: d.estimatedMin || 10,
          url: "decisions.html#" + d.id,
          action: "openDecisionDrawer:" + d.id,
          score: 50
        });
      });
    }

    if (!candidates.length) return null;
    candidates.sort((a,b) => b.score - a.score);
    return candidates[0];
  };

  function reasonForTask(t, dueDays, energy, ctxHour){
    if (t.starred && t.due === todayISO()) return "Focus Now du jour.";
    if (t.priority === "critical" && t.due === todayISO()) return "Critique, échéance aujourd'hui.";
    if (dueDays !== null && dueDays < 0) return "En retard de " + Math.abs(dueDays) + " j.";
    if (t.energy === energy && ctxHour && t.context === ctxHour) return "Calibré pour votre énergie.";
    if (t.priority === "critical") return "Tâche critique ouverte.";
    return "Prochaine action cohérente.";
  }

  // ========================================================
  // 2. renderNba — HTML inline
  // ========================================================
  A.renderNba = function(ctx){
    const item = A.nba(ctx);
    if (!item) return "";
    const icon = { task:"✓", proposal:"✨", event:"📅", decision:"⚖️" }[item.kind] || "→";
    const min  = item.estimatedMin ? `<span class="small muted"> · ${A.formatMin ? A.formatMin(item.estimatedMin) : item.estimatedMin+" min"}</span>` : "";
    return `
      <div class="nba-card" data-nba-id="${A.escHtml(item.id)}">
        <div class="nba-card-icon">${icon}</div>
        <div class="nba-card-body">
          <div class="nba-card-eyebrow">Enchaîner avec${min}</div>
          <div class="nba-card-title">${A.escHtml(item.title)}</div>
          <div class="nba-card-reason">${A.escHtml(item.reason)}</div>
        </div>
        <button class="nba-card-cta" onclick="AICEO._acceptNba('${A.escHtml(item.id)}','${A.escHtml(item.action||'')}')">Commencer</button>
      </div>
    `;
  };

  A._acceptNba = function(id, action){
    const history = A.getStorePath("journey.nbaHistory", []) || [];
    history.push({ ts: new Date().toISOString(), itemId: id, accepted: true });
    A.setStorePath("journey.nbaHistory", history.slice(-100));

    if (!action) return;
    const [fn, arg] = action.split(":");
    if (typeof A[fn] === "function") {
      try { A[fn](arg); } catch(e){ console.warn("[aiCEO] nba action failed", e); }
    }
  };

  A._ignoreNba = function(id){
    const history = A.getStorePath("journey.nbaHistory", []) || [];
    history.push({ ts: new Date().toISOString(), itemId: id, accepted: false });
    A.setStorePath("journey.nbaHistory", history.slice(-100));
  };

  // ========================================================
  // 3. Ambient — sidebar pulses
  // ========================================================
  A.ambient = function(){
    const tasks     = (A.TASKS_ALL ? A.TASKS_ALL() : []) || [];
    const open      = tasks.filter(t => !t.done);
    const overdue   = open.filter(t => t.due && A.daysUntil(t.due) < 0);
    const today     = todayISO();
    const critToday = open.filter(t => t.priority === "critical" && t.due === today);
    const propsAll  = (A.PROPOSALS_ALL ? A.PROPOSALS_ALL() : []) || [];
    const propsPending = propsAll.filter(p => (p.status || "pending") === "pending");
    const propsUrgent  = propsPending.filter(p => p.urgency === "now");
    const decisions = (A.DECISIONS || []).filter(d => d.status === "to-execute");
    const dormantDecs = decisions.filter(d => {
      if (!d.createdAt) return false;
      return Math.floor((Date.now() - new Date(d.createdAt).getTime()) / 86400000) >= 7;
    });
    const events = (A.EVENTS || []);
    const now = new Date();
    const soonPrep = events.filter(e => {
      if (!e.prep_needed || !e.date) return false;
      const t = new Date(e.date + (e.time ? "T" + e.time : "T09:00"));
      const diffH = (t - now) / 3600000;
      return diffH >= 0 && diffH <= 4;
    });

    // Focus Now non commencé après 8h
    const focusItem = open.find(t => t.starred && t.due === today);
    const afterEight = now.getHours() >= 8;

    // Revue dominicale
    const isSunday = now.getDay() === 0;
    const afterEvening = now.getHours() >= 18;
    const currentWeek = isoWeek(now);
    const reviewSigned = A.getStorePath("journey.reviewsSigned." + currentWeek, false);

    const hints = {
      dashboard: (focusItem && afterEight) ? `Focus du jour à lancer` : null,
      tasks:     overdue.length > 0
                   ? `${overdue.length} tâche${overdue.length>1?"s":""} en retard`
                   : (critToday.length >= 3 ? `${critToday.length} critiques aujourd'hui` : null),
      agenda:    soonPrep.length > 0 ? `RDV à préparer sous 4h` : null,
      decisions: dormantDecs.length > 0 ? `Décision en attente > 7 j` : null,
      reviews:   (isSunday && afterEvening && !reviewSigned) ? `Revue hebdo à signer` : null,
      assistant: propsUrgent.length > 0
                   ? `Proposition urgente`
                   : (propsPending.length >= 5 ? `${propsPending.length} propositions en attente` : null)
    };

    applyHints(hints);
  };

  function applyHints(hints){
    document.querySelectorAll(".sidebar .nav-item").forEach(el => {
      const page = el.dataset.page;
      const existing = el.querySelector(".hint-dot");
      if (existing) existing.remove();
      const reason = hints[page];
      if (!reason) return;
      const dot = document.createElement("span");
      dot.className = "hint-dot";
      dot.setAttribute("aria-hidden", "true");
      const label = el.querySelector(".nav-label");
      if (label){
        label.appendChild(dot);
        const base = (label.textContent || "").replace(/\s*•\s*$/, "").trim();
        el.setAttribute("aria-label", `${base} — ${reason}`);
      }
    });
  }

  // ========================================================
  // 4. Ritual triggers — ancres temporelles
  // ========================================================
  A.ritualTrigger = function(name){
    const today = todayISO();
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const state = A.getStorePath("journey.rituals", {}) || {};

    if (name === "matin"){
      if (!(h >= 7 && h < 12)) return false;
      const page = document.body && document.body.dataset.page;
      if (page !== "dashboard") return false;
      if (state.matin && state.matin.lastDate === today) return false;

      setTimeout(() => {
        const focusEl = document.querySelector(".focus-now, [data-focus-now]");
        if (focusEl) focusEl.classList.add("focus-now--ritual-entry");
        document.querySelectorAll("[data-ritual-dim]").forEach(el => {
          el.classList.add("dim", "dim--in");
          setTimeout(() => el.classList.remove("dim","dim--in"), 2200);
        });
      }, 120);

      A.setStorePath("journey.rituals.matin", { lastDate: today, triggered: true });
      return true;
    }

    if (name === "cloture"){
      if (h < 17) return false;
      if (state.cloture && state.cloture.lastDate === today) return false;
      if (typeof A.openEndOfDay !== "function") return false;
      setTimeout(() => { try { A.openEndOfDay(); } catch(e){} }, 400);
      A.setStorePath("journey.rituals.cloture", { lastDate: today, triggered: true });
      return true;
    }

    if (name === "revue"){
      if (now.getDay() !== 0) return false;
      if (h < 19 || h >= 22) return false;
      const week = isoWeek(now);
      if (state.revue && state.revue.lastWeek === week) return false;
      showReviewCoach(week);
      A.setStorePath("journey.rituals.revue", { lastWeek: week, triggered: true });
      return true;
    }
    return false;
  };

  A.ritualCheckAll = function(){
    try {
      A.ritualTrigger("matin");
      A.ritualTrigger("cloture");
      A.ritualTrigger("revue");
    } catch(e){ console.warn("[aiCEO] ritual", e); }
  };

  function showReviewCoach(week){
    const strip = document.querySelector(".coach-strip");
    if (!strip) return;
    strip.innerHTML = `
      <span class="coach-dot">AI</span>
      <span><em>Copilote ·</em> La revue ${week} est prête — 20 min pour cadrer la semaine.
        <a href="revues/index.html" style="color:var(--rose);text-decoration:underline;margin-left:6px">Ouvrir</a>
      </span>
    `;
  }

  // ========================================================
  // 5. Shortcut reveal — pédagogie progressive
  // ========================================================
  const REVEAL_RULES = {
    "cmd-k": { pages: ["dashboard","taches","assistant","decisions","projects"], visits: 3,
               msg: `<kbd>⌘K</kbd> ouvre la recherche rapide partout.` },
    "n":     { pages: ["dashboard","taches"], visits: 3,
               msg: `Appuyez sur <kbd>N</kbd> pour créer une tâche.` },
    "esc":   { pages: ["any"], visits: 999,
               msg: `<kbd>Esc</kbd> ferme le tiroir.` }
  };

  A.revealShortcut = function(key){
    const rule = REVEAL_RULES[key];
    if (!rule) return false;
    const used = A.getStorePath("journey.shortcutsUsed." + key, false);
    if (used) return false;
    const shown = A.getStorePath("journey.hintsShown." + key, 0) || 0;
    if (shown) return false;
    showSilentToast(rule.msg);
    A.setStorePath("journey.hintsShown." + key, (shown||0) + 1);
    return true;
  };

  A.maybeRevealShortcuts = function(page){
    const visits = A.getStorePath("journey.pageVisits." + page, 0) || 0;
    A.setStorePath("journey.pageVisits." + page, visits + 1);
    let shown = 0;
    for (const key of Object.keys(REVEAL_RULES)){
      if (shown) break;
      const rule = REVEAL_RULES[key];
      if (!rule.pages.includes(page) && !rule.pages.includes("any")) continue;
      if (visits + 1 < rule.visits) continue;
      if (A.revealShortcut(key)) shown++;
    }
  };

  A.markShortcutUsed = function(key){
    A.setStorePath("journey.shortcutsUsed." + key, true);
  };

  function showSilentToast(html){
    const wrap = document.getElementById("toast-wrap");
    if (!wrap) return;
    const t = document.createElement("div");
    t.className = "toast silent";
    t.innerHTML = html;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(10px)"; t.style.transition = "all .3s"; }, 3600);
    setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 4000);
  }

  // Hook : détecte l'usage effectif des raccourcis
  document.addEventListener("keydown", function(e){
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") A.markShortcutUsed("cmd-k");
    if (e.key === "/" && !/input|textarea/i.test((e.target.tagName||""))) A.markShortcutUsed("cmd-k");
    if ((e.key === "n" || e.key === "N") && !/input|textarea/i.test((e.target.tagName||""))) A.markShortcutUsed("n");
    if (e.key === "Escape") A.markShortcutUsed("esc");
  }, true);

  // ========================================================
  // 6. Init — hook de mount
  // ========================================================
  let ambientTimer = null;
  A.initAmbient = function(){
    A.setStorePath("journey.lastSeen", new Date().toISOString());
    try { A.ambient(); } catch(e){ console.warn("[aiCEO] ambient", e); }
    try { A.ritualCheckAll(); } catch(e){ console.warn("[aiCEO] rituals", e); }
    try {
      const page = document.body && document.body.dataset.page;
      if (page) A.maybeRevealShortcuts(page);
    } catch(e){ console.warn("[aiCEO] reveal", e); }

    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = setInterval(() => {
      if (document.hidden) return;
      try { A.ambient(); } catch(e){}
    }, 90 * 1000);

    // Rescan on store changes (task/decision/proposal CRUD)
    if (typeof A.onTaskChange === "function"){
      A.onTaskChange(() => { try { A.ambient(); } catch(e){} });
    }
  };

  // Auto-init dès que le DOM est prêt — se re-déclenche sur chaque mount
  // via un observer léger.
  function autoBoot(){
    if (document.querySelector(".sidebar")) {
      A.initAmbient();
      return;
    }
    const obs = new MutationObserver(() => {
      if (document.querySelector(".sidebar")){
        obs.disconnect();
        A.initAmbient();
      }
    });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", autoBoot);
  } else {
    autoBoot();
  }

  // ========================================================
  // 7. Service Worker — offline-first
  // ========================================================
  A.registerServiceWorker = function(){
    if (!("serviceWorker" in navigator)) return Promise.resolve();
    if (location.protocol !== "http:" && location.protocol !== "https:") return Promise.resolve();
    const base = (document.body && document.body.dataset.rel) || "";
    const swPath = base + "assets/sw.js";
    return navigator.serviceWorker.register(swPath, { scope: base || "./" })
      .then(reg => { /* ok */ })
      .catch(err => { console.warn("[aiCEO] SW register failed", err); });
  };
  A.registerServiceWorker();

  // ========================================================
  // 8. Energy widget — helper pour cockpit (optionnel)
  // ========================================================
  A.renderEnergyToggle = function(){
    const cur = A.getEnergy();
    const mk = (k, lbl, ico) => `<button class="btn sm${cur===k?" primary":""}" onclick="AICEO.setEnergy('${k}');location.reload()" aria-pressed="${cur===k}">${ico} ${lbl}</button>`;
    return `<div class="hstack" role="group" aria-label="Énergie courante">
      ${mk("deep","Deep","🎯")}${mk("medium","Medium","💭")}${mk("light","Light","☁️")}
    </div>`;
  };

})();
