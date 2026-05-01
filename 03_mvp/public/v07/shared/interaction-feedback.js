// interaction-feedback.js — Apprentissage actif generique (S6.33)
// Pattern : POST /api/system/interaction-feedback { kind, item_id, action, metadata }
//
// Usage :
//   import { logInteraction } from '../shared/interaction-feedback.js';
//   logInteraction({ kind: 'decision', item_id: 'd123', action: 'recommend_accepted' });
//
// La table interaction_feedback est creee a la volee cote backend (idempotent).

export async function logInteraction(payload) {
  if (!payload || !payload.kind || !payload.action) return;
  try {
    await fetch('/api/system/interaction-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // swallow : ne bloque jamais l'UX si le tracking echoue
    console.warn('[interaction-feedback]', e.message);
  }
}
