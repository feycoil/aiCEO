// coaching-store.js — Signaux faibles + 4 questions LLM (S6.11-EE-2 L3.3)
const escHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function safeFetch(url, opts) {
  try { const r = await fetch(url, opts); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

// Signaux rule-based (fallback) calcules depuis les donnees existantes
async function computeSignalsRuleBased() {
  const [decs, projs, evenings] = await Promise.all([
    safeFetch('/api/decisions'),
    safeFetch('/api/projects'),
    safeFetch('/api/evening?limit=7')
  ]);
  const signals = [];
  const decList = decs?.decisions || decs || [];
  const projList = projs?.projects || projs || [];
  const evList = evenings?.sessions || evenings || [];

  const openDecs = decList.filter(d => d.status === 'open' || d.status === 'a_trancher');
  const oldOpenDecs = openDecs.filter(d => {
    const created = new Date(d.created_at || d.updated_at || 0);
    return (Date.now() - created.getTime()) > 7 * 86400000;
  });
  if (oldOpenDecs.length >= 3) {
    signals.push({ level: 'warn', label: 'Decisions en attente', text: `${oldOpenDecs.length} decisions ouvertes depuis plus de 7 jours.`, meta: 'Indecision = decision implicite.' });
  }

  const alertProjs = projList.filter(p => p.status === 'alerte');
  if (alertProjs.length >= 2) {
    signals.push({ level: 'alert', label: 'Projets en alerte', text: `${alertProjs.length} projets necessitent une attention immediate.`, meta: alertProjs.slice(0,3).map(p => p.name || p.title).join(' · ') });
  }

  const recentEvenings = evList.length;
  if (recentEvenings === 0) {
    signals.push({ level: 'info', label: 'Rituel du soir', text: 'Aucun bilan enregistre cette semaine. Le streak commence par 1.', meta: 'Le rituel du soir prend 3 min.' });
  } else if (recentEvenings < 3) {
    const avgMood = evList.reduce((s, e) => s + (e.mood || 3), 0) / recentEvenings;
    if (avgMood < 3) {
      signals.push({ level: 'warn', label: 'Humeur basse', text: `Moyenne d humeur ${avgMood.toFixed(1)}/5 sur les derniers bilans.`, meta: 'Une cause a explorer en revue hebdo ?' });
    }
  }

  if (signals.length === 0) {
    signals.push({ level: 'info', label: 'Tableau calme', text: 'Aucun signal faible detecte. Continuez le rythme.', meta: 'Tout va bien (pour l instant).' });
  }
  return signals;
}

// Questions rule-based (fallback)
function defaultQuestions() {
  return [
    { num: '01', text: 'Quel est le seul levier que je n ai pas encore tire cette semaine ?', context: 'Identifier l action pivot - celle qui debloque le reste.' },
    { num: '02', text: 'Sur quelle decision est-ce que je procrastine sans le dire ?', context: 'L indecision a un cout. Le nommer le rend traitable.' },
    { num: '03', text: 'Quelle conversation repoussee dois-je avoir cette semaine ?', context: 'Une conversation evitee = un projet bloque.' },
    { num: '04', text: 'Si je devais tout recommencer demain, qu arreterais-je en priorite ?', context: 'Le NON cree plus d espace que le OUI.' }
  ];
}

async function loadLlmStatus() {
  const r = await safeFetch('/api/llm-status');
  const banner = document.querySelector('[data-region="co-llm-banner"]');
  if (!banner) return false;
  if (r?.ready) {
    banner.innerHTML = '<span>● Coach Claude live</span><span style="opacity:0.7;font-size:11px">- signaux et questions personnalises</span>';
    banner.className = 'co-llm-banner is-live';
    return true;
  }
  banner.innerHTML = '<span>○ Mode degrade</span><span style="opacity:0.7;font-size:11px">- regles heuristiques (ANTHROPIC_API_KEY non detectee)</span>';
  banner.className = 'co-llm-banner';
  return false;
}

async function loadSignals(llmReady) {
  const host = document.querySelector('[data-region="co-signals"]');
  const meta = document.querySelector('[data-region="co-signals-meta"]');
  if (!host) return;

  let signals = [];
  if (llmReady) {
    const r = await safeFetch('/api/coaching-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'signals' })
    });
    if (r?.signals) signals = r.signals;
  }
  if (!signals.length) signals = await computeSignalsRuleBased();

  if (meta) meta.textContent = `${signals.length} signal${signals.length > 1 ? 'aux' : ''}`;

  host.innerHTML = signals.map(s => {
    const cls = s.level === 'alert' ? 'is-alert' : (s.level === 'warn' ? 'is-warn' : '');
    return `
      <div class="co-signal ${cls}">
        <div class="co-signal-label">${escHtml(s.label || s.level || 'signal')}</div>
        <div class="co-signal-text">${escHtml(s.text || '')}</div>
        ${s.meta ? `<div class="co-signal-meta">${escHtml(s.meta)}</div>` : ''}
      </div>
    `;
  }).join('');
}

async function loadQuestions(llmReady) {
  const host = document.querySelector('[data-region="co-questions"]');
  if (!host) return;

  let qs = [];
  if (llmReady) {
    const r = await safeFetch('/api/coaching-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'weekly' })
    });
    if (r?.questions) qs = r.questions;
  }
  if (!qs.length) qs = defaultQuestions();

  host.innerHTML = qs.map((q, i) => `
    <div class="co-question">
      <div class="co-question-num">QUESTION ${q.num || String(i + 1).padStart(2, '0')}</div>
      <div class="co-question-text">${escHtml(q.text || q.question || '')}</div>
      ${q.context ? `<div class="co-question-context">${escHtml(q.context)}</div>` : ''}
      <div class="co-question-actions">
        <a href="assistant.html?prompt=${encodeURIComponent(q.text || q.question || '')}" class="co-btn co-btn-primary">Reflechir avec l Assistant</a>
        <button class="co-btn co-btn-ghost" data-action="pin" data-text="${escHtml(q.text || q.question || '')}">Epingler</button>
      </div>
    </div>
  `).join('');

  host.querySelectorAll('[data-action="pin"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.text;
      await safeFetch('/api/knowledge/pins', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'critere', title: text, content: 'Question coaching epinglee depuis /coaching' })
      });
      btn.textContent = '✓ Epingle';
      btn.disabled = true;
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const llmReady = await loadLlmStatus();
  await Promise.all([loadSignals(llmReady), loadQuestions(llmReady)]);
  console.info('[coaching] rendered', { llmReady });
});
