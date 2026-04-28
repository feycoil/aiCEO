/* bind-coaching.js — Page coaching câblée v0.7 (S6.7)
 * Branche les blocs "questions à se poser" et "signaux faibles" sur les routes
 *   POST /api/assistant/coaching-question  (LLM ou rule-based fallback)
 *   GET  /api/decisions                    (stats vitesse / documentation)
 *   GET  /api/evening                      (sommeil / humeur derniers jours)
 *   GET  /api/assistant/llm-status         (mode live ou fallback)
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'coaching') return;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  async function api(method, url, body) {
    try {
      var r = await fetch(url, {
        method: method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function fmtPct(n, total) {
    if (!total) return '–';
    return Math.round((n / total) * 100) + ' %';
  }

  async function loadSignals() {
    var dec = await api('GET', '/api/decisions');
    var decisions = (dec && dec.decisions) || [];
    if (!decisions.length) return;

    // Stats simples 30j
    var since = Date.now() - 30 * 86400000;
    var recent = decisions.filter(function (d) {
      return d.decided_at && new Date(d.decided_at).getTime() >= since;
    });
    var documented = recent.filter(function (d) { return d.context && d.context.length > 30; });
    var deferred = decisions.filter(function (d) { return d.status === 'reportee'; });
    var open = decisions.filter(function (d) { return d.status === 'ouverte'; });

    var signalsList = $('.coach-signals');
    if (!signalsList) return;

    var docPct = recent.length ? Math.round((documented.length / recent.length) * 100) : 0;
    var docDir = docPct >= 70 ? 'up' : (docPct >= 40 ? 'flat' : 'down');
    var docArrow = docDir === 'up' ? '↑' : (docDir === 'flat' ? '→' : '↓');

    var openDir = open.length <= 5 ? 'up' : (open.length <= 12 ? 'flat' : 'down');
    var openArrow = openDir === 'up' ? '↑' : (openDir === 'flat' ? '→' : '↓');

    var deferDir = deferred.length <= 2 ? 'up' : (deferred.length <= 5 ? 'flat' : 'down');
    var deferArrow = deferDir === 'up' ? '↑' : (deferDir === 'flat' ? '→' : '↓');

    var html = '' +
      '<li class="coach-signal">' +
        '<span class="coach-signal-dot ' + docDir + '" aria-hidden="true"></span>' +
        '<div>' +
          '<div class="coach-signal-name">Documentation des décisions</div>' +
          '<div class="coach-signal-desc">' + documented.length + ' / ' + recent.length + ' décisions tranchées 30j ont un rationale (' + docPct + ' %)</div>' +
        '</div>' +
        '<span class="coach-signal-trend ' + docDir + '">' + docArrow + '</span>' +
      '</li>' +
      '<li class="coach-signal">' +
        '<span class="coach-signal-dot ' + openDir + '" aria-hidden="true"></span>' +
        '<div>' +
          '<div class="coach-signal-name">Décisions ouvertes</div>' +
          '<div class="coach-signal-desc">' + open.length + ' à trancher · ' + (recent.length) + ' tranchées 30j</div>' +
        '</div>' +
        '<span class="coach-signal-trend ' + openDir + '">' + openArrow + '</span>' +
      '</li>' +
      '<li class="coach-signal">' +
        '<span class="coach-signal-dot ' + deferDir + '" aria-hidden="true"></span>' +
        '<div>' +
          '<div class="coach-signal-name">Décisions reportées</div>' +
          '<div class="coach-signal-desc">' + deferred.length + ' en colonne « plus tard » sur le board arbitrage</div>' +
        '</div>' +
        '<span class="coach-signal-trend ' + deferDir + '">' + deferArrow + '</span>' +
      '</li>';

    signalsList.innerHTML = html;
  }

  async function loadQuestions() {
    var qList = $('.coach-questions');
    if (!qList) return;

    // Détection mood / contexte sommaire (heuristique simple)
    var bucket = 'defaut';
    try {
      var ev = await api('GET', '/api/evening');
      var sessions = (ev && ev.sessions) || [];
      if (sessions.length) {
        var last = sessions[0];
        if (last.mood && last.mood < 3) bucket = 'tension';
        else if (last.energy && last.energy < 3) bucket = 'tension';
      }
    } catch (e) { /* silent */ }

    var r = await api('POST', '/api/assistant/coaching-question', { bucket: bucket, count: 4 });
    if (!r || !r.questions || !r.questions.length) return;

    qList.innerHTML = r.questions.map(function (q, i) {
      var id = 'cq-' + i;
      return '<li class="coach-question">' +
        '<input type="checkbox" id="' + id + '" class="coach-question-check" />' +
        '<label for="' + id + '">' +
          '<div class="coach-question-text">' + escHtml(q) + '</div>' +
          '<div class="coach-question-meta">Posée par aiCEO · ' + (r.mode === 'live' ? 'Claude' : 'rule-based') + '</div>' +
        '</label>' +
      '</li>';
    }).join('');

    qList.addEventListener('change', function (e) {
      var cb = e.target.closest('.coach-question-check');
      if (!cb) return;
      var li = cb.closest('.coach-question');
      if (li) li.classList.toggle('is-done', cb.checked);
    });
  }

  async function showLlmBadge() {
    var s = await api('GET', '/api/assistant/llm-status');
    if (!s) return;
    var head = $('.coach-posture-foot .coach-posture-meta');
    if (!head) return;
    var label = s.available ? 'Claude live' : 'mode dégradé (rule-based)';
    var tone = s.available ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.15 65)';
    head.innerHTML += ' · <span style="color:' + tone + ';font-weight:600">' + label + '</span>';
  }

  async function init() {
    await Promise.all([
      loadSignals(),
      loadQuestions(),
      showLlmBadge()
    ]);
  }

  // S6.8.1 — Bind bouton "Discuter cette lecture" → assistant avec contexte coaching-posture
  function bindDiscussButton() {
    var buttons = document.querySelectorAll('.coach-posture .btn, .coach-posture-foot button, .coach-posture button');
    buttons.forEach(function (btn) {
      var txt = (btn.textContent || '').trim().toLowerCase();
      if (!/discuter|cette lecture|cette posture/i.test(txt)) return;
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        location.href = '/v06/assistant.html?context=coaching-posture';
      });
    });
  }

  // Bind apres init (le HTML statique est deja la)
  document.addEventListener('DOMContentLoaded', bindDiscussButton);
  setTimeout(bindDiscussButton, 200);
  setTimeout(bindDiscussButton, 800);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
