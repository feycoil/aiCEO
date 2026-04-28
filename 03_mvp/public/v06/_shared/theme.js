/* theme.js — Applique theme + density depuis /api/preferences au plus tôt */
(function () {
  'use strict';
  // Charger les prefs minimum (sans bloquer le rendu)
  fetch('/api/preferences', { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data || !data.preferences) return;
      const p = data.preferences;
      const theme = p['appearance.theme'] || 'system';
      const density = p['appearance.density'] || 'comfortable';
      const reduceMotion = p['appearance.reduceMotion'] === true;

      const root = document.documentElement;
      root.dataset.theme = theme;
      root.dataset.density = density;
      if (reduceMotion) root.dataset.reduceMotion = '1';

      if (theme === 'dark') root.style.colorScheme = 'dark';
      else if (theme === 'light') root.style.colorScheme = 'light';

      // Populate user info global (override les défauts hardcodés)
      const firstName = p['user.firstName'] || 'Utilisateur';
      const initials = (firstName.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)) || 'U';
      const tenantName = p['tenant.name'] || (p['houses.0.name'] ? p['houses.0.name'] + ' & co.' : 'Mon espace');
      const tenantMark = (tenantName[0] || 'A').toUpperCase();

      window.AICEO_USER = {
        firstName: firstName,
        userName: firstName,  // alias pour compat
        userInitials: initials,
        userRole: p['user.role'] || 'CEO',
        tenantName: tenantName,
        tenantMark: tenantMark,
        locale: p['locale.lang'] === 'en' ? 'English' : (p['locale.lang'] === 'ar' ? 'العربية' : 'Français')
      };
      // Trigger refresh des bindings UI déjà rendus
      try { document.dispatchEvent(new CustomEvent('aiceo:user-loaded', { detail: window.AICEO_USER })); } catch(e) {}
    })
    .catch(() => {});

  // Inject CSS pour les variantes theme
  const s = document.createElement('style');
  s.textContent = `
    /* Dark mode global override */
    :root[data-theme="dark"] {
      --bg: #1a1d22 !important;
      --surface: #232730 !important;
      --surface-2: #2c313b !important;
      --surface-3: #383e4a !important;
      --text: #e8e9eb !important;
      --text-2: #b8bbc0 !important;
      --text-3: #80858d !important;
      --border: rgba(255,255,255,0.1) !important;
      --border-2: rgba(255,255,255,0.16) !important;
    }
    :root[data-theme="dark"] body { background: #1a1d22 !important; color: #e8e9eb !important; }
    /* Density compact */
    :root[data-density="compact"] {
      --space-card-padding: 16px !important;
      --space-card-gap: 12px !important;
    }
    :root[data-density="compact"] .card, :root[data-density="compact"] .panel {
      padding: 14px !important;
    }
    /* Reduce motion */
    :root[data-reduce-motion="1"] *, :root[data-reduce-motion="1"] *::before, :root[data-reduce-motion="1"] *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(s);

  // Détection 1er login : si pas de user.firstName ni onboarding.completed → redirect onboarding
  // (uniquement sur les pages produit, pas sur onboarding lui-même ni hub)
  const route = (document.body && document.body.dataset && document.body.dataset.route) || '';
  if (route && route !== 'onboarding' && route !== 'components' && !window.location.search.includes('lock=1')) {
    fetch('/api/preferences/user.firstName', { headers: {Accept:'application/json'} })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || d.value === undefined || d.value === null) {
          // Premier login détecté
          if (!sessionStorage.getItem('aiceo.onboard.redirected')) {
            sessionStorage.setItem('aiceo.onboard.redirected', '1');
            window.location.href = '/v06/onboarding.html';
          }
        }
      }).catch(() => {});
  }


// =============================================================
// window.aiceoArbStart + window.aiceoManualPicker
// Définis EN HAUT du chargement (theme.js synchrone dans <head>)
// pour être disponibles avant tout addEventListener et tout HTML inline onclick
// =============================================================
window.aiceoArbStart = function(ev) {
  if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
  console.log('[aiCEO arb] window.aiceoArbStart called');

  function modal(state, proposals, message) {
    const existing = document.getElementById('aiceo-arb-modal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'aiceo-arb-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
    let content = '';
    if (state === 'loading') {
      content = '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700">⌛ Analyse en cours…</h2><p style="margin:0 0 16px;font-size:14px;color:#888;line-height:1.5">aiCEO scanne vos derniers échanges Outlook.</p><div style="height:4px;background:#ebe7df;border-radius:99px;overflow:hidden"><div style="height:100%;width:35%;background:#e35a3a"></div></div>';
    } else if (state === 'results' && proposals && proposals.length > 0) {
      const items = proposals.slice(0,5).map(function(p){
        return '<div style="display:flex;gap:12px;padding:12px;background:#faf8f3;border-radius:10px;margin-bottom:8px"><span style="background:#ebe7df;color:#555;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;align-self:flex-start;flex-shrink:0">'+(p.kind||'task')+'</span><div style="flex:1"><div style="font-size:14px;font-weight:600;margin-bottom:4px">'+(p.title||'').replace(/[<>]/g,'')+'</div><p style="margin:0;font-size:12px;color:#888;line-height:1.4">'+((p.excerpt||'').slice(0,140)).replace(/[<>]/g,'')+'…</p></div></div>';
      }).join('');
      content = '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700">📧 '+proposals.length+' actions identifiées</h2><div style="max-height:300px;overflow-y:auto;margin:16px 0">'+items+'</div><div style="display:flex;gap:10px;justify-content:flex-end"><button onclick="document.getElementById(\'aiceo-arb-modal\').remove()" style="background:transparent;border:1px solid #ddd;border-radius:8px;padding:9px 16px;cursor:pointer">Fermer</button><button onclick="document.getElementById(\'aiceo-arb-modal\').remove();location.href=\'/v06/arbitrage.html?source=emails\'" style="background:#1a1a1a;color:#fff;border:0;border-radius:8px;padding:9px 16px;cursor:pointer;font-weight:600">Ouvrir la file →</button></div>';
    } else if (state === 'empty') {
      content = '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700">📫 Aucune action identifiée</h2><p style="margin:0 0 16px;font-size:14px;color:#888;line-height:1.5">'+(message||'Aucun email synchronisé. Lancez la sync Outlook manuellement.')+'</p><div style="background:#faf8f3;padding:14px 18px;border-radius:10px;font-family:monospace;font-size:12px;margin-bottom:16px">cd C:\\\\_workarea_local\\\\aiCEO\\\\03_mvp<br>pwsh -File scripts\\\\sync-outlook.ps1</div><div style="display:flex;gap:10px;justify-content:flex-end"><button onclick="document.getElementById(\'aiceo-arb-modal\').remove()" style="background:transparent;border:1px solid #ddd;border-radius:8px;padding:9px 16px;cursor:pointer">Fermer</button><a href="/v06/aide.html" style="background:#1a1a1a;color:#fff;border-radius:8px;padding:9px 16px;text-decoration:none;font-weight:600">Voir le guide →</a></div>';
    } else {
      content = '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#d94a3d">⚠ Erreur</h2><p style="margin:0 0 16px;font-size:14px;color:#888">'+(message||'Erreur inconnue')+'</p><div style="text-align:right"><button onclick="document.getElementById(\'aiceo-arb-modal\').remove()" style="background:#1a1a1a;color:#fff;border:0;border-radius:8px;padding:9px 16px;cursor:pointer">Fermer</button></div>';
    }
    overlay.innerHTML = '<div style="background:#fff;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-width:560px;width:100%;padding:32px 28px">'+content+'</div>';
    overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  modal('loading');
  fetch('/api/arbitrage/analyze-emails', { method:'POST', headers:{'Content-Type':'application/json'} })
    .then(function(r){ return r.json().catch(function(){ return {}; }); })
    .then(function(data){
      console.log('[aiCEO arb] API response:', data);
      if (data && data.ready && data.proposals && data.proposals.length > 0) {
        try { sessionStorage.setItem('aiCEO.arbitrage.queue', JSON.stringify(data.proposals)); } catch(e){}
        modal('results', data.proposals);
      } else {
        modal('empty', null, data && data.message);
      }
    })
    .catch(function(err){
      console.error('[aiCEO arb] Error:', err);
      modal('error', null, err.message);
    });
  return false;
};

window.aiceoManualPicker = function(ev) {
  if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
  const overlay = document.createElement('div');
  overlay.id = 'aiceo-manual-picker';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = '<div style="background:#fff;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-width:520px;width:100%;padding:32px 28px"><h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Créer manuellement</h2><p style="margin:0 0 20px;font-size:14px;color:#888">Que voulez-vous créer en premier ?</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button onclick="if(window.AICEOCrud)window.AICEOCrud.open(\'project\');else location.href=\'/v06/projets.html\';document.getElementById(\'aiceo-manual-picker\').remove()" style="padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;font-size:14px">Un projet</button><button onclick="if(window.AICEOCrud)window.AICEOCrud.open(\'task\');else location.href=\'/v06/taches.html\';document.getElementById(\'aiceo-manual-picker\').remove()" style="padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;font-size:14px">Une tâche</button><button onclick="if(window.AICEOCrud)window.AICEOCrud.open(\'decision\');else location.href=\'/v06/decisions.html\';document.getElementById(\'aiceo-manual-picker\').remove()" style="padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;font-size:14px">Une décision</button><button onclick="location.href=\'/v06/settings.html#tab=maisons\'" style="padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;font-size:14px">Une maison</button></div><div style="margin-top:18px;text-align:right"><button onclick="document.getElementById(\'aiceo-manual-picker\').remove()" style="background:transparent;border:0;color:#888;cursor:pointer;font-size:13px;text-decoration:underline">Annuler</button></div></div>';
  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return false;
};

// Helper : trouver le row parent d'un bouton arbitrage
function _aiceoArbFindRow(btn) {
  if (!btn) return null;
  var listEl = document.getElementById('aiceo-arb-list');
  if (!listEl) return null;
  var node = btn.parentElement;
  while (node && node.parentElement !== listEl) node = node.parentElement;
  return node;
}

// Accepter une proposition email
window.aiceoArbAccept = function(ev, id) {
  if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
  console.log('[aiCEO arb-accept] called id=', id);
  var queue = [];
  try { queue = JSON.parse(sessionStorage.getItem('aiCEO.arbitrage.queue') || '[]'); } catch(e) {}
  var item = queue.find(function(q){ return q.id === id; });
  if (!item) { console.warn('[aiCEO] item arbitrage introuvable', id); return false; }
  console.log('[aiCEO arb-accept] item kind=', item.kind, 'title=', item.title);

  var endpoint = item.kind === 'project' ? '/api/projects' :
                 item.kind === 'decision' ? '/api/decisions' : '/api/tasks';
  var payload;
  if (item.kind === 'project') {
    payload = { name: item.title, description: item.excerpt };
  } else if (item.kind === 'decision') {
    payload = { title: item.title, context: item.excerpt };
  } else {
    payload = { title: item.title, description: item.excerpt, priority: item.proposed_priority || 'P1' };
  }

  var btn = ev && ev.target ? ev.target.closest('button') : null;
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    .then(function(r){ if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(function(data){
      console.log('[aiCEO arb-accept] success', data);
      var newQueue = queue.filter(function(q){ return q.id !== id; });
      try { sessionStorage.setItem('aiCEO.arbitrage.queue', JSON.stringify(newQueue)); } catch(e) {}
      var row = _aiceoArbFindRow(btn);
      if (row) {
        row.style.transition = 'opacity 0.25s, max-height 0.3s';
        row.style.opacity = '0';
        row.style.maxHeight = '0';
        row.style.overflow = 'hidden';
        setTimeout(function(){ if (row.parentElement) row.parentElement.removeChild(row); }, 350);
      }
      var head2 = document.querySelector('#aiceo-arb-queue h2');
      if (head2) {
        head2.innerHTML = '\uD83D\uDCE7 ' + newQueue.length + ' propositions depuis vos emails';
        if (newQueue.length === 0) {
          var sec = document.getElementById('aiceo-arb-queue');
          if (sec) sec.style.display = 'none';
        }
      }
      var label = item.kind === 'project' ? 'Projet cree' : (item.kind === 'decision' ? 'Decision creee' : 'Action creee');
      if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast(label + ' \u2713', 'success');
    })
    .catch(function(err){
      console.error('[aiCEO arb-accept]', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Accepter'; }
      if (window.AICEOShell && window.AICEOShell.showToast) window.AICEOShell.showToast('Erreur : '+err.message, 'error');
    });
  return false;
};

window.aiceoArbIgnore = function(ev, id) {
  if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
  console.log('[aiCEO arb-ignore] called id=', id);
  var btn = ev && ev.target ? ev.target.closest('button') : null;
  var row = _aiceoArbFindRow(btn);
  if (row) {
    row.style.transition = 'opacity 0.2s, max-height 0.25s';
    row.style.opacity = '0';
    row.style.maxHeight = '0';
    row.style.overflow = 'hidden';
    setTimeout(function(){ if (row.parentElement) row.parentElement.removeChild(row); }, 280);
  }
  try {
    var q = JSON.parse(sessionStorage.getItem('aiCEO.arbitrage.queue') || '[]');
    q = q.filter(function(x){ return x.id !== id; });
    sessionStorage.setItem('aiCEO.arbitrage.queue', JSON.stringify(q));
    var head2 = document.querySelector('#aiceo-arb-queue h2');
    if (head2) {
      head2.innerHTML = '\uD83D\uDCE7 ' + q.length + ' propositions depuis vos emails';
      if (q.length === 0) {
        var sec = document.getElementById('aiceo-arb-queue');
        if (sec) sec.style.display = 'none';
      }
    }
  } catch(e) {}
  return false;
};

window.aiceoArbToggleQueue = function(ev) {
  if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
  var listEl = document.getElementById('aiceo-arb-list');
  var btn = document.getElementById('aiceo-arb-toggle');
  if (!listEl || !btn) return false;
  var collapsed = listEl.style.display === 'none';
  listEl.style.display = collapsed ? 'flex' : 'none';
  btn.textContent = collapsed ? 'Replier \u25B4' : 'Deplier \u25BE';
  return false;
};

console.log('[aiCEO] all globals installed: aiceoArbStart, aiceoManualPicker, aiceoArbAccept, aiceoArbIgnore, aiceoArbToggleQueue');

})();
