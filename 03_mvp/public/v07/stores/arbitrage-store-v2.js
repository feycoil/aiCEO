// arbitrage-store.js — 2 modes : queue emails + focus decisions (S6.11-EE-2 L4.1)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { mode: 'queue', queue: [], focusList: [], focusIdx: 0, kbIdx: 0, kbHelpOpen: false };

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.ar-mode-tab').forEach(t => t.classList.toggle('is-active', t.dataset.mode === mode));
  document.querySelector('[data-region="ar-queue-mode"]').hidden = mode !== 'queue';
  document.querySelector('[data-region="ar-focus-mode"]').hidden = mode !== 'focus';
  if (mode === 'focus') loadFocus();
}

// === Mode QUEUE ===
// S6.22 Lot 18 : messages rotatifs animation Claude
const LLM_THINKING_MESSAGES = [
  'Claude lit vos emails...',
  'Identifie les actions prioritaires...',
  'Filtre les newsletters et notifications auto...',
  'Synthese chaque email en une phrase...',
  'Detecte les decisions strategiques a trancher...',
  'Genere les recommandations concretes...',
  'Finalise la priorisation P0/P1/P2/P3...',
  'Encore un instant, presque pret...'
];

function showThinkingOverlay() {
  let host = document.querySelector('[data-region="ar-thinking"]');
  if (!host) {
    const queueHost = document.querySelector('[data-region="ar-queue"]');
    if (!queueHost) return null;
    host = document.createElement('div');
    host.dataset.region = 'ar-thinking';
    host.style.cssText = 'padding:32px;text-align:center;background:linear-gradient(135deg,#f5f0fa 0%,var(--paper) 100%);border:1px dashed var(--violet-200,#c7b9d3);border-radius:12px;margin:16px 0';
    host.innerHTML = `
      <div class="ar-thinking-pulse" style="display:inline-flex;align-items:center;gap:12px;font-size:14px;font-weight:500;color:var(--violet-800,#463a54)">
        <span class="ar-spinner" style="width:18px;height:18px;border:2px solid var(--violet-200,#c7b9d3);border-top-color:var(--violet-800,#463a54);border-radius:50%;animation:arSpin 0.8s linear infinite;display:inline-block"></span>
        <span data-region="ar-thinking-msg">Claude lit vos emails...</span>
      </div>
      <div class="ar-skeleton-cards" style="margin-top:24px;display:flex;flex-direction:column;gap:12px;max-width:760px;margin-left:auto;margin-right:auto">
        ${[1,2,3].map(() => `
          <div style="background:var(--paper);border:1px solid var(--ivory-200);border-radius:10px;padding:16px;animation:arPulse 1.5s ease-in-out infinite">
            <div style="height:14px;width:30%;background:var(--ivory-200);border-radius:4px;margin-bottom:10px"></div>
            <div style="height:18px;width:70%;background:var(--ivory-200);border-radius:4px;margin-bottom:8px"></div>
            <div style="height:12px;width:90%;background:var(--ivory-100);border-radius:4px"></div>
          </div>
        `).join('')}
      </div>
      <style>
        @keyframes arSpin { to { transform: rotate(360deg); } }
        @keyframes arPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      </style>
    `;
    queueHost.parentNode.insertBefore(host, queueHost);
  }
  host.hidden = false;
  // Rotation messages toutes les 1.5s
  let i = 0;
  const msgEl = host.querySelector('[data-region="ar-thinking-msg"]');
  const interval = setInterval(() => {
    i = (i + 1) % LLM_THINKING_MESSAGES.length;
    if (msgEl) msgEl.textContent = LLM_THINKING_MESSAGES[i];
  }, 1500);
  return { host, interval };
}

function hideThinkingOverlay(handle) {
  if (handle?.interval) clearInterval(handle.interval);
  if (handle?.host) handle.host.hidden = true;
}

async function analyzeEmails(useLlm) {
  const btn = useLlm
    ? document.querySelector('[data-action="analyze-llm"]')
    : document.querySelector('[data-action="analyze"]');
  const origText = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = useLlm ? 'Claude analyse...' : 'Analyse...';
  }

  // Show thinking overlay si LLM (heuristique = trop rapide)
  let thinkingHandle = null;
  if (useLlm) {
    thinkingHandle = showThinkingOverlay();
    // Vide la queue pour ne pas afficher l'ancienne
    const qh = document.querySelector('[data-region="ar-queue"]');
    if (qh) qh.innerHTML = '';
  }

  const url = useLlm ? '/api/arbitrage/analyze-emails-llm' : '/api/arbitrage/analyze-emails';
  const r = await safeFetch(url, { method: 'POST' });

  hideThinkingOverlay(thinkingHandle);
  if (btn) { btn.disabled = false; btn.textContent = origText; }

  if (!r) {
    alert(useLlm
      ? "Claude indisponible. Verifiez ANTHROPIC_API_KEY dans Reglages > Coaching IA."
      : 'Erreur analyse. Le serveur tourne-t-il ?');
    return;
  }
  if (r.error) {
    alert("Erreur : " + r.error + (r.fallback_route ? "\n\nRetentez avec 'Analyser les emails' (heuristique)." : ""));
    return;
  }

  state.queue = r.proposals || r.emails || [];
  state.skipped = r.skipped || [];
  state.llmUsed = !!r.llm_used;
  renderQueue();
  renderSkipped();
  if (r.llm_used && r.message) {
    showToast('\u2726 ' + r.message, 'success');
  }
  // S6.24.4 : tour 1er triage si jamais vu
  setTimeout(() => maybeShowFirstTriageTour(), 600);
}

async function bootstrapProjects() {
  if (!confirm('Auto-creer projets et contacts a partir des emails ?')) return;
  const r = await safeFetch('/api/arbitrage/bootstrap-from-emails', { method: 'POST' });
  if (r) alert(`✓ ${r.projects_created || 0} projets et ${r.contacts_created || 0} contacts crees.`);
}


// S6.22 Lot 24 : dropdown popover enrichi pour changer le kind (au lieu d un prompt natif)
function changeKindForItem(itemId, anchorEl) {
  const item = state.queue.find(m => String(m.id) === String(itemId));
  if (!item) return;
  // Si un dropdown existe deja, le fermer
  document.querySelectorAll('[data-region="ar-kind-dropdown"]').forEach(d => d.remove());

  const opts = [
    { id: 'task',     icon: 'actions',  color: '#463a54', bg: '#ece7f0', label: 'Action',   desc: 'Tache operationnelle' },
    { id: 'decision', icon: 'target',   color: '#92400e', bg: '#fbeed2', label: 'Decision', desc: 'Choix a trancher' },
    { id: 'project',  icon: 'projects', color: '#0f5e3c', bg: '#dcfce7', label: 'Project',  desc: 'Sujet a structurer' },
    { id: 'info',     icon: 'info',     color: '#1e40af', bg: '#dbeafe', label: 'Info',     desc: 'Contexte pour un projet' }
  ];

  const dropdown = document.createElement('div');
  dropdown.dataset.region = 'ar-kind-dropdown';
  dropdown.className = 'ar-kind-dropdown';
  dropdown.innerHTML = `
    <div class="ar-kind-dropdown-head">Changer le type</div>
    ${opts.map(o => `
      <button class="ar-kind-option ${item.kind === o.id ? 'is-current' : ''}" data-kind-choice="${o.id}">
        <div class="ar-kind-option-icon" style="background:${o.bg};color:${o.color}">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><use href="#i-${o.icon}"/></svg>
        </div>
        <div class="ar-kind-option-content">
          <div class="ar-kind-option-label">${o.label}</div>
          <div class="ar-kind-option-desc">${o.desc}</div>
        </div>
        ${item.kind === o.id ? '<svg viewBox="0 0 24 24" width="14" height="14" class="ar-kind-option-check"><use href="#i-check"/></svg>' : ''}
      </button>
    `).join('')}
  `;

  // Position : dessous du badge ancre
  const rect = anchorEl?.getBoundingClientRect();
  if (rect) {
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 6) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.zIndex = '9999';
  }
  document.body.appendChild(dropdown);

  // Bind selection
  dropdown.querySelectorAll('[data-kind-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const newKind = btn.dataset.kindChoice;
      item.kind = newKind;
      item.kind_confidence = 'high';
      const meta = getKindMeta(newKind);
      showToast('Type modifie : ' + meta.label, 'success');
      dropdown.remove();
      renderQueue();
    });
  });

  // Click outside ou Escape pour fermer
  setTimeout(() => {
    const closeOnClickOutside = (ev) => {
      if (!dropdown.contains(ev.target) && ev.target !== anchorEl) {
        dropdown.remove();
        document.removeEventListener('click', closeOnClickOutside);
        document.removeEventListener('keydown', closeOnEsc);
      }
    };
    const closeOnEsc = (ev) => {
      if (ev.key === 'Escape') {
        dropdown.remove();
        document.removeEventListener('click', closeOnClickOutside);
        document.removeEventListener('keydown', closeOnEsc);
      }
    };
    document.addEventListener('click', closeOnClickOutside);
    document.addEventListener('keydown', closeOnEsc);
  }, 50);
}

// S6.22 Lot 12 : tracking selection bulk
const selected = new Set();

function updateBulkToolbar() {
  const toolbar = document.querySelector('[data-region="ar-bulk-toolbar"]');
  if (!toolbar) return;
  const n = selected.size;
  toolbar.hidden = n === 0;
  const countEl = toolbar.querySelector('[data-region="ar-bulk-count"]');
  if (countEl) countEl.textContent = n + ' email' + (n > 1 ? 's' : '') + ' selectionne' + (n > 1 ? 's' : '');
  // S6.22 Lot 23 : update N dans chaque bouton
  ['accept', 'defer', 'ignore'].forEach(act => {
    const el = toolbar.querySelector(`[data-region="ar-bulk-n-${act}"]`);
    if (el) el.textContent = n;
  });
}

// S6.22 Lot 16 : Mapping kind -> icône + couleur + libellé + justification
const KIND_META = {
  task:     { icon: 'actions',  color: '#463a54', bg: '#ece7f0', label: 'Action' },
  decision: { icon: 'target',   color: '#92400e', bg: '#fbeed2', label: 'Decision' },
  project:  { icon: 'projects', color: '#0f5e3c', bg: '#dcfce7', label: 'Project' },
  // S6.22 Lot 25 : info = contexte pour un projet existant, pas d action a creer
  info:     { icon: 'info',     color: '#1e40af', bg: '#dbeafe', label: 'Info' }
};


// S6.22 Lot 26 : formate to_addrs (tronque si long, extrait ce qui est apres "for" ou nom de domaine du CEO)
function formatTo(toStr) {
  if (!toStr) return '';
  const cleaned = toStr.replace(/[<>]/g, '').replace(/"/g, '').trim();
  // Si plusieurs destinataires, prend les 2 premiers + "+N"
  const parts = cleaned.split(/[,;]/).map(p => p.trim()).filter(Boolean);
  if (parts.length <= 2) return parts.join(', ');
  return parts.slice(0, 2).join(', ') + ' +' + (parts.length - 2);
}

function getKindMeta(kind) {
  return KIND_META[kind] || KIND_META.task;
}

// Justification heuristique : pourquoi le scoring SQL/regex propose ce kind
function getKindJustification(item) {
  const subject = (item.subject || '').trim();
  const kind = item.kind || 'task';
  if (kind === 'decision') {
    return subject.endsWith('?')
      ? "Le sujet pose une question - une trancheure est requise."
      : "Choix strategique a poser - dispatchee en Decision.";
  }
  if (kind === 'project') {
    return "Mention 'launch/kickoff/projet' - dispatchee en Project a structurer.";
  }
  // task par defaut : on essaie d'expliquer le score
  const reasons = [];
  if (item.flagged) reasons.push('email flagge');
  if (item.unread) reasons.push('non lu');
  if (subject.toLowerCase().match(/^(re|fwd|tr)\s*:/)) reasons.push('reponse a un fil ouvert');
  if (item.has_attach) reasons.push('avec piece jointe');
  if (item.inferred_project) reasons.push(`sur projet ${item.inferred_project}`);
  if (reasons.length === 0) return "Action operationnelle ponctuelle.";
  return reasons.slice(0, 2).join(', ').replace(/^./, c => c.toUpperCase()) + '.';
}


// S6.22 Lot 28 : badge destinataire (direct vs cc vs unknown)
function renderRecipientFlagBadge(flag) {
  if (!flag || flag === 'unknown' || flag === 'direct') return '';
  if (flag === 'cc') {
    return '<span class="ar-recipient-flag is-cc" title="Vous n etes pas destinataire direct (CC ou liste de distribution)">\u26A0 Pas direct</span>';
  }
  return '';
}

// S6.22 Lot 28 : helpers projets pour le tag cliquable
let _projectsCache = null;
async function loadProjectsCache() {
  if (_projectsCache) return _projectsCache;
  const r = await safeFetch('/api/projects');
  const list = r?.projects || (Array.isArray(r) ? r : []);
  _projectsCache = list.filter(p => (p.status || '').toLowerCase() === 'active');
  return _projectsCache;
}

async function changeProjectForItem(itemId, anchorEl) {
  const item = state.queue.find(m => String(m.id) === String(itemId));
  if (!item) return;
  document.querySelectorAll('[data-region="ar-project-dropdown"]').forEach(d => d.remove());

  const projects = await loadProjectsCache();
  const dropdown = document.createElement('div');
  dropdown.dataset.region = 'ar-project-dropdown';
  dropdown.className = 'ar-kind-dropdown';
  const currentName = item.inferred_project || '';
  dropdown.innerHTML = `
    <div class="ar-kind-dropdown-head">Lier a un projet</div>
    <button class="ar-kind-option ${!currentName ? 'is-current' : ''}" data-proj-choice="" style="padding-left:46px">
      <div class="ar-kind-option-content">
        <div class="ar-kind-option-label">Aucun</div>
        <div class="ar-kind-option-desc">Pas de projet associe</div>
      </div>
      ${!currentName ? '<svg viewBox="0 0 24 24" width="14" height="14" class="ar-kind-option-check"><use href="#i-check"/></svg>' : ''}
    </button>
    ${projects.map(p => `
      <button class="ar-kind-option ${currentName.toLowerCase() === (p.name || '').toLowerCase() ? 'is-current' : ''}" data-proj-choice="${escHtml(p.id)}" data-proj-name="${escHtml(p.name)}">
        <div class="ar-kind-option-icon" style="background:#dcfce7;color:#0f5e3c">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><use href="#i-projects"/></svg>
        </div>
        <div class="ar-kind-option-content">
          <div class="ar-kind-option-label">${escHtml(p.name)}</div>
          <div class="ar-kind-option-desc">${escHtml((p.tagline || p.description || '').slice(0, 50))}</div>
        </div>
        ${currentName.toLowerCase() === (p.name || '').toLowerCase() ? '<svg viewBox="0 0 24 24" width="14" height="14" class="ar-kind-option-check"><use href="#i-check"/></svg>' : ''}
      </button>
    `).join('')}
  `;

  const rect = anchorEl?.getBoundingClientRect();
  if (rect) {
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 6) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.maxHeight = '60vh';
    dropdown.style.overflowY = 'auto';
    dropdown.style.zIndex = '9999';
  }
  document.body.appendChild(dropdown);

  dropdown.querySelectorAll('[data-proj-choice]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const projId = btn.dataset.projChoice;
      const projName = btn.dataset.projName || '';
      // Local state update
      item.inferred_project = projName || null;
      // Backend : POST /api/arbitrage/emails/:id/link-project
      if (item.source_id && projId) {
        try {
          await fetch('/api/arbitrage/emails/' + encodeURIComponent(item.source_id) + '/link-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projId })
          });
        } catch (e) { /* swallow */ }
      }
      showToast('\u2713 Projet : ' + (projName || 'aucun'), 'success');
      dropdown.remove();
      renderQueue();
    });
  });

  setTimeout(() => {
    const onClick = (ev) => {
      if (!dropdown.contains(ev.target) && ev.target !== anchorEl) {
        dropdown.remove();
        document.removeEventListener('click', onClick);
      }
    };
    document.addEventListener('click', onClick);
  }, 50);
}



// S6.24.4 : tour pedagogique 1er triage (un seul affichage, persiste localStorage)
function maybeShowFirstTriageTour() {
  try {
    if (localStorage.getItem('aiCEO.firstTriageTourDone') === '1') return;
    if (!state.queue.length) return;
  } catch (e) { return; }

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,22,18,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;animation:mdFadeIn 200ms';
  overlay.innerHTML = `
    <div style="background:var(--paper);max-width:520px;width:92%;padding:28px 32px;border-radius:14px;box-shadow:0 20px 60px rgba(26,22,18,0.25);animation:mdSlideUp 280ms cubic-bezier(.16,1,.3,1)">
      <div style="font-size:11px;font-weight:700;color:var(--ink-500);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">\u2726 Bienvenue sur le Triage</div>
      <h2 style="font-size:18px;font-weight:700;color:var(--ink-900);margin:0 0 12px">3 reflexes pour vos 5 prochaines minutes</h2>
      <ol style="margin:0 0 18px 20px;padding:0;font-size:13px;line-height:1.65;color:var(--ink-700)">
        <li><strong>Le badge en haut de chaque card</strong> indique ce que Claude propose : Action, Decision, Project ou Info. Click sur le badge pour le changer.</li>
        <li><strong>4 verdicts</strong> : <em>Faire</em> = creer ce que dit le badge. <em>Reporter</em> = revoir plus tard. <em>Ignorer</em> = skip silencieux. <em>Pas pour moi</em> = Claude apprendra a filtrer.</li>
        <li><strong>Le tag projet vert</strong> est cliquable pour rattacher l email a un autre projet.</li>
      </ol>
      <p style="font-size:12px;color:var(--ink-500);font-style:italic;margin:0 0 18px">Astuce : commencez par traiter les badges DECISION en haut de la file, puis les ACTION P0/P1.</p>
      <div style="text-align:right">
        <button id="ar-tour-close" style="padding:9px 20px;background:var(--ink-900);color:var(--paper);border:0;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer">Compris, c est parti !</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => {
    try { localStorage.setItem('aiCEO.firstTriageTourDone', '1'); } catch (e) {}
    overlay.remove();
  };
  overlay.querySelector('#ar-tour-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function renderQueue() {
  const host = document.querySelector('[data-region="ar-queue"]');
  const stat = document.querySelector('[data-region="ar-queue-stat"]');
  if (!host) return;

  if (stat) stat.innerHTML = `<strong>${state.queue.length}</strong> email${state.queue.length > 1 ? 's' : ''} a arbitrer`;

  if (!state.queue.length) {
    host.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-500);font-style:italic;background:var(--ivory-50);border-radius:var(--radius-md)">Cliquez sur <strong>Analyser les emails</strong> pour generer la file du jour.</div>';
    selected.clear();
    updateBulkToolbar();
    renderBulkToolbar();
    return;
  }

  // Garde uniquement les selections valides (au cas ou la queue change)
  const validIds = new Set(state.queue.map(m => String(m.id)));
  for (const id of [...selected]) if (!validIds.has(id)) selected.delete(id);

  // Bulk toolbar
  renderBulkToolbar();

  host.innerHTML = state.queue.slice(0, 50).map((m, i) => {
    const id = String(m.id || i);
    const isChecked = selected.has(id);
    const kind = m.kind || 'task';
    const meta = getKindMeta(kind);
    const justification = getKindJustification(m);
    const dateStr = m.received_at ? m.received_at.slice(0, 10) : '';
    return `
      <div class="ar-card ${isChecked ? 'is-selected' : ''}${state.llmUsed && m.created_from === 'email-llm' ? ' is-llm' : ''}${i === state.kbIdx ? ' is-kb-focused' : ''}" data-mail-id="${id}" data-kind="${kind}" data-kb-idx="${i}">
        <label class="ar-card-check">
          <input type="checkbox" data-bulk-check="${id}" ${isChecked ? 'checked' : ''} />
        </label>
        <div class="ar-card-icon" style="background:${meta.bg};color:${meta.color}" title="Propose : ${meta.label}">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><use href="#i-${meta.icon}"/></svg>
        </div>
        <div class="ar-card-body">
          <div class="ar-card-meta">
            <button class="ar-card-kind ar-card-kind-clickable" style="color:${meta.color};background:${meta.bg};border:0;cursor:pointer;font-family:inherit" data-action="change-kind" data-id="${id}" title="Cliquez pour changer le type">${meta.label}${m.kind_confidence === 'low' ? ' \u26A0' : (m.kind_confidence === 'medium' ? ' \u00B7\u00B7' : '')}</button>
            ${renderRecipientFlagBadge(m.recipient_flag)}
            ${m.relevance && m.relevance !== 'unknown' ? `<span class="ar-card-relevance is-${m.relevance}" title="Votre relation a cet email">${m.relevance === 'direct' ? '\u2192 destinataire' : m.relevance === 'cc' ? 'en CC' : m.relevance === 'mentioned' ? 'mentionne' : 'pas concerne'}</span>` : ''}
            ${m.related_count && m.related_count > 1 ? `<span class="ar-card-related" title="${m.related_count} emails similaires non arbitres - signal de relance">\u29C7 ${m.related_count} emails</span>` : ''}
            <button class="ar-card-project-tag" data-action="change-project" data-id="${id}" title="Cliquez pour rattacher l email a un projet">
              <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><use href="#i-projects"/></svg>
              <span>${m.inferred_project ? escHtml(m.inferred_project) : 'Aucun projet'}</span>
            </button>
            ${dateStr ? `<span class="ar-card-date">${escHtml(dateStr)}</span>` : ''}
          </div>
          <div class="ar-card-from-line">
            <span class="ar-card-from-label">DE</span>
            <span class="ar-card-from-value">${escHtml(m.from || m.sender || 'inconnu')}</span>
            ${m.to_addrs ? `<span class="ar-card-to-label">\u00B7 \u00C0</span><span class="ar-card-to-value" title="${escHtml(m.to_addrs)}">${escHtml(formatTo(m.to_addrs))}</span>` : ''}
          </div>
          <div class="ar-card-subject">${escHtml(m.subject || m.title || '(sans objet)')}</div>
          ${m.summary ? `<div class="ar-card-summary"><strong>Resume :</strong> ${escHtml(m.summary)}</div>` : ''}
          ${m.suggested_action ? `<div class="ar-card-suggested"><strong>\u2726 Action proposee :</strong> ${escHtml(m.suggested_action)}</div>` : ''}
          <div class="ar-card-why">
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" style="opacity:0.5"><use href="#i-info"/></svg>
            <span>${m.rationale ? 'Pourquoi : ' + escHtml(m.rationale) : 'Pourquoi : ' + escHtml(justification)}</span>
            ${m.proposed_priority ? `<span class="ar-card-prio is-${m.proposed_priority.toLowerCase()}">${escHtml(m.proposed_priority)}</span>` : ''}
          </div>
          ${(m.snippet || m.body_preview || m.excerpt) ? `<div class="ar-card-snippet">${escHtml(((m.snippet || m.body_preview || m.excerpt) || '').slice(0, 180))}${((m.snippet || m.body_preview || m.excerpt) || '').length > 180 ? '...' : ''}</div>` : ''}
          <div class="ar-card-tools">
            ${m.source_id ? `<button class="ar-card-view-mail" data-action="view-mail" data-source-id="${m.source_id}" title="Ouvrir l email original"><svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><use href="#i-arrow-up-right"/></svg> Voir le mail</button>` : ''}
            ${m.from_email ? `<button class="ar-card-reply-mail" data-action="reply-mail" data-from="${escHtml(m.from_email)}" data-subject="${escHtml(m.title || m.subject || '')}" title="Repondre via Outlook"><svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><use href="#i-undo"/></svg> Repondre</button>` : ''}
            ${state.llmUsed && m.created_from === 'email-llm' ? '<span class="ar-card-llm-tag" title="Card analysee par Claude Sonnet 4.6">\u2726 Claude</span>' : ''}
          </div>
        </div>
        <div class="ar-card-actions">
          <div class="ar-verdict-picker" role="group" aria-label="Verdict">
            <button class="ar-verdict accept" data-action="accept" data-id="${id}" title="Creer ${meta.label.toLowerCase()} (ce que dit le badge ci-dessus)">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><use href="#i-check"/></svg>
              <span>Faire</span>
            </button>
            <button class="ar-verdict defer" data-action="defer" data-id="${id}" title="Reporter a plus tard">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><use href="#i-undo"/></svg>
              <span>Reporter</span>
            </button>
            <button class="ar-verdict ignore" data-action="ignore" data-id="${id}" title="Marque arbitre - rien cree">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><use href="#i-info"/></svg>
              <span>Ignorer</span>
            </button>
          </div>
          <div class="ar-verdict-teach">
            <button class="ar-verdict-teach-link" data-action="not-concerned" data-id="${id}" title="Marque l email arbitre + envoie un signal a Claude pour qu il apprenne a filtrer ce type d email a l avenir">
              <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><use href="#i-sparkle"/></svg>
              <span>Pas pour moi - Claude apprendra</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind checkbox toggle
  host.querySelectorAll('[data-bulk-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.bulkCheck;
      if (cb.checked) selected.add(id); else selected.delete(id);
      const card = host.querySelector(`[data-mail-id="${id}"]`);
      if (card) card.classList.toggle('is-selected', cb.checked);
      updateBulkToolbar();
    });
  });

  host.querySelectorAll('[data-action]').forEach(b => {
    b.addEventListener('click', () => {
      const action = b.dataset.action;
      const id = b.dataset.id;
      if (action === 'change-kind') { changeKindForItem(id, b); return; }
      if (action === 'change-project') { changeProjectForItem(id, b); return; }
      if (action === 'mark-info') { markAsInfo(id); return; }
      if (action === 'not-concerned') { markNotConcerned(id); return; }
      if (action === 'view-mail') { viewSourceEmail(b.dataset.sourceId); return; }
      if (action === 'reply-mail') {
        const from = b.dataset.from || '';
        const subj = b.dataset.subject || '';
        const mailto = 'mailto:' + encodeURIComponent(from) + '?subject=' + encodeURIComponent('RE: ' + subj);
        window.location.href = mailto;
        return;
      }
      handleQueueAction(action, id);
    });
  });
}

function renderBulkToolbar() {
  let toolbar = document.querySelector('[data-region="ar-bulk-toolbar"]');
  if (!toolbar) {
    const queueHost = document.querySelector('[data-region="ar-queue"]');
    if (!queueHost) return;
    toolbar = document.createElement('div');
    toolbar.dataset.region = 'ar-bulk-toolbar';
    toolbar.hidden = true;
    toolbar.style.cssText = 'background:#fef9e7;border:1px solid #fbbf24;padding:10px 14px;border-radius:8px;display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;animation:asFadeUp .2s';
    toolbar.innerHTML = `
      <div class="ar-bulk-info">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="opacity:0.7"><use href="#i-check"/></svg>
        <strong data-region="ar-bulk-count">0 selectionne</strong>
      </div>
      <div class="ar-bulk-actions">
        <button class="ar-bulk-btn ar-bulk-btn-accept" data-bulk-action="accept">
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><use href="#i-check"/></svg>
          <span>Faire</span><span data-region="ar-bulk-n-accept" class="ar-bulk-n">0</span>
        </button>
        <button class="ar-bulk-btn ar-bulk-btn-defer" data-bulk-action="defer">
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><use href="#i-undo"/></svg>
          <span>Reporter</span><span data-region="ar-bulk-n-defer" class="ar-bulk-n">0</span>
        </button>
        <button class="ar-bulk-btn ar-bulk-btn-ignore" data-bulk-action="ignore">
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><use href="#i-info"/></svg>
          <span>Ignorer</span><span data-region="ar-bulk-n-ignore" class="ar-bulk-n">0</span>
        </button>
      </div>
      <span style="flex:1"></span>
      <div class="ar-bulk-tools">
        <button class="ar-bulk-link" data-bulk-action="select-all">Tout selectionner</button>
        <span class="ar-bulk-sep">\u00b7</span>
        <button class="ar-bulk-link" data-bulk-action="clear">Tout decocher</button>
      </div>
    `;
    queueHost.parentNode.insertBefore(toolbar, queueHost);

    toolbar.querySelectorAll('[data-bulk-action]').forEach(b => {
      b.addEventListener('click', () => handleBulkAction(b.dataset.bulkAction));
    });
  }
  updateBulkToolbar();
}

async function handleBulkAction(action) {
  if (action === 'select-all') {
    state.queue.forEach(m => selected.add(String(m.id)));
    renderQueue();
    return;
  }
  if (action === 'clear') {
    selected.clear();
    renderQueue();
    return;
  }
  if (selected.size === 0) {
    showToast('Aucun email selectionne', 'warning');
    return;
  }
  const verdictMap = { accept: 'faire', defer: 'decaler', ignore: 'archiver' };
  const verdict = verdictMap[action] || 'faire';
  const ids = [...selected];
  if (!confirm(`Appliquer "${action}" sur ${ids.length} email${ids.length>1?'s':''} ?`)) return;

  showToast(`Traitement de ${ids.length} email${ids.length>1?'s':''}...`, 'warning');

  // Fire all in parallele
  const promises = ids.map(id => {
    const item = state.queue.find(m => String(m.id) === id);
    if (!item) return Promise.resolve(null);
    return fetch('/api/arbitrage/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_id: item.source_id || item.id || id,
        kind: item.kind || 'task',
        verdict,
        title: item.title || item.subject || '(sans objet)',
        description: item.excerpt || item.snippet || item.body_preview || '',
        priority: item.proposed_priority || 'P1'
      })
    }).then(r => r.ok ? r.json() : null).catch(() => null);
  });

  const results = await Promise.allSettled(promises);
  let created = 0, deduped = 0, errors = 0, decisions = 0;
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value) {
      if (r.value.deduped) deduped++;
      else if (r.value.created) {
        created++;
        if (r.value.created.kind === 'decision') decisions++;
      }
    } else errors++;
  });

  // Bilan toast
  const parts = [];
  if (created) parts.push(`${created} action${created>1?'s':''} creee${created>1?'s':''}`);
  if (decisions) parts.push(`dont ${decisions} decision${decisions>1?'s':''}`);
  if (deduped) parts.push(`${deduped} dedupe`);
  if (errors) parts.push(`${errors} erreur${errors>1?'s':''}`);
  showToast('Bilan : ' + (parts.join(', ') || 'rien fait'), errors ? 'error' : 'success');

  // Retire tous les emails traites de la queue locale
  state.queue = state.queue.filter(m => !ids.includes(String(m.id)));
  selected.clear();
  renderQueue();
  loadHistory();  // S6.22 Lot 23 : refresh historique apres bulk
}

// S6.22 Lot 10 : feedback toast simple
function showToast(msg, kind) {
  let host = document.getElementById('ar-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'ar-toast-host';
    host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  const bg = kind === 'success' ? '#dcfce7' : (kind === 'error' ? '#fee2e2' : '#fef3c7');
  const fg = kind === 'success' ? '#166534' : (kind === 'error' ? '#991b1b' : '#92400e');
  t.style.cssText = `background:${bg};color:${fg};border:1px solid ${fg}40;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.08);animation:arSlide .25s ease;pointer-events:auto`;
  t.textContent = msg;
  host.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2800);
}

async function handleQueueAction(action, id) {
  const card = document.querySelector(`[data-mail-id="${id}"]`);
  const item = state.queue.find(m => String(m.id) === String(id) || String(m.source_id) === String(id));
  if (card) { card.style.opacity = '0.4'; card.style.pointerEvents = 'none'; }

  // S6.22 Lot 10 : route /api/arbitrage/accept (cree task/decision + dedupe email)
  const verdictMap = { accept: 'faire', defer: 'decaler', ignore: 'archiver' };
  const verdict = verdictMap[action] || 'faire';
  const payload = {
    source_id: item?.source_id || item?.id || id,
    kind: item?.kind || 'task',
    verdict: verdict,
    title: item?.title || item?.subject || '(sans objet)',
    description: item?.excerpt || item?.snippet || item?.body_preview || '',
    priority: item?.proposed_priority || 'P1'
  };

  const r = await safeFetch('/api/arbitrage/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Feedback utilisateur
  if (!r) {
    showToast('Erreur serveur. Verifiez la console (F12).', 'error');
    if (card) { card.style.opacity = '1'; card.style.pointerEvents = 'auto'; }
    return;
  }
  if (r.deduped) {
    showToast('Email deja arbitre — pas de doublon cree.', 'warning');
  } else if (r.created) {
    const lbl = r.created.kind === 'decision' ? 'Decision' : 'Action';
    const verb = verdict === 'archiver' ? 'archive' : (verdict === 'decaler' ? 'reportee' : 'creee');
    showToast(`✓ ${lbl} ${verb}`, 'success');
  } else {
    showToast(`✓ Email ${verdict}`, 'success');
  }

  // Retire visuellement apres 400ms
  setTimeout(() => {
    if (card) card.remove();
    state.queue = state.queue.filter(m => String(m.id) !== String(id));
    const stat = document.querySelector('[data-region="ar-queue-stat"]');
    if (stat) stat.innerHTML = `<strong>${state.queue.length}</strong> emails restants`;
    loadHistory();  // S6.22 Lot 23 : refresh historique apres chaque accept
  }, 400);
}

// === Mode FOCUS (decisions a trancher) ===
async function loadFocus() {
  const data = await safeFetch('/api/decisions');
  const all = data?.decisions || data || [];
  // S6.26.4 : filtres elargis — actives + reportees + top-up tranchees recentes
  const active = all.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'ouverte' || s === 'open' || s === 'a_trancher' || s === 'active';
  });
  const reportees = all.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'reportee' || s === 'reported' || s === 'deferred';
  });
  // Top-up : decisions tranchees ces 7 derniers jours (revue passive)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const recentes = all.filter(d => {
    const s = (d.status || '').toLowerCase();
    if (s !== 'tranchee' && s !== 'closed' && s !== 'completed') return false;
    const dt = (d.updated_at || d.created_at || '').slice(0, 10);
    return dt >= sevenDaysAgo;
  });
  // Priorite : actives d abord, puis reportees (a relancer), puis tranchees recentes (a revoir)
  state.focusList = [...active, ...reportees, ...recentes];
  state.focusIdx = 0;
  renderFocus();
}


// S6.22 Lot 22 : extraire source-email-id depuis decision.context
function extractSourceEmailId(decision) {
  if (!decision || !decision.context) return null;
  const m = decision.context.match(/\[source-email:([0-9a-fA-F-]+)\]/);
  return m ? m[1] : null;
}

async function viewSourceEmail(emailId) {
  if (!emailId) return;
  const r = await safeFetch('/api/arbitrage/emails/' + encodeURIComponent(emailId));
  if (!r) {
    showToast('Email introuvable.', 'error');
    return;
  }
  const e = r.email || r;
  // Modal simple
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,22,18,0.55);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:mdFadeIn 200ms';
  overlay.innerHTML = `
    <div style="background:var(--paper);border-radius:14px;max-width:680px;width:92%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(26,22,18,0.25);animation:mdSlideUp 280ms cubic-bezier(.16,1,.3,1)">
      <header style="padding:20px 24px;border-bottom:1px solid var(--ivory-200);background:linear-gradient(to bottom,var(--paper) 0%,var(--ivory-50) 100%)">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--ink-500);margin-bottom:4px">Email source</div>
        <h3 style="font-size:16px;font-weight:700;color:var(--ink-900);margin:0;line-height:1.4">${escHtml(e.subject || '(sans objet)')}</h3>
        <div style="font-size:12px;color:var(--ink-500);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap">
          <span><strong style="color:var(--ink-700)">${escHtml(e.from_name || e.from_email || '?')}</strong></span>
          ${e.received_at ? '<span>' + escHtml(new Date(e.received_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })) + '</span>' : ''}
          ${e.flagged ? '<span style="color:#92400e">\u2691 Flagge</span>' : ''}
          ${e.unread ? '<span style="color:#1e40af">\u25CF Non lu</span>' : ''}
        </div>
      </header>
      <div style="padding:20px 24px;overflow-y:auto;flex:1;font-size:13px;line-height:1.6;color:var(--ink-700);white-space:pre-wrap">${escHtml(e.preview || '(corps non disponible dans l\'apercu, voir Outlook)')}</div>
      <footer style="padding:14px 24px;border-top:1px solid var(--ivory-200);background:var(--ivory-50);display:flex;justify-content:flex-end;gap:8px">
        <button data-action="md-close" style="padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;background:var(--ink-900);color:var(--paper);border:0;cursor:pointer">Fermer</button>
      </footer>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });
  overlay.querySelector('[data-action="md-close"]').addEventListener('click', close);
  document.addEventListener('keydown', function esc(ev) {
    if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
}

function renderFocus() {
  const host = document.querySelector('[data-region="ar-focus-host"]');
  if (!host) return;

  if (!state.focusList.length) {
    host.innerHTML = '<div data-component="empty-state" data-props=\'{"icon":"check","title":"Toutes les decisions sont tranchees","description":"Aucune decision en attente. Continuez la file emails ou retournez au cockpit."}\'></div>';
    return;
  }

  const d = state.focusList[state.focusIdx];
  const total = state.focusList.length;
  // S6.22 Lot 19 : 4 options claires par defaut (au lieu de Aller/Ne pas aller/Attendre)
  const DEFAULT_OPTS = [
    { id: 'oui',      icon: 'check',   label: 'Trancher : OUI',       desc: 'Valider, avancer, engager.',                        color: '#166534', bg: '#dcfce7' },
    { id: 'non',      icon: 'info',    label: 'Trancher : NON',       desc: 'Refuser, ne pas avancer.',                          color: '#991b1b', bg: '#fee2e2' },
    { id: 'reporter', icon: 'undo',    label: 'Reporter',             desc: 'Garder ouverte, revoir plus tard.',                 color: '#92400e', bg: '#fef3c7' },
    { id: 'plus-info',icon: 'sparkle', label: 'Demander plus d info', desc: 'Pas assez d elements, on attend des reponses.',     color: '#463a54', bg: '#ece7f0' }
  ];
  const customOpts = Array.isArray(d.options) && d.options.length ? d.options : null;

  host.innerHTML = `
    <div class="ar-decision-card">
      <div class="ar-decision-head">
        <span class="ar-decision-eyebrow">Decision a trancher</span>
        <span class="ar-decision-progress">${state.focusIdx + 1} / ${total}</span>
      </div>
      <h2 class="ar-decision-title">${escHtml(d.title || d.label || 'Decision')}</h2>

      ${(() => {
        const sourceId = extractSourceEmailId(d);
        const cleanCtx = (d.context || d.description || '').replace(/\s*\[source-email:[0-9a-fA-F-]+\]\s*$/, '').trim();
        const meta = [];
        if (d.created_at) meta.push('Posee le ' + new Date(d.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }));
        if (d.project_name || d.project) meta.push('Projet : ' + escHtml(d.project_name || d.project));
        return `
          ${meta.length ? '<div class="ar-decision-meta">' + meta.join(' \u00b7 ') + '</div>' : ''}
          ${cleanCtx ? '<p class="ar-decision-context">' + escHtml(cleanCtx) + '</p>' : '<p class="ar-decision-context" style="font-style:italic;color:var(--ink-500)">Pas de contexte additionnel pour cette decision.</p>'}
          ${sourceId ? '<button class="ar-btn ar-btn-ghost" data-action="view-source-email" data-source-id="' + sourceId + '" style="margin-top:8px;font-size:12px"><svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" style="vertical-align:middle;margin-right:4px"><use href="#i-arrow-up-right"/></svg>Voir le mail original</button>' : ''}
        `;
      })()}

      <div class="ar-decision-llm-reco" data-region="ar-decision-llm-reco" hidden></div>

      <div class="ar-decision-prompt">Que decidez-vous ?</div>
      <div class="ar-decision-options-grid">
        ${customOpts ? customOpts.map(o => `
          <button class="ar-option-card" data-option="${escHtml(typeof o === 'string' ? o : (o.id || o.label))}">
            <div class="ar-option-content">
              <div class="ar-option-label">${escHtml(typeof o === 'string' ? o : (o.label || o.id))}</div>
            </div>
          </button>
        `).join('') : DEFAULT_OPTS.map(o => `
          <button class="ar-option-card" data-option="${o.id}" style="--opt-color:${o.color};--opt-bg:${o.bg}">
            <div class="ar-option-icon" style="background:${o.bg};color:${o.color}">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><use href="#i-${o.icon}"/></svg>
            </div>
            <div class="ar-option-content">
              <div class="ar-option-label">${o.label}</div>
              <div class="ar-option-desc">${o.desc}</div>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="ar-decision-tools">
        <button class="ar-btn ar-btn-ghost" data-action="suggest-options" ${!state.llmReady ? 'disabled' : ''} title="${state.llmReady ? 'Demander une recommandation contextuelle a Claude' : 'Claude non actif (cle API absente)'}">✦ Demander a Claude</button>
      </div>

      <div class="ar-decision-actions">
        <button class="ar-btn ar-btn-ghost" data-action="prev" ${state.focusIdx === 0 ? 'disabled' : ''}>← Precedente</button>
        <button class="ar-btn ar-btn-ghost" data-action="skip">Passer pour l instant</button>
        <button class="ar-btn ar-btn-ghost" data-action="next" ${state.focusIdx === total - 1 ? 'disabled' : ''}>Suivante →</button>
      </div>
    </div>
  `;

  host.querySelectorAll('[data-option]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const choice = btn.dataset.option;
      await safeFetch(`/api/decisions/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'decidee', resolution: choice, decided_at: new Date().toISOString() })
      });
      showToast('✓ Decision tranchee : ' + choice, 'success');
      state.focusList.splice(state.focusIdx, 1);
      if (state.focusIdx >= state.focusList.length && state.focusIdx > 0) state.focusIdx--;
      renderFocus();
    });
  });

  host.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'prev' && state.focusIdx > 0) state.focusIdx--;
      else if (a === 'next' && state.focusIdx < state.focusList.length - 1) state.focusIdx++;
      else if (a === 'skip' && state.focusIdx < state.focusList.length - 1) state.focusIdx++;
      else if (a === 'suggest-options') { suggestOptionsLLM(d); return; }
      else if (a === 'view-source-email') { viewSourceEmail(btn.dataset.sourceId); return; }
      renderFocus();
    });
  });
}

// S6.22 Lot 19 : suggestOptionsLLM (Claude recommande sur la decision en cours)
async function suggestOptionsLLM(decision) {
  if (!state.llmReady) {
    showToast('Claude non disponible. Configurez la cle API dans Reglages.', 'warning');
    return;
  }
  const btn = document.querySelector('[data-action="suggest-options"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Claude reflechit...'; }
  try {
    const r = await fetch('/api/decision-recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision_id: decision.id,
        title: decision.title,
        context: decision.context || decision.description || ''
      })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const reco = data.recommendation || data.suggestion || data.text || '';
    if (reco) {
      const recoHost = document.querySelector('[data-region="ar-decision-llm-reco"]');
      if (recoHost) {
        recoHost.hidden = false;
        recoHost.innerHTML = '<strong>✦ Recommandation Claude :</strong> ' + escHtml(reco);
      }
      showToast('✦ Recommandation Claude affichee', 'success');
    } else {
      showToast('Claude n a pas de recommandation pour cette decision.', 'warning');
    }
  } catch (e) {
    showToast('Erreur Claude : ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Demander a Claude'; }
  }
}


// S6.22 Lot 21 H : historique des arbitrages effectues
async function loadHistory() {
  // S6.22 Lot 23 : utilise triage-history (emails arbitres par jour) au lieu de l'ancien arbitrage_sessions
  const r = await safeFetch('/api/arbitrage/triage-history?days=7');
  if (!r) return;
  const items = r.history || (Array.isArray(r) ? r : []);
  renderHistory(items);
}

function renderHistory(items) {
  let host = document.querySelector('[data-region="ar-history"]');
  if (!host) {
    const main = document.querySelector('section[data-region="ar-queue-mode"]');
    if (!main) return;
    host = document.createElement('div');
    host.dataset.region = 'ar-history';
    host.style.cssText = 'margin-top:32px;padding-top:24px;border-top:1px solid var(--ivory-200)';
    main.appendChild(host);
  }
  if (!items.length) {
    host.innerHTML = '<div class="ar-history-empty" style="font-size:12px;color:var(--ink-500);font-style:italic;text-align:center;padding:16px">Aucun email arbitre encore. Les jours d arbitrage passes apparaitront ici.</div>';
    return;
  }
  host.innerHTML = `
    <div class="ar-history-head">
      <h3 class="ar-history-title">Historique des arbitrages</h3>
      <span class="ar-history-meta">${items.length} jour${items.length > 1 ? 's' : ''} d activite</span>
    </div>
    <div class="ar-history-list">
      ${items.map(it => {
        const total = it.total_arbitrated || 0;
        const tasks = it.tasks_created || 0;
        const decs = it.decisions_created || 0;
        const skipped = it.skipped || 0;
        const date = it.day ? new Date(it.day).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', weekday:'short' }) : '?';
        return `
          <div class="ar-history-item is-committed">
            <div class="ar-history-date">${escHtml(date)}</div>
            <div class="ar-history-content">
              <div class="ar-history-counts">
                ${tasks > 0 ? `<span class="ar-history-pill is-faire">${tasks} action${tasks > 1 ? 's' : ''}</span>` : ''}
                ${decs > 0 ? `<span class="ar-history-pill is-deleguer">${decs} decision${decs > 1 ? 's' : ''}</span>` : ''}
                ${skipped > 0 ? `<span class="ar-history-pill is-reporter">${skipped} ignore${skipped > 1 ? 's' : ''}</span>` : ''}
                <span class="ar-history-total">${total} email${total > 1 ? 's' : ''} arbitre${total > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// === S6.12 Keyboard-first arbitrage (pilier Executif promesse produit) ===
function showKbHelpOverlay() {
  if (state.kbHelpOpen) return;
  state.kbHelpOpen = true;
  var overlay = document.createElement('div');
  overlay.dataset.region = 'ar-kb-help';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,22,18,0.55);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center';
  var rows = [
    ['A', 'Faire (creer item selon badge kind)'],
    ['D', 'Reporter (repousser a plus tard)'],
    ['I', 'Ignorer (marquer arbitre, rien creer)'],
    ['N', 'Pas pour moi (apprentissage Claude)'],
    ['arrow up / down', 'Naviguer entre les cards'],
    ['J / K', 'Naviguer (vim-style)'],
    ['?', 'Afficher cette aide'],
    ['Esc', 'Fermer cette aide']
  ];
  var html = '<div style="background:var(--paper);border-radius:14px;max-width:520px;width:92%;padding:28px 32px;box-shadow:0 20px 60px rgba(26,22,18,0.25);font-family:var(--font-sans)">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px"><h3 style="margin:0;font-size:18px;font-weight:700;color:var(--ink-900)">Raccourcis clavier Triage</h3><button data-kb-close style="background:transparent;border:0;font-size:20px;cursor:pointer;color:var(--ink-500)">x</button></div>';
  html += '<p style="margin:0 0 14px;font-size:13px;color:var(--ink-500);font-style:italic">Pilier Executif : trancher au clavier. Une frappe = un verdict.</p>';
  html += '<div style="display:grid;grid-template-columns:auto 1fr;gap:12px 14px;font-size:13px;color:var(--ink-700)">';
  for (var i = 0; i < rows.length; i++) {
    html += '<kbd style="font-family:var(--font-mono);background:var(--ivory-100);border:1px solid var(--ivory-200);border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;text-align:center">' + escHtml(rows[i][0]) + '</kbd><span>' + escHtml(rows[i][1]) + '</span>';
  }
  html += '</div>';
  html += '<p style="margin:18px 0 0;font-size:11px;color:var(--ink-500);font-style:italic">Astuce : la card focus est encadree violet sur la page Triage.</p>';
  html += '</div>';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.dataset.kbClose !== undefined) closeKbHelp();
  });
}

function closeKbHelp() {
  state.kbHelpOpen = false;
  var el = document.querySelector('[data-region="ar-kb-help"]');
  if (el) el.remove();
}

function moveKbCursor(delta) {
  if (state.mode !== 'queue' || !state.queue.length) return;
  var max = Math.min(state.queue.length, 50) - 1;
  state.kbIdx = Math.max(0, Math.min(max, state.kbIdx + delta));
  document.querySelectorAll('.ar-card').forEach(function(c, i) {
    c.classList.toggle('is-kb-focused', i === state.kbIdx);
  });
  var focusedCard = document.querySelector('[data-kb-idx="' + state.kbIdx + '"]');
  if (focusedCard) focusedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function triggerKbAction(action) {
  if (state.mode !== 'queue' || !state.queue.length) return;
  var item = state.queue[state.kbIdx];
  if (!item) return;
  var id = String(item.id);
  if (action === 'not-concerned') {
    markNotConcerned(id);
  } else {
    handleQueueAction(action, id);
  }
}

function arbKeyboardHandler(ev) {
  var tag = (ev.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || ev.target.isContentEditable) return;
  if (state.kbHelpOpen) {
    if (ev.key === 'Escape') { closeKbHelp(); ev.preventDefault(); }
    return;
  }
  if (state.mode !== 'queue') return;
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  switch (ev.key) {
    case '?': case 'h': case 'H':
      showKbHelpOverlay(); ev.preventDefault(); break;
    case 'ArrowDown': case 'j': case 'J':
      moveKbCursor(1); ev.preventDefault(); break;
    case 'ArrowUp': case 'k': case 'K':
      moveKbCursor(-1); ev.preventDefault(); break;
    case 'a': case 'A':
      triggerKbAction('accept'); ev.preventDefault(); break;
    case 'd': case 'D':
      triggerKbAction('defer'); ev.preventDefault(); break;
    case 'i': case 'I':
      triggerKbAction('ignore'); ev.preventDefault(); break;
    case 'n': case 'N':
      triggerKbAction('not-concerned'); ev.preventDefault(); break;
  }
}

// === Init ===
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.ar-mode-tab').forEach(function(t) {
    t.addEventListener('click', function() { switchMode(t.dataset.mode); });
  });
  var bAna = document.querySelector('[data-action="analyze"]');
  if (bAna) bAna.addEventListener('click', function() { analyzeEmails(false); });
  var bLlm = document.querySelector('[data-action="analyze-llm"]');
  if (bLlm) bLlm.addEventListener('click', function() { analyzeEmails(true); });
  var bBoot = document.querySelector('[data-action="bootstrap"]');
  if (bBoot) bBoot.addEventListener('click', function() { bootstrapProjects(); });
  var bKb = document.querySelector('[data-action="kb-help"]');
  if (bKb) bKb.addEventListener('click', showKbHelpOverlay);
  // S6.12 keyboard-first
  document.addEventListener('keydown', arbKeyboardHandler);
  renderQueue();
  if (typeof loadHistory === 'function') loadHistory();
});
