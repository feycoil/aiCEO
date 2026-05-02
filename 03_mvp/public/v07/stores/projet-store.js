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

// S6.44 : Decisions liees TOUJOURS visibles (avec empty state explicite)
function renderDecisions(p) {
  const list = p.recent_decisions || [];
  let h = '<div class="proj-section" style="background:var(--paper);border:1px solid var(--ivory-200);border-radius:10px;padding:16px;margin-top:16px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
  h += '<h3 class="proj-section-title" style="margin:0;font-size:15px;font-weight:600">🎯 Decisions liees <span class="proj-count" style="color:var(--ink-500);font-weight:400">(' + list.length + ')</span></h3>';
  h += '<a href="decisions.html?project=' + encodeURIComponent(p.id) + '" style="font-size:12px;color:#7C3AED;text-decoration:none">Toutes les decisions →</a>';
  h += '</div>';
  if (!list.length) {
    h += '<div style="padding:16px;text-align:center;background:var(--ivory-50);border-radius:6px;color:var(--ink-500);font-size:13px"><em>Aucune decision liee a ce projet.</em><br><a href="decisions.html?new=1&project=' + encodeURIComponent(p.id) + '" style="color:#7C3AED;font-size:12px;display:inline-block;margin-top:6px">+ Creer une decision</a></div>';
  } else {
    h += '<ul class="proj-list" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">';
    list.forEach(d => {
      const st = (d.status || 'open').toLowerCase();
      const stColor = ['decidee','executee','tranchee'].includes(st) ? '#10b981' : (st === 'reportee' ? '#f59e0b' : '#3b82f6');
      h += '<li style="padding:8px 12px;background:var(--ivory-50);border-radius:6px;display:flex;align-items:center;gap:10px"><span style="width:8px;height:8px;border-radius:50%;background:' + stColor + '"></span><a href="decisions.html#dec-' + encodeURIComponent(d.id) + '" style="flex:1;color:var(--ink-900);text-decoration:none;font-size:13px">' + escHtml(d.title) + '</a><span style="font-size:11px;color:var(--ink-500);text-transform:uppercase;font-weight:600">' + escHtml(st) + '</span></li>';
    });
    h += '</ul>';
  }
  h += '</div>';
  return h;
}

// S6.44 : Actions liees TOUJOURS visibles (avec empty state explicite)
function renderTasks(p) {
  const list = p.recent_tasks || [];
  const open = list.filter(t => !t.done);
  const done = list.filter(t => t.done);
  let h = '<div class="proj-section" style="background:var(--paper);border:1px solid var(--ivory-200);border-radius:10px;padding:16px;margin-top:16px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
  h += '<h3 class="proj-section-title" style="margin:0;font-size:15px;font-weight:600">✓ Actions liees <span class="proj-count" style="color:var(--ink-500);font-weight:400">(' + open.length + ' ouvertes' + (done.length ? ' / ' + done.length + ' faites' : '') + ')</span></h3>';
  h += '<a href="taches.html?project=' + encodeURIComponent(p.id) + '" style="font-size:12px;color:#7C3AED;text-decoration:none">Toutes les actions →</a>';
  h += '</div>';
  if (!list.length) {
    h += '<div style="padding:16px;text-align:center;background:var(--ivory-50);border-radius:6px;color:var(--ink-500);font-size:13px"><em>Aucune action liee a ce projet.</em><br><a href="taches.html?new=1&project=' + encodeURIComponent(p.id) + '" style="color:#7C3AED;font-size:12px;display:inline-block;margin-top:6px">+ Creer une action</a></div>';
  } else {
    h += '<ul class="proj-list" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">';
    list.forEach(t => {
      const check = t.done ? '<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;background:#10b981;color:white;font-size:11px;font-weight:700">✓</span>' : '<span style="display:inline-block;width:18px;height:18px;border-radius:4px;border:2px solid var(--ivory-300)"></span>';
      const st = t.done ? 'text-decoration:line-through;color:var(--ink-500)' : 'color:var(--ink-900)';
      const prioColor = t.priority === 'P0' ? '#dc2626' : (t.priority === 'P1' ? '#f59e0b' : '#94a3b8');
      h += '<li style="padding:8px 12px;background:var(--ivory-50);border-radius:6px;display:flex;align-items:center;gap:10px">' + check + '<span style="flex:1;font-size:13px;' + st + '">' + escHtml(t.title) + '</span>';
      if (t.priority) h += '<span style="font-size:11px;color:' + prioColor + ';font-weight:700;font-family:var(--font-mono)">' + escHtml(t.priority) + '</span>';
      h += '</li>';
    });
    h += '</ul>';
  }
  h += '</div>';
  return h;
}

// S6.44 : Bandeau IA contextuel (4 actions Claude sur le projet)
function renderAIBanner(p) {
  const titleParam = p.name ? '&title=' + encodeURIComponent(p.name) : '';
  return `<div style="background:linear-gradient(135deg,#f5f3ff 0%,#fdf4ff 100%);border:1px solid #ddd6fe;border-radius:12px;padding:18px;margin-top:16px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:22px">✦</span>
      <div style="flex:1">
        <div style="font-weight:700;color:#5b21b6;font-size:15px">Claude connait ce projet</div>
        <div style="font-size:12px;color:var(--ink-500);margin-top:2px">Toutes les infos ci-dessus (emails, decisions, actions, sous-projets) sont automatiquement injectees dans le contexte LLM. Demandez :</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
      <a href="assistant.html?context=project:${encodeURIComponent(p.id)}${titleParam}&prompt=synthese" style="padding:10px 12px;background:white;border:1px solid #ddd6fe;border-radius:8px;text-decoration:none;color:var(--ink-900);font-size:13px;font-weight:600;text-align:center;transition:all 150ms"><div style="font-size:18px;margin-bottom:4px">📝</div>Synthetiser ce projet</a>
      <a href="assistant.html?context=project:${encodeURIComponent(p.id)}${titleParam}&prompt=next-action" style="padding:10px 12px;background:white;border:1px solid #ddd6fe;border-radius:8px;text-decoration:none;color:var(--ink-900);font-size:13px;font-weight:600;text-align:center;transition:all 150ms"><div style="font-size:18px;margin-bottom:4px">🎯</div>Prochaine action ?</a>
      <a href="assistant.html?context=project:${encodeURIComponent(p.id)}${titleParam}&prompt=risks" style="padding:10px 12px;background:white;border:1px solid #ddd6fe;border-radius:8px;text-decoration:none;color:var(--ink-900);font-size:13px;font-weight:600;text-align:center;transition:all 150ms"><div style="font-size:18px;margin-bottom:4px">⚠️</div>Detecter risques</a>
      <a href="assistant.html?context=project:${encodeURIComponent(p.id)}${titleParam}" style="padding:10px 12px;background:#7C3AED;border:1px solid #7C3AED;border-radius:8px;text-decoration:none;color:white;font-size:13px;font-weight:600;text-align:center;transition:all 150ms"><div style="font-size:18px;margin-bottom:4px">💬</div>Demander a Claude</a>
    </div>
  </div>`;
}

// S6.44 : Hero refonte avec velocite + KPIs en bandeau
function renderHeroV2(p) {
  const status = (p.status || 'active').toLowerCase();
  const statusLabel = { active: 'Actif', hot: 'Hot', alerte: 'Alerte', a_surveiller: 'A surveiller', sain: 'Sain', new: 'Nouveau', archived: 'Archive' }[status] || status;
  const stColor = ['hot','alerte'].includes(status) ? '#dc2626' : (status === 'a_surveiller' ? '#f59e0b' : '#10b981');
  const dom = p.domain || null;
  const comp = p.company || null;
  let h = '<div style="background:var(--paper);border:1px solid var(--ivory-200);border-radius:12px;padding:18px;margin-top:8px">';
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">';
  h += '<span style="display:inline-block;padding:3px 10px;border-radius:11px;font-size:11px;font-weight:700;background:' + stColor + '20;color:' + stColor + ';text-transform:uppercase">' + escHtml(statusLabel) + '</span>';
  if (dom) h += '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:11px;font-size:12px;font-weight:600;background:' + (dom.color || '#7C3AED') + '20;color:' + (dom.color || '#7C3AED') + '">' + (dom.icon || '◯') + ' ' + escHtml(dom.name) + '</span>';
  if (comp) h += '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:11px;font-size:12px;font-weight:600;background:' + (comp.color || '#0F172A') + '15;color:' + (comp.color || '#0F172A') + '">' + (comp.icon || '🏢') + ' ' + escHtml(comp.name) + '</span>';
  h += '</div>';
  if (p.tagline) h += '<p style="margin:8px 0 0;color:var(--ink-700);font-size:14px;line-height:1.5">' + escHtml(p.tagline) + '</p>';
  h += '</div>';
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

// S6.44 : render refonte — ordre logique pour CEO
// 1. Hero compact (status + axes + tagline)
// 2. KPIs (Velocite + Actions + Decisions + Cloturees)
// 3. Banner IA (4 actions Claude contextuelles)
// 4. Actions liees + Decisions liees (cote-a-cote ou empilees)
// 5. Sous-projets + Emails lies
// 6. Rattachement editable (en bas, secondaire)
// 7. Description / Effort
function render(p) {
  const titleEl = document.querySelector('.ht-title');
  const subtitleEl = document.querySelector('.ht-subtitle');
  if (titleEl) titleEl.textContent = p.name || 'Projet';
  if (subtitleEl) subtitleEl.textContent = 'Vue 360° · ' + ((p.recent_tasks||[]).filter(t=>!t.done).length) + ' action(s) ouverte(s) · ' + ((p.recent_decisions||[]).filter(d=>(d.status||'').toLowerCase()==='ouverte').length) + ' decision(s) a trancher';
  const host = document.querySelector('[data-region="projet-content"]');
  if (!host) return;
  let html = '';
  html += renderHeroV2(p);    // S6.44 : hero compact avec axes
  html += renderKpis(p);       // KPIs Velocite / Actions / Decisions / Cloturees
  html += renderAIBanner(p);   // S6.44 : bandeau IA contextuel (4 actions Claude)
  // Actions + Decisions cote-a-cote sur grand ecran
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:16px;margin-top:0">';
  html += renderTasks(p);      // S6.44 : toujours visible avec empty state
  html += renderDecisions(p);  // S6.44 : toujours visible avec empty state
  html += '</div>';
  html += renderChildren(p);   // sous-projets si applicable
  html += renderEmails(p);     // 5 derniers emails lies
  html += renderAxes(p);       // Rattachement editable (en bas, secondaire)
  html += renderEffort(p);
  html += renderDescription(p);
  host.innerHTML = html;
  bindAxesEdit();
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
