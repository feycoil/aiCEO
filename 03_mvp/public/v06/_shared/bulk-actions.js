/* bulk-actions.js — Sélection multi + bulk delete + undo */
(function () {
  'use strict';
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const $  = (s, r=document) => r.querySelector(s);

  function injectCSS() {
    if (document.getElementById('aiceo-bulk-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-bulk-css';
    s.textContent = `
      .aiceo-bulk-checkbox { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; margin-right: 8px; }
      .aiceo-bulk-bar {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: var(--text,#111); color: #fff; padding: 12px 18px;
        border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.20);
        display: flex; align-items: center; gap: 14px; z-index: 9500;
        font-size: 14px; font-weight: 500;
      }
      .aiceo-bulk-bar button {
        background: rgba(255,255,255,.16); color: #fff; border: 0;
        padding: 6px 12px; border-radius: 8px; cursor: pointer;
        font-size: 13px; font-family: inherit;
      }
      .aiceo-bulk-bar button:hover { background: rgba(255,255,255,.28); }
      .aiceo-bulk-bar button.danger { background: var(--rose,#d96d3e); }
      .aiceo-bulk-bar button.danger:hover { background: var(--rose-700,#b35327); }
    `;
    document.head.appendChild(s);
  }

  let selected = new Set();
  const ENTITY_MAP = {
    'task': 'tasks', 'project': 'projects',
    'decision': 'decisions', 'contact': 'contacts'
  };

  function getEntityType() {
    const r = document.body.dataset.route || '';
    if (r === 'taches')   return 'task';
    if (r === 'projets')  return 'project';
    if (r === 'decisions') return 'decision';
    if (r === 'equipe')   return 'contact';
    return null;
  }

  function getItems() {
    const t = getEntityType();
    if (!t) return [];
    if (t === 'task')     return $$('[data-task-id]');
    if (t === 'project')  return $$('[data-project-id]');
    if (t === 'decision') return $$('[data-decision-id]');
    if (t === 'contact')  return $$('[data-contact-id]');
    return [];
  }

  function getItemId(item, type) {
    if (type === 'task')     return item.dataset.taskId;
    if (type === 'project')  return item.dataset.projectId;
    if (type === 'decision') return item.dataset.decisionId;
    if (type === 'contact')  return item.dataset.contactId;
    return null;
  }

  function injectCheckboxes() {
    if (!getEntityType()) return;
    getItems().forEach(item => {
      if (item.querySelector('.aiceo-bulk-checkbox')) return;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'aiceo-bulk-checkbox';
      cb.addEventListener('click', (e) => e.stopPropagation());
      cb.addEventListener('change', () => {
        const id = getItemId(item, getEntityType());
        if (cb.checked) selected.add(id);
        else selected.delete(id);
        updateBar();
      });
      item.insertBefore(cb, item.firstChild);
    });
  }

  let bar = null;
  function updateBar() {
    if (selected.size === 0) {
      if (bar) { bar.remove(); bar = null; }
      return;
    }
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'aiceo-bulk-bar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = `
      <span><strong>${selected.size}</strong> sélectionné(s)</span>
      <button type="button" data-action="clear">Désélectionner</button>
      <button type="button" class="danger" data-action="delete">Supprimer</button>
    `;
    bar.querySelector('[data-action="clear"]').addEventListener('click', clearAll);
    bar.querySelector('[data-action="delete"]').addEventListener('click', bulkDelete);
  }

  function clearAll() {
    selected.clear();
    $$('.aiceo-bulk-checkbox').forEach(c => c.checked = false);
    updateBar();
  }

  async function bulkDelete() {
    if (!window.AICEOConfirm) return;
    const t = getEntityType();
    const ep = ENTITY_MAP[t];
    const ok = await window.AICEOConfirm(
      'Supprimer ' + selected.size + ' élément(s) ?',
      { title: 'Suppression en lot', confirmLabel: 'Supprimer', cancelLabel: 'Annuler', danger: true }
    );
    if (!ok) return;
    // Conserver pour undo
    const deletedIds = [...selected];
    const deletedItems = getItems().filter(i => deletedIds.includes(getItemId(i, t)));
    const deletedHtml = deletedItems.map(i => ({ id: getItemId(i, t), html: i.outerHTML }));

    // Hide visuellement (optimistic)
    deletedItems.forEach(i => i.style.display = 'none');
    clearAll();

    // Undo toast 5s
    showUndoToast(deletedIds.length + ' élément(s) supprimé(s)', async () => {
      // Restore visuellement (et idéalement re-POST chaque)
      deletedItems.forEach(i => i.style.display = '');
      // Note : pour un vrai undo backend, il faudrait reposter avec mêmes IDs.
      if (window.AICEOShell) window.AICEOShell.showToast('Suppression annulée — recharger pour confirmer', 'info');
    }, async () => {
      // Confirm : appel API DELETE
      for (const id of deletedIds) {
        await fetch('/api/' + ep + '/' + encodeURIComponent(id), { method: 'DELETE' });
      }
    });
  }

  // ── Undo toast 5s ──────────────────────────────────────────────
  function showUndoToast(msg, onUndo, onConfirm) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text,#111);color:#fff;padding:12px 18px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.20);z-index:9600;font-size:14px;display:flex;align-items:center;gap:14px';
    t.innerHTML = `<span>${msg}</span><button id="aiceo-undo" style="background:rgba(255,255,255,.16);color:#fff;border:0;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">Annuler</button>`;
    document.body.appendChild(t);
    let undone = false;
    document.getElementById('aiceo-undo').addEventListener('click', () => {
      undone = true;
      onUndo();
      t.remove();
    });
    setTimeout(() => {
      if (!undone) {
        onConfirm();
        t.remove();
      }
    }, 5000);
  }

  function init() {
    injectCSS();
    setTimeout(injectCheckboxes, 1000); // après bind-X.js
    new MutationObserver(() => setTimeout(injectCheckboxes, 200)).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.AICEOBulk = { showUndoToast };
})();
