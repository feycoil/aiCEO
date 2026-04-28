/* clear-demo.js — Nettoyage systématique des données démo
 * Politique : si la base SQLite est VIDE, l’UI est VIDE (empty states propres).
 * Si la base a des données, les bind-*.js les injectent par-dessus.
 *
 * Détection démo : items sans data-task-id / data-project-id / data-decision-id / data-contact-id
 * Textes hardcodés (Aubrielle, Northwind...) remplacés par defaults user-config.
 *
 * Tourne en defer mais avant les bind-*.js (pour qu’ils repartent d’une base propre).
 */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function emptyMsg(text, hint) {
    return '<div class="aiceo-empty-clean" style="text-align:center;padding:32px 24px;color:var(--text-3,#888)">' +
      '<p style="margin:0 0 6px;font-weight:500">' + text + '</p>' +
      (hint ? '<p style="margin:0;font-size:13px">' + hint + '</p>' : '') +
      '</div>';
  }

  function clearLists() {
    // Listes/grilles de données — on vide entièrement, les bind-*.js remplissent ensuite
    const containers = {
      '.top3-list':              { msg: 'Aucune tâche prioritaire pour aujourd\'hui.', hint: 'Profitez-en pour respirer.' },
      '.task-groups':            { msg: 'Aucune tâche enregistrée.', hint: 'Cliquez sur « + Nouvelle » pour démarrer.' },
      '.task-list':              { msg: 'Aucune tâche.', hint: '' },
      '.proj-grid':              { msg: 'Aucun projet actif.', hint: 'Créez votre premier projet via « + Nouveau projet ».' },
      '.proj-frozen-list':       { msg: '', hint: '' },
      '.team-grid':              { msg: 'Aucun contact dans votre équipe.', hint: 'Ajoutez vos premiers collaborateurs.' },
      '.dec-list':               { msg: 'Aucune décision enregistrée.', hint: 'Tranchez à votre rythme.' },
      '.revue-list':             { msg: 'Aucune revue hebdomadaire.', hint: 'La première revue se construit au fil de la semaine.' },
      '.kn-pinned-list':         { msg: '', hint: '' },
      '.kn-pinned-grid':         { msg: '', hint: '' },
      '.kn-list':                { msg: '', hint: '' },
      '.coach-grid':             { msg: '', hint: '' },
      '.as-conv-list':           { msg: 'Aucune conversation.', hint: 'Démarrez une discussion avec l\'assistant.' },
      '.msg-list':               { msg: '', hint: '' }
    };
    Object.entries(containers).forEach(([sel, { msg, hint }]) => {
      $$(sel).forEach(el => {
        el.innerHTML = msg ? emptyMsg(msg, hint) : '';
      });
    });
  }

  function killOrphanCards() {
    // Cards rendues sans data-*-id = démos, on les supprime
    $$('.task-row').forEach(el => { if (!el.dataset.taskId) el.remove(); });
    $$('.proj-card').forEach(el => { if (!el.dataset.projectId) el.remove(); });
    $$('.dec-card').forEach(el => { if (!el.dataset.decisionId) el.remove(); });
    $$('.contact-card').forEach(el => { if (!el.dataset.contactId) el.remove(); });
    $$('.revue-row').forEach(el => { if (!el.dataset.week) el.remove(); });
    // Big rocks démo
    $$('.big-rock-row, .revue-item').forEach(el => { if (!el.dataset.id) el.remove(); });
  }

  function clearAgenda() {
    // Agenda grid : événements démo (Comité produit Northwind, etc.)
    $$('.agenda-block').forEach(el => { if (!el.dataset.eventId) el.remove(); });
    $$('.agenda-row').forEach(el => { if (!el.dataset.eventId) el.remove(); });
    // Vider les compteurs en haut (Deep work 11h, Réunions 8h30, etc.)
    $$('.agenda-summary-stat .summary-tile-value, .agenda-summary-stat .stat, .agenda-stat-value').forEach(el => {
      el.textContent = '0';
    });
  }

  function clearHeroDemo() {
    // Hero greeting du cockpit
    if (document.body.dataset.route !== 'home') return;

    // 1. Sub-text "Aujourd’hui l’enjeu est de protéger Northwind…"
    const lead = $('.hero-greeting .lead, .hero-greeting > p');
    if (lead) {
      lead.innerHTML = 'C\'est le moment de poser votre cap pour aujourd\'hui. <a href="#" id="aiceo-cta-capter" style="color:var(--text,#111);text-decoration:underline;font-weight:600">Capturez votre intention</a> — ou décidez de la matinée.';
      lead.style.color = 'var(--text-2, #555)';
      lead.style.fontStyle = 'normal';
    }

    // 2. Pills hero (Tension Northwind, Coaching dispo, 07:42 énergie haute)
    $$('.hero-greeting .pill, .hero-greeting .o-cluster .pill').forEach(p => {
      // Garder seulement si data-bind ou data-real, sinon démo → cacher
      if (!p.dataset.bind && !p.dataset.real) p.style.display = 'none';
    });

    // 3. Stat hero "72%" + dot chart
    $$('.stat-hero-value, .stat-hero-num').forEach(el => {
      el.textContent = '0';
    });
    $$('.stat-hero-label, .stat-hero-sub').forEach(el => {
      el.textContent = 'Aucune mesure cette semaine';
    });
    $$('.dot-chart').forEach(el => { el.style.opacity = '0.3'; });

    // 4. Day pills L M M J V S D — laisser visuel mais sans état (is-done / is-active)
    $$('.day-pill, .day-pills button').forEach(p => {
      p.classList.remove('is-done', 'is-active', 'is-empty');
    });

    // 5. KPI bar — vide TOUT
    $$('.kpi-value, .kpi-tile, .stat-tile, .stat-card-value, .stat-large-num').forEach(el => {
      el.innerHTML = '<span style="color:var(--text-3,#888);font-weight:600">0</span>';
    });
    $$('.kpi-sub').forEach(el => { el.textContent = '—'; });
    // 5b. Tous les compteurs résiduels (badges drawer, etc.) si vides
    $$('.proj-stat-num, .stat-num, .stat-large-num, .stat-card-value, .data-stat').forEach(el => {
      if (el.dataset.bind || el.dataset.real) return;
      el.textContent = '0';
    });
    // Sections projets actifs (par maison)
    $$('.house-col .list-card, .house-col ul[role="list"]').forEach(ul => {
      ul.innerHTML = '<li style="padding:14px 0;color:var(--text-3,#888);font-size:13px;font-style:italic;text-align:center">Aucun projet</li>';
    });
    $$('.house-col header').forEach(h => {
      h.querySelectorAll('.u-tnum, .u-text-3').forEach(el => {
        if (/projets?/i.test(el.textContent)) el.textContent = '0 projet';
      });
      h.querySelectorAll('.pill.status').forEach(p => {
        if (/tension|cadence|émergence/i.test(p.textContent)) p.style.display = 'none';
      });
    });

    // 6. Agenda mardi (09:30 Comité produit Northwind, 11:00 1-à-1 Helene...)
    // Déjà géré par clearAgenda

    // 7. Posture coaching footer "Vous êtes à 4 jours d’affilée…"
    $$('.posture-card .question, .posture-card p, .strategic-q').forEach(el => {
      if (el.textContent.trim().length > 30) {
        el.style.display = 'none';
      }
    });

    // 8. Footer strategic-q — générique, on laisse
    // 9. Top-3 du jour : géré par clearLists (.top3-list)

    // 10. Projets actifs par maison : tout vider sauf header
    $$('.house-bar, [class*="house-section"]').forEach(section => {
      section.querySelectorAll('.proj-item, .item-row, .pj-entry, .list-row').forEach(el => el.remove());
    });
  }

  function clearTenant() {
    // Drawer tenant : remplacer "Aubrielle Hayes" / "Northwind & co." par neutre
    const nameEl = $('.drawer-tenant .tenant-name');
    const markEl = $('.drawer-tenant .tenant-mark');
    if (nameEl && /aubrielle|hayes|northwind|solstice|helix/i.test(nameEl.textContent) && nameEl.dataset.userSelected !== '1') {
      const u = window.AICEO_USER || {};
      nameEl.textContent = u.tenantName || 'Mon espace';
    }
    if (markEl && /^[A-Z]$/.test(markEl.textContent.trim())) {
      const newName = (nameEl && nameEl.textContent) || 'M';
      markEl.textContent = newName.charAt(0).toUpperCase();
    }
  }

  // ── Purge globale des noms démo hardcodés (toutes pages) ───
  const DEMO_RE = /\b(Northwind|Solstice|Helix|Aubrielle|Hayes|Aubrielle\s+Hayes|Spec\s+produit\s+v3|Spec\s+moteur\s+v3|Cadre\s+n[ée]go|Recrutement\s+front|Comit[ée]\s+produit|Backlog\s+v3|Studio\s+(Lin|Marc|Helene|H[ée]l[ée]ne)|\bMarc\b|\bH[ée]l[ée]ne\b|\bLin\b|\bSarah\s+Chen\b|\bAisha\b|\bTomas\b|\bNora\b)\b/i;

  function purgeDemoNames() {
    // 1. .house-col cachées seulement sur la home (cockpit) -- bind-cockpit gère le rendu réel
    if (document.body.dataset.route === 'home') {
      $$('.house-col').forEach(col => col.style.display = 'none');
      const houses = $('.projects-houses');
      if (houses && !houses.querySelector('.aiceo-empty-houses')) {
        const empty = document.createElement('div');
        empty.className = 'aiceo-empty-houses';
        empty.style.cssText = 'grid-column:1/-1;padding:36px 24px;text-align:center;color:var(--text-3,#888)';
        empty.innerHTML = '<p style="margin:0 0 8px;font-size:14px">Aucun projet actif.</p>' +
          '<p style="margin:0;font-size:13px">Créez votre premier projet via « + Nouveau projet ».</p>';
        houses.appendChild(empty);
      }
    }

    // 2. Parcourir tout le DOM textuel et nettoyer les noms démo
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const toClean = [];
    let n;
    while ((n = walker.nextNode())) {
      if (DEMO_RE.test(n.nodeValue)) toClean.push(n);
    }
    toClean.forEach(node => {
      // Si le parent est un élément avec data-bind / data-real, on laisse
      const p = node.parentElement;
      if (p && (p.dataset.bind || p.dataset.real)) return;
      node.nodeValue = node.nodeValue.replace(DEMO_RE, '—');
    });

    // 3. Attributs courants (title, alt, aria-label, placeholder)
    $$('[title], [alt], [aria-label], [placeholder]').forEach(el => {
      ['title', 'alt', 'aria-label', 'placeholder'].forEach(attr => {
        const v = el.getAttribute(attr);
        if (v && DEMO_RE.test(v)) el.setAttribute(attr, v.replace(DEMO_RE, '—'));
      });
    });
  }

  // ── Wipe par route : empty state propre par page ───
  const WIPE_CONFIG = {
    arbitrage: {
      selectors: ['#focus-mode .arb-focus-card', '.arb-context', '.decision-coach', '#board-mode .board-grid'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:60px 24px;color:var(--text-3,#888)"><h2 style="margin:0 0 8px;color:var(--text,#111);font-size:24px">Aucune décision à arbitrer</h2><p style="margin:0 0 20px">Toutes vos décisions sont à jour 🌿</p><button class="btn primary" data-new="decision">+ Nouvelle décision</button></div>',
      target: '.arb-decision-card, main .arb-pane, main'
    },
    agenda: {
      selectors: ['.agenda-grid', '.agenda-summary'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Agenda vide cette semaine.</p><p style="margin:0;font-size:13px">Glissez une tâche depuis <a href="/v06/taches.html" style="color:var(--accent,#e35a3a)">/taches</a> pour la planifier.</p></div>',
      target: '.agenda-grid'
    },
    assistant: {
      selectors: ['.as-thread', '.as-conv-list', '.as-context-list', '.as-effects-list'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Démarrez une conversation.</p><p style="margin:0;font-size:13px">L\'assistant répond avec votre contexte (décisions, tâches, projets).</p></div>',
      target: '.as-thread'
    },
    coaching: {
      selectors: ['.coach-posture', '.coach-signals', '.coach-questions', '.coach-history-list'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Pas encore de session de coaching.</p><p style="margin:0;font-size:13px">Une session est proposée chaque dimanche soir à partir de votre semaine.</p></div>',
      target: '.coach-posture, main'
    },
    connaissance: {
      selectors: ['.kn-side', '.kn-pinned-list', '.kn-pinned-grid', '.kn-list'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Votre base de connaissance est vide.</p><p style="margin:0;font-size:13px">Les décisions épinglées et critères créés par l\'assistant apparaîtront ici.</p></div>',
      target: '.kn-pinned-list, main'
    },
    decisions: {
      selectors: ['.dec-pulse', '.dec-timeline', '.dec-list'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Aucune décision enregistrée.</p><p style="margin:0 0 16px;font-size:13px">Tranchez votre première décision via <a href="/v06/arbitrage.html" style="color:var(--accent,#e35a3a)">/arbitrage</a>.</p><button class="btn primary" data-new="decision">+ Nouvelle décision</button></div>',
      target: '.dec-timeline, .dec-list, main'
    },
    equipe: {
      selectors: ['.team-group', '.team-grid'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Aucun contact.</p><p style="margin:0 0 16px;font-size:13px">Ajoutez vos premiers collaborateurs ou importez votre carnet Outlook.</p><button class="btn primary" data-new="contact">+ Nouveau contact</button></div>',
      target: '.team-grid, main'
    },
    evening: {
      selectors: ['.moments', '.slipping', '.health-side'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:32px 24px;color:var(--text-3,#888)"><p style="margin:0;font-weight:500">Première soirée — démarrez votre rituel.</p><p style="margin:6px 0 0;font-size:13px">Notez humeur, énergie, top 3.</p></div>',
      target: '.moments'
    },
    projets: {
      selectors: ['.proj-health-bar', '.proj-houses', '.proj-frozen', '.proj-grid'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Aucun projet.</p><p style="margin:0 0 16px;font-size:13px">Créez votre première maison puis ajoutez des projets.</p><button class="btn primary" data-new="project">+ Nouveau projet</button></div>',
      target: '.proj-houses, .proj-grid, main'
    },
    projet: {
      selectors: ['.proj-detail-head', '.proj-kpis', '.proj-section'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Projet introuvable.</p><p style="margin:0;font-size:13px"><a href="/v06/projets.html" style="color:var(--accent,#e35a3a)">← Retour à la liste</a></p></div>',
      target: 'main'
    },
    revues: {
      selectors: ['.revue-hero', '.revue-stats', '.revue-section', '.revue-list', '.revue-cap'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Pas encore de revue hebdo.</p><p style="margin:0;font-size:13px">Une revue est générée chaque dimanche à partir de votre semaine.</p></div>',
      target: '.revue-list, main'
    },
    taches: {
      selectors: ['.task-groups', '.task-list', '.filter-bar'],
      emptyHTML: '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px;color:var(--text-3,#888)"><p style="margin:0 0 6px;font-weight:500">Aucune tâche.</p><p style="margin:0 0 16px;font-size:13px">Capturez votre premier todo via Cmd+K ou + Nouvelle tâche.</p><button class="btn primary" data-new="task">+ Nouvelle tâche</button></div>',
      target: '.task-groups, main'
    }
  };

  // Routes avec bind-*.js qui peuplent depuis l'API REST.
  // Sur ces routes, wipeRoute serait contre-productif (efface le DOM
  // avant que bind-* n'ait fetche), donc on ne fait que clearLists qui
  // pose des empty states doux (innerHTML uniquement, pas de display:none).
  const ROUTES_WITH_BIND = new Set([
    'home', 'projets', 'projet', 'equipe', 'decisions', 'taches',
    'revues', 'agenda', 'evening', 'arbitrage'
  ]);

  function wipeRoute() {
    const route = document.body.dataset.route || '';
    if (ROUTES_WITH_BIND.has(route)) return;  // bind-*.js gere
    const cfg = WIPE_CONFIG[route];
    if (!cfg) return;
    // Vider les sélecteurs (innerHTML = '')
    cfg.selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Si l’élément contient des éléments avec data-id réels, on garde
        const realData = el.querySelector('[data-task-id], [data-project-id], [data-decision-id], [data-contact-id], [data-event-id], [data-id]');
        if (!realData) {
          el.innerHTML = '';
          el.style.display = 'none';
        }
      });
    });
    // Injecter empty state dans le premier target trouvé
    const targetSel = cfg.target.split(',').map(s => s.trim()).find(s => document.querySelector(s));
    if (targetSel) {
      const target = document.querySelector(targetSel);
      if (target && !target.querySelector('.aiceo-empty-clean')) {
        target.style.display = '';
        target.innerHTML = cfg.emptyHTML;
      }
    }
  }

  function run() {
    try { clearLists(); } catch (e) { console.warn('[clear-demo] clearLists', e); }
    try { killOrphanCards(); } catch (e) { console.warn('[clear-demo] killOrphanCards', e); }
    try { clearAgenda(); } catch (e) { console.warn('[clear-demo] clearAgenda', e); }
    try { clearHeroDemo(); } catch (e) { console.warn('[clear-demo] clearHeroDemo', e); }
    try { clearTenant(); } catch (e) { console.warn('[clear-demo] clearTenant', e); }
    try { purgeDemoNames(); } catch (e) { console.warn('[clear-demo] purgeDemoNames', e); }
    try { wipeRoute(); } catch (e) { console.warn('[clear-demo] wipeRoute', e); }
    // Re-passes pour neutraliser les contenus injectés par bind-*.js après notre 1er run
    setTimeout(() => { try { wipeRoute(); } catch (e) {} try { purgeDemoNames(); } catch (e) {} }, 300);
    setTimeout(() => { try { wipeRoute(); } catch (e) {} try { purgeDemoNames(); } catch (e) {} }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  window.AICEO_CLEAR_DEMO = { run, purgeDemoNames, wipeRoute, WIPE_CONFIG };
})();
