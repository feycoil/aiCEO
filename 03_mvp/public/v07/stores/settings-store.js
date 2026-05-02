// settings-store.js — 8 onglets navigables (S6.11-EE-2 L4.2)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const TABS = [
  { id: 'general',     icon: 'settings',  label: 'General' },
  { id: 'connecteurs', icon: 'arrow-up-right', label: 'Connecteurs' },
  { id: 'langue',      icon: 'globe',     label: 'Langue & locales' },
  { id: 'maisons',     icon: 'projects',  label: 'Maisons' },
  { id: 'rituels',     icon: 'evening',   label: 'Rituels' },
  { id: 'coaching',    icon: 'coaching',  label: 'Coaching IA' },
  { id: 'donnees',     icon: 'knowledge', label: 'Donnees' },
  { id: 'apparence',   icon: 'sparkle',   label: 'Apparence' },
  { id: 'sensible',    icon: 'undo',      label: 'Zone sensible' }
];

const state = { activeTab: 'general', prefs: {} };

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

function renderTabs() {
  const host = document.querySelector('[data-region="st-tabs"]');
  if (!host) return;
  host.innerHTML = TABS.map(t => `
    <button class="st-tab ${t.id === state.activeTab ? 'is-active' : ''}" data-tab="${t.id}">
      <svg class="st-tab-icon" aria-hidden="true"><use href="#i-${t.icon}"/></svg>
      <span>${t.label}</span>
    </button>
  `).join('');
  host.querySelectorAll('.st-tab').forEach(b => {
    b.addEventListener('click', () => {
      state.activeTab = b.dataset.tab;
      // S6.22 Lot 7 : sync hash URL pour deep-link (back button friendly)
      try { history.replaceState(null, '', '#' + state.activeTab); } catch (e) {}
      renderTabs();
      renderPanel();
    });
  });
}

// S6.22 Lot 7 : applyHashTab — lit window.location.hash et active l onglet correspondant.
// Resout le bug : Cockpit "Configurer ->" pointe vers settings.html#coaching mais on tombait sur General.
function applyHashTab() {
  const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
  if (!h) return false;
  // Aliases : api/llm/anthropic -> coaching (la cle ANTHROPIC est documentee dans Coaching IA)
  const alias = { api: 'coaching', llm: 'coaching', anthropic: 'coaching', 'api-key': 'coaching' };
  const target = alias[h] || h;
  if (TABS.some(t => t.id === target)) {
    state.activeTab = target;
    return true;
  }
  return false;
}

function showSaved() {
  const el = document.querySelector('[data-region="st-saved"]');
  if (!el) return;
  el.classList.add('is-visible');
  setTimeout(() => el.classList.remove('is-visible'), 1500);
}

async function savePref(key, value) {
  await safeFetch('/api/preferences/' + encodeURIComponent(key), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  });
  state.prefs[key] = value;
  showSaved();
}

function panelGeneral() {
  const fn = state.prefs['user.firstName'] || '';
  const tn = state.prefs['user.tenantName'] || 'Mon espace';
  let emails = [];
  try {
    const ea = state.prefs['user.email_addresses'];
    if (ea) emails = typeof ea === 'string' ? JSON.parse(ea) : ea;
    if (!Array.isArray(emails)) emails = [];
  } catch (e) { emails = []; }

  return `
    <h2 class="st-panel-title">General</h2>
    <p class="st-panel-desc">Identite, nom d espace, adresses email perso.</p>
    <div class="st-field">
      <label class="st-label" for="st-firstName">Prenom</label>
      <input type="text" class="st-input" id="st-firstName" value="${escHtml(fn)}" data-key="user.firstName" />
      <p class="st-helper">Apparait dans le greeting du Hub et du Cockpit.</p>
    </div>
    <div class="st-field">
      <label class="st-label" for="st-tenantName">Nom d espace</label>
      <input type="text" class="st-input" id="st-tenantName" value="${escHtml(tn)}" data-key="user.tenantName" />
    </div>

    <div class="st-field" style="margin-top:24px;padding-top:24px;border-top:1px solid var(--ivory-200)">
      <label class="st-label">Mes adresses email perso</label>
      <p class="st-helper" style="margin-bottom:10px">Claude prioritise les mails ou vous etes destinataire direct vs CC vs noise.</p>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <input type="email" class="st-input" id="st-email-add" placeholder="alias@domain.com" style="flex:1" />
        <button class="st-btn st-btn-ghost" data-action="add-email-pref" type="button" style="padding:9px 14px;border:1px solid var(--ivory-200);background:var(--paper);border-radius:8px;cursor:pointer;font-weight:600;font-size:12px">+ Ajouter</button>
      </div>
      <ul style="list-style:none;padding:12px;margin:0;background:var(--ivory-50);border:1px solid var(--ivory-200);border-radius:8px;display:flex;flex-wrap:wrap;gap:6px;min-height:48px" data-region="st-email-list">
        ${emails.length ? emails.map((e, i) => `
          <li style="display:inline-flex;align-items:center;gap:6px;padding:5px 4px 5px 10px;background:var(--paper);border:1px solid var(--ivory-200);border-radius:999px;font-size:12px;font-family:var(--font-mono)">
            <span>${escHtml(e)}</span>
            <button data-action="remove-email-pref" data-email="${escHtml(e)}" type="button" style="background:transparent;border:0;width:20px;height:20px;border-radius:50%;cursor:pointer;color:var(--ink-500);font-size:13px" aria-label="Retirer">×</button>
          </li>
        `).join('') : '<li style="font-size:12px;color:var(--ink-500);font-style:italic">Aucune adresse. Ajoutez la votre ci-dessus.</li>'}
      </ul>
    </div>

    <div class="st-actions">
      <span data-region="st-saved" class="st-saved">✓ Enregistre</span>
    </div>
  `;
}

function panelLangue() {
  const lang = state.prefs['locale.lang'] || 'fr';
  return `
    <h2 class="st-panel-title">Langue & locales</h2>
    <p class="st-panel-desc">L i18n complete arrive en V2. Pour l instant, francais uniquement.</p>
    <div class="st-field">
      <label class="st-label" for="st-lang">Langue</label>
      <select class="st-select" id="st-lang" data-key="locale.lang">
        <option value="fr" ${lang === 'fr' ? 'selected' : ''}>Francais (par defaut)</option>
        <option value="en" disabled>English (V2)</option>
      </select>
    </div>
    <div data-region="st-saved" class="st-saved">✓ Enregistre</div>
  `;
}

function panelMaisons() {
  return `
    <h2 class="st-panel-title">Maisons</h2>
    <p class="st-panel-desc">Vos maisons (groupes/projets) se gerent depuis la page <a href="projets.html" style="color:var(--primary-700)">Projets</a> directement.</p>
    <p class="st-helper">A V1 : import/export YAML, archivage de masse, regroupement par theme.</p>
  `;
}

function panelRituels() {
  const morning = state.prefs['ritual.morning'] !== '0';
  const evening = state.prefs['ritual.evening'] !== '0';
  return `
    <h2 class="st-panel-title">Rituels</h2>
    <p class="st-panel-desc">Les rituels du matin et du soir sont cle dans aiCEO. Vous pouvez les desactiver mais c est dommage.</p>
    <div class="st-field">
      <button class="st-toggle ${morning ? 'is-on' : ''}" data-toggle="ritual.morning">
        <div class="st-toggle-info">
          <div class="st-toggle-name">Arbitrage du matin</div>
          <div class="st-toggle-meta">Notification 8h00 - file emails + decisions</div>
        </div>
        <div class="st-switch"></div>
      </button>
    </div>
    <div class="st-field">
      <button class="st-toggle ${evening ? 'is-on' : ''}" data-toggle="ritual.evening">
        <div class="st-toggle-info">
          <div class="st-toggle-name">Bilan du soir</div>
          <div class="st-toggle-meta">Notification 19h00 - humeur + top 3 + streak</div>
        </div>
        <div class="st-switch"></div>
      </button>
    </div>
    <div data-region="st-saved" class="st-saved">✓ Enregistre</div>
  `;
}


// S6.24.2 : load + render stats apprentissage
async function loadLearningStats() {
  try {
    const r = await fetch('/api/arbitrage/learning-stats');
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
}

async function renderLearningStats() {
  const host = document.querySelector('[data-region="st-learning-stats"]');
  if (!host) return;
  const data = await loadLearningStats();
  if (!data || !data.total) {
    host.innerHTML = '<p class="st-helper" style="font-style:italic">Aucun apprentissage enregistre. Marquez "Pas pour moi" sur les emails pour entraine Claude.</p>';
    return;
  }
  const recent = (data.recent || []).slice(0, 10);
  host.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px">
      <div style="flex:1;min-width:140px;padding:12px 14px;background:#dcfce7;border-radius:8px"><div style="font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.04em">Patterns appris</div><div style="font-size:24px;font-weight:700;color:#14532d;margin-top:4px">${data.total}</div></div>
      <div style="flex:1;min-width:140px;padding:12px 14px;background:#dbeafe;border-radius:8px"><div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.04em">Auto-filtres</div><div style="font-size:24px;font-weight:700;color:#1e3a8a;margin-top:4px">${data.auto_filtered_estimate || 0}</div></div>
      <div style="flex:1;min-width:140px;padding:12px 14px;background:#fef3c7;border-radius:8px"><div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.04em">Pas pour moi</div><div style="font-size:24px;font-weight:700;color:#78350f;margin-top:4px">${data.byVerdict?.not_concerned || 0}</div></div>
    </div>
    ${recent.length ? `<div style="font-size:12px;font-weight:600;color:var(--ink-700);margin:8px 0 6px">10 derniers feedbacks</div>
    <ul style="list-style:none;margin:0;padding:0;border:1px solid var(--ivory-200);border-radius:8px;overflow:hidden">
      ${recent.map(f => `
        <li style="display:flex;align-items:center;gap:10px;padding:8px 12px;font-size:11px;border-bottom:1px solid var(--ivory-200)">
          <span style="font-family:var(--font-mono);color:var(--ink-500);min-width:60px">${(f.learned_at || '').slice(5, 16).replace('T', ' ')}</span>
          <span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:3px;font-weight:700;font-size:10px;text-transform:uppercase;font-family:var(--font-mono)">${escHtml(f.verdict)}</span>
          <span style="flex:1;color:var(--ink-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(f.from_email || '?')} \u00b7 ${escHtml((f.subject || '').slice(0, 50))}</span>
          <button data-action="del-feedback" data-id="${escHtml(f.id)}" type="button" style="background:transparent;border:0;color:var(--ink-500);cursor:pointer;font-size:12px" title="Retirer ce feedback">\u2715</button>
        </li>
      `).join('')}
    </ul>` : ''}
  `;

  host.querySelectorAll('[data-action="del-feedback"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Retirer ce feedback ? Claude ne respectera plus ce pattern.')) return;
      await fetch('/api/arbitrage/email-feedback/' + encodeURIComponent(btn.dataset.id), { method: 'DELETE' });
      renderLearningStats();
    });
  });
}


function panelCoaching() {
  const llmReady = state.llmReady;
  const statusBadge = llmReady
    ? '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#dcfce7;color:#166534;border-radius:999px;font-size:12px;font-weight:600">● Claude live</span>'
    : '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#fef3c7;color:#92400e;border-radius:999px;font-size:12px;font-weight:600">○ Mode degrade</span>';

  const configBlock = llmReady
    ? `<div style="background:#dcfce7;border:1px solid #86efac;padding:14px 16px;border-radius:var(--radius-md);max-width:640px;margin-bottom:var(--space-4)">
        <strong style="color:#166534">✓ ANTHROPIC_API_KEY detectee</strong>
        <p class="st-helper" style="margin:4px 0 0">Toutes les fonctions IA sont actives : Triage Claude-aware, recommandations decisions, auto-draft revues, signaux faibles coaching.</p>
       </div>`
    : `<div style="background:#fef3c7;border:1px solid #fbbf24;padding:14px 16px;border-radius:var(--radius-md);max-width:640px;margin-bottom:var(--space-4)">
        <strong style="color:#92400e">⚠ Activez Claude pour debloquer l IA</strong>
        <p class="st-helper" style="margin:4px 0 8px">Definissez la variable d environnement Windows <code>ANTHROPIC_API_KEY</code> puis redemarrez le serveur :</p>
        <pre style="background:var(--ink-900);color:#fff;padding:10px 12px;border-radius:6px;font-size:11px;overflow:auto;margin:0 0 8px"><code id="st-cmd-key">[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY","sk-ant-...","User")
# Puis dans un nouveau terminal :
cd C:\\_workarea_local\\aiCEO\\03_mvp ; npm start</code></pre>
        <button class="st-btn st-btn-ghost" id="st-copy-cmd" style="font-size:12px">📋 Copier la commande</button>
        <p class="st-helper" style="margin-top:8px;font-size:11px">Obtenez une cle sur <a href="https://console.anthropic.com/settings/keys" target="_blank" style="color:var(--primary-700)">console.anthropic.com</a>. Format <code>sk-ant-api03-...</code></p>
       </div>`;

  return `
    <h2 class="st-panel-title">Coaching IA</h2>
    <p class="st-panel-desc">Statut LLM ${statusBadge}</p>
    ${configBlock}
    <div class="st-field" style="margin-top:var(--space-4)">
      <label class="st-label">Posture decisionnelle</label>
      <select class="st-select" data-key="user.posture">
        <option value="">Non definie</option>
        <option value="gardienne"  ${state.prefs['user.posture'] === 'gardienne'  ? 'selected' : ''}>🛡 Gardienne</option>
        <option value="exploratrice" ${state.prefs['user.posture'] === 'exploratrice' ? 'selected' : ''}>🌱 Exploratrice</option>
        <option value="architecte" ${state.prefs['user.posture'] === 'architecte' ? 'selected' : ''}>◆ Architecte</option>
      </select>
      <p class="st-helper">Influe sur le ton des recommandations Claude (Triage, Decisions, Coaching).</p>
    </div>
    <div class="st-field" style="margin-top:24px;padding-top:24px;border-top:1px solid var(--ivory-200)">
      <label class="st-label">Apprentissage Claude</label>
      <p class="st-helper" style="margin-bottom:12px">Chaque "Pas pour moi" sur le Triage entraine Claude a filtrer les emails similaires. Voici les patterns appris.</p>
      <div data-region="st-learning-stats">
        <p class="st-helper" style="font-style:italic">Chargement des stats...</p>
      </div>
    </div>
    <div data-region="st-saved" class="st-saved">✓ Enregistre</div>
  `;
}

function panelDonnees() {
  return `
    <h2 class="st-panel-title">Donnees</h2>
    <p class="st-panel-desc">Vos donnees restent locales (SQLite mono-instance). Aucune copie cloud.</p>
    <div class="st-field">
      <label class="st-label">Sync Outlook</label>
      <p class="st-helper">Sync auto toutes les 2h via schtasks (J-15 emails + J-15 a J+30 events).</p>
      <button class="st-btn st-btn-ghost" disabled>Sync manuelle (cote serveur uniquement)</button>
    </div>
    <div class="st-field">
      <label class="st-label">Backup</label>
      <p class="st-helper">Snapshot manuel : <code>cp data/aiceo.db data/aiceo.db.bak-$(date +%Y%m%d)</code> a la racine du repo (V1.5 = backup auto).</p>
    </div>
    <div class="st-field">
      <label class="st-label">Export</label>
      <a href="/api/system/export" class="st-btn st-btn-ghost" style="text-decoration:none;display:inline-block">Telecharger (JSON)</a>
    </div>
  `;
}

function panelApparence() {
  const theme = state.prefs['ui.theme'] || 'editorial';
  let density = 'normal';
  try { density = localStorage.getItem('aiCEO.uiDensity') || 'normal'; } catch (e) {}
  const dBtn = (id, label) => '<button type="button" class="st-density-btn ' + (density === id ? 'is-active' : '') + '" data-density="' + id + '" style="padding:6px 14px;border:0;background:' + (density === id ? 'var(--paper)' : 'transparent') + ';color:' + (density === id ? 'var(--ink-900)' : 'var(--ink-500)') + ';border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;font-family:var(--font-sans);box-shadow:' + (density === id ? 'var(--elev-1)' : 'none') + ';transition:all 150ms">' + label + '</button>';
  return `
    <h2 class="st-panel-title">Apparence</h2>
    <p class="st-panel-desc">Direction artistique Editorial Executive (warm neutrals + violet primary). Le mode sombre arrive en V2.</p>
    <div class="st-field">
      <label class="st-label" for="st-theme">Theme</label>
      <select class="st-select" id="st-theme" data-key="ui.theme">
        <option value="editorial" ${theme === 'editorial' ? 'selected' : ''}>Editorial Executive (par defaut)</option>
        <option value="dark" disabled>Sombre (V2)</option>
      </select>
    </div>
    <div class="st-field" style="margin-top:var(--space-4)">
      <label class="st-label">Densite des cards Triage</label>
      <p class="st-helper" style="margin-bottom:var(--space-2)">Compact = plus d emails par ecran. Detaille = plus de contexte par card.</p>
      <div role="group" aria-label="Densite UI" style="display:inline-flex;background:var(--ivory-100);border-radius:8px;padding:3px;gap:2px">
        ${dBtn('compact', 'Compact')}${dBtn('normal', 'Normal')}${dBtn('detaille', 'Detaille')}
      </div>
      <p class="st-helper" style="margin-top:var(--space-2);font-style:italic">Choix pris en compte immediatement sur la page Triage.</p>
    </div>
    <div data-region="st-saved" class="st-saved">✓ Enregistre</div>
  `;
}

// S6.41 : Onglet Connecteurs (catalogue sources de donnees + sync log)
function panelConnecteurs() {
  return `
    <h2 class="st-panel-title">Connecteurs</h2>
    <p class="st-panel-desc">Sources de donnees branchees a aiCEO. Vous pouvez resynchroniser, voir l historique des syncs, et brancher de nouveaux connecteurs (a venir en V1.x).</p>

    <div data-region="st-connectors" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:var(--space-3);margin-top:var(--space-3)">
      <div style="text-align:center;padding:30px;color:var(--ink-500);grid-column:1/-1">Chargement...</div>
    </div>

    <div style="margin-top:var(--space-5);padding:var(--space-4);background:var(--ivory-50);border:1px solid var(--ivory-200);border-radius:var(--radius-md)">
      <h3 style="margin:0 0 var(--space-2);font-size:14px;font-weight:600">Historique des syncs (10 dernieres)</h3>
      <div data-region="st-synclog" style="font-size:12px;color:var(--ink-700)"><em>Chargement...</em></div>
    </div>
  `;
}

function panelSensible() {
  return `
    <h2 class="st-panel-title">Zone sensible</h2>
    <p class="st-panel-desc">Operations destructives. Reflexion de 2 minutes recommandee avant de cliquer.</p>
    <div class="st-danger-zone">
      <div class="st-danger-zone-title">⚠ Reset onboarding</div>
      <p class="st-helper" style="margin-bottom:var(--space-3)">Repasse par le wizard d onboarding au prochain demarrage. Vos donnees (decisions, projets, contacts) sont conservees.</p>
      <button class="st-btn st-btn-danger" data-action="reset-onboarding">Reinitialiser l onboarding</button>
    </div>
    <div class="st-danger-zone" style="margin-top:var(--space-3)">
      <div class="st-danger-zone-title">☠ Reset complet de la base</div>
      <p class="st-helper" style="margin-bottom:var(--space-3)">Supprime TOUTES vos donnees (decisions, projets, contacts, bilans, emails, conversations Assistant). Les 8 domaines + 1 societe seedes sont preserves. Operation irreversible. Cote ligne de commande : <code>cd C:\\_workarea_local\\aiCEO ; .\\wipe-and-restart.ps1</code></p>
      <button class="st-btn st-btn-danger" data-action="wipe-data">☠ Tout reinitialiser maintenant</button>
      <div data-region="wipe-result" style="margin-top:var(--space-3);font-size:13px" hidden></div>
    </div>
    <div class="st-danger-zone" style="margin-top:var(--space-3);background:#fef3c7;border-color:#fcd34d">
      <div class="st-danger-zone-title">📚 Parcours d initialisation</div>
      <p class="st-helper" style="margin-bottom:var(--space-3)">Vous voulez accompagner un nouveau dirigeant ou repartir d une page blanche ? Le parcours d init complet est documente : <a href="../../../../04_docs/PARCOURS-INIT-CEO.md" target="_blank">04_docs/PARCOURS-INIT-CEO.md</a> (8 etapes, 25 minutes).</p>
    </div>
  `;
}

function renderPanel() {
  const host = document.querySelector('[data-region="st-panel"]');
  if (!host) return;
  const fn = ({ general: panelGeneral, connecteurs: panelConnecteurs, langue: panelLangue, maisons: panelMaisons, rituels: panelRituels, coaching: panelCoaching, donnees: panelDonnees, apparence: panelApparence, sensible: panelSensible })[state.activeTab];
  host.innerHTML = fn ? fn() : '<p>Section inconnue.</p>';
  bindPanelEvents();
  // S6.41 : trigger render connecteurs si onglet connecteurs
  if (state.activeTab === 'connecteurs') {
    setTimeout(() => renderConnectors(), 100);
  }
  // S6.24.2 : trigger stats apprentissage si onglet coaching
  if (state.activeTab === 'coaching') {
    setTimeout(() => renderLearningStats(), 100);
  }
}

function bindPanelEvents() {
  const host = document.querySelector('[data-region="st-panel"]');
  if (!host) return;

  // Inputs / selects
  host.querySelectorAll('[data-key]').forEach(el => {
    const handler = () => {
      const value = el.value;
      savePref(el.dataset.key, value);
    };
    if (el.tagName === 'INPUT') el.addEventListener('blur', handler);
    else if (el.tagName === 'SELECT') el.addEventListener('change', handler);
  });

  // Toggles
  host.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const isOn = el.classList.toggle('is-on');
      savePref(el.dataset.toggle, isOn ? '1' : '0');
    });
  });

  // S6.27 : densite UI buttons
  host.querySelectorAll('[data-density]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.density;
      try { localStorage.setItem('aiCEO.uiDensity', d); } catch (e) {}
      document.body.classList.remove('density-compact', 'density-normal', 'density-detaille');
      document.body.classList.add('density-' + d);
      renderPanel();
      const saved = host.querySelector('[data-region="st-saved"]');
      if (saved) {
        saved.classList.add('is-visible');
        setTimeout(() => saved.classList.remove('is-visible'), 1200);
      }
    });
  });

  // S6.22 Lot 20 : add/remove email perso
  host.querySelector('[data-action="add-email-pref"]')?.addEventListener('click', async () => {
    const input = host.querySelector('#st-email-add');
    if (!input) return;
    const v = (input.value || '').trim().toLowerCase();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { alert('Adresse invalide'); return; }
    let cur = [];
    try {
      const ea = state.prefs['user.email_addresses'];
      if (ea) cur = typeof ea === 'string' ? JSON.parse(ea) : ea;
      if (!Array.isArray(cur)) cur = [];
    } catch (e) {}
    if (cur.includes(v)) { alert('Deja dans la liste'); return; }
    cur.push(v);
    await savePref('user.email_addresses', JSON.stringify(cur));
    state.prefs['user.email_addresses'] = JSON.stringify(cur);
    renderPanel();
  });
  host.querySelectorAll('[data-action="remove-email-pref"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const v = btn.dataset.email;
      let cur = [];
      try {
        const ea = state.prefs['user.email_addresses'];
        if (ea) cur = typeof ea === 'string' ? JSON.parse(ea) : ea;
        if (!Array.isArray(cur)) cur = [];
      } catch (e) {}
      cur = cur.filter(x => x !== v);
      await savePref('user.email_addresses', JSON.stringify(cur));
      state.prefs['user.email_addresses'] = JSON.stringify(cur);
      renderPanel();
    });
  });

  // Reset onboarding
  host.querySelector('[data-action="reset-onboarding"]')?.addEventListener('click', async () => {
    if (!confirm('Repasser par le wizard d onboarding au prochain demarrage ?')) return;
    await safeFetch('/api/preferences/onboarding.completed', { method: 'DELETE' });
    alert('✓ Onboarding reinitialise. Allez sur /v07/pages/onboarding.html pour le refaire.');
  });

  // S6.41 : Wipe complet (reset comme nouvelle install)
  host.querySelector('[data-action="wipe-data"]')?.addEventListener('click', async () => {
    const txt = prompt('Cette operation supprime DEFINITIVEMENT vos donnees (decisions, projets, contacts, emails, conversations).\n\nLes 8 domaines + societe seed sont preserves.\n\nTapez "RESET" pour confirmer.');
    if (txt !== 'RESET') return;
    const result = document.querySelector('[data-region="wipe-result"]');
    if (result) { result.hidden = false; result.textContent = 'Reinitialisation en cours...'; }
    try {
      const r = await fetch('/api/system/wipe-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Confirm-Wipe': 'yes-i-am-sure' },
        body: JSON.stringify({ keep_seeds: true })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      const total = (j.wiped || []).reduce((s, w) => s + (w.deleted || 0), 0);
      if (result) {
        result.innerHTML = '<strong style="color:#059669">✓ Reset complete.</strong> ' + total + ' lignes supprimees sur ' + (j.wiped || []).length + ' tables. Caches Outlook : ' + ((j.cache_files_removed || []).length) + ' fichiers. <a href="onboarding.html">Aller a l onboarding →</a>';
      }
    } catch (e) {
      if (result) result.innerHTML = '<strong style="color:#dc2626">✗ Erreur :</strong> ' + e.message;
    }
  });

  // S6.22 Lot 7 : copier commande config ANTHROPIC_API_KEY
  host.querySelector('#st-copy-cmd')?.addEventListener('click', async () => {
    const cmd = host.querySelector('#st-cmd-key')?.textContent || '';
    try {
      await navigator.clipboard.writeText(cmd);
      const btn = host.querySelector('#st-copy-cmd');
      const orig = btn.textContent;
      btn.textContent = '✓ Copie !';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    } catch (e) {
      alert('Impossible de copier (clipboard API non disponible). Selectionnez le texte manuellement.');
    }
  });
}

// === S6.41 : Render Connecteurs (catalogue + sync) ===
async function renderConnectors() {
  const host = document.querySelector('[data-region="st-connectors"]');
  const logHost = document.querySelector('[data-region="st-synclog"]');
  if (!host) return;
  const data = await safeFetch('/api/connectors');
  if (!data || !data.connectors) {
    host.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--ink-500);padding:20px">Erreur de chargement des connecteurs</div>';
    return;
  }
  const fmtDate = (iso) => { if (!iso) return 'jamais'; try { return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); } catch { return iso; } };
  const statusBadge = (s) => {
    const map = {
      'connected':   { label: 'Connecte',  bg: '#10b98120', fg: '#059669' },
      'available':   { label: 'Disponible',bg: '#3b82f620', fg: '#1e40af' },
      'error':       { label: 'Erreur',    bg: '#ef444420', fg: '#b91c1c' },
      'coming_soon': { label: 'Bientot',   bg: '#94a3b820', fg: '#475569' },
      'disabled':    { label: 'Desactive', bg: '#94a3b820', fg: '#475569' }
    };
    const m = map[s] || map['available'];
    return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:' + m.bg + ';color:' + m.fg + '">' + m.label + '</span>';
  };
  host.innerHTML = data.connectors.map(c => {
    const last = c.last_sync ? '<div style="font-size:11px;color:var(--ink-500);margin-top:4px">Dernier run : ' + fmtDate(c.last_sync.started_at) + ' · ' + (c.last_sync.items_count || 0) + ' items</div>' : '';
    const canSync = c.status !== 'coming_soon' && c.status !== 'disabled';
    const btn = canSync
      ? '<button class="st-btn" data-action="sync-now" data-kind="' + escHtml(c.kind) + '" style="margin-top:10px;width:100%;padding:8px;background:var(--ink-900);color:var(--paper);border:0;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px">Resynchroniser maintenant</button>'
      : '<button disabled style="margin-top:10px;width:100%;padding:8px;background:var(--ivory-200);color:var(--ink-400);border:0;border-radius:6px;cursor:not-allowed;font-weight:600;font-size:12px">Bientot disponible (V1.x)</button>';
    return `<div style="background:var(--paper);border:1px solid var(--ivory-200);border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="font-size:24px">${escHtml(c.icon || '🔌')}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;color:var(--ink-900)">${escHtml(c.label)}</div>
          <div style="font-size:11px;color:var(--ink-500);font-family:var(--font-mono)">${escHtml(c.kind)}</div>
        </div>
        ${statusBadge(c.status)}
      </div>
      ${last}
      ${c.last_error ? '<div style="margin-top:6px;font-size:11px;color:#dc2626">⚠ ' + escHtml(c.last_error.slice(0, 100)) + '</div>' : ''}
      ${btn}
    </div>`;
  }).join('');
  // Wire sync buttons
  host.querySelectorAll('[data-action="sync-now"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const kind = btn.dataset.kind;
      btn.disabled = true; btn.textContent = 'Sync en cours...';
      try {
        const r = await fetch('/api/connectors/' + encodeURIComponent(kind) + '/sync', { method: 'POST' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        btn.textContent = '✓ Lance · suivez l historique';
        // Poll log apres 3s puis 10s
        setTimeout(() => { renderSyncLog(); renderConnectors(); }, 3000);
        setTimeout(() => { renderSyncLog(); renderConnectors(); }, 10000);
      } catch (e) {
        btn.textContent = '✗ ' + e.message;
        setTimeout(() => { btn.disabled = false; btn.textContent = 'Resynchroniser maintenant'; }, 3000);
      }
    });
  });
  // Render sync log
  renderSyncLog();
}

async function renderSyncLog() {
  const logHost = document.querySelector('[data-region="st-synclog"]');
  if (!logHost) return;
  const data = await safeFetch('/api/system/sync-log?limit=10');
  if (!data || !data.logs || !data.logs.length) {
    logHost.innerHTML = '<em style="color:var(--ink-500)">Aucune sync enregistree pour le moment.</em>';
    return;
  }
  const fmtDate = (iso) => { if (!iso) return ''; try { return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' }); } catch { return iso; } };
  const fmtDur = (ms) => { if (!ms) return '-'; if (ms < 1000) return ms + 'ms'; return Math.round(ms/100)/10 + 's'; };
  const statusIcon = { running: '⏳', success: '✓', error: '✗' };
  logHost.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--paper)"><th style="text-align:left;padding:6px;font-size:11px;color:var(--ink-500);text-transform:uppercase">Statut</th><th style="text-align:left;padding:6px;font-size:11px;color:var(--ink-500);text-transform:uppercase">Connecteur</th><th style="text-align:left;padding:6px;font-size:11px;color:var(--ink-500);text-transform:uppercase">Demarre</th><th style="text-align:right;padding:6px;font-size:11px;color:var(--ink-500);text-transform:uppercase">Items</th><th style="text-align:right;padding:6px;font-size:11px;color:var(--ink-500);text-transform:uppercase">Duree</th></tr></thead><tbody>' +
    data.logs.map(l => {
      const errTooltip = l.error_message ? ' title="' + escHtml(l.error_message) + '"' : '';
      const stColor = l.status === 'success' ? '#059669' : (l.status === 'error' ? '#dc2626' : '#3b82f6');
      return '<tr style="border-top:1px solid var(--ivory-200)"' + errTooltip + '><td style="padding:6px;color:' + stColor + '">' + (statusIcon[l.status] || '?') + ' ' + escHtml(l.status) + '</td><td style="padding:6px;font-family:var(--font-mono);font-size:11px">' + escHtml(l.connector_kind) + '</td><td style="padding:6px;font-size:11px">' + fmtDate(l.started_at) + '</td><td style="padding:6px;text-align:right;font-variant-numeric:tabular-nums">' + (l.items_count || 0) + '</td><td style="padding:6px;text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-500)">' + fmtDur(l.duration_ms) + '</td></tr>';
    }).join('') + '</tbody></table>';
}

document.addEventListener('DOMContentLoaded', async () => {
  // S6.22 Lot 7 : applique le hash URL avant tout (#coaching, #api, #donnees...)
  applyHashTab();

  // Charge prefs + statut LLM
  const [prefs, llm] = await Promise.all([
    safeFetch('/api/preferences'),
    safeFetch('/api/llm-status')
  ]);
  state.prefs = (prefs?.preferences || prefs || {});
  state.llmReady = !!(llm?.ready || llm?.available || llm?.mode === "live");
  renderTabs();
  renderPanel();

  // Reagit au changement de hash (ex: back/forward navigation, ou autre lien interne)
  window.addEventListener('hashchange', () => {
    if (applyHashTab()) {
      renderTabs();
      renderPanel();
    }
  });

  console.info('[settings] ready', { tabs: TABS.length, llmReady: state.llmReady, activeTab: state.activeTab });
});
