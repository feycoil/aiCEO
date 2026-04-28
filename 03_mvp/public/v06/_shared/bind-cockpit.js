/* bind-cockpit.js v3.1 — Branchement APIs + CTA "Commencer l'arbitrage" */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  async function tryJson(url) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  async function bindGreeting() {
    applyGreeting();
    document.addEventListener('aiceo:user-loaded', applyGreeting);
  }
  function applyGreeting() {
    const u = window.AICEO_USER || window.AICEO_CONFIG || {};
    const userName = u.firstName || u.userName;
    if (!userName) return;
    const accents = $$('.greeting.hero .accent, .hero-greeting h1 .accent, .greeting .accent');
    accents.forEach(a => { a.textContent = userName; });
    $$('.greeting.hero, .hero-greeting h1').forEach(h => {
      if (!h.querySelector('.accent')) {
        h.innerHTML = h.innerHTML.replace(/Bonjour\s+\S+/i, 'Bonjour <span class="accent">' + userName + '</span>');
      }
    });
  }

  async function bindIntention() {
    const data = await tryJson('/api/cockpit/today');
    if (!data) return;
    const lead = $('.hero-greeting .lead');
    if (lead && data.intention && data.intention.trim()) {
      lead.innerHTML = '<strong>' + escHtml(data.intention) + '</strong>';
    }
    return data;
  }

  async function bindTop3() {
    const data = await tryJson('/api/tasks?done=false&limit=3');
    if (!data || !data.tasks || data.tasks.length === 0) return;
    const list = $('.top3-list');
    if (!list) return;
    list.innerHTML = data.tasks.map((t, i) => {
      const rank = String(i + 1).padStart(2, '0');
      const prio = (t.priority || '').toLowerCase();
      const prioPill = prio ? '<span class="pill priority ' + prio + '">' + prio.toUpperCase() + '</span>' : '';
      const dueClock = t.due_at ?
        '<span class="pill outline sm"><svg class="ico" width="11" height="11"><use href="#i-clock"/></svg>' +
        escHtml(t.due_at.slice(0, 10)) + '</span>' : '';
      return [
        '<li class="top3-row" data-task-id="' + escHtml(t.id) + '">',
          '<span class="top3-rank">' + rank + '</span>',
          '<div class="top3-main">',
            '<h3 class="top3-title">' + escHtml(t.title || '(sans titre)') + '</h3>',
            t.description ? '<p class="top3-sub">' + escHtml(t.description) + '</p>' : '<p class="top3-sub">&nbsp;</p>',
            '<div class="o-cluster" style="gap:8px;margin-top:8px">',
              prioPill, dueClock,
            '</div>',
          '</div>',
          '<a href="/v06/taches.html" class="btn primary sm" style="text-decoration:none">Ouvrir</a>',
        '</li>'
      ].join('');
    }).join('');
  }

  async function bindProjects() {
    const houses = $('.projects-houses');
    if (!houses) return;

    const data = await tryJson('/api/projects?limit=20');
    const projects = (data && data.projects) || [];

    if (projects.length === 0) {
      // Empty state
      houses.innerHTML = '<div class="aiceo-empty-houses" style="grid-column:1/-1;padding:36px 24px;text-align:center;color:var(--text-3,#888);background:var(--surface-2,#fff);border-radius:12px">' +
        '<p style="margin:0 0 8px;font-size:14px;font-weight:500">Aucun projet actif</p>' +
        '<p style="margin:0 0 16px;font-size:13px">Vos projets apparaitront ici apres un arbitrage matin.</p>' +
        '<a href="/v06/projets.html" class="btn ghost sm" style="text-decoration:none">Voir tous les projets</a>' +
        '</div>';
      houses.style.display = 'grid';
      houses.style.gridTemplateColumns = '1fr';
      return;
    }

    // Rendu en grille simple : top 12 projets tries par status puis volume
    const top = projects
      .slice(0, 12)
      .sort((a, b) => {
        const order = { hot: 0, active: 1, new: 2, suspended: 3, archived: 4 };
        return (order[a.status] || 9) - (order[b.status] || 9);
      });

    const cards = top.map(p => {
      const status = p.status || 'active';
      const desc = p.description || p.tagline || '';
      // Extraire compteur emails depuis description "X email(s) sur 30 jours..."
      const emailMatch = desc.match(/^(\d+)\s+email/);
      const count = emailMatch ? emailMatch[1] : '';
      return [
        '<a href="projet.html?id=' + encodeURIComponent(p.id) + '" class="proj-card" data-project-id="' + p.id + '" data-status="' + status + '" style="display:flex;flex-direction:column;gap:6px;padding:14px 16px;background:var(--surface-2,#fff);border-radius:12px;text-decoration:none;color:inherit;border:1px solid var(--border,#eaeaea);transition:all 0.15s;min-height:90px">',
          '<header style="display:flex;align-items:center;justify-content:space-between;gap:8px">',
            '<span class="proj-card-state status-' + status + '" style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text-3,#888);letter-spacing:0.05em">' + status + '</span>',
            count ? '<span class="pill outline" style="font-size:10px;padding:2px 6px;border-radius:99px;background:var(--surface-3,#f0eee9);color:var(--text-2,#555);font-weight:600">' + count + ' mails</span>' : '',
          '</header>',
          '<h3 style="margin:0;font-size:14px;font-weight:600;color:var(--text,#111);line-height:1.3">' + escHtml(p.name || '(sans nom)') + '</h3>',
          (p.tagline ? '<p style="margin:0;font-size:12px;color:var(--text-3,#888);line-height:1.35">' + escHtml(p.tagline.slice(0, 60)) + '</p>' : ''),
        '</a>'
      ].join('');
    }).join('');

    houses.innerHTML = cards;
    houses.style.display = 'grid';
    houses.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
    houses.style.gap = '12px';
  }

  async function bindKPIs() {
    // Fetch en parallele les compteurs reels
    const [projR, tasksR, decsR, contR] = await Promise.all([
      tryJson('/api/projects?limit=100'),
      tryJson('/api/tasks?done=false&limit=100'),
      tryJson('/api/decisions?status=ouverte&limit=100'),
      tryJson('/api/contacts?limit=100')
    ]);

    const counts = {
      projects: ((projR && projR.projects) || []).length,
      projectsActive: ((projR && projR.projects) || []).filter(p => ['active','hot','new'].includes((p.status||'').toLowerCase())).length,
      tasks: ((tasksR && tasksR.tasks) || []).length,
      decisions: ((decsR && decsR.decisions) || []).length,
      contacts: ((contR && contR.contacts) || []).length
    };

    // KPI 1 — Tension active (rose) : décisions ouvertes
    const k1 = $('.kpi.tinted.rose .kpi-value');
    const k1s = $('.kpi.tinted.rose .kpi-sub');
    if (k1) k1.innerHTML = String(counts.decisions);
    if (k1s) k1s.textContent = counts.decisions === 0 ? 'aucune decision en attente' :
      (counts.decisions === 1 ? '1 decision a arbitrer' : counts.decisions + ' decisions a arbitrer');

    // KPI 2 — Cadence projets (emerald) : projets actifs
    const k2 = $('.kpi.tinted.emerald .kpi-value');
    const k2s = $('.kpi.tinted.emerald .kpi-sub');
    if (k2) k2.innerHTML = String(counts.projectsActive) +
      (counts.projects > counts.projectsActive ? '<span style="font-size:18px;color:var(--text-3);font-weight:var(--fw-medium);"> / ' + counts.projects + '</span>' : '');
    if (k2s) k2s.textContent = counts.projects === 0 ? 'aucun projet en cours' :
      (counts.projectsActive === 1 ? '1 projet actif' : counts.projectsActive + ' projets actifs');

    // KPI 3 — Capital equipe (sky) : nb contacts
    const k3 = $('.kpi.tinted.sky .kpi-value');
    const k3s = $('.kpi.tinted.sky .kpi-sub');
    if (k3) k3.innerHTML = String(counts.contacts);
    if (k3s) k3s.textContent = counts.contacts === 0 ? 'aucun contact' :
      (counts.contacts === 1 ? '1 contact suivi' : counts.contacts + ' contacts dans votre reseau');

    // KPI 4 — Coaching (violet) : preview v0.8 (on neutralise)
    const k4 = $('.kpi.tinted.violet .kpi-value');
    const k4s = $('.kpi.tinted.violet .kpi-sub');
    if (k4) k4.innerHTML = '<span style="color:var(--text-3,#888);font-weight:600;font-size:24px">—</span>';
    if (k4s) k4s.innerHTML = 'disponible en <strong>v0.8</strong>';
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function applyArbitrageSkippedUi() {
    const stored = (function(){ try { return localStorage.getItem('aiCEO.uiPrefs.arbitrageSkipped'); } catch(e) { return null; } })();
    if (stored !== todayKey()) return;
    const ctaBtns = $$('.hero-greeting button, section.hero button, .card.hero button');
    ctaBtns.forEach(b => {
      const t = (b.textContent || '').toLowerCase();
      if (t.includes('ouvrir l') || t.includes('plus tard') || t.includes('arbitrage')) {
        const cluster = b.closest('.o-cluster, .hero-actions, .cta-row') || b.parentElement;
        if (cluster) cluster.style.display = 'none';
      }
    });
    const heroCard = $('.card.hero, section.hero, .hero-greeting');
    const heroBody = heroCard ? (heroCard.querySelector('.hero-greeting') || heroCard) : null;
    if (heroBody && !document.getElementById('aiceo-arb-skip-msg')) {
      const msg = document.createElement('p');
      msg.id = 'aiceo-arb-skip-msg';
      msg.style.cssText = 'margin-top:24px;color:var(--text-3,#666);font-size:14px;font-style:normal;font-weight:500';
      msg.innerHTML = '✓ Arbitrage différé pour aujourd\'hui. <a href="/v06/arbitrage.html" style="color:var(--text,#111);text-decoration:underline;font-weight:600">Le faire maintenant</a> →';
      heroBody.appendChild(msg);
    }
  }

  function bindPlusTard() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, a');
      if (!btn) return;
      const text = (btn.textContent || '').trim().toLowerCase();
      if (text !== 'plus tard' && !text.startsWith('plus tard')) return;
      if (btn.closest('.hero-greeting, section.hero, .card.hero')) {
        e.preventDefault();
        e.stopPropagation();
        try { localStorage.setItem('aiCEO.uiPrefs.arbitrageSkipped', todayKey()); } catch(err) {}
        if (window.AICEOShell) window.AICEOShell.showToast('Arbitrage différé · À tout moment dans la journée 🌿', 'info');
        applyArbitrageSkippedUi();
        return;
      }
      if (btn.closest('.posture-card, .card.posture, [class*="coaching-strip"]')) {
        try { localStorage.setItem('aiCEO.uiPrefs.coachingDeferred', todayKey()); } catch(err) {}
        if (window.AICEOShell) window.AICEOShell.showToast('Question reportée à demain', 'info');
        const card = btn.closest('.posture-card, .card.posture');
        if (card) card.style.display = 'none';
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  function bindCockpitToggles() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn, [role="tab"]');
      if (!btn) return;
      const group = btn.closest('.toggle-group, [role="tablist"]');
      if (!group) return;
      e.preventDefault();
      group.querySelectorAll('.toggle-btn, [role="tab"]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const mode = (btn.textContent || '').toLowerCase().trim();
      const cols = $$('.house-col');
      cols.forEach(col => {
        if (mode === 'tous') col.style.display = '';
        else if (mode === 'à risque' || mode === 'a risque') {
          const hasRisk = !!col.querySelector('.pill.status.hot, .pill.status.alert');
          col.style.display = hasRisk ? '' : 'none';
        } else col.style.display = '';
      });
      if (window.AICEOShell) window.AICEOShell.showToast('Vue : ' + mode, 'info');
    });
  }

  function showArbModal(state, proposals, message) {
    // Fermer tout modal existant
    const existing = document.getElementById('aiceo-arb-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'aiceo-arb-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)';

    let content = '';
    if (state === 'loading') {
      content = [
        '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700">⧼ Analyse en cours…</h2>',
        '<p style="margin:0 0 24px;font-size:14px;color:var(--text-3,#888);line-height:1.5">aiCEO scanne vos derniers échanges Outlook pour identifier les actions, projets et décisions à arbitrer.</p>',
        '<div style="height:4px;background:var(--surface-3,#ebe7df);border-radius:99px;overflow:hidden;margin-bottom:8px"><div style="height:100%;width:35%;background:var(--accent,#e35a3a);border-radius:99px;animation:aiceo-arb-loader 1.4s ease-in-out infinite"></div></div>',
        '<style>@keyframes aiceo-arb-loader { 0%{margin-left:-35%}100%{margin-left:100%} }</style>'
      ].join('');
    } else if (state === 'results' && proposals && proposals.length > 0) {
      const itemsHTML = proposals.slice(0, 5).map((p, i) => [
        '<div style="display:flex;gap:12px;padding:12px;background:var(--surface,#faf8f3);border-radius:10px;margin-bottom:8px">',
          '<span style="background:var(--surface-3,#ebe7df);color:var(--text-2,#555);font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;align-self:flex-start;flex-shrink:0">' + (p.kind||'task') + '</span>',
          '<div style="flex:1">',
            '<div style="font-size:14px;font-weight:600;margin-bottom:4px">' + escHtml(p.title||'Sans titre') + '</div>',
            '<p style="margin:0;font-size:12px;color:var(--text-3,#888);line-height:1.4">' + escHtml((p.excerpt||'').slice(0,140)) + '…</p>',
          '</div>',
        '</div>'
      ].join('')).join('');

      content = [
        '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700">✉️ ' + proposals.length + ' actions identifiées</h2>',
        '<p style="margin:0 0 16px;font-size:14px;color:var(--text-3,#888)">Voici les ' + Math.min(5, proposals.length) + ' premières propositions issues de vos emails :</p>',
        '<div style="max-height:300px;overflow-y:auto;margin-bottom:20px">' + itemsHTML + '</div>',
        '<div style="display:flex;gap:10px;justify-content:flex-end">',
          '<button data-arb-close class="btn ghost">Fermer</button>',
          '<button data-arb-go class="btn primary">Ouvrir la file d\'arbitrage →</button>',
        '</div>'
      ].join('');
    } else if (state === 'empty') {
      content = [
        '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700">📬 Aucune action identifiée</h2>',
        '<p style="margin:0 0 16px;font-size:14px;color:var(--text-3,#888);line-height:1.5">' + (message || 'Aucun email n\'a encore été synchronisé. Lancez la sync Outlook manuellement pour peupler vos données.') + '</p>',
        '<div style="background:var(--surface,#faf8f3);padding:14px 18px;border-radius:10px;font-family:monospace;font-size:12px;margin-bottom:20px">cd C:\\_workarea_local\\aiCEO\\03_mvp<br>pwsh -File scripts\\sync-outlook.ps1</div>',
        '<div style="display:flex;gap:10px;justify-content:flex-end">',
          '<button data-arb-close class="btn ghost">Fermer</button>',
          '<a href="/v06/aide.html" class="btn primary" style="text-decoration:none">Voir le guide d\'aide →</a>',
        '</div>'
      ].join('');
    } else if (state === 'error') {
      content = [
        '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:var(--rose,#d94a3d)">⚠ Erreur</h2>',
        '<p style="margin:0 0 16px;font-size:14px;color:var(--text-3,#888)">L\'analyse n\'a pas pu aboutir : <strong>' + escHtml(message||'erreur inconnue') + '</strong></p>',
        '<p style="margin:0 0 16px;font-size:13px;color:var(--text-3,#888)">Vérifiez que le serveur est démarré (port 4747) et que la base SQLite est accessible.</p>',
        '<div style="display:flex;gap:10px;justify-content:flex-end">',
          '<button data-arb-close class="btn ghost">Fermer</button>',
        '</div>'
      ].join('');
    }

    overlay.innerHTML = '<div style="background:var(--surface-2,#fff);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-width:560px;width:100%;padding:32px 28px;animation:aiceo-arb-pop .2s ease-out"><style>@keyframes aiceo-arb-pop { from { opacity:0; transform:translateY(10px) scale(.96) } to { opacity:1; transform:translateY(0) scale(1) } }</style>' + content + '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-arb-close]')) {
        overlay.remove();
        return;
      }
      if (e.target.closest('[data-arb-go]')) {
        overlay.remove();
        location.href = '/v06/arbitrage.html?source=emails';
      }
    });
  }

  async function applyArbitrageState() {
    const heroCard = $('.card.hero');
    if (!heroCard) return;

    const decsR = await tryJson('/api/decisions?status=ouverte');
    const decsCount = (decsR && (decsR.decisions || decsR) || []).length;
    if (decsCount > 0) return;

    // Cacher les CTAs originaux (Ouvrir l'arbitrage, Plus tard)
    Array.from(heroCard.querySelectorAll('button, a')).forEach(b => {
      const t = (b.textContent||'').toLowerCase();
      if (/ouvrir l['’]arbitrage/i.test(t) || /^plus tard\b/i.test(t.trim())) {
        b.style.display = 'none';
      }
    });

    // Trouver le cluster CTAs
    const cluster = heroCard.querySelector('.o-cluster.u-mt-6, .o-cluster:last-of-type, .hero-greeting .o-cluster:last-child');
    if (!cluster) return;
    if (cluster.querySelector('.aiceo-arb-start-btn')) return;

    // Modifier le lead
    const lead = heroCard.querySelector('.hero-greeting .lead');
    if (lead && !lead.dataset.bound) {
      lead.dataset.bound = '1';
      lead.innerHTML = '<strong>Commençons par analyser vos mails.</strong> aiCEO scanne vos derniers échanges Outlook et propose les actions, projets et décisions à arbitrer.';
      lead.style.color = 'var(--text, #1a1a1a)';
      lead.style.fontStyle = 'normal';
    }

    // Créer le wrap des CTAs
    const wrap = document.createElement('div');
    wrap.className = 'aiceo-empty-cta';
    wrap.style.cssText = 'display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:8px';
    wrap.innerHTML = '<button type="button" data-action="arb-start" onclick="return window.aiceoArbStart && window.aiceoArbStart(event)" class="btn primary lg aiceo-arb-start-btn" style="display:inline-flex;align-items:center;gap:8px;padding:12px 22px;font-size:15px;cursor:pointer"><svg class="ico" width="16" height="16"><use href="#i-arbitrage"/></svg>Commencer l\'arbitrage</button><button type="button" data-action="manual-create" onclick="return window.aiceoManualPicker && window.aiceoManualPicker(event)" class="btn ghost aiceo-manual-btn" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;font-size:14px;cursor:pointer">+ Créer manuellement</button>';
    cluster.appendChild(wrap);

    // Garantir interactivité (event delegation au niveau document, voir bloc en bas du fichier)
    const arbBtn = wrap.querySelector('.aiceo-arb-start-btn');
    if (arbBtn) { arbBtn.disabled = false; arbBtn.style.pointerEvents = 'auto'; }
    const manualBtn = wrap.querySelector('.aiceo-manual-btn');
    if (manualBtn) { manualBtn.disabled = false; manualBtn.style.pointerEvents = 'auto'; }
  }

  function showManualPicker() {
    if (document.getElementById('aiceo-manual-picker')) return;
    const overlay = document.createElement('div');
    overlay.id = 'aiceo-manual-picker';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
    overlay.innerHTML = [
      '<div style="background:var(--surface-2,#fff);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-width:520px;width:100%;padding:32px 28px">',
        '<h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Créer manuellement</h2>',
        '<p style="margin:0 0 20px;font-size:14px;color:var(--text-3,#888)">Que voulez-vous créer en premier ?</p>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">',
          '<button data-create="project" class="btn">Un projet</button>',
          '<button data-create="task" class="btn">Une tâche</button>',
          '<button data-create="decision" class="btn">Une décision</button>',
          '<button data-create="group" class="btn">Une maison</button>',
        '</div>',
        '<div style="margin-top:18px;text-align:right">',
          '<button data-close class="btn ghost" style="font-size:13px">Annuler</button>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      const target = e.target.closest('[data-create], [data-close]');
      if (!target) {
        if (e.target === overlay) overlay.remove();
        return;
      }
      const kind = target.dataset.create;
      overlay.remove();
      if (kind === 'group') {
        location.href = '/v06/settings.html#tab=maisons';
      } else if (kind && window.AICEOCrud) {
        window.AICEOCrud.open(kind);
      } else if (kind) {
        const links = { project: '/v06/projets.html', task: '/v06/taches.html', decision: '/v06/decisions.html' };
        if (links[kind]) location.href = links[kind];
      }
    });
  }

  async function bindCapStrategique() {
    const card = $('.hero-stat-card');
    if (!card) return;

    // Fetch parallele : tasks de la semaine + projets actifs
    const [tasksR, projR, decsR] = await Promise.all([
      tryJson('/api/tasks?limit=200'),
      tryJson('/api/projects?limit=100'),
      tryJson('/api/decisions?limit=100')
    ]);

    const tasks = (tasksR && tasksR.tasks) || [];
    const projects = (projR && projR.projects) || [];
    const decisions = (decsR && decsR.decisions) || [];

    // 1. Ratio attention : tasks done cette semaine / total tasks ouvertes ou done cette semaine
    // Heuristique simple : (decisions tranchees + tasks done) / (decisions total + tasks total) * 100
    const totalActions = tasks.length + decisions.length;
    const doneActions =
      tasks.filter(t => (t.status || '').toLowerCase() === 'done' || t.done === 1).length +
      decisions.filter(d => (d.status || '').toLowerCase() === 'tranchee').length;
    const ratio = totalActions === 0 ? 0 : Math.round((doneActions / totalActions) * 100);

    const valEl = card.querySelector('.stat-hero-value');
    if (valEl) {
      valEl.innerHTML = String(ratio) + '<span class="unit">%</span>';
    }

    const lblEl = card.querySelector('.stat-hero-label');
    if (lblEl) {
      if (totalActions === 0) {
        lblEl.textContent = 'Aucune action enregistree pour le moment.';
      } else {
        lblEl.textContent = doneActions + ' / ' + totalActions + ' actions cloturees cette semaine.';
      }
    }

    // 2. Pill echeance : projet le plus proche (status hot ou avec date proche)
    const pillEl = card.querySelector('.value-pill');
    if (pillEl) {
      const hot = projects.filter(p => (p.status || '').toLowerCase() === 'hot').length;
      if (hot > 0) {
        pillEl.textContent = hot + ' urgent' + (hot > 1 ? 's' : '');
        pillEl.style.background = 'var(--rose-50, #fde6e3)';
        pillEl.style.color = 'var(--rose-700, #9c2920)';
      } else if (projects.length > 0) {
        pillEl.textContent = projects.length + ' projet' + (projects.length > 1 ? 's' : '');
      } else {
        pillEl.textContent = '—';
      }
    }

    // 3. Dot-chart : activite par jour (created_at des tasks/decisions sur 7 jours)
    const dots = card.querySelectorAll('.dot-chart-col');
    if (dots.length === 7) {
      const now = new Date();
      const startOfWeek = new Date(now);
      const dow = (now.getDay() + 6) % 7; // lundi=0
      startOfWeek.setDate(now.getDate() - dow);
      startOfWeek.setHours(0, 0, 0, 0);

      const counts = [0, 0, 0, 0, 0, 0, 0];
      const all = tasks.concat(decisions);
      all.forEach(item => {
        const d = item.created_at;
        if (!d) return;
        const date = new Date(d);
        const diff = Math.floor((date - startOfWeek) / 86400000);
        if (diff >= 0 && diff < 7) counts[diff]++;
      });
      const max = Math.max.apply(null, counts.concat([1]));
      dots.forEach((dot, i) => {
        const h = Math.max(15, Math.round((counts[i] / max) * 100));
        dot.setAttribute('data-h', String(h));
        const stem = dot.querySelector('.stem');
        if (stem) stem.style.height = h + '%';
        dot.classList.toggle('is-peak', counts[i] === max && max > 0);
      });
    }

    // 4. Day-pills : marquer "is-done" pour les jours passes, "is-active" pour aujourd'hui
    const pills = card.querySelectorAll('.day-pill');
    if (pills.length === 7) {
      const todayDow = (new Date().getDay() + 6) % 7;
      pills.forEach((p, i) => {
        p.classList.remove('is-done', 'is-active', 'is-empty');
        if (i < todayDow) p.classList.add('is-done');
        else if (i === todayDow) p.classList.add('is-active');
        // futurs jours laisses neutres
      });
    }
  }

  async function init() {
    document.body.dataset.cockpitState = 'loading';
    bindCockpitToggles();
    bindPlusTard();
    applyArbitrageSkippedUi();
    try {
      await Promise.allSettled([
        bindGreeting(),
        bindIntention(),
        bindTop3(),
        bindProjects(),
        bindKPIs(),
        bindCapStrategique(),
        applyArbitrageState()
      ]);
      document.body.dataset.cockpitState = 'loaded';
    } catch (e) {
      document.body.dataset.cockpitState = 'error';
      console.error('[cockpit-bind v3]', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ════════════════════════════════════════════════════════════
  // Event delegation globale pour les CTAs cockpit
  // (résiste aux re-renders DOM — handler attaché au document)
  // ════════════════════════════════════════════════════════════
  document.addEventListener('click', async (ev) => {
    const arbBtn = ev.target.closest('[data-action="arb-start"]');
    if (arbBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      console.log('[aiCEO] Commencer arbitrage : delegation handler triggered');
      if (typeof showArbModal !== 'undefined') {
        showArbModal('loading');
      } else {
        alert('Modal non chargé');
        return;
      }
      try {
        const r = await fetch('/api/arbitrage/analyze-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
        });
        const data = await r.json().catch(() => ({}));
        console.log('[aiCEO] Réponse arbitrage :', data);
        if (data && data.ready && data.proposals && data.proposals.length > 0) {
          showArbModal('results', data.proposals);
          try { sessionStorage.setItem('aiCEO.arbitrage.queue', JSON.stringify(data.proposals)); } catch(e) {}
        } else {
          showArbModal('empty', null, data && data.message);
        }
      } catch (err) {
        console.error('[aiCEO] Erreur arbitrage :', err);
        showArbModal('error', null, err.message);
      }
      return;
    }

    const manualBtn = ev.target.closest('[data-action="manual-create"]');
    if (manualBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      console.log('[aiCEO] Créer manuellement : delegation handler triggered');
      if (typeof showManualPicker !== 'undefined') {
        showManualPicker();
      } else {
        alert('Modal non chargé');
      }
      return;
    }
  }, true); // capture phase

})();
