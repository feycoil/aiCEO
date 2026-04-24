/* aiCEO — app.js v4 (23 avril 2026)
   Shell unifié + CRUD tâches/décisions + Quick-add + Group switcher + AI proposals + Export
   v4 REBUILD : seed reconstruit depuis 1 025 mails Outlook + 56 événements 30j.
*/
(function(){
  const A = (window.AICEO = window.AICEO || {});

  // ========= STORE (localStorage enrichi) =========
  // v4 REBUILD : bumper la clé force un reset propre de tout le store utilisateur
  // (overrides tâches/décisions, préférences, streak, journal matin, etc.).
  // Les anciennes clés (v1) sont purgées pour libérer le quota localStorage.
  const STORE_KEY = "aiCEO.store.v2";
  const LEGACY_KEYS = ["aiCEO.store.v1"];
  try { LEGACY_KEYS.forEach(k => { if (localStorage.getItem(k) != null) localStorage.removeItem(k); }); } catch(e){}
  A._loadStore = function(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch(e){ return {}; }
  };
  A._saveStore = function(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); };
  A.store = A._loadStore();
  A.getStorePath = function(path, def){
    const parts = path.split(".");
    let cur = A.store;
    for (const p of parts){ if (cur == null) return def; cur = cur[p]; }
    return cur == null ? def : cur;
  };
  A.setStorePath = function(path, val){
    const parts = path.split(".");
    let cur = A.store;
    for (let i=0;i<parts.length-1;i++){
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length-1]] = val;
    A._saveStore(A.store);
  };

  // ========= TASKS CRUD (merge base data + overrides) =========
  A.TASKS_ALL = function(){
    const base = (A.TASKS || []).slice();
    const added = A.getStorePath("tasks.added", []);
    const deleted = A.getStorePath("tasks.deleted", []);
    const edited = A.getStorePath("tasks.edited", {});
    const stateMap = A.getStorePath("tasks.state", {}); // {id: {done, starred}}
    let all = base.concat(added);
    all = all.filter(t => !deleted.includes(t.id));
    all = all.map(t => {
      const patch = edited[t.id];
      const state = stateMap[t.id];
      return Object.assign({}, t, patch || {}, state || {});
    });
    return all;
  };
  A.createTask = function(data){
    const id = "tn" + Date.now().toString(36);
    const task = Object.assign({
      id, title: "", project: null, type: "do", priority: "medium",
      due: null, starred: false, done: false,
      estimatedMin: 30, energy: "medium", aiCapable: false, context: "deep-work"
    }, data);
    const added = A.getStorePath("tasks.added", []);
    added.push(task);
    A.setStorePath("tasks.added", added);
    return task;
  };
  A.updateTask = function(id, patch){
    const added = A.getStorePath("tasks.added", []);
    const idxAdded = added.findIndex(t => t.id === id);
    if (idxAdded !== -1){
      added[idxAdded] = Object.assign({}, added[idxAdded], patch);
      A.setStorePath("tasks.added", added);
      return;
    }
    const edited = A.getStorePath("tasks.edited", {});
    edited[id] = Object.assign({}, edited[id] || {}, patch);
    A.setStorePath("tasks.edited", edited);
  };
  A.deleteTask = function(id){
    const added = A.getStorePath("tasks.added", []);
    const idxAdded = added.findIndex(t => t.id === id);
    if (idxAdded !== -1){
      added.splice(idxAdded, 1);
      A.setStorePath("tasks.added", added);
      return;
    }
    const deleted = A.getStorePath("tasks.deleted", []);
    if (!deleted.includes(id)) deleted.push(id);
    A.setStorePath("tasks.deleted", deleted);
  };
  A.isTaskDone = function(id){
    const s = A.getStorePath("tasks.state." + id, null);
    if (s && typeof s.done === "boolean") return s.done;
    const t = (A.TASKS || []).find(tt => tt.id === id);
    return t ? !!t.done : false;
  };
  A.isTaskStarred = function(id){
    const s = A.getStorePath("tasks.state." + id, null);
    if (s && typeof s.starred === "boolean") return s.starred;
    const t = (A.TASKS || []).find(tt => tt.id === id);
    return t ? !!t.starred : false;
  };
  A.toggleTaskDone = function(id, evt){
    const next = !A.isTaskDone(id);
    const state = A.getStorePath("tasks.state", {});
    state[id] = Object.assign({}, state[id] || {}, { done: next });
    A.setStorePath("tasks.state", state);
    const row = document.querySelector('[data-task-id="' + id + '"]');
    if (row){
      row.classList.toggle("done", next);
      const cb = row.querySelector('.task-checkbox');
      if (cb) cb.setAttribute("aria-checked", String(next));
    }
    A.showToast(next ? "Tâche soldée ✓" : "Tâche rouverte", next ? "success" : null);
    const onChangeFns = A._onTaskChange || [];
    onChangeFns.forEach(fn => { try { fn(); } catch(e){} });
  };
  A.toggleTaskStar = function(id, evt){
    const next = !A.isTaskStarred(id);
    const state = A.getStorePath("tasks.state", {});
    state[id] = Object.assign({}, state[id] || {}, { starred: next });
    A.setStorePath("tasks.state", state);
    const star = document.querySelector('[data-task-star="' + id + '"]');
    if (star) star.setAttribute("aria-pressed", String(next));
  };
  A._onTaskChange = [];
  A.onTaskChange = function(fn){ A._onTaskChange.push(fn); };

  // ========= DECISIONS CRUD =========
  A.DECISIONS_ALL = function(){
    const base = (A.DECISIONS || []).slice();
    const added = A.getStorePath("decisions.added", []);
    const deleted = A.getStorePath("decisions.deleted", []);
    const edited = A.getStorePath("decisions.edited", {});
    let all = base.concat(added);
    all = all.filter(d => !deleted.includes(d.id));
    all = all.map(d => Object.assign({}, d, edited[d.id] || {}));
    return all;
  };
  A.createDecision = function(data){
    const id = "dn" + Date.now().toString(36);
    const decision = Object.assign({
      id, title:"", date: new Date().toISOString().slice(0,10), project:null,
      parties:[], outcome:"", rationale:"", status:"taken", owner:"Feyçoil", deadline:null, tags:[]
    }, data);
    const added = A.getStorePath("decisions.added", []);
    added.push(decision);
    A.setStorePath("decisions.added", added);
    return decision;
  };
  A.updateDecision = function(id, patch){
    const added = A.getStorePath("decisions.added", []);
    const idxAdded = added.findIndex(d => d.id === id);
    if (idxAdded !== -1){
      added[idxAdded] = Object.assign({}, added[idxAdded], patch);
      A.setStorePath("decisions.added", added);
      return;
    }
    const edited = A.getStorePath("decisions.edited", {});
    edited[id] = Object.assign({}, edited[id] || {}, patch);
    A.setStorePath("decisions.edited", edited);
  };

  // ========= AI PROPOSALS =========
  A.PROPOSALS_ALL = function(){
    const base = (A.AI_PROPOSALS || []).slice();
    const states = A.getStorePath("proposals", {});
    return base.map(p => Object.assign({}, p, states[p.id] || {}));
  };
  A.setProposalStatus = function(id, status){
    const states = A.getStorePath("proposals", {});
    states[id] = Object.assign({}, states[id] || {}, { status });
    A.setStorePath("proposals", states);
  };
  A.acceptProposal = function(id){
    A.setProposalStatus(id, "accepted");
    A.showToast("Proposition IA acceptée ✓", "success");
  };
  A.rejectProposal = function(id){
    A.setProposalStatus(id, "rejected");
    A.showToast("Proposition IA ignorée", null);
  };

  // ========= ACTIVE GROUP (scope filter) =========
  A.getActiveGroup = function(){ return A.getStorePath("view.activeGroup", "all"); };
  A.setActiveGroup = function(g){
    A.setStorePath("view.activeGroup", g);
    A.showToast(g === "all" ? "Portefeuille complet" : "Focus : " + A.getGroup(g).name, null);
    // hint user to reload page for scope filter
  };
  A.scopeProjects = function(list){
    const g = A.getActiveGroup();
    if (g === "all") return list;
    return list.filter(p => p.group === g);
  };
  A.scopeTasks = function(list){
    const g = A.getActiveGroup();
    if (g === "all") return list;
    const projIds = (A.PROJECTS || []).filter(p => p.group === g).map(p => p.id);
    return list.filter(t => projIds.includes(t.project));
  };

  // ========= EXPORT =========
  A.exportJSON = function(){
    const data = {
      exportedAt: new Date().toISOString(),
      tasks: A.TASKS_ALL(),
      decisions: A.DECISIONS_ALL(),
      events: A.EVENTS,
      contacts: A.CONTACTS,
      projects: A.PROJECTS,
      groups: A.GROUPS,
      reviews: A.REVIEWS,
      proposals: A.PROPOSALS_ALL()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aiceo-export-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
  };

  // ========= UTILS =========
  A.escHtml = function(s){ return String(s||"").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); };
  A.todayISO = function(){ return new Date().toISOString().slice(0,10); };
  A.formatDate = function(iso, opts){
    if (!iso) return "";
    const d = new Date(iso);
    const today = A.todayISO();
    if (iso.slice(0,10) === today) return "aujourd'hui";
    const tom = new Date(Date.now() + 24*3600*1000).toISOString().slice(0,10);
    if (iso.slice(0,10) === tom) return "demain";
    return d.toLocaleDateString("fr-FR", opts || { day:"numeric", month:"short" });
  };
  A.daysUntil = function(iso){
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    const now = new Date(A.todayISO() + "T00:00:00");
    return Math.round((d - now) / (24*3600*1000));
  };
  A.formatMin = function(min){
    if (!min) return "—";
    if (min < 60) return min + " min";
    const h = Math.floor(min/60), m = min%60;
    return m ? (h+"h"+String(m).padStart(2,"0")) : (h+"h");
  };

  // ========= NAV ICONS — Lucide stroke-2 round =========
  const S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  A.NAV_ICONS = {
    dashboard: `<svg ${S}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    groups:    `<svg ${S}><path d="M3 7a2 2 0 0 1 2-2h3l2 2h4a2 2 0 0 1 2 2v1"/><path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5"/></svg>`,
    projects:  `<svg ${S}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    tasks:     `<svg ${S}><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 11l2 2 4-4"/></svg>`,
    agenda:    `<svg ${S}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    assistant: `<svg ${S}><rect x="4" y="6" width="16" height="12" rx="3"/><path d="M12 2v4"/><circle cx="9.5" cy="12" r=".5" fill="currentColor"/><circle cx="14.5" cy="12" r=".5" fill="currentColor"/><path d="M9 16h6"/><path d="M2 12h2M20 12h2"/></svg>`,
    decisions: `<svg ${S}><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/><path d="M9 14h6M9 18h4"/></svg>`,
    contacts:  `<svg ${S}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="3"/><path d="M22 19a5 5 0 0 0-5-5"/></svg>`,
    reviews:   `<svg ${S}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
    search:    `<svg ${S}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    menu:      `<svg ${S}><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
    bell:      `<svg ${S}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
    settings:  `<svg ${S}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.65 1.65 0 0 0-1.8-.3 1.65 1.65 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-1-1.5 1.65 1.65 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.65 1.65 0 0 0 .3-1.8 1.65 1.65 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1.5-1 1.65 1.65 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.65 1.65 0 0 0 1.8.3h0a1.65 1.65 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.65 1.65 0 0 0 1 1.5h0a1.65 1.65 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.65 1.65 0 0 0-.3 1.8v0a1.65 1.65 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1.5 1z"/></svg>`,
    brand:     `<svg width="22" height="22" viewBox="0 0 40 40" fill="none"><path d="M11 10c6 0 10 4 10 10s4 10 10 10" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M11 20c6 0 10-4 10-10" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/></svg>`,
  };

  // ========= SIDEBAR RENDER =========
  A._openPages = [];
  function navItem(page, active){
    const href = page.href;
    const classes = "nav-item" + (active ? " active" : "");
    const countHtml = page.count ? `<span class="count">${page.count}</span>` : "";
    return `<li><a href="${href}" class="${classes}" data-page="${page.key}" ${active ? 'aria-current="page"' : ''}>
      <span class="ico" aria-hidden="true">${A.NAV_ICONS[page.icon] || ""}</span>
      <span class="nav-label">${page.label}</span>
      ${countHtml}
    </a></li>`;
  }

  function renderSidebar(page, rel){
    rel = rel || "";
    const tasks = A.TASKS_ALL();
    const openTasks = tasks.filter(t => !t.done);
    const overdueCnt = openTasks.filter(t => t.due && A.daysUntil(t.due) < 0).length;
    const propCnt = (A.PROPOSALS_ALL() || []).filter(p => (p.status||"pending") === "pending").length;

    const activeGroup = A.getActiveGroup();

    // Groupe 1 : PILOTAGE — routine CEO quotidienne
    const pilotage = [
      { key: "dashboard", icon:"dashboard", label:"Cockpit",      href: `${rel}index.html`    },
      { key: "tasks",     icon:"tasks",     label:"Tâches",       href: `${rel}taches.html`,   count: overdueCnt || null },
      { key: "agenda",    icon:"agenda",    label:"Agenda",       href: `${rel}agenda.html`   },
      { key: "decisions", icon:"decisions", label:"Décisions",    href: `${rel}decisions.html`},
      { key: "reviews",   icon:"reviews",   label:"Revues hebdo", href: `${rel}revues/index.html` },
    ];

    // Groupe 2 : PORTEFEUILLE — vision multi-entités
    const portfolio = [
      { key: "groups",    icon:"groups",    label:"Portefeuille", href: `${rel}groupes.html`  },
      { key: "projects",  icon:"projects",  label:"Projets",      href: `${rel}projets.html`  },
      { key: "contacts",  icon:"contacts",  label:"Contacts",     href: `${rel}contacts.html` },
    ];

    // Groupe 3 : INTELLIGENCE — IA et prospective
    const intelligence = [
      { key: "assistant", icon:"assistant", label:"Copilote IA",  href: `${rel}assistant.html`, count: propCnt || null },
    ];

    const navPilotage     = pilotage.map(p => navItem(p, page===p.key)).join("");
    const navPortfolio    = portfolio.map(p => navItem(p, page===p.key)).join("");
    const navIntelligence = intelligence.map(p => navItem(p, page===p.key)).join("");

    // Group-switcher chips (scope filter)
    // v4: nouveaux IDs groupes (mhssn/amani/etic). Mapping CSS aligné dans app.css.
    const groupChips = (A.GROUPS || []).map(g => {
      const cls = "group-chip" + (activeGroup === g.id ? " active" : "");
      // mapping legacy + v4 → classe CSS existante
      const dotCls = (g.id === "terres-rouges") ? "terres"
                   : (g.id === "mhssn")         ? "mhssn"
                   : (g.id === "etic")          ? "etic"
                   : g.id;
      return `<div class="${cls}" data-group-id="${g.id}" role="button" tabindex="0" aria-label="Filtrer sur ${A.escHtml(g.name)}">
        <span class="group-chip-dot ${dotCls}"></span>
        <span>${A.escHtml(g.name)}</span>
      </div>`;
    }).join("");
    const allChip = `<div class="group-chip ${activeGroup==='all'?'active':''}" data-group-id="all" role="button" tabindex="0" aria-label="Tous les groupes">
      <span class="group-chip-dot" style="background:var(--text)"></span>
      <span>Tous les groupes</span>
    </div>`;

    return `
      <aside class="sidebar" role="navigation" aria-label="Navigation principale">
        <div class="brand">
          <div class="brand-logo" aria-hidden="true">${A.NAV_ICONS.brand}</div>
          <div>
            <div class="brand-title">aiCEO</div>
            <div class="brand-sub">Terres Rouges</div>
          </div>
        </div>

        <div class="nav-group">
          <div class="nav-group-title">Pilotage</div>
          <ul class="nav-list">${navPilotage}</ul>
        </div>

        <div class="nav-group">
          <div class="nav-group-title">Portefeuille</div>
          <ul class="nav-list">${navPortfolio}</ul>
        </div>

        <div class="nav-group">
          <div class="nav-group-title">Intelligence</div>
          <ul class="nav-list">${navIntelligence}</ul>
        </div>

        <div class="group-switcher">
          <div class="group-switcher-title">Scope</div>
          ${allChip}
          ${groupChips}
        </div>
      </aside>
    `;
  }

  // ========= TOPBAR =========
  function renderCrumbs(breadcrumb, title){
    // Accepte :
    //  - string "Pilotage · Tâches" (sep " · ")
    //  - array  [{label, href?}, ...]
    if (!breadcrumb){
      return `<div class="crumbs"><span class="current">${A.escHtml(title || "")}</span></div>`;
    }
    let parts;
    if (Array.isArray(breadcrumb)){
      parts = breadcrumb.map(b => typeof b === "string" ? {label:b} : b).filter(b => b && b.label);
    } else {
      parts = String(breadcrumb).split("·").map(s => s.trim()).filter(Boolean).map(label => ({label}));
    }
    if (parts.length === 0) return `<div class="crumbs"><span class="current">${A.escHtml(title||"")}</span></div>`;
    const current = parts[parts.length - 1];
    const parents = parts.slice(0, -1);
    const parentHtml = parents.map(p => {
      const lbl = A.escHtml(p.label);
      return p.href ? `<a href="${p.href}">${lbl}</a><span class="sep">/</span>` : `<a>${lbl}</a><span class="sep">/</span>`;
    }).join("");
    return `<div class="crumbs">${parentHtml}<span class="current">${A.escHtml(current.label)}</span></div>`;
  }

  function renderTopbar(title, breadcrumb){
    const initials = "FM";
    return `
      <div class="topbar">
        <button class="btn-hamburger" aria-label="Menu" onclick="AICEO.toggleSidebar()">${A.NAV_ICONS.menu}</button>
        ${renderCrumbs(breadcrumb, title)}
        <div class="topbar-actions">
          <div class="search-pill" role="button" tabindex="0" aria-label="Ouvrir la recherche rapide" onclick="AICEO.openPalette()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();AICEO.openPalette();}">
            <span class="ico-s" aria-hidden="true">${A.NAV_ICONS.search}</span>
            <span class="placeholder-txt">Rechercher un projet, une tâche…</span>
            <kbd>⌘K</kbd>
          </div>
          <button class="icon-btn" aria-label="Notifications" title="Notifications">${A.NAV_ICONS.bell}</button>
          <button class="icon-btn" aria-label="Paramètres" title="Paramètres">${A.NAV_ICONS.settings}</button>
          <div class="avatar" aria-label="Feyçoil Mouhoussoune" title="Feyçoil Mouhoussoune">${initials}</div>
        </div>
      </div>
    `;
  }

  function renderPageHeader(opts){
    // Si la page a fourni un pageHeader custom, on l'utilise tel quel.
    if (opts.pageHeader) return opts.pageHeader;
    if (!opts.title) return "";
    const sub = opts.subtitle ? `<div class="page-subtitle">${opts.subtitle}</div>` : "";
    const actions = opts.pageActions ? `<div class="row">${opts.pageActions}</div>` : "";
    return `<div class="page-header">
      <div>
        <h1 class="page-title display">${A.escHtml(opts.title)}</h1>
        ${sub}
      </div>
      ${actions}
    </div>`;
  }

  // ========= MOUNT =========
  A.mount = function(opts){
    opts = opts || {};
    const rel = opts.rel || "";
    document.body.dataset.page = opts.page || "";
    document.body.dataset.rel = rel;

    const root = document.getElementById("app-root");
    root.innerHTML = `
      <a href="#main-content" class="skip-link">Aller au contenu</a>
      <div class="sidebar-backdrop" onclick="AICEO.toggleSidebar(false)"></div>
      <div class="app">
        ${renderSidebar(opts.page, rel)}
        <div class="main-wrap">
          ${renderTopbar(opts.title, opts.breadcrumb)}
          <main class="main" id="main-content" role="main">
            ${renderPageHeader(opts)}
            ${opts.content || ""}
          </main>
        </div>
      </div>
      <div class="toast-wrap" id="toast-wrap"></div>
      ${renderPaletteBackdrop()}
      ${renderQuickAddModal()}
      <button class="quick-add-fab" aria-label="Ajouter" onclick="AICEO.openQuickAdd()">+</button>
    `;

    // Wire group chips
    document.querySelectorAll("[data-group-id]").forEach(el => {
      el.addEventListener("click", () => {
        A.setActiveGroup(el.dataset.groupId);
        setTimeout(() => location.reload(), 300);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " "){
          e.preventDefault();
          A.setActiveGroup(el.dataset.groupId);
          setTimeout(() => location.reload(), 300);
        }
      });
    });

    // Close sidebar on nav link click (mobile)
    document.querySelectorAll(".sidebar .nav-item").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 900) A.toggleSidebar(false);
      });
    });

    A._installShortcuts();

    if (typeof opts.onMounted === "function"){
      try { opts.onMounted(); } catch(e){ console.error(e); }
    }
  };

  // ========= SIDEBAR TOGGLE =========
  A.toggleSidebar = function(force){
    const sb = document.querySelector(".sidebar");
    const bd = document.querySelector(".sidebar-backdrop");
    if (!sb || !bd) return;
    const nextOpen = typeof force === "boolean" ? force : !sb.classList.contains("open");
    sb.classList.toggle("open", nextOpen);
    bd.classList.toggle("open", nextOpen);
  };

  // ========= TOAST =========
  A.showToast = function(msg, variant){
    const wrap = document.getElementById("toast-wrap");
    if (!wrap) return;
    const toast = document.createElement("div");
    toast.className = "toast" + (variant ? " " + variant : "");
    toast.textContent = msg;
    wrap.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateY(10px)"; toast.style.transition = "all .3s"; }, 2400);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2800);
  };

  // ========= TASK ROW =========
  A.taskRow = function(t, opts){
    opts = opts || {};
    const overdue = t.due && A.daysUntil(t.due) < 0 && !t.done;
    const done = !!t.done;
    const starred = !!t.starred;
    const project = A.getProject(t.project);
    const grp = project ? A.getGroup(project.group) : null;
    const grpColor = grp ? A.GROUP_COLOR[grp.id] : null;

    const dueLabel = t.due ? A.formatDate(t.due) : "";
    const dueDays = t.due ? A.daysUntil(t.due) : null;
    const dueCls = overdue ? "overdue" : "";

    const chips = [];
    if (t.estimatedMin) chips.push(`<span class="task-chip estimate">⏱ ${A.formatMin(t.estimatedMin)}</span>`);
    if (t.energy) chips.push(`<span class="task-chip energy ${t.energy}">${t.energy === "deep" ? "🔥" : t.energy === "medium" ? "◐" : "◦"} ${t.energy === "deep" ? "deep" : t.energy === "medium" ? "moyen" : "léger"}</span>`);
    if (t.due) chips.push(`<span class="task-chip due ${dueCls}">📅 ${dueLabel}${overdue ? ` · J${dueDays}` : ""}</span>`);
    if (t.aiCapable) chips.push(`<span class="task-chip ai" title="IA peut assister">✨ IA</span>`);
    if (project) chips.push(`<span class="task-chip project" style="background:${grpColor ? grpColor.bg : 'var(--surface-3)'};color:${grpColor ? grpColor.fg : 'var(--text-2)'}">${A.escHtml(project.name)}</span>`);
    // Source pill — backlink vers origine (mail/event/dossier)
    const _src = A._sourceOfTask(t);
    if (_src) chips.push(A.renderSourcePill(_src));

    const actionsHtml = opts.showActions !== false ? `
      <div class="task-actions">
        <button class="task-action-btn" onclick="event.stopPropagation(); AICEO.openEditTask('${t.id}')" title="Modifier">✎</button>
        <button class="task-action-btn danger" onclick="event.stopPropagation(); AICEO.confirmDeleteTask('${t.id}')" title="Supprimer">🗑</button>
      </div>` : "";

    return `
      <div class="task-row ${done ? "done" : ""} ${overdue ? "overdue" : ""}" data-task-id="${t.id}">
        <button class="task-checkbox" role="checkbox" aria-checked="${done}" aria-label="Marquer comme ${done?'rouvert':'fait'}" onclick="event.stopPropagation(); AICEO.toggleTaskDone('${t.id}', event)"></button>
        <div class="task-body" data-open-task="${t.id}" role="button" tabindex="0" style="cursor:pointer">
          <div class="task-title">${A.escHtml(t.title)}</div>
          <div class="task-meta">${chips.join("")}</div>
        </div>
        <button class="task-star" data-task-star="${t.id}" aria-pressed="${starred}" aria-label="${starred?'Retirer':'Mettre'} en favori" onclick="event.stopPropagation(); AICEO.toggleTaskStar('${t.id}', event)">${starred ? "★" : "☆"}</button>
        ${actionsHtml}
      </div>
    `;
  };

  A.confirmDeleteTask = function(id){
    if (confirm("Supprimer cette tâche ?")){
      A.deleteTask(id);
      A.showToast("Tâche supprimée", "warn");
      setTimeout(() => location.reload(), 400);
    }
  };

  A.openEditTask = function(id){
    const all = A.TASKS_ALL();
    const t = all.find(x => x.id === id);
    if (!t) return;
    A.openQuickAdd(t);
  };

  // ========= QUICK-ADD MODAL =========
  function renderQuickAddModal(){
    return `
      <div class="modal-backdrop" id="qa-backdrop" onclick="if(event.target===this)AICEO.closeQuickAdd()">
        <div class="modal" role="dialog" aria-label="Nouvelle tâche">
          <div class="modal-header">
            <h2 class="modal-title" id="qa-title">Nouvelle tâche</h2>
            <button class="modal-close" onclick="AICEO.closeQuickAdd()" aria-label="Fermer">×</button>
          </div>
          <form class="modal-body" id="qa-form" onsubmit="event.preventDefault(); AICEO.submitQuickAdd()">
            <input type="hidden" id="qa-id" value="">
            <div class="form-field">
              <label class="form-label" for="qa-input-title">Titre *</label>
              <input class="form-input" id="qa-input-title" required placeholder="Ex: Valider contrat Bénédicte">
            </div>
            <div class="form-row">
              <div class="form-field">
                <label class="form-label" for="qa-project">Projet</label>
                <select class="form-select" id="qa-project"></select>
              </div>
              <div class="form-field">
                <label class="form-label" for="qa-due">Échéance</label>
                <input type="date" class="form-input" id="qa-due">
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Type (Eisenhower)</label>
                <div class="toggle-group" id="qa-type">
                  <button type="button" data-val="do" class="active">Faire</button>
                  <button type="button" data-val="plan">Planifier</button>
                  <button type="button" data-val="delegate">Déléguer</button>
                  <button type="button" data-val="drop">Abandonner</button>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Priorité</label>
                <div class="toggle-group" id="qa-priority">
                  <button type="button" data-val="critical">Critique</button>
                  <button type="button" data-val="high">Haute</button>
                  <button type="button" data-val="medium" class="active">Moyenne</button>
                  <button type="button" data-val="low">Basse</button>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label class="form-label" for="qa-estimate">Temps estimé (min)</label>
                <input type="number" min="5" step="5" class="form-input" id="qa-estimate" value="30">
              </div>
              <div class="form-field">
                <label class="form-label">Énergie</label>
                <div class="toggle-group" id="qa-energy">
                  <button type="button" data-val="light">◦ Léger</button>
                  <button type="button" data-val="medium" class="active">◐ Moyen</button>
                  <button type="button" data-val="deep">🔥 Deep</button>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Contexte</label>
                <select class="form-select" id="qa-context">
                  <option value="deep-work">Travail profond</option>
                  <option value="email">Email</option>
                  <option value="meeting">Réunion</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">
                  <input type="checkbox" id="qa-ai" style="margin-right:6px"> IA peut aider
                </label>
                <span class="form-help">Active les propositions IA pour cette tâche</span>
              </div>
            </div>
          </form>
          <div class="modal-footer">
            <button class="btn" onclick="AICEO.closeQuickAdd()">Annuler</button>
            <button class="btn primary" onclick="AICEO.submitQuickAdd()">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
  }

  A.openQuickAdd = function(task){
    const bd = document.getElementById("qa-backdrop");
    if (!bd) return;
    // Populate project options
    const projSelect = document.getElementById("qa-project");
    projSelect.innerHTML = '<option value="">— Aucun —</option>' + (A.PROJECTS||[]).map(p => `<option value="${p.id}">${p.icon} ${A.escHtml(p.name)}</option>`).join("");

    const titleEl = document.getElementById("qa-title");
    const idEl = document.getElementById("qa-id");
    if (task){
      titleEl.textContent = "Modifier la tâche";
      idEl.value = task.id;
      document.getElementById("qa-input-title").value = task.title || "";
      projSelect.value = task.project || "";
      document.getElementById("qa-due").value = task.due || "";
      document.getElementById("qa-estimate").value = task.estimatedMin || 30;
      document.getElementById("qa-ai").checked = !!task.aiCapable;
      document.getElementById("qa-context").value = task.context || "deep-work";
      _toggleSet("qa-type", task.type || "do");
      _toggleSet("qa-priority", task.priority || "medium");
      _toggleSet("qa-energy", task.energy || "medium");
    } else {
      titleEl.textContent = "Nouvelle tâche";
      idEl.value = "";
      document.getElementById("qa-form").reset();
      document.getElementById("qa-estimate").value = 30;
      _toggleSet("qa-type", "do");
      _toggleSet("qa-priority", "medium");
      _toggleSet("qa-energy", "medium");
    }

    // Wire toggle groups
    ["qa-type","qa-priority","qa-energy"].forEach(gid => {
      const g = document.getElementById(gid);
      g.querySelectorAll("button").forEach(b => {
        b.onclick = () => {
          g.querySelectorAll("button").forEach(x => x.classList.remove("active"));
          b.classList.add("active");
        };
      });
    });

    bd.classList.add("open");
    setTimeout(() => document.getElementById("qa-input-title").focus(), 50);
  };
  function _toggleSet(groupId, val){
    const g = document.getElementById(groupId);
    if (!g) return;
    g.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.val === val));
  }
  function _toggleGet(groupId){
    const g = document.getElementById(groupId);
    if (!g) return null;
    const b = g.querySelector("button.active");
    return b ? b.dataset.val : null;
  }

  A.closeQuickAdd = function(){
    const bd = document.getElementById("qa-backdrop");
    if (bd) bd.classList.remove("open");
  };

  A.submitQuickAdd = function(){
    const title = document.getElementById("qa-input-title").value.trim();
    if (!title){ A.showToast("Titre requis", "warn"); return; }
    const id = document.getElementById("qa-id").value;
    const data = {
      title,
      project: document.getElementById("qa-project").value || null,
      due: document.getElementById("qa-due").value || null,
      type: _toggleGet("qa-type") || "do",
      priority: _toggleGet("qa-priority") || "medium",
      energy: _toggleGet("qa-energy") || "medium",
      estimatedMin: parseInt(document.getElementById("qa-estimate").value || "30", 10),
      context: document.getElementById("qa-context").value,
      aiCapable: document.getElementById("qa-ai").checked
    };
    if (id){
      A.updateTask(id, data);
      A.showToast("Tâche modifiée ✓", "success");
    } else {
      A.createTask(data);
      A.showToast("Tâche créée ✓", "success");
    }
    A.closeQuickAdd();
    setTimeout(() => location.reload(), 400);
  };

  // ========= PALETTE =========
  function renderPaletteBackdrop(){
    return `
      <div class="palette-backdrop" id="palette-backdrop" onclick="if(event.target===this)AICEO.closePalette()">
        <div class="palette" role="dialog" aria-label="Recherche rapide">
          <input type="text" class="palette-input" id="palette-input" placeholder="Rechercher pages, projets, tâches, contacts…" autocomplete="off">
          <div class="palette-results" id="palette-results"></div>
        </div>
      </div>
    `;
  }
  A._paletteSelectedIdx = 0;
  A._paletteResults = [];
  A.openPalette = function(){
    const bd = document.getElementById("palette-backdrop");
    if (!bd) return;
    bd.classList.add("open");
    const input = document.getElementById("palette-input");
    input.value = "";
    A._paletteSelectedIdx = 0;
    A._renderPaletteResults("");
    input.onkeydown = A._paletteKeydown;
    input.oninput = (e) => { A._paletteSelectedIdx = 0; A._renderPaletteResults(e.target.value); };
    setTimeout(() => input.focus(), 50);
  };
  A.closePalette = function(){
    const bd = document.getElementById("palette-backdrop");
    if (bd) bd.classList.remove("open");
  };
  A._paletteKeydown = function(e){
    if (e.key === "Escape") { A.closePalette(); return; }
    if (e.key === "ArrowDown"){ e.preventDefault(); A._paletteSelectedIdx = Math.min(A._paletteSelectedIdx+1, A._paletteResults.length-1); A._updatePaletteSelection(); }
    if (e.key === "ArrowUp")  { e.preventDefault(); A._paletteSelectedIdx = Math.max(A._paletteSelectedIdx-1, 0); A._updatePaletteSelection(); }
    if (e.key === "Enter")    { e.preventDefault(); const r = A._paletteResults[A._paletteSelectedIdx]; if (r) { A.closePalette(); if (r.href) location.href = r.href; }}
  };
  A._updatePaletteSelection = function(){
    document.querySelectorAll("#palette-results .palette-item").forEach((el, i) => el.classList.toggle("selected", i === A._paletteSelectedIdx));
    const sel = document.querySelector("#palette-results .palette-item.selected");
    if (sel) sel.scrollIntoView({ block: "nearest" });
  };
  A._renderPaletteResults = function(q){
    const rel = document.body.dataset.rel || "";
    const qn = (q||"").toLowerCase();
    const results = [];
    const pages = [
      { label:"Cockpit",      href:`${rel}index.html`,    icon:"🏠", group:"Pages" },
      { label:"Portefeuille", href:`${rel}groupes.html`,  icon:"🏢", group:"Pages" },
      { label:"Projets",      href:`${rel}projets.html`,  icon:"📁", group:"Pages" },
      { label:"Tâches",       href:`${rel}taches.html`,   icon:"✓", group:"Pages" },
      { label:"Agenda",       href:`${rel}agenda.html`,   icon:"📅", group:"Pages" },
      { label:"Copilote IA",  href:`${rel}assistant.html`,icon:"✨", group:"Pages" },
      { label:"Décisions",    href:`${rel}decisions.html`,icon:"⚖️", group:"Pages" },
      { label:"Contacts",     href:`${rel}contacts.html`, icon:"👥", group:"Pages" },
      { label:"Revues hebdo", href:`${rel}revues/index.html`,icon:"📝", group:"Pages" },
    ];
    pages.forEach(p => { if (!qn || p.label.toLowerCase().includes(qn)) results.push(p); });
    (A.PROJECTS || []).forEach(p => { if (!qn || p.name.toLowerCase().includes(qn)) results.push({ label: p.name, sub: p.tagline, href: `${rel}projets/${p.id}.html`, icon: p.icon, group:"Projets" }); });
    const tasks = A.TASKS_ALL().filter(t => !t.done);
    tasks.slice(0, qn ? 20 : 6).forEach(t => { if (!qn || t.title.toLowerCase().includes(qn)) results.push({ label: t.title, sub: "Tâche", href: `${rel}taches.html#${t.id}`, icon: "✓", group:"Tâches" }); });
    (A.CONTACTS || []).forEach(c => { if (!qn || c.name.toLowerCase().includes(qn) || (c.org||"").toLowerCase().includes(qn)) results.push({ label: c.name, sub: c.role + " · " + c.org, href: `${rel}contacts.html#${c.id}`, icon: "👤", group:"Contacts" }); });
    if (qn){
      A.DECISIONS_ALL().forEach(d => { if (d.title.toLowerCase().includes(qn)) results.push({ label: d.title, sub: "Décision " + d.date, href: `${rel}decisions.html`, icon: "⚖️", group:"Décisions" }); });
    }
    A._paletteResults = results;
    const groups = {};
    results.forEach((r, i) => { (groups[r.group] = groups[r.group] || []).push({ r, i }); });
    const html = Object.keys(groups).map(gName => `
      <div class="palette-group-label">${A.escHtml(gName)}</div>
      ${groups[gName].map(({r,i}) => `
        <div class="palette-item ${i === A._paletteSelectedIdx ? "selected" : ""}" onclick="location.href='${r.href}'">
          <div class="palette-item-icon">${r.icon}</div>
          <div>
            <div class="palette-item-label">${A.escHtml(r.label)}</div>
            ${r.sub ? `<div class="palette-item-sub">${A.escHtml(r.sub)}</div>` : ""}
          </div>
        </div>
      `).join("")}
    `).join("");
    const el = document.getElementById("palette-results");
    if (el) el.innerHTML = html || '<div class="empty">Aucun résultat</div>';
  };

  // ========= SHORTCUTS =========
  A._installShortcuts = function(){
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k"){
        e.preventDefault();
        A.openPalette();
      }
      const activeEl = document.activeElement;
      const isTextInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);
      if (!isTextInput){
        if (e.key === "n"){ A.openQuickAdd(); e.preventDefault(); }
        if (e.key === "/"){ A.openPalette(); e.preventDefault(); }
      }
    });
  };

  // ========= AI CARD RENDERER =========
  A.aiCard = function(p, opts){
    opts = opts || {};
    const status = p.status || "pending";
    if (status !== "pending" && !opts.showAll) return "";
    const kindLabel = { "email-draft":"✉️ Brouillon mail","meeting-prep":"📋 Préparation","task-from-event":"✓ Création tâches","workload-rebalance":"⚖️ Charge","automation":"⚙️ Automatisation","summary":"📝 Synthèse" };
    const urgLabel = { "now":"maintenant", "today":"aujourd'hui", "this-week":"cette semaine" };
    return `
      <div class="ai-card" data-proposal-id="${p.id}">
        <div class="ai-card-kind">${A.escHtml(kindLabel[p.kind] || p.kind)} · ${A.escHtml(urgLabel[p.urgency] || p.urgency || "")}</div>
        <div class="ai-card-title">${A.escHtml(p.title)}</div>
        <div class="ai-card-summary">${A.escHtml(p.summary || "")}</div>
        <div class="ai-card-why">💡 ${A.escHtml(p.rationale || "")}</div>
        ${p.preview ? `<div class="ai-card-preview" onclick="this.classList.toggle('expanded')">${A.escHtml(p.preview)}<div class="ai-card-preview-fade"></div></div>` : ""}
        <div class="ai-card-actions">
          <button class="ai-btn accept" onclick="AICEO.acceptProposal('${p.id}'); setTimeout(()=>location.reload(),400)">Accepter</button>
          <button class="ai-btn" onclick="navigator.clipboard && navigator.clipboard.writeText(${JSON.stringify(p.preview||'')}); AICEO.showToast('Copié ✓','success')">Copier</button>
          <button class="ai-btn reject" onclick="AICEO.rejectProposal('${p.id}'); setTimeout(()=>location.reload(),400)">Ignorer</button>
          ${p.estimatedGain ? `<span class="muted small" style="margin-left:auto">Gain estimé ${A.escHtml(p.estimatedGain)}</span>` : ""}
        </div>
      </div>
    `;
  };


  // ============================================================
  // SERENITY & GAMIFICATION ENGINE — v4 (23 avril 2026)
  // Drawer (source inspector) · Coach copy library · Week gauge ·
  // Streak · Badges · Celebration · End-of-day ritual
  // ============================================================

  // ========= SOURCE RESOLUTION (heuristic backlinks) =========
  A._sourceOfTask = function(t){
    if (!t) return null;
    // 1) Explicit link from AI proposals pointing at this task
    const prop = (A.AI_PROPOSALS||[]).find(p => p.source === "task:" + t.id);
    const proj = t.project ? A.getProject(t.project) : null;
    const grp  = proj ? A.getGroup(proj.group) : null;

    // Try to find a nearby event on same project within +/- 4 days
    let eventNearby = null;
    if (proj){
      const due = t.due ? new Date(t.due + "T12:00") : null;
      const candidates = (A.EVENTS||[]).filter(e => e.project === proj.id);
      if (due && candidates.length){
        candidates.sort((a,b) => Math.abs(new Date(a.date) - due) - Math.abs(new Date(b.date) - due));
        const best = candidates[0];
        if (best && Math.abs(new Date(best.date) - due) <= 4 * 86400000){
          eventNearby = best;
        }
      }
    }

    // Heuristic sources by context
    const sourceByContext = {
      "email":      { type:"email",   icon:"✉︎", detail:"Thread mail" },
      "meeting":    { type:"event",   icon:"📅", detail:"Réunion" },
      "phone":      { type:"call",    icon:"☎︎", detail:"Appel" },
      "deep-work":  { type:"file",    icon:"📄", detail:"Dossier" }
    };
    const base = sourceByContext[t.context] || sourceByContext["deep-work"];

    // Build plausible label
    let label = "";
    let subject = "";
    let from = "";
    let body = "";
    if (base.type === "email"){
      subject = "Re: " + t.title.replace(/\(.*?\)/g,"").trim();
      from = proj ? (proj.name + " · " + (grp ? grp.name : "")) : "mail@etic-services.net";
      body = "Fil synthétisé par le copilote IA. Ouvrez Outlook pour le détail complet du thread.";
      label = subject;
    } else if (base.type === "event" && eventNearby){
      subject = eventNearby.title;
      from = (eventNearby.location || "") + " · " + new Date(eventNearby.date).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" });
      body = "Réunion agenda · " + (eventNearby.attendees || []).join(", ") + ".";
      label = subject;
    } else if (base.type === "call"){
      subject = "Appel programmé";
      from = proj ? proj.name : "—";
      body = "Ligne non enregistrée. Notes manuscrites dans le dossier.";
      label = "Appel · " + (proj ? proj.name : "tâche");
    } else {
      subject = proj ? ("Dossier " + proj.name) : "Dossier de travail";
      from = grp ? grp.name : "—";
      body = "Dossier projet consolidé. Ouvrir SharePoint pour la version courante.";
      label = subject;
    }

    return {
      type: base.type,
      icon: base.icon,
      detail: base.detail,
      label,
      subject,
      from,
      body,
      nearbyEvent: eventNearby,
      project: proj,
      group: grp,
      proposal: prop || null,
      href: base.type === "event" && eventNearby ? ("agenda.html#" + eventNearby.id) : null
    };
  };

  A._sourceOfDecision = function(d){
    if (!d) return null;
    const proj = d.project ? A.getProject(d.project) : null;
    const grp = proj ? A.getGroup(proj.group) : null;
    const nearEv = (A.EVENTS||[]).filter(e => e.project === (d.project||null)).sort((a,b) => Math.abs(new Date(a.date) - new Date(d.date)) - Math.abs(new Date(b.date) - new Date(d.date)))[0] || null;
    return {
      type: "decision",
      icon: "⚖︎",
      detail: "Décision",
      label: d.title,
      subject: d.title,
      from: (d.parties||[]).join(", ") || "—",
      body: d.outcome || "",
      nearbyEvent: nearEv,
      project: proj,
      group: grp,
      href: null
    };
  };

  A.renderSourcePill = function(source){
    if (!source) return "";
    const lbl = source.detail + (source.label ? " · " + source.label : "");
    return `<button class="source-pill" data-source-pill title="Voir la source" aria-label="Voir la source : ${A.escHtml(lbl)}">
      <span class="src-ico" aria-hidden="true">${source.icon}</span>
      <span>${A.escHtml(source.detail)}</span>
      <span class="src-arrow" aria-hidden="true">↗</span>
    </button>`;
  };

  // ========= DRAWER =========
  A._drawerEl = null;
  A._ensureDrawer = function(){
    if (A._drawerEl) return A._drawerEl;
    const bd = document.createElement("div");
    bd.className = "drawer-backdrop";
    bd.id = "drawer-backdrop";
    bd.addEventListener("click", () => A.closeDrawer());
    document.body.appendChild(bd);

    const dr = document.createElement("aside");
    dr.className = "drawer";
    dr.id = "drawer";
    dr.setAttribute("role","dialog");
    dr.setAttribute("aria-label","Panneau de détail");
    document.body.appendChild(dr);
    A._drawerEl = dr;
    return dr;
  };
  A.openDrawer = function(opts){
    opts = opts || {};
    const dr = A._ensureDrawer();
    const bd = document.getElementById("drawer-backdrop");

    const eyebrow = opts.eyebrow || "Détail";
    const title = opts.title || "";
    const source = opts.source || null;
    const meta = opts.meta || [];     // array of {label, value}
    const related = opts.related || []; // array of {icon, label, sub, href}
    const actions = opts.actions || []; // array of {label, primary?, onclick}

    let html = `
      <div class="drawer-head">
        <div class="drawer-head-body">
          <div class="drawer-eyebrow">${A.escHtml(eyebrow)}</div>
          <h2 class="drawer-title">${A.escHtml(title)}</h2>
        </div>
        <button class="drawer-close" aria-label="Fermer" onclick="AICEO.closeDrawer()">×</button>
      </div>
      <div class="drawer-body">
    `;
    if (source){
      html += `
        <div class="drawer-section">
          <div class="drawer-section-label">Source d'origine</div>
          <div class="drawer-source-card">
            <div class="from"><span>${source.icon}</span><span>${A.escHtml(source.detail)}</span></div>
            <div class="subject">${A.escHtml(source.subject || source.label || "")}</div>
            <div class="from" style="color:var(--text-3)">${A.escHtml(source.from || "")}</div>
            ${source.body ? `<div class="body">${A.escHtml(source.body)}</div>` : ""}
            <div class="drawer-source-actions">
              ${source.href ? `<a class="btn sm" href="${source.href}">Ouvrir →</a>` : ""}
              ${source.type === "email" ? `<button class="btn sm" onclick="AICEO.showToast('Lien Outlook copié ✓','success')">Ouvrir Outlook</button>` : ""}
              ${source.type === "file" ? `<button class="btn sm" onclick="AICEO.showToast('Dossier SharePoint ouvert','success')">SharePoint</button>` : ""}
              ${source.proposal ? `<a class="btn sm primary" href="assistant.html#${source.proposal.id}">✨ Proposition IA</a>` : ""}
            </div>
          </div>
        </div>
      `;
    }
    if (meta.length){
      html += `
        <div class="drawer-section">
          <div class="drawer-section-label">Informations</div>
          <div class="drawer-link-list">
            ${meta.map(m => `
              <div class="drawer-link" style="cursor:default;background:#fff">
                <div class="drawer-link-body">
                  <div class="drawer-link-sub">${A.escHtml(m.label)}</div>
                  <div class="drawer-link-label">${A.escHtml(m.value)}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }
    if (related.length){
      html += `
        <div class="drawer-section">
          <div class="drawer-section-label">Éléments liés</div>
          <div class="drawer-link-list">
            ${related.map(r => `
              <${r.href ? "a" : "div"} class="drawer-link" ${r.href ? `href="${r.href}"` : ""}>
                <div class="drawer-link-ico">${r.icon || "↗"}</div>
                <div class="drawer-link-body">
                  <div class="drawer-link-label">${A.escHtml(r.label)}</div>
                  ${r.sub ? `<div class="drawer-link-sub">${A.escHtml(r.sub)}</div>` : ""}
                </div>
              </${r.href ? "a" : "div"}>
            `).join("")}
          </div>
        </div>
      `;
    }
    if (actions.length){
      html += `
        <div class="drawer-section">
          <div class="drawer-source-actions" style="gap:8px">
            ${actions.map(a => `<button class="btn${a.primary?" primary":""} sm" onclick="${a.onclick || ""}">${A.escHtml(a.label)}</button>`).join("")}
          </div>
        </div>
      `;
    }
    html += `</div>`;

    dr.innerHTML = html;
    bd.classList.add("open");
    dr.classList.add("open");

    // ESC to close
    A._drawerEscHandler = (e) => { if (e.key === "Escape") A.closeDrawer(); };
    document.addEventListener("keydown", A._drawerEscHandler);
  };
  A.closeDrawer = function(){
    const dr = document.getElementById("drawer");
    const bd = document.getElementById("drawer-backdrop");
    if (dr) dr.classList.remove("open");
    if (bd) bd.classList.remove("open");
    if (A._drawerEscHandler){ document.removeEventListener("keydown", A._drawerEscHandler); A._drawerEscHandler = null; }
  };

  A.openTaskDrawer = function(id){
    const t = (A.TASKS_ALL()).find(x => x.id === id);
    if (!t) return;
    const source = A._sourceOfTask(t);
    const proj = t.project ? A.getProject(t.project) : null;
    const grp = proj ? A.getGroup(proj.group) : null;
    const meta = [];
    if (proj) meta.push({ label: "Projet", value: proj.icon + " " + proj.name });
    if (grp)  meta.push({ label: "Groupe", value: grp.icon + " " + grp.name });
    if (t.due) meta.push({ label: "Échéance", value: A.formatDate(t.due) + (A.daysUntil(t.due) < 0 ? " (en retard)" : "") });
    if (t.estimatedMin) meta.push({ label: "Temps estimé", value: A.formatMin(t.estimatedMin) });
    if (t.energy) meta.push({ label: "Énergie", value: t.energy === "deep" ? "Travail profond" : t.energy === "medium" ? "Moyen" : "Léger" });
    if (t.priority) meta.push({ label: "Priorité", value: {critical:"Critique",high:"Haute",medium:"Moyenne",low:"Basse"}[t.priority] || t.priority });

    // Related events and decisions
    const related = [];
    if (source && source.nearbyEvent){
      const e = source.nearbyEvent;
      const d = new Date(e.date);
      related.push({ icon: "📅", label: e.title, sub: d.toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" }) + " · " + d.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }), href: "agenda.html#" + e.id });
    }
    (A.DECISIONS_ALL()||[]).filter(d => d.project === (t.project||null)).slice(0,2).forEach(d => {
      related.push({ icon: "⚖︎", label: d.title, sub: "Décision · " + A.formatDate(d.date), href: "decisions.html#" + d.id });
    });
    if (source && source.proposal){
      related.push({ icon: "✨", label: source.proposal.title, sub: "Proposition IA", href: "assistant.html#" + source.proposal.id });
    }

    const actions = [
      { label: t.done ? "Rouvrir la tâche" : "✓ Marquer fait", primary: !t.done, onclick: `AICEO.toggleTaskDone('${t.id}'); setTimeout(()=>AICEO.closeDrawer(),250)` },
      { label: "Modifier", onclick: `AICEO.closeDrawer(); setTimeout(()=>AICEO.openEditTask('${t.id}'),200)` }
    ];

    A.openDrawer({
      eyebrow: proj ? proj.name : "Tâche",
      title: t.title,
      source, meta, related, actions
    });
  };

  A.openDecisionDrawer = function(id){
    const d = (A.DECISIONS_ALL()).find(x => x.id === id);
    if (!d) return;
    const source = A._sourceOfDecision(d);
    const proj = d.project ? A.getProject(d.project) : null;
    const meta = [];
    if (proj) meta.push({ label: "Projet", value: proj.icon + " " + proj.name });
    meta.push({ label: "Date", value: A.formatDate(d.date, { day:"numeric", month:"long", year:"numeric" }) });
    if (d.owner) meta.push({ label: "Pilote", value: d.owner });
    if (d.deadline) meta.push({ label: "Échéance d'exécution", value: A.formatDate(d.deadline) });
    if (d.status) meta.push({ label: "Statut", value: d.status === "executed" ? "Exécutée" : "À exécuter" });
    if (d.rationale) meta.push({ label: "Pourquoi", value: d.rationale });

    const related = [];
    if (source && source.nearbyEvent){
      const e = source.nearbyEvent;
      const dd = new Date(e.date);
      related.push({ icon:"📅", label: e.title, sub: dd.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}), href: "agenda.html#" + e.id });
    }
    A.openDrawer({
      eyebrow: proj ? proj.name : "Décision",
      title: d.title,
      source, meta, related
    });
  };

  A.openEventDrawer = function(id){
    const e = (A.EVENTS||[]).find(x => x.id === id);
    if (!e) return;
    const dd = new Date(e.date);
    const proj = e.project ? A.getProject(e.project) : null;
    const source = {
      type: "event", icon:"📅", detail: "Événement agenda",
      label: e.title, subject: e.title,
      from: (e.location||"") + (e.attendees ? " · " + e.attendees.join(", ") : ""),
      body: dd.toLocaleString("fr-FR", { weekday:"long", day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" }) + (e.duration_min ? " · " + A.formatMin(e.duration_min) : ""),
      href: null
    };
    const meta = [];
    if (proj) meta.push({ label:"Projet", value: proj.icon + " " + proj.name });
    if (e.prep_needed) meta.push({ label:"Préparation", value:"Requise" });
    A.openDrawer({ eyebrow: proj ? proj.name : "Agenda", title: e.title, source, meta });
  };

  // ========= GAMIFICATION : streak · badges · week gauge =========
  A.getStreak = function(){
    const s = A.getStorePath("gamif.streak", null) || { days: 0, lastDay: null };
    return s;
  };
  A.getBadges = function(){
    return A.getStorePath("gamif.badges", []);
  };
  A._countClosedToday = function(){
    const today = A.todayISO();
    const state = A.getStorePath("tasks.state", {});
    return Object.keys(state).filter(id => state[id] && state[id].done && (state[id].doneAt||"").slice(0,10) === today).length;
  };
  A._countClosedThisWeek = function(){
    // Monday start
    const now = new Date();
    const dow = (now.getDay()+6)%7; // Mon=0 ... Sun=6
    const monday = new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate() - dow);
    const mondayIso = monday.toISOString().slice(0,10);
    const state = A.getStorePath("tasks.state", {});
    return Object.keys(state).filter(id => state[id] && state[id].done && (state[id].doneAt||"").slice(0,10) >= mondayIso).length;
  };
  A._bumpStreak = function(){
    const today = A.todayISO();
    const s = A.getStreak();
    if (s.lastDay === today) return s; // already bumped
    const y = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    if (s.lastDay === y){
      s.days = (s.days||0) + 1;
    } else {
      s.days = 1;
    }
    s.lastDay = today;
    A.setStorePath("gamif.streak", s);
    return s;
  };
  A._checkBadges = function(){
    const totalClosed = Object.values(A.getStorePath("tasks.state", {})).filter(s => s && s.done).length;
    const badges = A.getBadges().slice();
    const defs = [
      { id:"first",  threshold:1,  icon:"⭐", label:"Première tâche" },
      { id:"five",   threshold:5,  icon:"🎯", label:"5 soldées" },
      { id:"twenty", threshold:20, icon:"🏅", label:"20 soldées" },
      { id:"fifty",  threshold:50, icon:"🏆", label:"Cap 50" }
    ];
    const unlocked = [];
    for (const def of defs){
      if (totalClosed >= def.threshold && !badges.find(b => b.id === def.id)){
        badges.push({ id: def.id, icon: def.icon, label: def.label, at: new Date().toISOString() });
        unlocked.push(def);
      }
    }
    if (unlocked.length){
      A.setStorePath("gamif.badges", badges);
    }
    return unlocked;
  };
  A.celebrate = function(msg){
    // Non-bouncy celebration toast
    const el = document.createElement("div");
    el.className = "celebrate-toast";
    el.innerHTML = `<span class="check">✓</span><span>${A.escHtml(msg)}</span>`;
    document.body.appendChild(el);
    // Trigger in next frame for transition
    requestAnimationFrame(() => { requestAnimationFrame(() => el.classList.add("show")); });
    setTimeout(() => { el.classList.remove("show"); }, 2200);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 2800);
  };

  // Wrap toggleTaskDone to add streak + celebrate
  (function(){
    const prev = A.toggleTaskDone;
    A.toggleTaskDone = function(id, evt){
      const wasDone = A.isTaskDone(id);
      // Record doneAt BEFORE calling previous (so it's in state before UI updates)
      const state = A.getStorePath("tasks.state", {});
      if (!wasDone){
        state[id] = Object.assign({}, state[id]||{}, { doneAt: new Date().toISOString() });
        A.setStorePath("tasks.state", state);
      }
      prev(id, evt);
      if (!wasDone){
        // Task now marked done
        A._bumpStreak();
        const unlocked = A._checkBadges();
        const closedToday = A._countClosedToday();
        const weekClosed = A._countClosedThisWeek();
        const streak = A.getStreak();
        let msg = "Belle avancée · " + closedToday + " soldée" + (closedToday>1?"s":"") + " aujourd'hui";
        if (unlocked.length){
          msg = "Badge débloqué " + unlocked[0].icon + " " + unlocked[0].label;
        } else if (streak.days >= 3){
          msg = "Streak " + streak.days + " jours · gardez le rythme";
        } else if (weekClosed === 3){
          msg = "3 soldées cette semaine · elan retrouvé";
        }
        A.celebrate(msg);
      }
    };
  })();

  // Auto-tick existing toast on re-open of page
  A.onTaskChange(function(){
    const el = document.querySelector("[data-week-gauge]");
    if (el){
      const closed = parseInt(el.dataset.closed||"0",10);
      const total = parseInt(el.dataset.total||"0",10) || 1;
      const pct = Math.min(100, Math.round((closed/total)*100));
      const fill = el.querySelector(".week-gauge-fill");
      if (fill) fill.style.width = pct + "%";
    }
  });

  // ========= COACH COPY LIBRARY =========
  A.coachMessage = function(ctx){
    ctx = ctx || {};
    const hour = (new Date()).getHours();
    const closedToday = A._countClosedToday();
    const closedWeek = A._countClosedThisWeek();
    const streak = A.getStreak().days || 0;
    const overdueCount = ctx.overdue || 0;
    const bigRocksProgress = ctx.bigRocksProgress || 0;

    const pick = (list) => list[Math.floor(Date.now()/3600000) % list.length];

    if (overdueCount > 3){
      return pick([
        "Quelques tâches en retard — pas un drame. Une seule soldée change la donne.",
        "La liste est longue aujourd'hui. Commencez par la plus rapide, le reste suit.",
        "Objectif : une grosse tâche, puis vous soufflez. Le reste peut attendre."
      ]);
    }
    if (closedToday >= 3){
      return pick([
        "Très belle journée — " + closedToday + " tâches soldées. Vous pouvez ralentir.",
        "Momentum solide aujourd'hui. Protégez ce que vous avez déjà gagné.",
        "Trois tâches derrière vous — le plus dur est fait."
      ]);
    }
    if (streak >= 5){
      return pick([
        "Streak " + streak + " jours · vous tenez un rythme durable.",
        "Cinq jours consécutifs · votre système fonctionne.",
        "Régularité remarquable — continuez sans forcer."
      ]);
    }
    if (closedWeek >= 8){
      return pick([
        "Vous avez déjà soldé " + closedWeek + " tâches cette semaine · bon rythme.",
        closedWeek + " tâches semaine · vous êtes en avance sur l'objectif.",
        "Excellente semaine en cours. Utilisez l'élan pour les gros morceaux."
      ]);
    }
    if (bigRocksProgress >= 66){
      return pick([
        "Deux Big Rocks solidement posées — la semaine tient son cap.",
        "Gros morceau derrière vous, soufflez un instant.",
        "Vos priorités avancent. Le reste peut s'ajuster autour."
      ]);
    }
    if (hour >= 17){
      return pick([
        "Fin de journée · faites le bilan avant de lâcher.",
        "Une dernière tâche légère puis vous fermez, sans forcer.",
        "Pensez à la clôture : ce que vous laissez est autant que ce que vous faites."
      ]);
    }
    if (hour < 10){
      return pick([
        "Bonne semaine " + (ctx.weekNum ? "S"+ctx.weekNum+" " : "") + "· commencez par la tâche qui libère le reste.",
        "Matin · un choix clair vaut mieux qu'un plan parfait.",
        "Démarrez par une seule priorité, laissez le reste suivre."
      ]);
    }
    return pick([
      "Avancez au rythme qui vous ressemble — la régularité bat la vitesse.",
      "Une tâche à la fois. Le cumul fera la différence.",
      "Vous êtes en piste · rien à prouver aujourd'hui."
    ]);
  };

  // ========= END-OF-DAY RITUAL =========
  A.openEndOfDay = function(){
    const today = A.todayISO();
    const state = A.getStorePath("tasks.state", {});
    const doneToday = Object.keys(state).filter(id => state[id] && state[id].done && (state[id].doneAt||"").slice(0,10) === today).length;
    const all = A.TASKS_ALL();
    const overdue = all.filter(t => !t.done && t.due && A.daysUntil(t.due) < 0).length;
    const tomorrow = all.filter(t => !t.done && t.due && A.daysUntil(t.due) === 1).length;
    const remainingToday = all.filter(t => !t.done && t.due && A.daysUntil(t.due) === 0).length;
    const streak = A.getStreak().days || 0;

    const coach = (() => {
      if (doneToday >= 4) return "Journée très productive — " + doneToday + " tâches soldées. Fermez l'ordinateur, vous l'avez mérité.";
      if (doneToday >= 1) return doneToday + " tâche" + (doneToday>1?"s":"") + " soldée" + (doneToday>1?"s":"") + " · c'est l'essentiel. Le reste attendra demain, reposé.";
      if (overdue > 0) return "Journée dense sans clôture — pas grave. Demain matin, une seule priorité suffira à repartir.";
      return "Rien soldé aujourd'hui · parfois c'est juste une journée pour réfléchir. Demain sera plus linéaire.";
    })();

    const actions = [
      { label: "Clôturer la journée", primary: true, onclick: "AICEO._closeDay()" },
      { label: "Voir les tâches de demain", onclick: "location.href='taches.html'" }
    ];

    A.openDrawer({
      eyebrow: "Bilan du jour",
      title: "Fin de journée sereine",
      meta: [],
      related: []
    });
    // Rerender drawer body with custom content
    const dr = document.getElementById("drawer");
    if (dr){
      dr.querySelector(".drawer-body").innerHTML = `
        <div class="drawer-section">
          <div class="drawer-section-label">Ce que vous avez fait</div>
          <div class="end-of-day-stats">
            <div class="end-of-day-stat"><div class="n">${doneToday}</div><div class="l">Soldées</div></div>
            <div class="end-of-day-stat"><div class="n">${streak}</div><div class="l">Jours de suite</div></div>
            <div class="end-of-day-stat"><div class="n">${remainingToday}</div><div class="l">Reste aujourd'hui</div></div>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-label">Ce qui attendra demain (sans culpabilité)</div>
          <div class="drawer-source-card">
            <div class="body" style="border-top:none;padding-top:0">
              ${tomorrow > 0 ? `<strong>${tomorrow} tâche${tomorrow>1?"s":""}</strong> sont calées pour demain.` : "Aucune tâche flaguée pour demain — bonne soirée."}
              ${overdue > 0 ? `<br>${overdue} en retard peuvent glisser d'un jour si besoin.` : ""}
            </div>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-label">Le mot du copilote</div>
          <div class="end-of-day-coach">${A.escHtml(coach)}</div>
        </div>
        <div class="drawer-section">
          <div class="drawer-source-actions" style="gap:8px">
            ${actions.map(a => `<button class="btn${a.primary?" primary":""} sm" onclick="${a.onclick}">${A.escHtml(a.label)}</button>`).join("")}
          </div>
        </div>
      `;
    }
  };
  A._closeDay = function(){
    A.setStorePath("gamif.lastCloseDay", A.todayISO());
    A.closeDrawer();
    setTimeout(() => A.celebrate("Journée clôturée ✨", "success"), 150);
  };

})();
