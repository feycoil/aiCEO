/* bind-revues.js v4 — Liste revues hebdo + CTA "Demarrer une revue" si vide */
(function () {
  'use strict';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  async function tryJson(url, opts){
    try {
      const r = await fetch(url, Object.assign({headers:{Accept:'application/json'}}, opts||{}));
      if (r.status === 204) return { empty: true };
      if (!r.ok) return null;
      return await r.json();
    } catch(e) { return null; }
  }

  // ISO week (YYYY-Www) — algorithme standard
  function currentWeekId() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // Jeudi de la semaine ISO
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 4);
    const weekNo = 1 + Math.round(((d - yearStart) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + '-W' + String(weekNo).padStart(2, '0');
  }

  function injectCTA() {
    const list = $('.revue-list');
    if (!list) return;
    const week = currentWeekId();
    list.innerHTML = [
      '<div class="aiceo-empty-clean" style="text-align:center;padding:48px 24px">',
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-3,#888);margin-bottom:14px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        '<h3 style="margin:0 0 6px;font-size:16px;font-weight:600;color:var(--text,#111)">Aucune revue hebdomadaire</h3>',
        '<p style="margin:0 0 20px;font-size:14px;color:var(--text-3,#888);max-width:380px;margin-left:auto;margin-right:auto">Demarrez la revue de la semaine ' + escHtml(week) + ' pour faire le point sur vos projets, big rocks et decisions.</p>',
        '<button type="button" class="btn primary" id="aiceo-start-review">Demarrer la revue de la semaine</button>',
      '</div>'
    ].join('');

    const btn = document.getElementById('aiceo-start-review');
    if (btn) {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Creation...';
        const r = await tryJson('/api/weekly-reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ week: week, intention: '', mood: '' })
        });
        if (r && r.review) {
          if (window.AICEOShell && window.AICEOShell.showToast) {
            window.AICEOShell.showToast('Revue de la semaine demarree', 'success');
          }
          // Relancer init pour rendre la nouvelle revue
          init();
        } else {
          btn.disabled = false;
          btn.textContent = 'Demarrer la revue de la semaine';
          if (window.AICEOShell && window.AICEOShell.showToast) {
            window.AICEOShell.showToast('Erreur lors de la creation', 'error');
          }
        }
      });
    }
  }

  async function init() {
    const reviews = await tryJson('/api/weekly-reviews?limit=8');
    const rocks   = await tryJson('/api/big-rocks');

    const hasReviews = reviews && reviews.weekly_reviews && reviews.weekly_reviews.length > 0;

    if (hasReviews) {
      const list = $('.revue-list');
      if (list) {
        list.innerHTML = reviews.weekly_reviews.map(r => {
          return '<article class="revue-row" data-week="' + escHtml(r.week_id) + '">' +
            '<header class="revue-row-head"><h3>' + escHtml(r.week_id || '') + '</h3>' +
            (r.completion ? '<span class="pill outline">' + r.completion + '%</span>' : '') + '</header>' +
            (r.intention ? '<p class="revue-row-intent"><em>' + escHtml(r.intention) + '</em></p>' : '') +
            '</article>';
        }).join('');
      }
    } else {
      // Injecter le CTA "Demarrer la revue"
      injectCTA();
    }

    if (rocks && rocks.big_rocks && rocks.big_rocks.length > 0) {
      const rocksList = $('.big-rocks, [data-big-rocks]');
      if (rocksList) {
        rocksList.innerHTML = rocks.big_rocks.slice(0,3).map((b,i) => {
          return '<li class="big-rock-row"><span class="big-rock-num">0' + (i+1) + '</span>' +
            '<div><h4>' + escHtml(b.title || '') + '</h4>' +
            (b.description ? '<p class="u-text-2 small">' + escHtml(b.description) + '</p>' : '') +
            '</div></li>';
        }).join('');
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
