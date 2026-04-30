// onboarding-store.js — Wizard 4 etapes (S6.11-EE-2 L1.2)
// Etape 1 : firstName | Etape 2 : tenantName | Etape 3 : posture | Etape 4 : recap+confirm
// Persistance : POST /api/preferences (table key/value)

const STEPS = ['identite', 'espace', 'emails', 'posture', 'recap'];
const POSTURES = [
  {
    id: 'gardienne',
    glyph: '🛡',
    name: 'La gardienne',
    tag: 'Je tranche pour proteger.',
    bullets: ['Lis les risques en premier', 'Prefere stabiliser avant d explorer', 'Consultative avec l equipe']
  },
  {
    id: 'exploratrice',
    glyph: '🌱',
    name: 'L exploratrice',
    tag: 'Je tranche pour ouvrir.',
    bullets: ['Cherche l opportunite cachee', 'Tolere le doute pour avancer', 'Pivote vite si signal nouveau']
  },
  {
    id: 'architecte',
    glyph: '◆',
    name: 'L architecte',
    tag: 'Je tranche pour optimiser.',
    bullets: ['Aligne tout sur la coherence systeme', 'Mesure avant de decider', 'Refuse l improvisation sans donnees']
  }
];

const state = {
  currentStep: 0,
  data: { firstName: '', tenantName: '', posture: '', emails: [] }
};

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderProgress() {
  const host = document.querySelector('[data-region="ob-progress"]');
  if (!host) return;
  let html = '';
  STEPS.forEach((_, i) => {
    const cls = i < state.currentStep ? 'is-done' : (i === state.currentStep ? 'is-current' : '');
    html += `<span class="ob-step-dot ${cls}">${i + 1}</span>`;
    if (i < STEPS.length - 1) {
      const lineCls = i < state.currentStep ? 'is-done' : '';
      html += `<span class="ob-step-line ${lineCls}"></span>`;
    }
  });
  host.innerHTML = html;
}

function renderStep() {
  const host = document.querySelector('[data-region="ob-step-host"]');
  if (!host) return;
  const step = STEPS[state.currentStep];
  if (step === 'identite') host.innerHTML = stepIdentite();
  else if (step === 'espace') host.innerHTML = stepEspace();
  else if (step === 'emails') host.innerHTML = stepEmails();
  else if (step === 'posture') host.innerHTML = stepPosture();
  else if (step === 'recap') host.innerHTML = stepRecap();
  bindStepEvents();
}

function stepIdentite() {
  return `
    <div class="ob-card">
      <div class="ob-eyebrow">Etape 1 / 5 - Identite</div>
      <h1 class="ob-title">Comment puis-je vous appeler ?</h1>
      <p class="ob-desc">Votre prenom apparaitra dans le greeting du Hub et dans les rituels matin/soir. Rien d ecrit en pierre - vous pourrez modifier dans Reglages.</p>
      <div class="ob-field">
        <label class="ob-label" for="ob-firstName">Prenom</label>
        <input type="text" id="ob-firstName" class="ob-input" placeholder="Major" value="${escapeHtml(state.data.firstName)}" autocomplete="given-name" />
        <p class="ob-helper">Exemple : "Major", "Lamiae", "Jean-Pierre"...</p>
      </div>
      <div class="ob-actions">
        <button class="ob-btn ob-btn-secondary" data-action="prev" disabled>Precedent</button>
        <button class="ob-btn ob-btn-primary" data-action="next">Continuer</button>
      </div>
    </div>
  `;
}

function stepEspace() {
  return `
    <div class="ob-card">
      <div class="ob-eyebrow">Etape 2 / 5 - Espace de travail</div>
      <h1 class="ob-title">Quel nom pour votre espace ?</h1>
      <p class="ob-desc">Un espace = un perimetre. C est comme un compte. Vous pourrez en avoir plusieurs plus tard (perso / pro / projet specifique).</p>
      <div class="ob-field">
        <label class="ob-label" for="ob-tenantName">Nom de l espace</label>
        <input type="text" id="ob-tenantName" class="ob-input" placeholder="Mon espace" value="${escapeHtml(state.data.tenantName)}" />
        <p class="ob-helper">Exemple : "ETIC Services", "Direction generale", "Mon perso"...</p>
      </div>
      <div class="ob-actions">
        <button class="ob-btn ob-btn-secondary" data-action="prev">Precedent</button>
        <button class="ob-btn ob-btn-primary" data-action="next">Continuer</button>
      </div>
    </div>
  `;
}


function stepEmails() {
  const emails = state.data.emails || [];
  const list = emails.length
    ? emails.map((e, i) => `
        <li class="ob-email-chip" data-email-idx="${i}">
          <span>${escapeHtml(e)}</span>
          <button type="button" class="ob-email-remove" data-action="remove-email" data-idx="${i}" aria-label="Retirer ${escapeHtml(e)}">\u00d7</button>
        </li>
      `).join('')
    : '<li class="ob-email-empty">Aucune adresse pour l instant. Tapez la votre ci-dessous.</li>';

  return `
    <div class="ob-card">
      <div class="ob-eyebrow">Etape 3 / 5 - Vos adresses email</div>
      <h1 class="ob-title">Comment Claude reconnait-il vos mails ?</h1>
      <p class="ob-desc">Indiquez vos adresses perso (pro, perso, alias). Claude prioritise les mails ou vous etes destinataire direct, distingue les CC, et filtre le noise.</p>
      <div class="ob-field">
        <label class="ob-label" for="ob-email-input">Ajouter une adresse</label>
        <div style="display:flex;gap:8px;align-items:stretch">
          <input type="email" id="ob-email-input" class="ob-input" placeholder="major.fey@etic-services.net" autocomplete="email" style="flex:1" />
          <button type="button" class="ob-btn ob-btn-secondary" data-action="add-email" style="white-space:nowrap;padding:0 18px">+ Ajouter</button>
        </div>
        <p class="ob-helper">Tapez l adresse + Entree, ou cliquez sur "+ Ajouter". Vos alias et adresses pro sont importants.</p>
      </div>
      <ul class="ob-email-list" data-region="ob-email-list">${list}</ul>
      <p class="ob-helper" style="margin-top:12px;font-size:12px;font-style:italic">Au minimum 1 adresse pour passer a l etape suivante. Vous pourrez en ajouter dans Reglages > General.</p>
      <div class="ob-actions">
        <button class="ob-btn ob-btn-secondary" data-action="prev">Precedent</button>
        <button class="ob-btn ob-btn-primary" data-action="next" ${emails.length ? '' : 'disabled'}>Continuer</button>
      </div>
    </div>
  `;
}

function stepPosture() {
  const cards = POSTURES.map(p => `
    <button type="button" class="ob-posture${state.data.posture === p.id ? ' is-selected' : ''}" data-posture-id="${p.id}">
      <div class="ob-posture-glyph">${p.glyph}</div>
      <div class="ob-posture-name">${p.name}</div>
      <div class="ob-posture-tag">${p.tag}</div>
      <ul class="ob-posture-list">
        ${p.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </button>
  `).join('');
  return `
    <div class="ob-card">
      <div class="ob-eyebrow">Etape 4 / 5 - Posture decisionnelle</div>
      <h1 class="ob-title">Comment <em>decidez</em>-vous, en vrai ?</h1>
      <p class="ob-desc">Aucune reponse n est meilleure - mais l assistant adaptera ses propositions selon votre style dominant. Vous pourrez l ajuster dans Reglages.</p>
      <div class="ob-postures">${cards}</div>
      <div class="ob-actions">
        <button class="ob-btn ob-btn-secondary" data-action="prev">Precedent</button>
        <button class="ob-btn ob-btn-primary" data-action="next" ${state.data.posture ? '' : 'disabled'}>Continuer</button>
      </div>
    </div>
  `;
}

function stepRecap() {
  const posture = POSTURES.find(p => p.id === state.data.posture);
  return `
    <div class="ob-card">
      <div class="ob-eyebrow">Etape 5 / 5 - Confirmation</div>
      <h1 class="ob-title">On est prets, ${escapeHtml(state.data.firstName || 'Major')}.</h1>
      <p class="ob-desc">Voici votre configuration. Cliquez sur "Demarrer" pour rejoindre le cockpit.</p>
      <div class="ob-recap">
        <div class="ob-recap-row">
          <span class="ob-recap-label">Prenom</span>
          <span class="ob-recap-value">${escapeHtml(state.data.firstName)}</span>
        </div>
        <div class="ob-recap-row">
          <span class="ob-recap-label">Espace</span>
          <span class="ob-recap-value">${escapeHtml(state.data.tenantName)}</span>
        </div>
        <div class="ob-recap-row">
          <span class="ob-recap-label">Adresses email</span>
          <span class="ob-recap-value">${(state.data.emails || []).length} adresse${(state.data.emails || []).length > 1 ? 's' : ''}</span>
        </div>
        <div class="ob-recap-row">
          <span class="ob-recap-label">Posture</span>
          <span class="ob-recap-value">${posture ? posture.glyph + ' ' + posture.name : '—'}</span>
        </div>
      </div>
      <div class="ob-actions">
        <button class="ob-btn ob-btn-secondary" data-action="prev">Modifier</button>
        <button class="ob-btn ob-btn-primary" data-action="finish">Demarrer aiCEO</button>
      </div>
    </div>
  `;
}


function addEmailFromInput() {
  const input = document.querySelector('#ob-email-input');
  if (!input) return;
  const v = (input.value || '').trim().toLowerCase();
  if (!v) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    alert('Adresse email invalide : ' + v);
    return;
  }
  if (!state.data.emails) state.data.emails = [];
  if (state.data.emails.includes(v)) {
    alert('Cette adresse est deja dans la liste.');
    input.value = '';
    return;
  }
  state.data.emails.push(v);
  input.value = '';
  renderStep();
}

function bindStepEvents() {
  const host = document.querySelector('[data-region="ob-step-host"]');
  if (!host) return;

  // Inputs
  const fn = host.querySelector('#ob-firstName');
  if (fn) fn.addEventListener('input', e => { state.data.firstName = e.target.value.trim(); });
  const tn = host.querySelector('#ob-tenantName');
  if (tn) tn.addEventListener('input', e => { state.data.tenantName = e.target.value.trim(); });

  // S6.22 Lot 20 : Email input (etape emails)
  const emailInput = host.querySelector('#ob-email-input');
  if (emailInput) {
    emailInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEmailFromInput();
      }
    });
  }

  // Remove email chip
  host.querySelectorAll('[data-action="remove-email"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (idx >= 0) {
        state.data.emails.splice(idx, 1);
        renderStep();
      }
    });
  });

  // Posture cards
  host.querySelectorAll('[data-posture-id]').forEach(card => {
    card.addEventListener('click', () => {
      state.data.posture = card.dataset.postureId;
      renderStep();
    });
  });

  // Actions
  host.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'prev') prevStep();
      else if (action === 'next') nextStep();
      else if (action === 'finish') finishOnboarding();
      else if (action === 'add-email') addEmailFromInput();
    });
  });
}

function nextStep() {
  // Validation par etape
  const step = STEPS[state.currentStep];
  if (step === 'identite' && !state.data.firstName) {
    alert('Indiquez un prenom (meme une initiale).');
    return;
  }
  if (step === 'espace' && !state.data.tenantName) {
    state.data.tenantName = 'Mon espace';
  }
  if (step === 'emails' && (!state.data.emails || !state.data.emails.length)) {
    alert('Ajoutez au moins une adresse email pour continuer.');
    return;
  }
  if (step === 'posture' && !state.data.posture) {
    alert('Choisissez une posture (vous pourrez la changer dans Reglages).');
    return;
  }
  if (state.currentStep < STEPS.length - 1) {
    state.currentStep++;
    renderProgress();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    renderProgress();
    renderStep();
  }
}

async function finishOnboarding() {
  const btn = document.querySelector('[data-action="finish"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Sauvegarde...'; }

  try {
    const r = await fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'user.firstName':  state.data.firstName,
        'user.tenantName': state.data.tenantName,
        'user.posture':    state.data.posture,
        'user.email_addresses': JSON.stringify(state.data.emails || []),
        'onboarding.completed': new Date().toISOString()
      })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);

    // Etat de succes : rendu inline + redirection 1.2s
    const host = document.querySelector('[data-region="ob-step-host"]');
    if (host) {
      host.innerHTML = `
        <div class="ob-card ob-success">
          <div class="ob-success-glyph">✓</div>
          <h1 class="ob-title">Bienvenue, ${escapeHtml(state.data.firstName)}.</h1>
          <p class="ob-desc">Configuration enregistree. Direction le cockpit...</p>
        </div>
      `;
    }
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  } catch (err) {
    console.error('[onboarding] finish error', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Reessayer'; }
    alert('Sauvegarde echouee : ' + err.message + '. Le serveur tourne-t-il sur :4747 ?');
  }
}

async function loadExistingPrefs() {
  // Si l onboarding a deja ete fait, on prefille les champs
  try {
    const r = await fetch('/api/preferences');
    if (!r.ok) return;
    const data = await r.json();
    const prefs = data.preferences || {};
    state.data.firstName  = prefs['user.firstName']  || '';
    state.data.tenantName = prefs['user.tenantName'] || '';
    state.data.posture    = prefs['user.posture']    || '';
    try {
      const eAddrs = prefs['user.email_addresses'];
      if (eAddrs) {
        state.data.emails = typeof eAddrs === 'string' ? JSON.parse(eAddrs) : eAddrs;
        if (!Array.isArray(state.data.emails)) state.data.emails = [];
      }
    } catch (e) { state.data.emails = []; }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadExistingPrefs();
  renderProgress();
  renderStep();
  console.info('[onboarding] wizard ready', { steps: STEPS.length, prefilled: !!state.data.firstName });
});
