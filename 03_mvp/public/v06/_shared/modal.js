/* modal.js — Modal générique réutilisable
 * Usage : window.AICEOModal.open({ title, fields, onSubmit, onDelete, initial })
 */
(function () {
  'use strict';

  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (v == null) return;
      if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function injectModalCSS() {
    if (document.getElementById('aiceo-modal-css')) return;
    const s = document.createElement('style');
    s.id = 'aiceo-modal-css';
    s.textContent = `
      .aiceo-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: aiceo-modal-fade .15s ease-out; }
      .aiceo-modal { background: var(--surface-2, #fff); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.25); width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; animation: aiceo-modal-slide .2s ease-out; overflow: hidden; }
      .aiceo-modal-head { padding: 20px 24px 12px; border-bottom: 1px solid var(--border, #eee); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .aiceo-modal-title { font-size: 18px; font-weight: 700; margin: 0; color: var(--text, #111); }
      .aiceo-modal-close { background: transparent; border: 0; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-3, #888); display: flex; align-items: center; justify-content: center; }
      .aiceo-modal-close:hover { background: var(--surface-3, #eee); color: var(--text, #111); }
      .aiceo-modal-body { padding: 16px 24px; overflow-y: auto; flex: 1; }
      .aiceo-modal-foot { padding: 14px 24px; border-top: 1px solid var(--border, #eee); display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
      .aiceo-modal-foot .danger-zone { margin-right: auto; }
      .aiceo-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
      .aiceo-field-label { font-size: 12px; font-weight: 600; color: var(--text-2, #555); text-transform: uppercase; letter-spacing: 0.04em; }
      .aiceo-field-input, .aiceo-field-textarea, .aiceo-field-select { padding: 10px 12px; border: 1px solid var(--border, #ddd); border-radius: 8px; background: var(--surface, #fff); font-size: 14px; font-family: inherit; color: var(--text, #111); width: 100%; box-sizing: border-box; }
      .aiceo-field-textarea { min-height: 80px; resize: vertical; }
      .aiceo-field-range { -webkit-appearance: none; appearance: none; height: 6px; background: var(--surface-3,#eee); border-radius: 99px; outline: 0; }
      .aiceo-field-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; background: var(--text,#111); border-radius: 50%; cursor: grab; }
      .aiceo-field-range::-webkit-slider-thumb:active { cursor: grabbing; }
      .aiceo-field-input:focus, .aiceo-field-textarea:focus, .aiceo-field-select:focus { outline: 0; border-color: var(--text, #111); box-shadow: 0 0 0 3px rgba(17,17,17,.08); }
      .aiceo-field-input.is-error, .aiceo-field-textarea.is-error, .aiceo-field-select.is-error { border-color: var(--rose,#d96d3e) !important; box-shadow: 0 0 0 3px rgba(217,109,62,.15) !important; }
      .aiceo-btn { padding: 9px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: all .15s; }
      .aiceo-btn-primary { background: var(--text, #111); color: #fff; }
      .aiceo-btn-primary:hover { background: #2c2f36; }
      .aiceo-btn-ghost { background: transparent; color: var(--text-2, #555); }
      .aiceo-btn-ghost:hover { background: var(--surface-3, #eee); }
      .aiceo-btn-danger { background: transparent; color: var(--rose-700, #b35327); border-color: transparent; }
      .aiceo-btn-danger:hover { background: var(--rose-50, #fdecdf); border-color: var(--rose, #d96d3e); }
      .aiceo-btn:disabled { opacity: .5; cursor: not-allowed; }
      @keyframes aiceo-modal-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes aiceo-modal-slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(s);
  }

  function open(config) {
    injectModalCSS();
    const { title, fields = [], onSubmit, onDelete, initial = {}, isEdit = false } = config;

    const backdrop = el('div', { class: 'aiceo-modal-backdrop' });
    const modal = el('div', { class: 'aiceo-modal', role: 'dialog', 'aria-modal': 'true' });

    const head = el('div', { class: 'aiceo-modal-head' });
    head.appendChild(el('h2', { class: 'aiceo-modal-title' }, title || 'Édition'));
    head.appendChild(el('button', {
      class: 'aiceo-modal-close',
      'aria-label': 'Fermer',
      onclick: () => close()
    }, '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'));
    modal.appendChild(head);

    const body = el('div', { class: 'aiceo-modal-body' });
    const form = el('form', { onsubmit: (e) => { e.preventDefault(); submit(); } });
    const inputs = {};

    fields.forEach(f => {
      const fieldDiv = el('div', { class: 'aiceo-field' });
      fieldDiv.appendChild(el('label', { class: 'aiceo-field-label' }, f.label + (f.required ? ' *' : '')));
      let input;
      if (f.type === 'textarea') {
        input = el('textarea', { class: 'aiceo-field-textarea', name: f.key, placeholder: f.placeholder || '', rows: f.rows || 3 });
        if (initial[f.key] != null) input.value = initial[f.key];
      } else if (f.type === 'select') {
        input = el('select', { class: 'aiceo-field-select', name: f.key });
        const opts = f.options || [];
        // Option vide par défaut si pas required
        if (!f.required) input.appendChild(el('option', { value: '' }, '— aucun —'));
        opts.forEach(opt => {
          const optEl = el('option', { value: opt.value }, opt.label || opt.value);
          if (initial[f.key] === opt.value) optEl.selected = true;
          input.appendChild(optEl);
        });
        // Async loader : on remplace les options après fetch
        if (typeof f.optionsLoader === 'function') {
          input.disabled = true;
          input.appendChild(el('option', { value: '' }, 'Chargement…'));
          f.optionsLoader().then(loadedOpts => {
            input.innerHTML = '';
            const list = loadedOpts || [];
            if (!f.required) input.appendChild(el('option', { value: '' }, '— aucun —'));
            list.forEach(opt => {
              const optEl = el('option', { value: opt.value }, opt.label || opt.value);
              if (initial[f.key] === opt.value) optEl.selected = true;
              input.appendChild(optEl);
            });
            input.disabled = false;
            // Si liste vide : ajouter un help text contextualisé
            if (list.length === 0) {
              const wrap = input.parentElement;
              if (wrap && !wrap.querySelector('.aiceo-field-empty-hint')) {
                const hint = document.createElement('div');
                hint.className = 'aiceo-field-empty-hint';
                hint.style.cssText = 'font-size:12px;color:var(--text-3,#888);margin-top:6px;padding:8px 10px;background:var(--bg-2,#f5f3ef);border-radius:8px;border-left:3px solid var(--accent,#e35a3a)';
                let cta = '';
                if (f.key === 'group_id') {
                  cta = 'Aucune maison créée. <a href="/v06/settings.html#tab=maisons" style="color:inherit;font-weight:600">Créer une maison →</a>';
                } else if (f.key === 'project_id') {
                  cta = 'Aucun projet. <a href="/v06/projets.html" style="color:inherit;font-weight:600">Créer un projet →</a>';
                } else {
                  cta = 'Aucune option disponible pour le moment.';
                }
                hint.innerHTML = cta;
                wrap.appendChild(hint);
              }
            }
          }).catch(e => { input.disabled = false; console.warn('[modal] optionsLoader error:', e); });
        }
      } else if (f.type === 'range') {
        // Container avec input range + display valeur
        const rangeWrap = el('div', { style: 'display:flex;align-items:center;gap:10px' });
        input = el('input', {
          class: 'aiceo-field-range', name: f.key, type: 'range',
          min: f.min || 0, max: f.max || 100, step: f.step || 1,
          style: 'flex:1;cursor:pointer;'
        });
        if (initial[f.key] != null) input.value = initial[f.key];
        else input.value = f.default != null ? f.default : 0;
        const display = el('span', { style: 'font-weight:600;font-variant-numeric:tabular-nums;min-width:48px;text-align:right' }, input.value + (f.unit || '%'));
        input.addEventListener('input', () => { display.textContent = input.value + (f.unit || '%'); });
        rangeWrap.appendChild(input);
        rangeWrap.appendChild(display);
        fieldDiv.appendChild(rangeWrap);
        inputs[f.key] = input;
        form.appendChild(fieldDiv);
        return; // skip default append
      } else {
        input = el('input', { class: 'aiceo-field-input', name: f.key, type: f.type || 'text', placeholder: f.placeholder || '' });
        if (initial[f.key] != null) input.value = initial[f.key];
      }
      if (f.required) input.required = true;
      fieldDiv.appendChild(input);
      inputs[f.key] = input;
      form.appendChild(fieldDiv);
    });
    body.appendChild(form);
    modal.appendChild(body);

    const foot = el('div', { class: 'aiceo-modal-foot' });
    if (isEdit && onDelete) {
      const delBtn = el('button', {
        class: 'aiceo-btn aiceo-btn-danger danger-zone',
        type: 'button',
        onclick: async () => {
          const ok = window.AICEOConfirm
            ? await window.AICEOConfirm('Cette action est irréversible.', { title: 'Supprimer définitivement ?', confirmLabel: 'Supprimer', cancelLabel: 'Annuler', danger: true })
            : confirm('Supprimer définitivement ?');
          if (!ok) return;
          delBtn.disabled = true;
          delBtn.textContent = 'Suppression…';
          try {
            await onDelete(initial.id);
            close();
            if (window.AICEOShell) window.AICEOShell.showToast('Supprimé', 'success');
          } catch (e) {
            delBtn.disabled = false;
            delBtn.textContent = 'Supprimer';
            alert('Erreur : ' + e.message);
          }
        }
      }, 'Supprimer');
      foot.appendChild(delBtn);
    }
    foot.appendChild(el('button', {
      class: 'aiceo-btn aiceo-btn-ghost',
      type: 'button',
      onclick: () => close()
    }, 'Annuler'));
    const submitBtn = el('button', {
      class: 'aiceo-btn aiceo-btn-primary',
      type: 'submit',
      onclick: (e) => { e.preventDefault(); submit(); }
    }, isEdit ? 'Enregistrer' : 'Créer');
    foot.appendChild(submitBtn);
    modal.appendChild(foot);
    backdrop.appendChild(modal);

    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', escHandler);

    document.body.appendChild(backdrop);
    setTimeout(() => { const first = form.querySelector('input,textarea,select'); if (first) first.focus(); }, 50);

    function close() {
      document.removeEventListener('keydown', escHandler);
      backdrop.remove();
    }
    function escHandler(e) { if (e.key === 'Escape') close(); }

    function validate(data) {
      const errors = {};
      fields.forEach(f => {
        const v = data[f.key];
        if (f.required && (!v || (typeof v === 'string' && !v.trim()))) {
          errors[f.key] = 'Champ obligatoire';
        }
        if (v && f.type === 'email' && !/^\S+@\S+\.\S+$/.test(String(v))) {
          errors[f.key] = 'Email invalide';
        }
        if (v && f.minLength && String(v).length < f.minLength) {
          errors[f.key] = 'Minimum ' + f.minLength + ' caractères';
        }
      });
      return errors;
    }

    function showFieldErrors(errors) {
      // Nettoyer les erreurs précédentes
      form.querySelectorAll('.aiceo-field-error').forEach(e => e.remove());
      form.querySelectorAll('.aiceo-field-input.is-error, .aiceo-field-textarea.is-error, .aiceo-field-select.is-error').forEach(i => i.classList.remove('is-error'));
      // Afficher les nouvelles
      Object.entries(errors).forEach(([key, msg]) => {
        const inp = inputs[key];
        if (!inp) return;
        inp.classList.add('is-error');
        const err = document.createElement('div');
        err.className = 'aiceo-field-error';
        err.style.cssText = 'color:var(--rose-700,#b35327);font-size:12px;margin-top:4px;font-weight:500';
        err.textContent = msg;
        inp.parentNode.appendChild(err);
      });
      // Focus sur le premier champ en erreur
      const firstKey = Object.keys(errors)[0];
      if (firstKey && inputs[firstKey]) inputs[firstKey].focus();
    }

    // Auto-save brouillon en localStorage (par titre + clé)
    const draftKey = 'aiCEO.uiPrefs.draft.' + (config.title || 'modal').replace(/\s+/g,'_');
    function saveDraft() {
      if (isEdit) return; // pas de brouillon en édition
      const data = {};
      fields.forEach(f => { data[f.key] = inputs[f.key]?.value; });
      try { localStorage.setItem(draftKey, JSON.stringify(data)); } catch {}
    }
    function loadDraft() {
      if (isEdit) return;
      try {
        const raw = localStorage.getItem(draftKey);
        if (!raw) return;
        const data = JSON.parse(raw);
        Object.entries(data).forEach(([k, v]) => {
          if (inputs[k] && v != null) inputs[k].value = v;
        });
      } catch {}
    }
    function clearDraft() { try { localStorage.removeItem(draftKey); } catch {} }

    setTimeout(loadDraft, 100);
    fields.forEach(f => {
      const inp = inputs[f.key];
      if (!inp) return;
      const evt = (inp.type === 'checkbox' || inp.tagName === 'SELECT') ? 'change' : 'input';
        inp.addEventListener(evt, () => {
          if (window.AICEOStates && typeof window.AICEOStates.markDirty === 'function') {
            window.AICEOStates.markDirty(form);
          }
        });
      });

    // Boutons
    const closeBtn = root.querySelector('[data-close]');
    if (closeBtn) closeBtn.addEventListener('click', close);
    const cancelBtn = root.querySelector('[data-cancel]');
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    if (config.isEdit && config.onDelete) {
      const delBtn = root.querySelector('[data-delete]');
      if (delBtn) delBtn.addEventListener('click', async () => {
        if (!confirm('Supprimer définitivement ?')) return;
        try { await config.onDelete(initial.id); close(); }
        catch (err) { alert('Erreur : ' + err.message); }
      });
    }

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const data = {};
      Object.entries(inputs).forEach(([k, inp]) => {
        if (inp.type === 'checkbox') data[k] = inp.checked;
        else data[k] = inp.value;
      });
      try {
        await config.onSubmit(data, initial.id);
        close();
      } catch (err) {
        const errBox = root.querySelector('.aiceo-modal-error');
        if (errBox) {
          errBox.textContent = 'Erreur : ' + (err.message || 'inconnue');
          errBox.style.display = 'block';
        }
      }
    });
  }

  function close() {
    const overlay = document.getElementById('aiceo-modal-overlay');
    if (overlay) overlay.remove();
  }

  window.AICEOModal = { open: open, close };
})();
