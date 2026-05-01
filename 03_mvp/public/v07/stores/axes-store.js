// axes-store.js — S6.39 — Gestion CRUD des Domaines + Sociétés
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = { domains: [], companies: [] };

async function safeFetch(url, opts) {
  try {
    const r = await fetch(url, opts || {});
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.warn('[axes] HTTP', r.status, url, txt);
      return null;
    }
    return await r.json();
  } catch (e) { console.warn('[axes] fetch fail', url, e); return null; }
}

async function loadDomains() {
  const data = await safeFetch('/api/domains');
  state.domains = (data && data.domains) || [];
  renderDomains();
}

async function loadCompanies() {
  const data = await safeFetch('/api/companies');
  state.companies = (data && data.companies) || [];
  renderCompanies();
}

function renderDomains() {
  const host = document.querySelector('[data-region="domains-list"]');
  const count = document.querySelector('[data-region="domains-count"]');
  if (!host) return;
  if (count) count.textContent = String(state.domains.length);
  if (!state.domains.length) {
    host.innerHTML = '<div class="axes-empty">Aucun domaine. Ajoutez-en ci-dessous.</div>';
    return;
  }
  host.innerHTML = state.domains.map(d => `
    <div class="axes-item" data-id="${escHtml(d.id)}">
      <div class="axes-item-icon" style="background:${escHtml(d.color || '#94A3B8')}22;color:${escHtml(d.color || '#94A3B8')}">
        ${escHtml(d.icon || '◯')}
      </div>
      <div class="axes-item-body">
        <div class="axes-item-name">${escHtml(d.name)}</div>
        <div class="axes-item-meta">${(d.projects_count || 0)} projet(s) · slug : <code>${escHtml(d.slug)}</code></div>
      </div>
      <div class="axes-item-actions">
        <button class="axes-btn" data-action="edit-domain">Renommer</button>
        ${(d.projects_count || 0) === 0 ? '<button class="axes-btn axes-btn-danger" data-action="del-domain">×</button>' : ''}
      </div>
    </div>
  `).join('');
  host.querySelectorAll('[data-action="edit-domain"]').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      const id = btn.closest('[data-id]').dataset.id;
      const dom = state.domains.find(d => d.id === id);
      const newName = prompt('Nouveau nom :', dom.name);
      if (!newName || newName.trim() === dom.name) return;
      await safeFetch('/api/domains/' + encodeURIComponent(id), {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      loadDomains();
    });
  });
  host.querySelectorAll('[data-action="del-domain"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('[data-id]').dataset.id;
      if (!confirm('Supprimer ce domaine ?')) return;
      await safeFetch('/api/domains/' + encodeURIComponent(id), { method: 'DELETE' });
      loadDomains();
    });
  });
}

function renderCompanies() {
  const host = document.querySelector('[data-region="companies-list"]');
  const count = document.querySelector('[data-region="companies-count"]');
  if (!host) return;
  if (count) count.textContent = String(state.companies.length);
  if (!state.companies.length) {
    host.innerHTML = '<div class="axes-empty">Aucune société. Ajoutez-en ci-dessous.</div>';
    return;
  }
  host.innerHTML = state.companies.map(c => `
    <div class="axes-item" data-id="${escHtml(c.id)}">
      <div class="axes-item-icon" style="background:${escHtml(c.color || '#94A3B8')}22;color:${escHtml(c.color || '#94A3B8')}">
        ${escHtml(c.icon || '🏢')}
      </div>
      <div class="axes-item-body">
        <div class="axes-item-name">${escHtml(c.name)}</div>
        <div class="axes-item-meta">${(c.projects_count || 0)} projet(s) · slug : <code>${escHtml(c.slug)}</code></div>
      </div>
      <div class="axes-item-actions">
        <button class="axes-btn" data-action="edit-company">Renommer</button>
        ${(c.projects_count || 0) === 0 ? '<button class="axes-btn axes-btn-danger" data-action="del-company">×</button>' : ''}
      </div>
    </div>
  `).join('');
  host.querySelectorAll('[data-action="edit-company"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('[data-id]').dataset.id;
      const c = state.companies.find(x => x.id === id);
      const newName = prompt('Nouveau nom :', c.name);
      if (!newName || newName.trim() === c.name) return;
      await safeFetch('/api/companies/' + encodeURIComponent(id), {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      loadCompanies();
    });
  });
  host.querySelectorAll('[data-action="del-company"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('[data-id]').dataset.id;
      if (!confirm('Supprimer cette société ?')) return;
      await safeFetch('/api/companies/' + encodeURIComponent(id), { method: 'DELETE' });
      loadCompanies();
    });
  });
}

function bindForms() {
  const dForm = document.querySelector('[data-region="domains-form"]');
  if (dForm) {
    dForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(dForm);
      const name = String(fd.get('name') || '').trim();
      if (!name) return;
      const r = await safeFetch('/api/domains', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon: fd.get('icon') || null, color: fd.get('color') || null })
      });
      if (r) { dForm.reset(); loadDomains(); }
    });
  }
  const cForm = document.querySelector('[data-region="companies-form"]');
  if (cForm) {
    cForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(cForm);
      const name = String(fd.get('name') || '').trim();
      if (!name) return;
      const r = await safeFetch('/api/companies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon: fd.get('icon') || null, color: fd.get('color') || null })
      });
      if (r) { cForm.reset(); loadCompanies(); }
    });
  }
}

function bindActions() {
  // S6.40 : auto-classification heuristique
  const classifyBtn = document.querySelector('[data-action="classify-projects"]');
  const classifyResult = document.querySelector('[data-region="classify-result"]');
  if (classifyBtn && !classifyBtn.dataset.bound) {
    classifyBtn.dataset.bound = '1';
    classifyBtn.addEventListener('click', async () => {
      classifyBtn.disabled = true;
      classifyBtn.textContent = 'Analyse en cours...';
      classifyResult.hidden = false;
      classifyResult.classList.remove('is-error');
      classifyResult.textContent = 'Lecture des projets et matching keywords...';
      try {
        // 1. Preview
        const previewR = await safeFetch('/api/projects/auto-classify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ apply: false }) });
        if (!previewR) throw new Error('Reponse invalide');
        const n = previewR.proposed_count || 0;
        if (n === 0) {
          classifyResult.textContent = 'Aucun projet a classer (tous deja classifies ou aucun mot-cle match).';
          classifyBtn.disabled = false;
          classifyBtn.textContent = 'Lancer la classification';
          return;
        }
        const preview = (previewR.proposals || []).slice(0, 5).map(p => p.name + ' -> ' + p.domain_id.replace('dom-','')).join(', ');
        if (!confirm('Proposer ' + n + ' rattachement(s) :\n\n' + preview + (n > 5 ? '\n... + ' + (n-5) + ' autres' : '') + '\n\nAppliquer ?')) {
          classifyResult.textContent = 'Annule.';
          classifyBtn.disabled = false;
          classifyBtn.textContent = 'Lancer la classification';
          return;
        }
        // 2. Apply
        const applyR = await safeFetch('/api/projects/auto-classify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ apply: true }) });
        if (!applyR) throw new Error('Reponse invalide');
        classifyResult.textContent = '\u2713 ' + (applyR.updated || 0) + ' projet(s) classifie(s). Recharger la liste projets pour voir.';
      } catch (e) {
        classifyResult.classList.add('is-error');
        classifyResult.textContent = 'Erreur : ' + e.message;
      }
      // Recharger les counts (projects_count par domaine)
      loadDomains();
      classifyBtn.disabled = false;
      classifyBtn.textContent = 'Lancer la classification';
    });
  }

  // S6.40 : bulk-company
  const bulkBtn = document.querySelector('[data-action="bulk-company"]');
  const bulkResult = document.querySelector('[data-region="bulk-result"]');
  if (bulkBtn && !bulkBtn.dataset.bound) {
    bulkBtn.dataset.bound = '1';
    bulkBtn.addEventListener('click', async () => {
      if (!state.companies.length) { alert('Aucune societe disponible — ajoutez-en une.'); return; }
      // Si plusieurs societes, demander laquelle
      let cid = state.companies[0].id;
      if (state.companies.length > 1) {
        const list = state.companies.map((c, i) => (i+1) + '. ' + c.name).join('\n');
        const choice = prompt('Plusieurs societes disponibles. Choisir le numero :\n\n' + list, '1');
        if (!choice) return;
        const idx = parseInt(choice, 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= state.companies.length) return;
        cid = state.companies[idx].id;
      }
      const cName = (state.companies.find(c => c.id === cid) || {}).name || cid;
      if (!confirm('Rattacher TOUS les projets sans societe a "' + cName + '" ?')) return;
      bulkBtn.disabled = true;
      bulkResult.hidden = false;
      bulkResult.classList.remove('is-error');
      bulkResult.textContent = 'En cours...';
      try {
        const r = await safeFetch('/api/projects/bulk-company', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ company_id: cid }) });
        if (!r) throw new Error('Reponse invalide');
        bulkResult.textContent = '\u2713 ' + (r.updated || 0) + ' projet(s) rattache(s) a ' + cName + '.';
      } catch (e) {
        bulkResult.classList.add('is-error');
        bulkResult.textContent = 'Erreur : ' + e.message;
      }
      loadCompanies();
      bulkBtn.disabled = false;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindForms();
  bindActions();
  loadDomains();
  loadCompanies();
});
