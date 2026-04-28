/* cockpit-modes.js — Layout adaptatif cockpit selon état de remplissage
 *  - Mode "empty"  : DB vide → onboarding wizard pleine page (4 étapes)
 *  - Mode "partial": setup en cours → layout standard
 *  - Mode "rich"   : data > seuil → layout compact (header 80px + KPI horizontal + Top-3/Agenda 2-cols)
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'home') return;

  async function tryJson(url) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  async function detectMode() {
    const [groupsR, projR, tasksR, decsR] = await Promise.all([
      tryJson('/api/groups'),
      tryJson('/api/projects?limit=10'),
      tryJson('/api/tasks?done=false&limit=10'),
      tryJson('/api/decisions?status=ouverte&limit=10')
    ]);
    const counts = {
      groups: ((groupsR && (groupsR.groups || groupsR)) || []).length,
      projects: ((projR && (projR.projects || projR)) || []).length,
      tasks: ((tasksR && (tasksR.tasks || tasksR)) || []).length,
      decisions: ((decsR && (decsR.decisions || decsR)) || []).length
    };
    const total = counts.groups + counts.projects + counts.tasks + counts.decisions;

    document.body.classList.remove('is-cockpit-empty', 'is-cockpit-partial', 'is-cockpit-rich');

    if (total === 0) {
      document.body.classList.add('is-cockpit-empty');
      injectOnboardingWizard(counts);
    } else if (counts.projects >= 1 && counts.tasks >= 3) {
      document.body.classList.add('is-cockpit-rich');
    } else {
      document.body.classList.add('is-cockpit-partial');
    }
  }

  function injectOnboardingWizard(counts) {
    // Si déjà injecté, ne pas dupliquer
    if (document.getElementById('aiceo-onboarding-wizard')) return;

    const main = document.querySelector('main, .app-main');
    if (!main) return;

    // Construire le wizard
    const steps = [
      { key: 'groups',    label: 'Maisons',    desc: 'Domaines d\'activité', count: counts.groups,    href: '/v06/settings.html#tab=maisons', cta: 'Créer ma première maison' },
      { key: 'projects',  label: 'Projets',    desc: 'Chantiers & livrables', count: counts.projects,  href: '/v06/projets.html',              cta: 'Lancer un projet' },
      { key: 'tasks',     label: 'Tâches',     desc: 'Actions du quotidien',  count: counts.tasks,     href: '/v06/taches.html',               cta: 'Capturer ma première tâche' },
      { key: 'decisions', label: 'Décisions',  desc: 'À trancher',            count: counts.decisions, href: '/v06/arbitrage.html',            cta: 'Noter une décision' }
    ];

    // L'étape active = première avec count 0
    const activeIdx = steps.findIndex(s => s.count === 0);
    const active = steps[activeIdx >= 0 ? activeIdx : 0];

    const userName = (window.AICEO_USER && window.AICEO_USER.firstName) || '';
    const greeting = userName ? 'Bienvenue, ' + escapeHtml(userName) : 'Bienvenue';

    let cardHTML = '';
    if (active.key === 'groups') {
      cardHTML = [
        '<div class="aiceo-wiz-card-eyebrow">Étape ' + (activeIdx + 1) + ' / 4</div>',
        '<h2 class="aiceo-wiz-card-title">' + active.label + '</h2>',
        '<p class="aiceo-wiz-card-desc">' + getStepIntro(active.key) + '</p>',
        '<div class="aiceo-wiz-form" style="display:flex;flex-direction:column;gap:12px;max-width:400px;margin:0 auto">',
          '<input type="text" id="aiceo-wiz-house-name" placeholder="Nom de votre première maison (ex. Holding, R&D)" style="border:1px solid var(--border,#e0dcd0);border-radius:8px;padding:12px 14px;font-size:15px;font-family:inherit;background:#fff" />',
          '<button type="button" id="aiceo-wiz-house-save" class="btn primary lg" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;font-size:15px">+ Créer ma maison →</button>',
        '</div>',
        '<div style="margin-top:24px;display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap">',
          '<button type="button" id="aiceo-wiz-sync-outlook" class="btn ghost" style="display:inline-flex;align-items:center;gap:8px;font-size:13px;padding:8px 16px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Importer depuis Outlook</button>',
          '<button type="button" class="aiceo-wiz-skip">Skip pour l\'instant →</button>',
        '</div>'
      ].join('');
    } else {
      cardHTML = [
        '<div class="aiceo-wiz-card-eyebrow">Étape ' + (activeIdx + 1) + ' / 4</div>',
        '<h2 class="aiceo-wiz-card-title">' + active.label + '</h2>',
        '<p class="aiceo-wiz-card-desc">' + getStepIntro(active.key) + '</p>',
        '<a href="' + active.href + '" class="btn primary lg aiceo-wiz-cta">+ ' + active.cta + ' →</a>',
        '<button type="button" class="aiceo-wiz-skip">Skip pour l\'instant →</button>'
      ].join('');
    }

    const wiz = document.createElement('section');
    wiz.id = 'aiceo-onboarding-wizard';
    wiz.innerHTML = [
      '<div class="aiceo-wiz-inner">',
        '<h1 class="aiceo-wiz-title">👋 ' + greeting + '</h1>',
        '<p class="aiceo-wiz-sub">Pour piloter sereinement, configurons votre cockpit en 4 étapes — 5 minutes max.</p>',
        '<div class="aiceo-wiz-steps">',
          steps.map((s, i) => {
            const done = s.count > 0;
            const current = i === activeIdx;
            const cls = done ? 'is-done' : (current ? 'is-current' : 'is-todo');
            return [
              '<div class="aiceo-wiz-step ' + cls + '">',
                '<div class="aiceo-wiz-step-bullet">' + (done ? '✓' : (i + 1)) + '</div>',
                '<div class="aiceo-wiz-step-label">' + s.label + '</div>',
                '<div class="aiceo-wiz-step-desc">' + s.desc + '</div>',
              '</div>'
            ].join('');
          }).join(''),
        '</div>',
        '<div class="aiceo-wiz-card">',
          cardHTML,
        '</div>',
      '</div>'
    ].join('');

    // Ajouter au début du main
    main.insertBefore(wiz, main.firstChild);

    // Bind skip
    wiz.querySelector('.aiceo-wiz-skip').addEventListener('click', () => {
      wiz.remove();
      document.body.classList.remove('is-cockpit-empty');
      document.body.classList.add('is-cockpit-partial');
      try { localStorage.setItem('aiCEO.uiPrefs.skipOnboarding', '1'); } catch(e) {}
    });

    // Bind inline form (groups step) + sync outlook button
    const saveBtn = wiz.querySelector('#aiceo-wiz-house-save');
    const nameInput = wiz.querySelector('#aiceo-wiz-house-name');
    if (saveBtn && nameInput) {
      const doSave = async () => {
        const name = nameInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        try {
          const r = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name, color: 'rose' })
          });
          if (!r.ok) throw new Error('API error');
          if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast('Maison créée : ' + name, 'success');
          wiz.remove();
          document.body.classList.remove('is-cockpit-empty');
          // Rerun mode detection
          detectMode();
        } catch (err) {
          alert('Erreur création : ' + err.message);
        }
      };
      saveBtn.addEventListener('click', doSave);
      nameInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); doSave(); } });
      setTimeout(() => nameInput.focus(), 100);
    }

    const syncBtn = wiz.querySelector('#aiceo-wiz-sync-outlook');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        syncBtn.textContent = 'Synchronisation…';
        try {
          const r = await fetch('/api/system/sync-outlook', { method: 'POST' });
          if (r.ok) {
            if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast('Synchronisation lancée — vos données arrivent dans quelques instants', 'info');
            setTimeout(() => location.reload(), 2000);
          } else {
            if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast('Synchronisation Outlook bientôt disponible', 'warning');
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/></svg> Importer depuis Outlook';
          }
        } catch (err) {
          if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast('Erreur sync : ' + err.message, 'warning');
          syncBtn.disabled = false;
        }
      });
    }
  }

  function getStepIntro(key) {
    const intros = {
      groups: 'Une "maison" représente un domaine d\'activité que vous pilotez (ex. Holding, R&D, Sales). Elle structure vos projets et KPIs.',
      projects: 'Vos projets sont les chantiers concrets que vous suivez. Chaque projet appartient à une maison et a une progression.',
      tasks: 'Capturez vos actions du jour — l\'IA vous proposera un Top-3 chaque matin selon priorité et énergie.',
      decisions: 'Notez vos décisions à trancher. L\'arbitrage matin vous présente les plus urgentes avec leur contexte.'
    };
    return intros[key] || '';
  }

  function escapeHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // Vérifier si l'utilisateur a explicitement skipé l'onboarding
  function userSkipped() {
    try { return localStorage.getItem('aiCEO.uiPrefs.skipOnboarding') === '1'; } catch(e) { return false; }
  }

  function init() {
    if (userSkipped()) {
      // Forcer mode partial même si tout vide
      document.body.classList.add('is-cockpit-partial');
      return;
    }
    detectMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
