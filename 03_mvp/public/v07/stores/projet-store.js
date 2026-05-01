// projet-store.js (S6.34) - page detail UN projet
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function safeFetch(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
}

function emptyState(title, desc, ctaLabel, ctaHref) {
  return '<div class="empty-state-v2"><div class="empty-state-v2-title">' + escHtml(title) + '</div><div class="empty-state-v2-desc">' + desc + '</div><a class="empty-state-v2-cta" href="' + ctaHref + '">' + escHtml(ctaLabel) + '</a></div>';
}

function kpiTile(label, value, tone) {
  return '<div class="kpi-tile" data-tone="' + tone + '"><div class="kpi-tile-label">' + escHtml(label) + '</div><div class="kpi-tile-value">' + escHtml(String(value)) + '</div></div>';
}

function renderHero(p) {
  const status = (p.status || 'active').toLowerCase();
  const labels = { active: 'Actif', hot: 'Hot', new: 'Nouveau', alerte: 'Alerte', a_surveiller: 'A surveiller', sain: 'Sain', archived: 'Archive' };
  const lbl = labels[status] || status;
  let h = '<div class="proj-hero">';
  h += '<div class="proj-status-pill is-' + escHtml(status) + '">' + escHtml(lbl) + '</div>';
  if (p.parent) h += '<div class="proj-parent-link">Sous-projet de <a href="projet.html?id=' + encodeURIComponent(p.parent.id) + '">' + escHtml(p.parent.name) + '</a></div>';
  h += '<h2 class="proj-hero-title">' + escHtml(p.name || '') + '</h2>';
  if (p.tagline) h += '<p class="proj-hero-tagline">' + escHtml(p.tagline) + '</p>';
  h += '</div>';
  return h;
}

function renderKpis(p) {
  const c = p.counts || {};
  const v = p.velocity_pct || 0;
  const vTone = v >= 70 ? 'success' : (v >= 40 ? 'warning' : 'danger');
  const tTone = (c.tasks_open || 0) > 5 ? 'warning' : 'neutral';
  const dTone = (c.decisions_open || 0) > 0 ? 'warning' : 'success';
  let h = '<div class="kpi-row" style="margin-top:24px">';
  h += kpiTile('Velocite', v + '%', vTone);
  h += kpiTile('Actions ouvertes', c.tasks_open || 0, tTone);
  h += kpiTile('Cloturees 30j', c.tasks_done_30d || 0, 'success');
  h += kpiTile('Decisions ouvertes', c.decisions_open || 0, dTone);
  h += '</div>';
  return h;
}

function renderEffort(p) {
  const done = Number(p.effort_done_days || 0);
  const remaining = Number(p.effort_remaining_days || 0);
  const total = done + remaining;
  if (total <= 0) return '';
  const ratio = Math.round(done / total * 100);
  let h = '<div class="proj-effort">';
  h += '<h3 class="proj-section-title">Effort</h3>';
  h += '<div class="proj-effort-bar"><div class="proj-effort-bar-fill" style="width:' + ratio + '%"></div></div>';
  h += '<div class="proj-effort-meta">';
  h += '<span><strong>' + done + '</strong> j fournis</span>';
  h += '<span><strong>' + remaining + '</strong> j restants</span>';
  h += '<span>Total ' + total + ' j</span>';
  h += '</div></div>';
  return h;
}

function renderChildren(p) {
  if (!p.children || !p.children.length) return '';
  let h = '<div class="proj-section">';
  h += '<h3 class="proj-section-title">Sous-projets <span class="proj-count">' + p.children.length + '</span></h3>';
  h += '<div class="proj-children">';
  p.children.forEach(c => {
    const st = (c.status || 'active').toLowerCase();
    h += '<a class="proj-child-card" href="projet.html?id=' + encodeURIComponent(c.id) + '">';
    h += '<div class="proj-child-status is-' + escHtml(st) + '"></div>';
    h += '<div><div class="proj-child-name">' + escHtml(c.name) + '</div>';
    if (c.tagline) h += '<div class="proj-child-tagline">' + escHtml(c.tagline) + '</div>';
    h += '</div></a>';
  });
  h += '</div></div>';
  return h;
}

function renderDecisions(p) {
  if (!p.recent_decisions || !p.recent_decisions.length) return '';
  let h = '<div class="proj-section">';
  h += '<h3 class="proj-section-title">Decisions recentes <span class="proj-count">' + p.recent_decisions.length + '</span></h3>';
  h += '<ul class="proj-list">';
  p.recent_decisions.forEach(d => {
    const st = (d.status || 'open').toLowerCase();
    h += '<li><span class="proj-list-status is-' + escHtml(st) + '"></span><a href="decisions.html#dec-' + encodeURIComponent(d.id) + '">' + escHtml(d.title) + '</a></li>';
  });
  h += '</ul></div>';
  return h;
}

function renderTasks(p) {
  if (!p.recent_tasks || !p.recent_tasks.length) return '';
  let h = '<div class="proj-section">';
  h += '<h3 class="proj-section-title">Actions recentes <span class="proj-count">' + p.recent_tasks.length + '</span></h3>';
  h += '<ul class="proj-list">';
  p.recent_tasks.forEach(t => {
    const check = t.done ? '<span class="proj-task-check is-done">&#x2713;</span>' : '<span class="proj-task-check"></span>';
    const st = t.done ? 'text-decoration:line-through;color:var(--ink-500)' : '';
    h += '<li>' + check + '<span style="' + st + '">' + escHtml(t.title) + '</span>';
    if (t.priority) h += ' <span class="proj-task-prio">' + escHtml(t.priority) + '</span>';
    h += '</li>';
  });
  h += '</ul></div>';
  return h;
}

function renderDescription(p) {
  if (!p.description) return '';
  let h = '<div class="proj-section">';
  h += '<h3 class="proj-section-title">Description</h3>';
  h += '<div class="proj-context">' + escHtml(p.description).replace(/\n/g, '<br>') + '</div>';
  h += '</div>';
  return h;
}

// S6.39 : section Rattachement (axes domain + company editables)
function renderAxes(p) {
  const dom = p.domain || null;
  const comp = p.company || null;
  const dColor = (dom && dom.color) || '#7C3AED';
  const cColor = (comp && comp.color) || '#0F172A';
  let h = '<div class="proj-section">';
  h += '<h3 class="proj-section-title">Rattachement</h3>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px">';
  // Domain selector
  h += '<div style="flex:1;min-width:200px"><label style="display:block;font-size:11px;color:var(--text-3);margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Domaine</label>';
  if (dom) {
    h += '<div class="cd-axis-chip" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:14px;background:' + dColor + '22;color:' + dColor + ';font-weight:600;border:1px solid ' + dColor + '40">' + (dom.icon || '◯') + ' ' + escHtml(dom.name) + '</div>';
  } else {
    h += '<div style="color:var(--text-3);font-size:13px;font-style:italic">Non rattache</div>';
  }
  h += ' <select data-axis="domain" data-pid="' + escHtml(p.id) + '" style="margin-left:8px;padding:4px 8px;border:1px solid var(--ivory-300);border-radius:6px;font-size:12px"><option value="">— Choisir —</option>';
  axesDomains.forEach(d => { h += '<option value="' + escHtml(d.id) + '"' + (dom && dom.id === d.id ? ' selected' : '') + '>' + (d.icon || '') + ' ' + escHtml(d.name) + '</option>'; });
  h += '</select></div>';
  // Company selector
  h += '<div style="flex:1;min-width:200px"><label style="display:block;font-size:11px;color:var(--text-3);margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Societe</label>';
  if (comp) {
    h += '<div class="cd-axis-chip" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:14px;background:' + cColor + '15;color:' + cColor + ';font-weight:600;border:1px solid ' + cColor + '30">' + (comp.icon || '🏢') + ' ' + escHtml(comp.name) + '</div>';
  } else {
    h += '<div style="color:var(--text-3);font-size:13px;font-style:italic">Non rattachee</div>';
  }
  h += ' <select data-axis="company" data-pid="' + escHtml(p.id) + '" style="margin-left:8px;padding:4px 8px;border:1px solid var(--ivory-300);border-radius:6px;font-size:12px"><option value="">— Choisir —</option>';
  axesCompanies.forEach(c => { h += '<option value="' + escHtml(c.id) + '"' + (comp && comp.id === c.id ? ' selected' : '') + '>' + (c.icon || '') + ' ' + escHtml(c.name) + '</option>'; });
  h += '</select></div>';
  h += '</div>';
  h += '<p style="margin:10px 0 0;font-size:12px;color:var(--text-3)">Gerer les axes : <a href="axes.html">/axes</a></p>';
  h += '</div>';
  return h;
}

// S6.39 : section Emails lies (5 derniers)
function renderEmails(p) {
  const emails = p._emails || [];
  if (!emails.length) return '';
  let h = '<div class="proj-section">';
  h += '<h3 class="proj-section-title">Emails lies <span class="proj-count">' + emails.length + '</span></h3>';
  h += '<ul class="proj-list" style="margin-top:8px">';
  emails.slice(0, 5).forEach(e => {
    const date = (e.received_at || '').slice(0, 10);
    h += '<li style="padding:6px 0;border-bottom:1px solid var(--ivory-200)"><strong>' + escHtml(e.from_name || e.from_email || '?') + '</strong> · <span style="color:var(--text-3);font-size:12px">' + date + '</span><div style="font-size:13px;margin-top:2px">' + escHtml((e.subject || '').slice(0, 100)) + '</div></li>';
  });
  h += '</ul></div>';
  return h;
}

function bindAxesEdit() {
  document.querySelectorAll('select[data-axis]').forEach(sel => {
    if (sel.dataset.bound) return;
    sel.dataset.bound = '1';
    sel.addEventListener('change', async () => {
      const pid = sel.dataset.pid;
      const axis = sel.dataset.axis;
      const val = sel.value || null;
      const field = axis === 'domain' ? 'domain_id' : 'company_id';
      const body = {};
      body[field] = val;
      try {
        await fetch('/api/projects/' + encodeURIComponent(pid), {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        // Reload pour refleter le changement (chip + select sync)
        load();
      } catch (e) { alert('Erreur : ' + e.message); }
    });
  });
}

function render(p) {
  const titleEl = document.querySelector('.ht-title');
  const subtitleEl = document.querySelector('.ht-subtitle');
  if (titleEl) titleEl.textContent = p.name || 'Projet';
  if (subtitleEl) subtitleEl.textContent = p.tagline || p.description || '';
  const host = document.querySelector('[data-region="projet-content"]');
  if (!host) return;
  let html = '';
  html += renderHero(p);
  html += renderKpis(p);
  html += renderAxes(p);   // S6.39
  html += renderEffort(p);
  html += renderDescription(p);
  html += renderChildren(p);
  html += renderDecisions(p);
  html += renderTasks(p);
  html += renderEmails(p); // S6.39
  const empty = !p.description && (!p.children || !p.children.length) && (!p.recent_decisions || !p.recent_decisions.length) && (!p.recent_tasks || !p.recent_tasks.length) && (!p._emails || !p._emails.length);
  if (empty) html += emptyState('Projet vierge', 'Aucune action, decision ni sous-projet pour l instant.', 'Lancer le Triage', 'arbitrage.html');
  host.innerHTML = html;
  bindAxesEdit();  // S6.39 : wire les selects domaine/societe
}

// S6.39 : caches axes pour edition rattachement
let axesDomains = [];
let axesCompanies = [];

async function loadAxes() {
  try {
    const [d, c] = await Promise.all([
      safeFetch('/api/domains'),
      safeFetch('/api/companies')
    ]);
    axesDomains = (d && d.domains) || [];
    axesCompanies = (c && c.companies) || [];
  } catch (e) {}
}

async function load() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const host = document.querySelector('[data-region="projet-content"]');
  // Fix titre 'Chargement...' : remplacer par '...' neutre tant que data n arrive pas
  const subtitleEl = document.querySelector('.ht-subtitle');
  if (subtitleEl && subtitleEl.textContent.trim() === 'Chargement...') subtitleEl.textContent = '';
  if (!host) return;
  if (!id) {
    host.innerHTML = emptyState('Aucun projet selectionne', 'L URL doit contenir <code>?id=&lt;project-id&gt;</code>.', 'Voir tous les projets', 'projets.html');
    return;
  }
  // Charger axes en parallele du projet
  await Promise.all([loadAxes(), Promise.resolve()]);
  const data = await safeFetch('/api/projects/' + encodeURIComponent(id));
  if (!data || !data.project) {
    host.innerHTML = emptyState('Projet introuvable', 'Cet identifiant n existe pas.', 'Voir tous les projets', 'projets.html');
    return;
  }
  // Charger emails lies (best effort)
  let emails = [];
  try {
    const eRes = await safeFetch('/api/projects/' + encodeURIComponent(id) + '/emails');
    emails = (eRes && eRes.emails) || [];
  } catch (e) {}
  data.project._emails = emails;
  render(data.project);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  load();
} else {
  document.addEventListener('DOMContentLoaded', load);
}
