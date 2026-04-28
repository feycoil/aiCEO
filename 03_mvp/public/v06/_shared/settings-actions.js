/* settings-actions.js — Actions branchées sur Settings */
(function () {
  'use strict';
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  async function api(method, url, body) {
    try {
      const r = await fetch(url, {
        method,
        headers: {'Content-Type':'application/json', Accept:'application/json'},
        body: body ? JSON.stringify(body) : undefined
      });
      return r.ok ? await r.json() : null;
    } catch(e) { return null; }
  }

  // ── Export complet JSON ────────────────────────────────────────
  async function exportAll() {
    if (window.AICEOShell) window.AICEOShell.showToast('Export en cours…', 'info');
    const endpoints = ['preferences', 'projects', 'tasks', 'decisions', 'contacts', 'groups', 'events', 'weekly-reviews', 'big-rocks'];
    const result = {};
    for (const ep of endpoints) {
      const d = await api('GET', '/api/' + ep);
      result[ep] = d;
    }
    result.exportedAt = new Date().toISOString();
    result.version = 'v0.6';
    // Download
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aiceo-export-' + new Date().toISOString().slice(0,19).replace(/:/g,'-') + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    if (window.AICEOShell) window.AICEOShell.showToast('Export téléchargé ✓', 'success');
  }

  // ── Reset coaching prefs ───────────────────────────────────────
  async function resetCoaching() {
    if (!window.AICEOConfirm) return;
    const ok = await window.AICEOConfirm(
      'Cela supprime votre profondeur de coaching, votre posture et l\'historique des questions. Vous pourrez les reconfigurer.',
      { title: 'Réinitialiser le coaching ?', confirmLabel: 'Réinitialiser', cancelLabel: 'Annuler', danger: true }
    );
    if (!ok) return;
    await api('DELETE', '/api/preferences/coaching.depth');
    await api('DELETE', '/api/preferences/coaching.during.arbitrage');
    await api('DELETE', '/api/preferences/user.coaching.tone');
    if (window.AICEOShell) window.AICEOShell.showToast('Coaching réinitialisé', 'success');
    setTimeout(() => location.reload(), 800);
  }

  // ── Supprimer mon espace (RESET TOTAL) ─────────────────────────
  async function deleteWorkspace() {
    if (!window.AICEOConfirm) return;
    const ok = await window.AICEOConfirm(
      'Toutes vos données seront supprimées : projets, tâches, décisions, contacts, événements, préférences. Cette action est IRRÉVERSIBLE.',
      { title: '⚠ Supprimer définitivement mon espace ?', confirmLabel: 'Tout supprimer', cancelLabel: 'Annuler', danger: true }
    );
    if (!ok) return;
    const ok2 = await window.AICEOConfirm(
      'Dernière confirmation. Tapez votre prénom pour valider — ou cliquez Annuler.',
      { title: 'Vraiment ?', confirmLabel: 'Je sais ce que je fais', cancelLabel: 'Annuler', danger: true }
    );
    if (!ok2) return;
    if (window.AICEOShell) window.AICEOShell.showToast('Suppression…', 'info');
    // DELETE chaque entité (pas de DELETE all sur l'API actuelle, on enchaîne)
    const entities = [
      { ep: 'tasks',     key: 'tasks' },
      { ep: 'decisions', key: 'decisions' },
      { ep: 'projects',  key: 'projects' },
      { ep: 'contacts',  key: 'contacts' }
    ];
    for (const { ep, key } of entities) {
      const list = await api('GET', '/api/' + ep + '?limit=1000');
      if (!list || !list[key]) continue;
      for (const item of list[key]) {
        await api('DELETE', '/api/' + ep + '/' + encodeURIComponent(item.id));
      }
    }
    // Supprimer toutes les prefs
    const prefs = await api('GET', '/api/preferences');
    if (prefs && prefs.preferences) {
      for (const k of Object.keys(prefs.preferences)) {
        await api('DELETE', '/api/preferences/' + encodeURIComponent(k));
      }
    }
    // Clear localStorage
    try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
    if (window.AICEOShell) window.AICEOShell.showToast('Espace supprimé. Redémarrage…', 'success');
    setTimeout(() => { window.location.href = '/v06/onboarding.html'; }, 1500);
  }

  // ── Voir le journal IA (modal liste messages assistant récents) ─
  async function viewAILog() {
    if (!window.AICEOModal) return;
    const data = await api('GET', '/api/assistant/conversations?limit=20');
    const convs = (data && data.conversations) || [];
    let html = '';
    if (convs.length === 0) {
      html = '<p style="color:var(--text-3,#888);padding:24px;text-align:center">Aucune conversation pour le moment. <a href="/v06/assistant.html">Démarrer une conversation</a></p>';
    } else {
      html = '<div style="max-height:400px;overflow-y:auto"><ul style="list-style:none;padding:0;margin:0">';
      for (const c of convs) {
        const date = c.updated_at ? new Date(c.updated_at).toLocaleDateString('fr-FR') : '';
        html += '<li style="padding:12px;border-bottom:1px solid var(--border,#eee)"><a href="/v06/assistant.html" style="color:var(--text,#111);text-decoration:none"><strong>' + escapeHtml(c.title||'(sans titre)') + '</strong> <span style="color:var(--text-3,#888);font-size:12px;float:right">' + date + '</span></a></li>';
      }
      html += '</ul></div>';
    }
    // Affiche dans un mini-modal personnalisé (pas via AICEOModal qui est form-based)
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:11500;display:flex;align-items:center;justify-content:center;padding:20px';
    backdrop.innerHTML = '<div style="background:var(--surface-2,#fff);border-radius:14px;max-width:560px;width:100%;max-height:80vh;display:flex;flex-direction:column;overflow:hidden"><header style="padding:18px 24px;border-bottom:1px solid var(--border,#eee);display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:18px;font-weight:700">Journal IA — ' + convs.length + ' conversation(s)</h2><button id="aiceo-log-close" style="background:transparent;border:0;cursor:pointer;font-size:20px">×</button></header><div style="flex:1;overflow-y:auto;padding:8px">' + html + '</div></div>';
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
    document.getElementById('aiceo-log-close').addEventListener('click', () => backdrop.remove());
  }

  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  // ── Forcer une sync (placeholder, vrai sync via schtasks Windows) ─
  async function forceSync() {
    if (window.AICEOShell) window.AICEOShell.showToast('Sync Outlook : utiliser pwsh -File scripts/sync-outlook.ps1 côté Windows (pas d\'endpoint REST pour MVP)', 'info');
  }

  // ── Bind boutons par texte ─────────────────────────────────────
  function bindActions() {
    if (document.body.dataset.route !== 'settings') return;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, a.btn');
      if (!btn) return;
      const text = (btn.textContent || '').trim().toLowerCase();
      // Skip les boutons déjà handled
      if (btn.dataset.aiceoActionBound) return;
      let action = null;
      if (text.includes('exporter')) action = exportAll;
      else if (text.includes('voir le journal')) action = viewAILog;
      else if (text.includes('forcer une sync') || text.includes('forcer sync')) action = forceSync;
      else if (text.includes('réinitialiser le coaching') || text.includes('reset coaching')) action = resetCoaching;
      else if (text.includes('supprimer mon espace')) action = deleteWorkspace;
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.aiceoActionBound = '1';
      btn.classList.remove('aiceo-disabled-btn');
      btn.disabled = false;
      action();
    });
    // Ré-activer les boutons branchés (qui auraient pu être marqués disabled par shell)
    setTimeout(() => {
      document.querySelectorAll('button, a.btn').forEach(b => {
        const t = (b.textContent || '').toLowerCase();
        if (/exporter|voir le journal|forcer.*sync|réinitialiser le coaching|supprimer mon espace/i.test(t)) {
          b.classList.remove('aiceo-disabled-btn');
          b.disabled = false;
          b.title = '';
          b.removeAttribute('aria-disabled');
        }
      });
    }, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindActions);
  else bindActions();

  window.AICEOSettings = { exportAll, resetCoaching, deleteWorkspace, viewAILog };
})();
