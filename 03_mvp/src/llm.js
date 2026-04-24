/**
 * llm.js — wrapper Claude API avec mode démo.
 * Supporte HTTPS_PROXY via la factory anthropic-client.
 */
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prompt");
const { createAnthropicClient } = require("./anthropic-client");

const DEMO_FALLBACK = {
  arbitrage_summary: "Journée serrée — 4 échéances le 23/04 (virements, mail CA Bretagne, contrat Bénédicte).",
  alert: "saturation",
  alert_message: "5 tâches critical/high ce jour. Protégez un créneau de 2h en matinée pour les décisions de fond.",
  faire: [
    { task_id: "t1", reason: "Contrat Bénédicte FF&E — engagement externe, décision finale requise", slot: "matin", estimated_min: 45 },
    { task_id: "t7", reason: "Virement Affejee — 3ᵉ relance, déblocage immédiat", slot: "matin", estimated_min: 10 },
    { task_id: "t16", reason: "Confirmer décalage tirage CA Bretagne par écrit — engagement tenu", slot: "matin", estimated_min: 15 }
  ],
  deleguer: [
    { task_id: "t3", reason: "Relance devis climatisation SPA — mail type, pas de valeur à y passer votre temps", to: "assistant.e ETIC", draft_available: true },
    { task_id: "t13", reason: "Commande switch 48 ports Vitry — opérationnel pur, équipe IT peut arbitrer", to: "équipe ETIC Dépôts", draft_available: true }
  ],
  reporter: [
    { task_id: "t19", reason: "AG SCI MB — préparation non urgente, peut glisser après le comité Adabu", new_due: "2026-05-05" },
    { task_id: "t20", reason: "Classer dossier FEDER — 90 min d'effort sans deadline réelle : fait vaut mieux que parfait, reportez", new_due: "2026-05-07" },
    { task_id: "t21", reason: "Appel notaire statuts SCI MB — faible priorité, à grouper avec d'autres appels", new_due: "2026-04-30" }
  ],
  ignored_task_ids: []
};

async function callClaude({ tasks, projects, today, events, emailBlock }) {
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const demo = process.env.DEMO_MODE === "1" || !apiKey;

  if (demo) {
    const ids = new Set(tasks.map(t => t.id));
    const patch = (arr) => arr.filter(x => ids.has(x.task_id));
    return {
      ...DEMO_FALLBACK,
      faire: patch(DEMO_FALLBACK.faire),
      deleguer: patch(DEMO_FALLBACK.deleguer),
      reporter: patch(DEMO_FALLBACK.reporter),
      _meta: { source: "demo", reason: apiKey ? "DEMO_MODE=1" : "pas de clé API" }
    };
  }

  const client = createAnthropicClient();

  const msg = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt({ tasks, projects, today, events, emailBlock }) }]
  });

  const text = msg.content?.[0]?.text || "";
  // Strip markdown fences + slice to outer {...}
  let clean = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  const raw = clean.slice(jsonStart, jsonEnd + 1);
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (e) {
    const stop = msg.stop_reason || "?";
    throw new Error(`Claude JSON invalide (stop_reason=${stop}, len=${text.length}) : ` + text.slice(-300));
  }
  parsed._meta = { source: "claude", model, usage: msg.usage };
  return parsed;
}

module.exports = { callClaude };
