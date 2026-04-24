/* aiCEO Platform — Shell & utilities
   - Render sidebar navigation (active item from data-page on <body>)
   - Render topbar breadcrumbs
   - localStorage for interactive state (task done/starred, etc.)
   - Helpers: formatDate, formatTime, companyChip, priorityBadge, etc.
*/

(function() {
  const A = window.AICEO || {};

  /* ───────── localStorage store ───────── */
  const STORE_KEY = "aiCEO.store.v1";
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch(e) { return {}; }
  }
  function saveStore(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }
  A.store = loadStore();
  A.taskState = function(id) {
    const s = A.store.tasks || {};
    return s[id] || {};
  };
  A.updateTask = function(id, patch) {
    A.store.tasks = A.store.tasks || {};
    A.store.tasks[id] = { ...(A.store.tasks[id]||{}), ...patch };
    saveStore(A.store);
  };
  A.resetStore = function() { localStorage.removeItem(STORE_KEY); A.store = {}; };

  /* Decorate tasks with persisted state */
  A.getTasks = function() {
    return (A.TASKS || []).map(t => {
      const st = A.taskState(t.id);
      return { ...t, done: st.done ?? t.done, starred: st.starred ?? t.starred };
    });
  };

  /* ───────── Formatting helpers ───────── */
  const WD = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const WDFULL = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const MO = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  const MOFULL = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

  A.parseDate = s => s instanceof Date ? s : new Date(s);
  A.fmtDate = s => {
    const d = A.parseDate(s);
    return `${d.getDate()} ${MO[d.getMonth()]}`;
  };
  A.fmtDateLong = s => {
    const d = A.parseDate(s);
    return `${WDFULL[d.getDay()]} ${d.getDate()} ${MOFULL[d.getMonth()]}`;
  };
  A.fmtTime = s => {
    const d = A.parseDate(s);
    return d.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", hour12:false });
  };
  A.isSameDay = (a, b) => {
    a = A.parseDate(a); b = A.parseDate(b);
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  };
  A.isoDay = s => {
    const d = A.parseDate(s);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  A.escHtml = s => String(s||"").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));

  /* ───────── Reusable components (return HTML strings) ───────── */
  A.companyChip = code => {
    const c = A.COMPANIES[code];
    if (!c) return "";
    return `<span class="company-chip c-${code}" title="${A.escHtml(c.full)}">${code}</span>`;
  };
  A.companyChips = codes => (codes||[]).map(A.companyChip).join(" ");
  A.priorityBadge = p => {
    const d = A.PRIORITY_BADGE[p];
    if (!d) return "";
    return `<span class="badge ${d.cls}">${d.label}</span>`;
  };
  A.statusBadge = s => {
    const d = A.STATUS_BADGE[s];
    if (!d) return "";
    return `<span class="badge ${d.cls}">${d.label}</span>`;
  };

  A.taskRow = (t, opts={}) => {
    const p = (A.PROJECTS || []).find(x => x.id === t.project);
    const proj = p ? `<a href="${opts.rel||""}projets/${p.id}.html">${A.escHtml(p.name.split("—")[0].trim())}</a>` : "<span class='muted'>Sans projet</span>";
    const due = t.due ? `<span class="${t.overdue && !t.done ? "strong" : ""}" style="color:${t.overdue && !t.done ? 'var(--rose)' : 'var(--text-2)'}">${A.fmtDate(t.due)}</span>` : "";
    return `
      <div class="task ${t.done?"done":""}" data-task-id="${t.id}">
        <button type="button" class="task-check" role="checkbox" aria-checked="${t.done?"true":"false"}" aria-label="${t.done?"Marquer comme à faire":"Marquer comme soldée"}" onclick="window.AICEO.toggleTask('${t.id}','done')" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();window.AICEO.toggleTask('${t.id}','done');}"></button>
        <div class="task-body">
          <div class="task-text">${A.escHtml(t.text)}</div>
          <div class="task-meta">
            ${A.companyChips(t.companies)}
            <span class="dot"></span>${proj}
            ${due ? `<span class="dot"></span>${due}` : ""}
            ${t.meta ? `<span class="dot"></span>${A.escHtml(t.meta)}` : ""}
            ${t.priority && t.priority !== "low" ? `<span class="dot"></span>${A.priorityBadge(t.priority)}` : ""}
          </div>
        </div>
        <button type="button" class="task-star-btn" aria-label="${t.starred?"Retirer des Vital Few":"Ajouter aux Vital Few"}" aria-pressed="${t.starred?"true":"false"}" onclick="window.AICEO.toggleTask('${t.id}','starred')">
          <svg class="task-star ${t.starred?"starred":""}" viewBox="0 0 24 24" fill="${t.starred?"currentColor":"none"}" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>`;
  };

  A.toggleTask = function(id, field) {
    const current = A.taskState(id);
    const base = (A.TASKS || []).find(t => t.id === id) || {};
    const val = !(current[field] ?? base[field] ?? false);
    A.updateTask(id, { [field]: val });
    // Re-render: find all occurrences of this task in DOM and update
    document.querySelectorAll(`[data-task-id="${id}"]`).forEach(el => {
      if (field === "done") {
        el.classList.toggle("done", val);
        const chk = el.querySelector(".task-check");
        if (chk) {
          chk.setAttribute("aria-checked", val ? "true" : "false");
          chk.setAttribute("aria-label", val ? "Marquer comme à faire" : "Marquer comme soldée");
        }
      }
      if (field === "starred") {
        const star = el.querySelector(".task-star");
        if (star) {
          star.classList.toggle("starred", val);
          star.setAttribute("fill", val ? "currentColor" : "none");
        }
        const btn = el.querySelector(".task-star-btn");
        if (btn) {
          btn.setAttribute("aria-pressed", val ? "true" : "false");
          btn.setAttribute("aria-label", val ? "Retirer des Vital Few" : "Ajouter aux Vital Few");
        }
      }
    });
    // Also refresh computed KPIs if present
    if (typeof window.refreshKpis === "function") window.refreshKpis();
    // Toast feedback
    if (A.showToast) {
      if (field === "done") A.showToast(val ? "✓ Tâche soldée" : "Tâche rouverte", val ? "success" : "");
      else if (field === "starred") A.showToast(val ? "★ Ajoutée aux Vital Few" : "Retirée des Vital Few", val ? "warn" : "");
    }
  };

  /* ───────── Shell rendering ───────── */
  const NAV_ICONS = {
    dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    tasks:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    decisions:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    reviews:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    agenda:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    contacts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    search:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    menu:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  };

  A.renderShell = function({ page, title, breadcrumb, rel="" }) {
    const tasks = A.getTasks();
    const openTasks = tasks.filter(t => !t.done && t.type !== "drop").length;
    const overdueTasks = tasks.filter(t => !t.done && t.overdue).length;
    const projectsCount = (A.PROJECTS||[]).length;

    // Sidebar
    const sidebar = `
      <aside class="sidebar" role="navigation" aria-label="Navigation principale">
        <a class="brand" href="${rel}index.html" style="text-decoration:none;color:inherit">
          <div class="brand-logo">Ai</div>
          <div>
            <div class="brand-title">aiCEO</div>
            <div class="brand-sub">Pilotage</div>
          </div>
        </a>

        <div class="nav-group">
          <div class="nav-group-title">Vue d'ensemble</div>
          <a class="nav-item ${page==='dashboard'?'active':''}" href="${rel}index.html">
            <span class="ico">${NAV_ICONS.dashboard}</span>Dashboard
          </a>
          <a class="nav-item ${page==='agenda'?'active':''}" href="${rel}agenda.html">
            <span class="ico">${NAV_ICONS.agenda}</span>Agenda
          </a>
        </div>

        <div class="nav-group">
          <div class="nav-group-title">Pilotage</div>
          <a class="nav-item ${page==='projects'?'active':''}" href="${rel}projets.html">
            <span class="ico">${NAV_ICONS.projects}</span>Projets<span class="count">${projectsCount}</span>
          </a>
          <a class="nav-item ${page==='tasks'?'active':''}" href="${rel}taches.html">
            <span class="ico">${NAV_ICONS.tasks}</span>Tâches${overdueTasks?`<span class="count" style="background:var(--rose);color:white">${openTasks}</span>`:`<span class="count">${openTasks}</span>`}
          </a>
          <a class="nav-item ${page==='decisions'?'active':''}" href="${rel}decisions.html">
            <span class="ico">${NAV_ICONS.decisions}</span>Décisions<span class="count">${(A.DECISIONS||[]).length}</span>
          </a>
          <a class="nav-item ${page==='contacts'?'active':''}" href="${rel}contacts.html">
            <span class="ico">${NAV_ICONS.contacts}</span>Contacts<span class="count">${(A.CONTACTS||[]).length}</span>
          </a>
        </div>

        <div class="nav-group">
          <div class="nav-group-title">Revues</div>
          <a class="nav-item ${page==='reviews'?'active':''}" href="${rel}revues/index.html">
            <span class="ico">${NAV_ICONS.reviews}</span>Revues hebdo
          </a>
        </div>
      </aside>`;

    // Topbar
    const crumbs = (breadcrumb || [{label:title}]).map((c, i, arr) => {
      const last = i === arr.length - 1;
      if (last) return `<span class="current">${A.escHtml(c.label)}</span>`;
      const a = c.href ? `<a href="${c.href}">${A.escHtml(c.label)}</a>` : A.escHtml(c.label);
      return `${a}<span class="sep">›</span>`;
    }).join("");
    const now = new Date();
    const topbar = `
      <header class="topbar">
        <button class="hamburger" aria-label="Ouvrir le menu" onclick="window.AICEO.toggleSidebar()">
          <span class="ico">${NAV_ICONS.menu}</span>
        </button>
        <div class="crumbs">${crumbs}</div>
        <div class="topbar-actions">
          <button class="palette-btn" aria-label="Rechercher (Ctrl+K)" onclick="window.AICEO.openPalette()">
            <span class="ico">${NAV_ICONS.search}</span>
            <span class="palette-btn-label">Rechercher…</span>
            <kbd class="palette-kbd">⌘K</kbd>
          </button>
          <span class="pill hide-sm">Semaine ${isoWeek(now)}</span>
          <span class="pill hide-sm" style="background:var(--brand-50);color:var(--brand)">${A.fmtDateLong(now)}</span>
        </div>
      </header>`;

    return { sidebar, topbar };
  };

  function isoWeek(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  }

  A.mount = function(opts) {
    const el = document.getElementById("app-root");
    if (!el) return;
    document.body.dataset.rel = opts.rel || "";
    const { sidebar, topbar } = A.renderShell(opts);
    el.innerHTML = `
      <a href="#page-content" class="skip-link">Aller au contenu principal</a>
      <div class="app">
        ${sidebar}
        <div class="sidebar-backdrop" onclick="window.AICEO.toggleSidebar(false)" aria-hidden="true"></div>
        <div class="main">
          ${topbar}
          <main class="page" id="page-content" tabindex="-1" role="main" aria-label="${A.escHtml(opts.title || "Contenu")}">${opts.content || ""}</main>
        </div>
        <div class="toast-wrap" id="toast-wrap" aria-live="polite"></div>
        <div class="palette-backdrop" id="palette-backdrop" onclick="window.AICEO.closePalette()"></div>
        <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Recherche globale">
          <div class="palette-input-wrap">
            <span class="ico">${NAV_ICONS.search}</span>
            <input class="palette-input" id="palette-input" type="text" placeholder="Rechercher un projet, une tâche, un contact, une décision…" autocomplete="off"/>
            <kbd class="palette-kbd">ESC</kbd>
          </div>
          <div class="palette-results" id="palette-results"></div>
        </div>
      </div>`;
    A._installShortcuts();
    if (opts.onMounted) opts.onMounted();
  };

  /* ───────── Sidebar toggle (mobile) ───────── */
  A.toggleSidebar = function(force) {
    const sb = document.querySelector(".sidebar");
    const bd = document.querySelector(".sidebar-backdrop");
    if (!sb) return;
    const open = typeof force === "boolean" ? force : !sb.classList.contains("open");
    sb.classList.toggle("open", open);
    if (bd) bd.classList.toggle("open", open);
  };

  /* ───────── Toast (feedback léger) ───────── */
  A.showToast = function(message, variant) {
    const wrap = document.getElementById("toast-wrap");
    if (!wrap) return;
    const t = document.createElement("div");
    t.className = "toast " + (variant || "");
    t.textContent = message;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add("leaving"); }, 2200);
    setTimeout(() => { t.remove(); }, 2800);
  };

  /* ───────── Command palette (⌘K) ───────── */
  A._paletteSelection = 0;
  A._paletteItems = [];

  A.openPalette = function() {
    const p = document.getElementById("palette");
    const bd = document.getElementById("palette-backdrop");
    const input = document.getElementById("palette-input");
    if (!p || !input) return;
    p.classList.add("open");
    if (bd) bd.classList.add("open");
    input.value = "";
    A._paletteSelection = 0;
    A._renderPaletteResults("");
    setTimeout(() => input.focus(), 30);
    input.removeEventListener("input", A._paletteOnInput);
    input.removeEventListener("keydown", A._paletteKeydown);
    A._paletteOnInput = (e) => { A._paletteSelection = 0; A._renderPaletteResults(e.target.value); };
    input.addEventListener("input", A._paletteOnInput);
    input.addEventListener("keydown", A._paletteKeydown);
  };

  A.closePalette = function() {
    const p = document.getElementById("palette");
    const bd = document.getElementById("palette-backdrop");
    if (p) p.classList.remove("open");
    if (bd) bd.classList.remove("open");
  };

  A._paletteKeydown = function(e) {
    if (e.key === "Escape") { e.preventDefault(); A.closePalette(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      A._paletteSelection = Math.min(A._paletteSelection + 1, Math.max(0, A._paletteItems.length - 1));
      A._updatePaletteSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      A._paletteSelection = Math.max(0, A._paletteSelection - 1);
      A._updatePaletteSelection();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = A._paletteItems[A._paletteSelection];
      if (it && it.href) { window.location.href = it.href; }
    }
  };

  A._updatePaletteSelection = function() {
    const nodes = document.querySelectorAll(".palette-item");
    nodes.forEach((n, i) => n.classList.toggle("selected", i === A._paletteSelection));
    const active = nodes[A._paletteSelection];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
  };

  A._renderPaletteResults = function(query) {
    const box = document.getElementById("palette-results");
    if (!box) return;
    const q = (query || "").trim().toLowerCase();
    const rel = document.body.dataset.rel || "";
    const items = [];

    // Pages / raccourcis
    const PAGES = [
      { label: "Dashboard", href: rel + "index.html", icon: NAV_ICONS.dashboard, group: "Pages" },
      { label: "Agenda", href: rel + "agenda.html", icon: NAV_ICONS.agenda, group: "Pages" },
      { label: "Projets", href: rel + "projets.html", icon: NAV_ICONS.projects, group: "Pages" },
      { label: "Tâches", href: rel + "taches.html", icon: NAV_ICONS.tasks, group: "Pages" },
      { label: "Décisions", href: rel + "decisions.html", icon: NAV_ICONS.decisions, group: "Pages" },
      { label: "Contacts", href: rel + "contacts.html", icon: NAV_ICONS.contacts, group: "Pages" },
      { label: "Revues hebdo", href: rel + "revues/index.html", icon: NAV_ICONS.reviews, group: "Pages" },
    ];
    PAGES.forEach(it => {
      if (!q || it.label.toLowerCase().includes(q)) items.push(it);
    });

    // Projets
    (A.PROJECTS || []).forEach(p => {
      const hay = (p.name + " " + (p.phase||"") + " " + p.id).toLowerCase();
      if (!q || hay.includes(q)) {
        items.push({
          label: p.name.split("—")[0].trim(),
          sub: p.phase || "",
          href: rel + "projets/" + p.id + ".html",
          icon: p.icon || "📁",
          group: "Projets",
          isEmoji: true,
        });
      }
    });

    // Tâches (max 6)
    const tasks = (A.getTasks() || []).filter(t => !t.done);
    let tcount = 0;
    tasks.forEach(t => {
      if (tcount >= 6 && q.length < 2) return;
      const hay = (t.text + " " + (t.meta||"") + " " + (t.project||"")).toLowerCase();
      if (!q || hay.includes(q)) {
        items.push({
          label: t.text,
          sub: t.project ? ((A.PROJECTS||[]).find(p=>p.id===t.project)?.name.split("—")[0].trim() || "") : "",
          href: rel + "taches.html#" + t.id,
          icon: NAV_ICONS.tasks,
          group: "Tâches",
        });
        tcount++;
      }
    });

    // Contacts
    (A.CONTACTS || []).forEach(c => {
      const hay = (c.name + " " + (c.role||"") + " " + (c.org||"") + " " + (c.email||"")).toLowerCase();
      if (!q || hay.includes(q)) {
        items.push({
          label: c.name,
          sub: [c.role, c.org].filter(Boolean).join(" · "),
          href: rel + "contacts.html#" + c.id,
          icon: NAV_ICONS.contacts,
          group: "Contacts",
        });
      }
    });

    // Décisions (max 5)
    (A.DECISIONS || []).slice(0, 30).forEach(d => {
      const label = d.title || d.text || d.label || "";
      const hay = (label + " " + (d.project||"")).toLowerCase();
      if (!q) return;
      if (hay.includes(q)) {
        items.push({
          label: label,
          sub: d.date || "",
          href: rel + "decisions.html",
          icon: NAV_ICONS.decisions,
          group: "Décisions",
        });
      }
    });

    A._paletteItems = items.slice(0, 50);
    if (A._paletteItems.length === 0) {
      box.innerHTML = '<div class="palette-empty">Aucun résultat pour « ' + A.escHtml(query) + ' »</div>';
      return;
    }

    const groups = {};
    A._paletteItems.forEach((it, idx) => {
      if (!groups[it.group]) groups[it.group] = [];
      groups[it.group].push({ ...it, idx });
    });

    let html = "";
    Object.keys(groups).forEach(g => {
      html += '<div class="palette-group-title">' + A.escHtml(g) + '</div>';
      groups[g].forEach(it => {
        const iconHtml = it.isEmoji
          ? '<span class="palette-item-icon emoji">' + A.escHtml(it.icon) + '</span>'
          : '<span class="palette-item-icon"><span class="ico">' + it.icon + '</span></span>';
        html += '<a class="palette-item" href="' + A.escHtml(it.href || "#") + '" data-idx="' + it.idx + '">'
             + iconHtml
             + '<div class="palette-item-body">'
             + '<div class="palette-item-label">' + A.escHtml(it.label) + '</div>'
             + (it.sub ? '<div class="palette-item-sub">' + A.escHtml(it.sub) + '</div>' : '')
             + '</div>'
             + '</a>';
      });
    });
    box.innerHTML = html;
    A._updatePaletteSelection();
  };

  A._installShortcuts = function() {
    if (A._shortcutsInstalled) return;
    A._shortcutsInstalled = true;
    document.addEventListener("keydown", (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        const p = document.getElementById("palette");
        if (p && p.classList.contains("open")) A.closePalette(); else A.openPalette();
      } else if (e.key === "Escape") {
        const p = document.getElementById("palette");
        if (p && p.classList.contains("open")) A.closePalette();
        const sb = document.querySelector(".sidebar.open");
        if (sb) A.toggleSidebar(false);
      }
    });
  };

})();
