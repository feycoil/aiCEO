/* bind-onboarding.js v4 — Wizard plein-écran propre
 * - Cache TOTALEMENT le HTML statique Claude Design (étape 3 figée)
 * - Wizard custom plein-écran avec header complet (logo + progress + quitter)
 * - 5 étapes navigables, sauvegarde finale dans /api/preferences
 */
(function () {
  'use strict';
  if (document.body.dataset.route !== 'onboarding') return;

  const $ = (s, r=document) => r.querySelector(s);

  async function api(method, url, body) {
    try {
      const r = await fetch(url, {
        method, headers: {'Content-Type':'application/json', Accept:'application/json'},
        body: body ? JSON.stringify(body) : undefined
      });
      return r.ok ? await r.json() : null;
    } catch(e) { return null; }
  }

  // ── Hide TOUT le contenu original Claude Design ────────────────
  function hideOriginal() {
    // Cache tout sauf le head, les scripts, et notre wizard
    Array.from(document.body.children).forEach(child => {
      if (child.id === 'aiceo-onboard-fullscreen') return;
      if (child.id === 'icons-host' || child.tagName === 'SCRIPT') return;
      if (child.tagName === 'SVG' && child.style.display === 'none') return; // sprite
      child.style.display = 'none';
    });
  }

  // ── État ───────────────────────────────────────────────────────
  let step = 1;
  const TOTAL = 5;
  const data = {};

  const STEPS = [
    {
      title: 'Bienvenue',
      sub: 'aiCEO est votre copilote local. Tout reste sur votre machine. Quelques questions pour le calibrer.',
      body: () => `<div style="padding:32px 24px;background:var(--cream-50,#faf7f1);border-radius:14px;text-align:center;border:1px solid var(--border,#eee)">
        <div style="width:64px;height:64px;margin:0 auto 16px;background:var(--rose,#d96d3e);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:28px">a</div>
        <p style="margin:0 0 6px;font-size:15px;color:var(--text,#111);font-weight:600">3 minutes pour configurer votre cockpit.</p>
        <p style="margin:0;font-size:13px;color:var(--text-3,#888)">Vous pourrez tout modifier dans Réglages.</p>
      </div>`,
      collect: () => ({})
    },
    {
      title: 'Comment vous appelle-t-on ?',
      sub: 'Le cockpit ouvrira avec « Bonjour [prénom] » chaque matin.',
      body: () => `
        <div style="display:flex;flex-direction:column;gap:16px">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-2,#555);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Prénom</label>
            <input id="aiceo-ob-firstName" type="text" placeholder="Major" value="${escHtml(data.firstName||'')}" style="width:100%;padding:12px 14px;border:1px solid var(--border,#ddd);border-radius:8px;font-size:15px;font-family:inherit;box-sizing:border-box" />
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-2,#555);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Tonalité du coaching</label>
            <select id="aiceo-ob-tone" style="width:100%;padding:12px 14px;border:1px solid var(--border,#ddd);border-radius:8px;font-size:14px;font-family:inherit;background:#fff;box-sizing:border-box">
              <option value="direct"${data.tone==='direct'?' selected':''}>Direct — challenge sans tour de phrase</option>
              <option value="mesuree"${data.tone==='mesuree'||!data.tone?' selected':''}>Mesurée — équilibrée, pose les bonnes questions</option>
              <option value="douce"${data.tone==='douce'?' selected':''}>Douce — patiente, écoute d\'abord</option>
            </select>
          </div>
        </div>
      `,
      collect: () => ({
        firstName: $('#aiceo-ob-firstName')?.value.trim() || 'Major',
        tone: $('#aiceo-ob-tone')?.value || 'mesuree'
      })
    },
    {
      title: 'Vos maisons',
      sub: 'Les maisons structurent vos projets. 3 par défaut, jusqu\'à 6.',
      body: () => `
        <div style="display:flex;flex-direction:column;gap:10px">
          <input id="aiceo-ob-h0" type="text" placeholder="Maison 1" value="${escHtml(data.house0||'')}" style="padding:12px 14px;border:1px solid var(--border,#ddd);border-radius:8px;font-size:14px;font-family:inherit" />
          <input id="aiceo-ob-h1" type="text" placeholder="Maison 2" value="${escHtml(data.house1||'')}"  style="padding:12px 14px;border:1px solid var(--border,#ddd);border-radius:8px;font-size:14px;font-family:inherit" />
          <input id="aiceo-ob-h2" type="text" placeholder="Maison 3" value="${escHtml(data.house2||'')}"     style="padding:12px 14px;border:1px solid var(--border,#ddd);border-radius:8px;font-size:14px;font-family:inherit" />
        </div>
        <p style="font-size:12px;color:var(--text-3,#888);margin-top:12px">Vous pourrez ajouter ou renommer dans Réglages → Maisons.</p>
      `,
      collect: () => ({
        house0: $('#aiceo-ob-h0')?.value.trim() || '',
        house1: $('#aiceo-ob-h1')?.value.trim() || '',
        house2: $('#aiceo-ob-h2')?.value.trim() || ''
      })
    },
    {
      title: 'Vos rituels',
      sub: 'À quelle heure préférez-vous être interrogé ?',
      body: () => `
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;gap:14px;align-items:center;padding:14px 16px;background:var(--surface,#f5f3ef);border-radius:10px">
            <span style="font-size:24px">☀</span>
            <div style="flex:1">
              <div style="font-weight:600;color:var(--text,#111)">Top-3 du matin</div>
              <div style="font-size:12px;color:var(--text-3,#888)">Posté chaque jour à cette heure</div>
            </div>
            <input id="aiceo-ob-morning" type="time" value="${data.morning||'07:00'}" style="padding:8px 10px;border:1px solid var(--border,#ddd);border-radius:6px;font-family:inherit;font-size:14px" />
          </div>
          <div style="display:flex;gap:14px;align-items:center;padding:14px 16px;background:var(--surface,#f5f3ef);border-radius:10px">
            <span style="font-size:24px">🌙</span>
            <div style="flex:1">
              <div style="font-weight:600;color:var(--text,#111)">Boucle du soir</div>
              <div style="font-size:12px;color:var(--text-3,#888)">Notif rappel + mode lent activé</div>
            </div>
            <input id="aiceo-ob-evening" type="time" value="${data.evening||'18:30'}" style="padding:8px 10px;border:1px solid var(--border,#ddd);border-radius:6px;font-family:inherit;font-size:14px" />
          </div>
        </div>
      `,
      collect: () => ({
        morning: $('#aiceo-ob-morning')?.value || '07:00',
        evening: $('#aiceo-ob-evening')?.value || '18:30'
      })
    },
    {
      title: 'Profondeur du coaching',
      sub: 'À quel niveau l\'IA peut-elle vous challenger ?',
      body: () => `
        <div style="padding:18px;background:var(--cream-50,#faf7f1);border-radius:10px;border:1px solid var(--border,#eee)">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
            <span style="font-size:13px;color:var(--text-3,#888)">Doux</span>
            <input id="aiceo-ob-depth" type="range" min="1" max="5" value="${data.depth||3}" style="flex:1;accent-color:var(--violet,#7a6a8a)" />
            <span style="font-size:13px;color:var(--text-3,#888)">Profond</span>
            <span id="aiceo-ob-depth-display" style="font-weight:700;min-width:30px;text-align:right;color:var(--text,#111)">${data.depth||3}/5</span>
          </div>
          <p style="font-size:13px;color:var(--text-2,#555);margin:0;line-height:1.5">
            <strong>Niveau ${data.depth||3}</strong> — pose les bonnes questions sans insister. Vous pourrez ajuster à tout moment dans Réglages.
          </p>
        </div>
        <label style="display:flex;align-items:center;gap:10px;margin-top:18px;font-size:13px;color:var(--text-2,#555);cursor:pointer">
          <input id="aiceo-ob-during-arb" type="checkbox" ${data.duringArb!==false ? 'checked':''} />
          Coacher pendant l\'arbitrage matinal
        </label>
      `,
      collect: () => ({
        depth: Number($('#aiceo-ob-depth')?.value) || 3,
        duringArb: $('#aiceo-ob-during-arb')?.checked !== false
      })
    }
  ];

  function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  // ── Build wizard plein-écran ──────────────────────────────────
  function build() {
    if (document.getElementById('aiceo-onboard-fullscreen')) return;
    const wizard = document.createElement('div');
    wizard.id = 'aiceo-onboard-fullscreen';
    wizard.style.cssText = 'position:fixed;inset:0;background:var(--bg,#f5f3ef);z-index:8000;display:flex;flex-direction:column;font-family:var(--font-sans,system-ui)';
    wizard.innerHTML = `
      <header id="aiceo-ob-header" style="display:flex;align-items:center;gap:24px;padding:14px 24px;background:var(--surface-2,#fff);border-bottom:1px solid var(--border,#eee);flex-shrink:0">
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
          <span style="width:32px;height:32px;background:var(--rose,#d96d3e);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px">a</span>
          <span style="font-weight:700;font-size:16px;color:var(--text,#111)">aiCEO</span>
        </div>
        <div id="aiceo-ob-bar" style="display:flex;flex:1;justify-content:center;align-items:center;gap:6px;max-width:480px;margin:0 auto"></div>
        <button id="aiceo-ob-quit" type="button" style="background:transparent;border:0;color:var(--text-3,#888);cursor:pointer;font-family:inherit;font-size:13px;padding:6px 10px;border-radius:6px">Quitter</button>
      </header>
      <main style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto">
        <section style="width:100%;max-width:560px;background:var(--surface-2,#fff);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.06);padding:32px;border:1px solid var(--border,#eee)">
          <h1 id="aiceo-ob-title" style="font-size:24px;font-weight:700;margin:0 0 8px;color:var(--text,#111);line-height:1.2"></h1>
          <p id="aiceo-ob-sub" style="font-size:14px;color:var(--text-2,#555);margin:0 0 24px;line-height:1.5"></p>
          <div id="aiceo-ob-body"></div>
          <footer style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:28px;padding-top:18px;border-top:1px solid var(--border,#eee)">
            <button id="aiceo-ob-back" type="button" style="padding:10px 16px;border-radius:8px;background:transparent;border:0;color:var(--text-2,#555);cursor:pointer;font-family:inherit;font-size:14px;visibility:hidden">← Précédent</button>
            <span id="aiceo-ob-meta" style="font-size:12px;color:var(--text-3,#888)">Étape <span id="aiceo-ob-step">1</span> / 5</span>
            <button id="aiceo-ob-next" type="button" style="padding:11px 22px;border-radius:8px;background:var(--text,#111);color:#fff;border:0;cursor:pointer;font-family:inherit;font-weight:500;font-size:14px">Suivant →</button>
          </footer>
        </section>
      </main>
    `;
    document.body.appendChild(wizard);

    document.getElementById('aiceo-ob-back').addEventListener('click', goBack);
    document.getElementById('aiceo-ob-next').addEventListener('click', goNext);
    document.getElementById('aiceo-ob-quit').addEventListener('click', () => {
      api('PUT', '/api/preferences', { 'onboarding.skipped': true });
      window.location.href = '/v06/index.html';
    });
    render();
  }

  function render() {
    const cur = STEPS[step - 1];
    // Barre de progression : steps avec numéros + lignes
    const bar = document.getElementById('aiceo-ob-bar');
    bar.innerHTML = '';
    for (let i = 1; i <= TOTAL; i++) {
      if (i > 1) {
        const line = document.createElement('div');
        line.style.cssText = 'flex:1;height:2px;background:' + (i <= step ? 'var(--emerald,#3d7363)' : 'var(--surface-3,#eee)') + ';max-width:48px;transition:background .3s';
        bar.appendChild(line);
      }
      const dot = document.createElement('div');
      const isCurrent = i === step;
      const isDone = i < step;
      dot.style.cssText = 'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .3s;' + (
        isDone ? 'background:var(--emerald,#3d7363);color:#fff;' :
        isCurrent ? 'background:var(--text,#111);color:#fff;transform:scale(1.1);box-shadow:0 0 0 4px rgba(17,17,17,.1);' :
        'background:var(--surface-3,#eee);color:var(--text-3,#888);'
      );
      dot.textContent = isDone ? '✓' : i;
      bar.appendChild(dot);
    }
    document.getElementById('aiceo-ob-title').textContent = cur.title;
    document.getElementById('aiceo-ob-sub').textContent = cur.sub;
    document.getElementById('aiceo-ob-body').innerHTML = cur.body();
    document.getElementById('aiceo-ob-step').textContent = step;
    document.getElementById('aiceo-ob-back').style.visibility = step > 1 ? 'visible' : 'hidden';
    document.getElementById('aiceo-ob-next').textContent = step === TOTAL ? '✓ Terminer' : 'Suivant →';
    // Wire range display
    const rng = $('#aiceo-ob-depth');
    const disp = $('#aiceo-ob-depth-display');
    if (rng && disp) rng.addEventListener('input', () => disp.textContent = rng.value + '/5');
  }

  function saveCurrent() {
    const cur = STEPS[step - 1];
    if (cur.collect) Object.assign(data, cur.collect());
  }

  function goBack() {
    saveCurrent();
    if (step > 1) { step--; render(); }
  }

  async function goNext() {
    saveCurrent();
    if (step < TOTAL) { step++; render(); return; }
    // Finalisation
    const btn = document.getElementById('aiceo-ob-next');
    btn.disabled = true;
    btn.textContent = 'Enregistrement…';
    const prefs = {
      'user.firstName': data.firstName || 'Major',
      'user.coaching.tone': data.tone || 'mesuree',
      'houses.0.name': data.house0 || '',
      'houses.1.name': data.house1 || '',
      'houses.2.name': data.house2 || '',
      'rituals.morning': data.morning || '07:00',
      'rituals.evening': data.evening || '18:30',
      'rituals.morning.on': true,
      'rituals.evening.on': true,
      'coaching.depth': data.depth || 3,
      'coaching.during.arbitrage': data.duringArb !== false,
      'onboarding.completed': true,
      'onboarding.completedAt': new Date().toISOString()
    };
    try {
      await api('PUT', '/api/preferences', prefs);
      try { sessionStorage.removeItem('aiceo.onboard.redirected'); } catch(e) {}
      if (window.AICEOShell) window.AICEOShell.showToast('Bienvenue ' + prefs['user.firstName'] + ' 🌅', 'success');
    } catch(e) {}
    setTimeout(() => { window.location.href = '/v06/index.html'; }, 1000);
  }

  function init() {
    hideOriginal();
    build();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
