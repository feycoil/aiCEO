// settings-store.js — 8 onglets navigables (S6.11-EE-2 L4.2)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const TABS = [
  { id: 'general',    icon: 'settings',  label: 'General' },
  { id: 'langue',     icon: 'globe',     label: 'Langue & locales' },
  { id: 'maisons',    icon: 'projects',  label: 'Maisons' },
  { id: 'rituels',    icon: 'evening',   label: 'Rituels' },
  { id: 'coaching',   icon: 'coaching',  label: 'Coaching IA' },
  { id: 'donnees',    icon: 'knowledge', label: 'Donnees' },
  { id: 'apparence',  icon: 'sparkle',   label: 'Apparence' },
  { id: 'sensible',   icon: 'undo',      label: 'Zone sensible' }
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
    b.addEventListener('click', () => { state.activeTab = b.dataset.tab; renderTabs(); renderPanel(); });
  });
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
  return `
    <h2 class="st-panel-title">General</h2>
    <p class="st-panel-desc">Identite et nom d espace - utilises dans le greeting et les rituels.</p>
    <div class="st-field">
      <label class="st-label" for="st-firstName">Prenom</label>
      <input type="text" class="st-input" id="st-firstName" value="${escHtml(fn)}" data-key="user.firstName" />
      <p class="st-helper">Apparait dans le greeting du Hub et du Cockpit.</p>
    </div>
    <div class="st-field">
      <label class="st-label" for="st-tenantName">Nom d espace</label>
      <input type="text" class="st-input" id="st-tenantName" value="${escHtml(tn)}" data-key="user.tenantName" />
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

function panelCoaching() {
  const llmReady = state.llmReady;
  return `
    <h2 class="st-panel-title">Coaching IA</h2>
    <p class="st-panel-desc">Statut LLM : ${llmReady ? '<strong style="color:var(--success)">● Live (Claude Sonnet)</strong>' : '<strong style="color:var(--warning)">○ Mode degrade (rule-based)</strong>'}</p>
    <div class="st-helper" style="background:var(--ivory-50);padding:14px;border-radius:var(--radius-md);max-width:520px">
      ${llmReady
        ? 'Votre cle <code>ANTHROPIC_API_KEY</code> est detectee. Toutes les fonctions IA sont actives.'
        : 'Pour activer le coaching IA, definissez la variable d environnement Windows <code>ANTHROPIC_API_KEY</code> et redemarrez le serveur (pwsh -File restart-server.ps1).'
      }
    </div>
    <div class="st-field" style="margin-top:var(--space-4)">
      <label class="st-label">Posture decisionnelle</label>
      <select class="st-select" data-key="user.posture">
        <option value="">Non definie</option>
        <option value="gardienne"  ${state.prefs['user.posture'] === 'gardienne'  ? 'selected' : ''}>🛡 Gardienne</option>
        <option value="exploratrice" ${state.prefs['user.posture'] === 'exploratrice' ? 'selected' : ''}>🌱 Exploratrice</option>
        <option value="architecte" ${state.prefs['user.posture'] === 'architecte' ? 'selected' : ''}>◆ Architecte</option>
      </select>
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
    <div data-region="st-saved" class="st-saved">✓ Enregistre</div>
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
      <p class="st-helper" style="margin-bottom:var(--space-3)">Supprime TOUTES vos donnees (decisions, projets, contacts, bilans...). Cette operation se fait cote serveur uniquement (<code>cd 03_mvp ; npm run db:reset</code>) - non disponible depuis l UI pour eviter les accidents.</p>
      <button class="st-btn st-btn-danger" disabled>Disponible cote serveur uniquement</button>
    </div>
  `;
}

function renderPanel() {
  const host = document.querySelector('[data-region="st-panel"]');
  if (!host) return;
  const fn = ({ general: panelGeneral, langue: panelLangue, maisons: panelMaisons, rituels: panelRituels, coaching: panelCoaching, donnees: panelDonnees, apparence: panelApparence, sensible: panelSensible })[state.activeTab];
  host.innerHTML = fn ? fn() : '<p>Section inconnue.</p>';
  bindPanelEvents();
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

  // Reset onboarding
  host.querySelector('[data-action="reset-onboarding"]')?.addEventListener('click', async () => {
    if (!confirm('Repasser par le wizard d onboarding au prochain demarrage ?')) return;
    await safeFetch('/api/preferences/onboarding.completed', { method: 'DELETE' });
    alert('✓ Onboarding reinitialise. Allez sur /v07/pages/onboarding.html pour le refaire.');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Charge prefs + statut LLM
  const [prefs, llm] = await Promise.all([
    safeFetch('/api/preferences'),
    safeFetch('/api/llm-status')
  ]);
  state.prefs = (prefs?.preferences || prefs || {});
  state.llmReady = !!(llm?.ready);
  renderTabs();
  renderPanel();
  console.info('[settings] ready', { tabs: TABS.length, llmReady: state.llmReady });
});
