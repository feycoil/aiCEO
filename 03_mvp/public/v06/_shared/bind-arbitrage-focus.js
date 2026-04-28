/* bind-arbitrage-focus.js v3 — Cable mode FOCUS sur vraies decisions DB
 * - Decision-card masquee par CSS tant que body.data-arb-ready != "1"
 * - JS pose data-arb-ready="1" UNIQUEMENT si decisions reelles trouvees
 * - Sinon : empty state propre (focus seul, ou empty-all si tout vide)
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'arbitrage') return;

  const $  = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  async function tryJson(url, opts) {
    try {
      const r = await fetch(url, Object.assign({ headers: { Accept: 'application/json' } }, opts || {}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function disableReporterTout() {
    const all = Array.prototype.slice.call(document.querySelectorAll('button, a'));
    const btns = all.filter(function (b) { return /reporter\s+tout/i.test((b.textContent || '').trim()); });
    btns.forEach(function (b) {
      b.disabled = true;
      b.style.opacity = '0.45';
      b.style.cursor = 'not-allowed';
      b.title = 'Disponible en v0.7';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.AICEOShell) window.AICEOShell.showToast('Action disponible en v0.7', 'info');
      }, true);
    });
  }

  let decisions = [];
  let currentIdx = 0;

  function updateCounter() {
    const counter = $('.arb-stack-head .thin.md');
    if (counter) {
      const total = decisions.length;
      const cur = String(currentIdx + 1).padStart(2, '0');
      const tot = String(total).padStart(2, '0');
      counter.innerHTML = cur + '<span class="u-text-3" style="font-weight:var(--fw-thin)"> / ' + tot + '</span>';
    }
    const steps = $$('.arb-progress-step');
    steps.forEach(function (s, i) {
      s.classList.toggle('is-current', i === currentIdx);
      s.classList.toggle('is-done', i < currentIdx);
    });
    const prev = $('#prev-card');
    const next = $('#next-card');
    if (prev) {
      const enP = currentIdx > 0;
      prev.style.opacity = enP ? '1' : '.4';
      prev.style.pointerEvents = enP ? '' : 'none';
    }
    if (next) {
      const enN = currentIdx < decisions.length - 1;
      next.style.opacity = enN ? '1' : '.4';
      next.style.pointerEvents = enN ? '' : 'none';
    }
  }

  function renderDecision(d) {
    const card = $('.decision-card');
    if (!card || !d) return;
    const q = card.querySelector('.decision-question');
    if (q) q.textContent = d.title || d.question || '(decision sans titre)';
    const ctx = card.querySelector('.decision-context');
    if (ctx) ctx.textContent = d.context || d.description || '';
    const houseChip = card.querySelector('.pill.house');
    if (houseChip) houseChip.innerHTML = '<span class="dot"></span>—';
    const priority = (d.priority || 'P1').toUpperCase();
    const pp = card.querySelector('.pill.priority');
    if (pp) {
      pp.className = 'pill priority ' + priority.toLowerCase();
      const tag = priority === 'P0' ? 'Urgent' : (priority === 'P1' ? 'Prioritaire' : 'Normal');
      pp.textContent = priority + ' \u00B7 ' + tag;
    }
    const dateP = card.querySelector('.pill.outline.sm');
    if (dateP && d.created_at) {
      const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
      const when = days === 0 ? "aujourd'hui" : (days === 1 ? "hier" : "il y a " + days + " j");
      dateP.innerHTML = '<svg class="ico" width="11" height="11"><use href="#i-clock"/></svg> Posee ' + when;
    }
    // Vider les options A/B/C demo statiques (deviendront cablees v0.7)
    const opts = $$('.option-card, .opt-desc, .option-label');
    opts.forEach(function (el) {
      if (el.textContent && /scope|patient|tient l'engagement|d[ée]cale|module|studio|backlog/i.test(el.textContent)) {
        el.textContent = '\u2014';
      }
    });
  }

  function renderEmptyInFocus() {
    const focus = $('#focus-mode');
    if (!focus) return;
    focus.innerHTML =
      '<div style="text-align:center;padding:80px 24px;color:var(--text-3,#888)">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:18px;color:var(--text-3,#888)"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>' +
        '<h2 style="margin:0 0 8px;font-size:20px;color:var(--text,#111);font-weight:600">Aucune decision a trancher</h2>' +
        '<p style="margin:0 0 24px;font-size:14px;max-width:420px;margin-left:auto;margin-right:auto">Acceptez des propositions emails dans la file ci-dessus pour creer des decisions.</p>' +
        '<a href="/v06/index.html" class="btn primary" style="text-decoration:none">Retour cockpit</a>' +
      '</div>';
    focus.style.display = 'block';
    focus.style.maxWidth = '640px';
    focus.style.margin = '40px auto';
  }

  function renderEmptyAll() {
    const main = $('main, .app-main');
    if (!main) return;
    const focus = $('#focus-mode');
    const board = $('#board-mode');
    if (focus) focus.style.display = 'none';
    if (board) board.style.display = 'none';
    const queueSec = $('#aiceo-arb-queue');
    if (queueSec) queueSec.style.display = 'none';
    if (document.getElementById('aiceo-arb-empty-all')) return;

    const empty = document.createElement('section');
    empty.id = 'aiceo-arb-empty-all';
    empty.className = 'card';
    empty.style.cssText = 'padding:80px 24px;text-align:center;margin:40px auto;max-width:640px';
    empty.innerHTML =
      '<div style="font-size:48px;margin-bottom:16px">\uD83C\uDF3F</div>' +
      '<h2 style="margin:0 0 12px;font-size:24px;font-weight:600;color:var(--text,#111)">Tout est a jour</h2>' +
      '<p style="margin:0 0 24px;font-size:15px;color:var(--text-3,#888);max-width:480px;margin-left:auto;margin-right:auto">Aucune decision en attente. Aucune nouvelle proposition dans vos emails. Profitez-en pour respirer.</p>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
        '<a href="/v06/index.html" class="btn primary" style="text-decoration:none">Retour cockpit</a>' +
        '<a href="/v06/decisions.html" class="btn ghost" style="text-decoration:none">Voir toutes les decisions</a>' +
      '</div>';
    main.appendChild(empty);
  }

  function bindNavigation() {
    const prev = $('#prev-card');
    const next = $('#next-card');
    if (prev) {
      prev.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentIdx > 0) {
          currentIdx--;
          renderDecision(decisions[currentIdx]);
          updateCounter();
        }
      });
    }
    if (next) {
      next.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentIdx < decisions.length - 1) {
          currentIdx++;
          renderDecision(decisions[currentIdx]);
          updateCounter();
        }
      });
    }
  }

  function hasQueue() {
    try {
      const q = JSON.parse(sessionStorage.getItem('aiCEO.arbitrage.queue') || '[]');
      return Array.isArray(q) && q.length > 0;
    } catch (e) { return false; }
  }

  async function init() {
    disableReporterTout();

    const data = await tryJson('/api/decisions?status=ouverte');
    decisions = (data && data.decisions) || [];

    if (decisions.length === 0) {
      // CSS masque deja decision-card et arb-stack-head (data-arb-ready absent)
      if (hasQueue()) {
        renderEmptyInFocus();
      } else {
        renderEmptyAll();
      }
      return;
    }

    // Decisions reelles trouvees : on remplit la card et on autorise CSS a la montrer
    currentIdx = 0;
    renderDecision(decisions[0]);
    updateCounter();
    bindNavigation();
    document.body.dataset.arbReady = '1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
