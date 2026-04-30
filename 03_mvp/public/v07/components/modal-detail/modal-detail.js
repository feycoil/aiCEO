// modal-detail.js — S6.12 : rendu enrichi par kind + auto-detection [data-md-kind]
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function safeFetch(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

// === Renderers par kind ===
function statusBadge(status) {
  if (!status) return '';
  const map = {
    open: 'warning', a_trancher: 'warning', pending: 'warning',
    tranchee: 'success', decided: 'success', closed: 'success',
    gelee: 'neutral', frozen: 'neutral', reportee: 'info',
    alerte: 'danger', a_surveiller: 'warning', sain: 'success',
    active: 'info', archived: 'neutral'
  };
  const tone = map[status] || 'neutral';
  return `<span class="md-badge md-badge-${tone}">${escapeHtml(status)}</span>`;
}

function metaGrid(rows) {
  const filtered = rows.filter(r => r && r.length === 2 && r[1] !== undefined && r[1] !== null && r[1] !== '');
  if (!filtered.length) return '';
  return `<dl class="md-meta-grid">${filtered.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
}

function relatedList(title, items, hrefBuilder) {
  if (!items || !items.length) return '';
  return `
    <div class="md-section">
      <h3 class="md-section-title">${escapeHtml(title)} <span class="md-section-meta">${items.length}</span></h3>
      <ul class="md-related-list">
        ${items.slice(0, 10).map(it => `
          <li class="md-related-item">
            <a href="${hrefBuilder(it)}" class="md-related-link">${escapeHtml(it.title || it.name || it.subject || it.label || 'Item')}</a>
            ${it.status ? statusBadge(it.status) : ''}
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

async function renderDecision(d) {
  const ctx = d.context || d.description || '';
  const options = Array.isArray(d.options) ? d.options : [];
  const meta = metaGrid([
    ['Type', d.type ? escapeHtml(d.type) : null],
    ['Statut', d.status ? statusBadge(d.status) : null],
    ['Projet', d.project_name ? `<a href="projets.html?id=${d.project_id || ''}">${escapeHtml(d.project_name)}</a>` : (d.project_id ? `<a href="projets.html?id=${d.project_id}">${d.project_id}</a>` : null)],
    ['Source', d.source || d.source_email_id ? escapeHtml(d.source || ('Email ' + d.source_email_id)) : null],
    ['Creee', d.created_at ? fmtDateTime(d.created_at) : null],
    ['Tranchee', d.tranchee_at ? fmtDateTime(d.tranchee_at) : null],
    ['Resolution', d.resolution ? escapeHtml(d.resolution) : null]
  ]);

  // Pins liees (knowledge)
  let pins = null;
  if (d.id) pins = await safeFetch(`/api/knowledge/from-decision/${d.id}`);
  const pinsList = (pins?.pins || pins || []);

  return {
    body: `
      ${meta}
      ${ctx ? `<div class="md-section"><h3 class="md-section-title">Contexte</h3><div class="md-context"><p>${escapeHtml(ctx).replace(/\n/g, '<br>')}</p></div></div>` : ''}
      ${options.length ? `
        <div class="md-section">
          <h3 class="md-section-title">Options envisagees</h3>
          <ul class="md-options">
            ${options.map(o => `<li>${escapeHtml(typeof o === 'string' ? o : (o.label || o.text || ''))}</li>`).join('')}
          </ul>
        </div>` : ''}
      ${pinsList.length ? relatedList('Pins de connaissance lies', pinsList, p => `connaissance.html#pin-${p.id}`) : ''}
    `,
    foot: `
      ${d.status === 'open' || d.status === 'a_trancher' ? '<button class="md-btn md-btn-primary" data-action="md-trancher">Trancher</button>' : ''}
      ${d.status === 'open' || d.status === 'a_trancher' ? '<button class="md-btn md-btn-llm" data-action="md-recommend" data-id="' + d.id + '">✦ Recommander avec Claude</button>' : ''}
      <button class="md-btn md-btn-ghost" data-action="md-pin" data-id="${d.id}" data-title="${escapeHtml(d.title || '')}">Epingler</button>
      <button class="md-btn md-btn-ghost" data-action="close">Fermer</button>
    `
  };
}

async function renderProject(p) {
  // Fetch related : tasks + decisions
  let tasks = [], decisions = [];
  if (p.id) {
    const [t, d] = await Promise.all([
      safeFetch(`/api/tasks?project_id=${p.id}`),
      safeFetch(`/api/decisions?project_id=${p.id}`)
    ]);
    tasks = t?.tasks || t || [];
    decisions = d?.decisions || d || [];
  }
  const meta = metaGrid([
    ['Statut', statusBadge(p.status || 'active')],
    ['Groupe', p.group_name || p.group || null],
    ['Creee', p.created_at ? fmtDate(p.created_at) : null],
    ['Volume mails 30j', p.email_volume_30d || null],
    ['Actions', `${(tasks || []).filter(x => !x.done).length} ouvertes / ${(tasks || []).length} total`],
    ['Decisions', `${(decisions || []).filter(x => x.status === 'open' || x.status === 'a_trancher').length} a trancher / ${(decisions || []).length} total`]
  ]);

  return {
    body: `
      ${meta}
      ${p.description ? `<div class="md-section"><h3 class="md-section-title">Description</h3><div class="md-context"><p>${escapeHtml(p.description).replace(/\n/g, '<br>')}</p></div></div>` : ''}
      ${relatedList('Actions liees', tasks.filter(t => !t.done).slice(0, 8), t => `taches.html#task-${t.id}`)}
      ${relatedList('Decisions liees', decisions.slice(0, 6), d => `decisions.html#dec-${d.id}`)}
    `,
    foot: `
      <a href="projet.html?id=${p.id}" class="md-btn md-btn-primary">Ouvrir la fiche projet</a>
      <button class="md-btn md-btn-ghost" data-action="close">Fermer</button>
    `
  };
}

async function renderContact(c) {
  // Fetch related projets
  let projects = [];
  if (c.id) {
    const r = await safeFetch(`/api/contacts/${c.id}/projects`);
    projects = r?.projects || r || [];
  }
  const meta = metaGrid([
    ['Email', c.email ? `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>` : null],
    ['Role', c.role || c.title || null],
    ['Organisation', c.org || c.company || null],
    ['Volume mails 30j', c.email_count_30d || c.email_count || null],
    ['Derniere interaction', c.last_email_at ? fmtDate(c.last_email_at) : null],
    ['Trust', c.trust_level || null],
    ['Cree', c.created_at ? fmtDate(c.created_at) : null]
  ]);

  return {
    body: `
      ${meta}
      ${c.notes ? `<div class="md-section"><h3 class="md-section-title">Notes</h3><div class="md-context"><p>${escapeHtml(c.notes).replace(/\n/g, '<br>')}</p></div></div>` : ''}
      ${relatedList('Projets en commun', projects.slice(0, 8), p => `projet.html?id=${p.id}`)}
    `,
    foot: `
      ${c.email ? `<a href="mailto:${escapeHtml(c.email)}" class="md-btn md-btn-primary">Envoyer un email</a>` : ''}
      <button class="md-btn md-btn-ghost" data-action="close">Fermer</button>
    `
  };
}

async function renderTask(t) {
  const eis = (t.urgent ? '🔥 Urgent ' : '') + (t.important ? '⭐ Important' : '');
  const meta = metaGrid([
    ['Statut', t.done ? statusBadge('closed') : statusBadge('open')],
    ['Eisenhower', eis || 'non classifiee'],
    ['Echeance', t.due_date ? fmtDate(t.due_date) : null],
    ['Projet', t.project_name ? `<a href="projet.html?id=${t.project_id}">${escapeHtml(t.project_name)}</a>` : null],
    ['Groupe', t.group_name || null],
    ['Creee', t.created_at ? fmtDateTime(t.created_at) : null]
  ]);

  return {
    body: `
      ${meta}
      ${t.description ? `<div class="md-section"><h3 class="md-section-title">Description</h3><div class="md-context"><p>${escapeHtml(t.description).replace(/\n/g, '<br>')}</p></div></div>` : ''}
    `,
    foot: `
      ${t.done ? '' : '<button class="md-btn md-btn-primary" data-action="md-toggle-done" data-id="' + t.id + '">Marquer fait</button>'}
      <button class="md-btn md-btn-ghost" data-action="close">Fermer</button>
    `
  };
}

async function renderEvent(e) {
  const meta = metaGrid([
    ['Date', e.start ? fmtDateTime(e.start) : null],
    ['Duree', e.start && e.end ? Math.round((new Date(e.end) - new Date(e.start)) / 60000) + ' min' : null],
    ['Organisateur', e.organizer || null],
    ['Statut', e.status ? statusBadge(e.status) : null],
    ['Lieu', e.location || null],
    ['Projet auto-lie', e.project_name ? `<a href="projet.html?id=${e.project_id}">${escapeHtml(e.project_name)}</a>` : null]
  ]);

  return {
    body: `
      ${meta}
      ${e.body_preview ? `<div class="md-section"><h3 class="md-section-title">Apercu</h3><div class="md-context"><p>${escapeHtml(e.body_preview).replace(/\n/g, '<br>')}</p></div></div>` : ''}
      ${e.attendees && e.attendees.length ? `<div class="md-section"><h3 class="md-section-title">Participants <span class="md-section-meta">${e.attendees.length}</span></h3><div class="md-context">${e.attendees.map(a => escapeHtml(a)).join(' · ')}</div></div>` : ''}
    `,
    foot: `<button class="md-btn md-btn-ghost" data-action="close">Fermer</button>`
  };
}

async function renderReview(r) {
  const big = Array.isArray(r.big_rocks) ? r.big_rocks : [];
  const meta = metaGrid([
    ['Semaine', r.week_id || r.week || null],
    ['Statut', r.status ? statusBadge(r.status) : null],
    ['Date', r.created_at ? fmtDate(r.created_at) : null],
    ['Big Rocks', big.length ? `${big.length}/3` : 'aucune']
  ]);

  return {
    body: `
      ${meta}
      ${r.intention ? `<div class="md-section"><h3 class="md-section-title">Intention</h3><div class="md-context"><p style="font-size:15px;font-weight:500"><strong>${escapeHtml(r.intention)}</strong></p></div></div>` : ''}
      ${big.length ? `
        <div class="md-section">
          <h3 class="md-section-title">Big Rocks <span class="md-section-meta">${big.length}/3</span></h3>
          <ol class="md-options" style="counter-reset:rocks">
            ${big.map((rock, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(typeof rock === 'string' ? rock : (rock.title || rock.label || ''))}</li>`).join('')}
          </ol>
        </div>` : ''}
      ${r.draft ? `<div class="md-section"><h3 class="md-section-title">Notes auto-draft</h3><div class="md-context"><p>${escapeHtml(r.draft).replace(/\n/g, '<br>')}</p></div></div>` : ''}
    `,
    foot: `<button class="md-btn md-btn-ghost" data-action="close">Fermer</button>`
  };
}

function renderGeneric(data) {
  const ctx = data.context || data.description || '';
  const meta = metaGrid([
    ['Type', data.type || null],
    ['Statut', data.status ? statusBadge(data.status) : null],
    ['Cree', data.created_at ? fmtDateTime(data.created_at) : null]
  ]);
  return {
    body: `${meta}${ctx ? `<div class="md-context"><p>${escapeHtml(ctx).replace(/\n/g, '<br>')}</p></div>` : ''}`,
    foot: `<button class="md-btn md-btn-ghost" data-action="close">Fermer</button>`
  };
}

const RENDERERS = {
  decision: renderDecision,
  project: renderProject,
  contact: renderContact,
  task: renderTask,
  event: renderEvent,
  review: renderReview
};

export default {
  mount(el, props = {}) {
    const root = el.querySelector('.md') || el.firstElementChild;
    if (!root) return;
    const close = () => { root.hidden = true; document.body.style.overflow = ''; };

    root.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="close"]')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !root.hidden) close();
    });

    // API publique : el.openWith({kind, ...data})
    el.openWith = async (data) => {
      const title = root.querySelector('[data-region="md-title"]');
      const body = root.querySelector('[data-region="md-body"]');
      const foot = root.querySelector('[data-region="md-foot"]');

      const kind = data.kind || data._kind || 'generic';
      if (title) title.textContent = data.title || data.name || data.subject || 'Detail';

      // Loading
      if (body) body.innerHTML = '<div class="md-loading">Chargement...</div>';
      if (foot) foot.innerHTML = '';
      root.hidden = false;
      document.body.style.overflow = 'hidden';

      const renderer = RENDERERS[kind] || renderGeneric;
      let result;
      try { result = await renderer(data); }
      catch (err) { console.error('[modal-detail]', err); result = renderGeneric(data); }

      if (body) body.innerHTML = result.body;
      if (foot) foot.innerHTML = result.foot;

      // Bind actions footer
      foot?.querySelectorAll('[data-action]').forEach(btn => {
        const action = btn.dataset.action;
        if (action === 'close') return; // deja gere par root listener
        btn.addEventListener('click', async () => {
          if (action === 'md-pin') {
            const r = await fetch('/api/knowledge/pins', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'decision', title: btn.dataset.title, source_decision_id: btn.dataset.id })
            });
            if (r.ok) { btn.textContent = '✓ Epingle'; btn.disabled = true; }
          } else if (action === 'md-trancher') {
            window.location.href = `arbitrage.html`;
          } else if (action === 'md-recommend') {
            // S6.21 LLM frontend - decision-recommend
            const id = btn.dataset.id;
            const orig = btn.textContent;
            btn.disabled = true; btn.textContent = '✦ Claude reflechit...';
            try {
              const r = await fetch('/api/decision-recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision_id: id })
              });
              const data = await r.json();
              const body = root.querySelector('[data-region="md-body"]');
              if (body && data?.recommendation) {
                const reco = document.createElement('div');
                reco.className = 'md-section';
                reco.innerHTML = '<h3 class="md-section-title">✦ Recommandation Claude</h3><div class="md-context" style="background:var(--primary-50);padding:var(--space-3);border-radius:var(--radius-md);border-left:3px solid var(--primary-500)"><p>' + escapeHtml(data.recommendation).replace(/\n/g, '<br>') + '</p></div>';
                body.appendChild(reco);
                btn.textContent = '✓ Recommandation generee'; btn.disabled = true;
              } else if (data?.fallback) {
                btn.textContent = '○ Mode degrade - regle: ' + (data.fallback || ''); btn.disabled = false;
                setTimeout(() => { btn.textContent = orig; }, 4000);
              } else {
                btn.textContent = '✗ Erreur'; btn.disabled = false;
                setTimeout(() => { btn.textContent = orig; }, 2000);
              }
            } catch (err) {
              btn.textContent = '✗ ' + err.message; btn.disabled = false;
              setTimeout(() => { btn.textContent = orig; }, 3000);
            }
          } else if (action === 'md-toggle-done') {
            await fetch(`/api/tasks/${btn.dataset.id}`, {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ done: true, done_at: new Date().toISOString() })
            });
            btn.textContent = '✓ Fait'; btn.disabled = true;
            setTimeout(close, 600);
          }
        });
      });
    };

    // Listeners custom events (compat S6.10) + nouveaux
    document.addEventListener('decision:open', (e) => { if (e.detail) el.openWith({ kind: 'decision', ...(e.detail.decision || e.detail) }); });
    document.addEventListener('project:open',  (e) => { if (e.detail) el.openWith({ kind: 'project',  ...(e.detail.project  || e.detail) }); });
    document.addEventListener('contact:open',  (e) => { if (e.detail) el.openWith({ kind: 'contact',  ...(e.detail.contact  || e.detail) }); });
    document.addEventListener('task:open',     (e) => { if (e.detail) el.openWith({ kind: 'task',     ...(e.detail.task     || e.detail) }); });
    document.addEventListener('event:open',    (e) => { if (e.detail) el.openWith({ kind: 'event',    ...(e.detail.event    || e.detail) }); });
    document.addEventListener('review:open',   (e) => { if (e.detail) el.openWith({ kind: 'review',   ...(e.detail.review   || e.detail) }); });

    // Auto-detection : tout element [data-md-kind][data-md-id] devient cliquable
    document.addEventListener('click', async (ev) => {
      const trigger = ev.target.closest('[data-md-kind][data-md-id]');
      if (!trigger) return;
      // Ne pas intercepter les clics sur les liens internes ou actions inline
      if (ev.target.closest('a, button[data-action], [data-no-md]')) return;
      ev.preventDefault();
      const kind = trigger.dataset.mdKind;
      const id = trigger.dataset.mdId;
      // Fetch l item
      const endpoints = {
        decision: `/api/decisions/${id}`,
        project:  `/api/projects/${id}`,
        contact:  `/api/contacts/${id}`,
        task:     `/api/tasks/${id}`,
        event:    `/api/events/${id}`,
        review:   `/api/weekly-reviews/${id}`
      };
      const url = endpoints[kind];
      if (!url) return;
      const data = await safeFetch(url);
      if (data) el.openWith({ kind, ...data });
    });
  }
};
