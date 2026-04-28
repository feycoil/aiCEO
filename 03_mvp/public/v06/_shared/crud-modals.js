/* crud-modals.js — Configs CRUD pour les 4 entités principales
 * Branche les boutons "+ Nouveau X" + clic items pour ouvrir modals
 */
(function () {
  'use strict';
  if (!window.AICEOModal) { console.warn('[crud] AICEOModal manquant'); return; }

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  async function api(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      const errMsg = err.error || r.statusText;
      if (window.AICEOStates) window.AICEOStates.errorBanner(errMsg);
      throw new Error(errMsg);
    }
    if (r.status === 204) return null;
    return await r.json();
  }

  // ── Loaders dynamiques pour les FK ────────────────────────────
  const groupsLoader = async () => {
    const data = await api('GET', '/api/groups');
    const list = (data && (data.groups || data)) || [];
    return list.map(g => ({ value: g.id, label: g.name || g.id }));
  };
  const projectsLoader = async () => {
    const data = await api('GET', '/api/projects?limit=100');
    const list = (data && (data.projects || data)) || [];
    return list.map(p => ({ value: p.id, label: p.name || p.id }));
  };

  // ── Configs entités ────────────────────────────────────────────
  const ENTITIES = {
    project: {
      title: 'Projet',
      endpoint: '/api/projects',
      respKey: 'project',
      listKey: 'projects',
      fields: [
        { key: 'name',     label: 'Nom du projet', required: true, placeholder: 'Spec produit v3' },
        { key: 'tagline',  label: 'Description courte', placeholder: 'Refonte du moteur d\'arbitrage' },
        { key: 'status',   label: 'Statut', type: 'select', required: true, options: [
          { value: 'active',  label: 'Actif' },
          { value: 'hot',     label: 'À surveiller / hot' },
          { value: 'frozen',  label: 'Gelé' },
          { value: 'done',    label: 'Terminé' }
        ]},
        { key: 'group_id', label: 'Maison', type: 'select', optionsLoader: groupsLoader },
        { key: 'progress', label: 'Progression', type: 'range', min: 0, max: 100, step: 5, default: 0, unit: ' %' },
        { key: 'description', label: 'Description longue', type: 'textarea', rows: 3 }
      ]
    },
    task: {
      title: 'Tâche',
      endpoint: '/api/tasks',
      respKey: 'task',
      listKey: 'tasks',
      fields: [
        { key: 'title',       label: 'Titre', required: true, placeholder: 'Trancher le spec…' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { key: 'priority',    label: 'Priorité', type: 'select', required: true, options: [
          { value: 'P0', label: 'P0 — Urgent' },
          { value: 'P1', label: 'P1 — Important' },
          { value: 'P2', label: 'P2 — Normal' },
          { value: 'P3', label: 'P3 — Plus tard' }
        ]},
        { key: 'eisenhower',  label: 'Quadrant Eisenhower', type: 'select', options: [
          { value: 'UI', label: 'Urgent + Important' },
          { value: '-I', label: 'Pas urgent + Important' },
          { value: 'U-', label: 'Urgent + Pas important' },
          { value: '--', label: 'Ni urgent ni important' }
        ]},
        { key: 'project_id',  label: 'Projet lié', type: 'select', optionsLoader: projectsLoader },
        { key: 'due_at',      label: 'Échéance', type: 'date' }
      ]
    },
    decision: {
      title: 'Décision',
      endpoint: '/api/decisions',
      respKey: 'decision',
      listKey: 'decisions',
      fields: [
        { key: 'title',     label: 'Décision à prendre', required: true, placeholder: 'Critères pour qualifier les RFP…' },
        { key: 'context',   label: 'Contexte', type: 'textarea', rows: 3 },
        { key: 'decision',  label: 'Décision (si tranchée)', type: 'textarea', rows: 2 },
        { key: 'status',    label: 'Statut', type: 'select', options: [
          { value: 'ouverte', label: 'Ouverte' },
          { value: 'tranchee', label: 'Tranchée' },
          { value: 'reportee', label: 'Reportée' },
          { value: 'gelee',    label: 'Gelée' }
        ]},
        { key: 'owner',     label: 'Décideur (optionnel)' },
        { key: 'project_id', label: 'Projet lié', type: 'select', optionsLoader: projectsLoader },
        { key: 'deadline',   label: 'Deadline', type: 'date' }
      ]
    },
    contact: {
      title: 'Contact',
      endpoint: '/api/contacts',
      respKey: 'contact',
      listKey: 'contacts',
      fields: [
        { key: 'name',     label: 'Nom complet', required: true, placeholder: 'Sarah Chen' },
        { key: 'role',     label: 'Rôle / titre', placeholder: 'Tech lead, CFO, Investor…' },
        { key: 'company',  label: 'Société', placeholder: 'Northwind Holdings' },
        { key: 'email',    label: 'Email', type: 'email' },
        { key: 'phone',    label: 'Téléphone' },
        { key: 'trust_level', label: 'Niveau de confiance', type: 'select', options: [
          { value: 'haute',  label: 'Haute' },
          { value: 'moyenne', label: 'Moyenne' },
          { value: 'a-tester', label: 'À tester' },
          { value: 'faible',  label: 'Faible' }
        ]},
        { key: 'notes',    label: 'Notes', type: 'textarea', rows: 3 }
      ]
    }
  };

  // ── Ouvrir un modal pour création ou édition ───────────────────
  async function openCrudModal(entityKey, initialOrId) {
    const e = ENTITIES[entityKey];
    if (!e) return;
    let initial = {};
    let isEdit = false;
    if (typeof initialOrId === 'string') {
      try {
        const data = await api('GET', e.endpoint + '/' + encodeURIComponent(initialOrId));
        initial = data[e.respKey] || data;
        isEdit = true;
      } catch (err) {
        alert('Impossible de charger : ' + err.message);
        return;
      }
    } else if (initialOrId && typeof initialOrId === 'object') {
      initial = initialOrId;
      isEdit = !!initial.id;
    }

    window.AICEOModal.open({
      title: (isEdit ? 'Modifier ' : 'Nouveau ') + e.title.toLowerCase(),
      fields: e.fields,
      initial,
      isEdit,
      onSubmit: async (data, id) => {
        let result = null;
        if (isEdit && id) {
          result = await api('PATCH', e.endpoint + '/' + encodeURIComponent(id), data);
        } else {
          result = await api('POST', e.endpoint, data);
        }
        if (window.AICEOShell && !isEdit) {
          const links = { project: '/v06/projets.html', task: '/v06/taches.html', decision: '/v06/decisions.html', contact: '/v06/equipe.html' };
          const url = links[entityKey];
          if (url && document.body.dataset.route !== entityKey + 's' && document.body.dataset.route !== entityKey) {
            setTimeout(() => {
              const t = document.createElement('div');
              t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text,#111);color:#fff;padding:12px 18px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);z-index:10500;display:flex;gap:14px;align-items:center;font-size:14px';
              t.innerHTML = '<span>' + e.title + ' créé(e) ✓</span><a href="' + url + '" style="color:#fff;text-decoration:underline;font-weight:500">Voir la liste →</a>';
              document.body.appendChild(t);
              setTimeout(() => t.remove(), 4000);
            }, 200);
          }
        }
        setTimeout(() => location.reload(), 800);
      },
      onDelete: async (id) => {
        await api('DELETE', e.endpoint + '/' + encodeURIComponent(id));
        setTimeout(() => location.reload(), 600);
      }
    });
  }

  window.AICEOCrud = { open: openCrudModal };

  function openWithContext(entity, extraInitial) {
    const route = document.body.dataset.route || '';
    const initial = Object.assign({}, extraInitial || {});
    if (route === 'projet') {
      const id = new URLSearchParams(window.location.search).get('id');
      if (id && (entity === 'task' || entity === 'decision')) {
        initial.project_id = id;
      }
    }
    openCrudModal(entity, Object.keys(initial).length ? initial : null);
  }
  window.AICEOCrud.openWithContext = openWithContext;

  function bindButtons() {
    function entityFromText(t) {
      if (!t) return null;
      if (/projet|chantier/i.test(t))       return 'project';
      if (/tâche|tache|action/i.test(t))    return 'task';
      if (/décision|decision/i.test(t))     return 'decision';
      if (/contact|équipe|equipe|membre/i.test(t)) return 'contact';
      return null;
    }
    function tagButtons() {
      const route = document.body.dataset.route || '';
      const map = { projets: 'project', taches: 'task', decisions: 'decision', equipe: 'contact' };
      const ent = map[route];
      $$('button, a').forEach(b => {
        if (b.dataset.new) return;
        const txt = (b.textContent || '').trim().toLowerCase();
        if (/nouveau|nouvelle|ajouter|\+\s*new/i.test(txt) && txt.length < 40) {
          let entity = entityFromText(txt);
          if (!entity) {
            const card = b.closest('section, article, .card, .panel');
            if (card) {
              const title = card.querySelector('.card-title, h2, h3, header h2, header h3');
              if (title) entity = entityFromText(title.textContent || '');
            }
          }
          if (!entity && ent) entity = ent;
          if (entity) {
            b.dataset.new = entity;
            b.style.cursor = 'pointer';
          }
        }
      });
    }
    tagButtons();
    new MutationObserver(tagButtons).observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
      const newBtn = e.target.closest('[data-new]');
      if (newBtn) {
        e.preventDefault();
        e.stopPropagation();
        openWithContext(newBtn.dataset.new);
        return;
      }
      const editEl = e.target.closest('[data-edit]');
      if (editEl) {
        const ent = editEl.dataset.editEntity || autodetectEntity(editEl);
        const id = editEl.dataset.edit || editEl.dataset.id;
        if (ent && id) {
          e.preventDefault();
          openCrudModal(ent, id);
          return;
        }
      }
      const taskRow = e.target.closest('[data-task-id]');
      if (taskRow && !e.target.closest('.task-check, button, a')) {
        const id = taskRow.dataset.taskId;
        if (id) { e.preventDefault(); openCrudModal('task', id); return; }
      }
    });
  }

  function autodetectEntity(el) {
    if (el.dataset.taskId)     return 'task';
    if (el.dataset.projectId)  return 'project';
    if (el.dataset.decisionId) return 'decision';
    if (el.dataset.contactId)  return 'contact';
    return null;
  }

  function bindCapter() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-capter], .btn-capter, #capture-btn, button, a');
      if (!btn) return;
      const text = (btn.textContent || '').toLowerCase().trim();
      const isCapter = btn.matches('[data-capter], .btn-capter, #capture-btn') ||
                       /^(capter|capturer)\b/.test(text) ||
                       /capturer maintenant/.test(text);
      if (!isCapter) return;
      if (btn.dataset.new) return;
      e.preventDefault();
      e.stopPropagation();
      openCrudModal('task');
    });
  }

  function init() {
    bindButtons();
    bindCapter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
