/**
 * evening.js — boucle du soir.
 *
 * Principe : on reprend l'arbitrage du matin (faire/déléguer/reporter) et
 * on demande au CEO de marquer chaque item Fait / Partiel / Pas fait + une
 * brève note. On persiste le résultat dans data/evenings.json (append-only)
 * et on peut en faire un petit debrief (texte court, pas moralisateur).
 *
 * L'objectif est de fermer la journée en <3 minutes et de collecter les
 * signaux nécessaires à l'apprentissage de l'IA (sur-estimation du temps,
 * tâches systématiquement reportées, surcharge réelle vs planifiée, etc.).
 */

const fs = require("fs");
const path = require("path");

const EVENINGS_PATH = path.join(__dirname, "..", "data", "evenings.json");
const DECISIONS_PATH = path.join(__dirname, "..", "data", "decisions.json");

/**
 * Récupère la dernière décision d'arbitrage pour une date donnée
 * (ou aujourd'hui par défaut).
 */
function latestArbitrageFor(date) {
  if (!fs.existsSync(DECISIONS_PATH)) return null;
  let all = [];
  try { all = JSON.parse(fs.readFileSync(DECISIONS_PATH, "utf8")); }
  catch (e) { return null; }
  const target = date || new Date().toISOString().slice(0, 10);
  const forDay = all.filter(d => (d.date || "").startsWith(target));
  return forDay[forDay.length - 1] || null;
}

/**
 * Enregistre le debrief du soir.
 * Attend : { date, outcomes: [{task_id, status: "done"|"partial"|"skipped", note?}], mood?, energy? }
 */
function saveEvening(entry) {
  let all = [];
  if (fs.existsSync(EVENINGS_PATH)) {
    try { all = JSON.parse(fs.readFileSync(EVENINGS_PATH, "utf8")); }
    catch (e) { all = []; }
  }
  const record = { ...entry, saved_at: new Date().toISOString() };
  all.push(record);
  fs.writeFileSync(EVENINGS_PATH, JSON.stringify(all, null, 2), "utf8");
  return record;
}

function readEvenings() {
  if (!fs.existsSync(EVENINGS_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(EVENINGS_PATH, "utf8")); }
  catch (e) { return []; }
}

/**
 * Petit résumé local (sans LLM) du debrief :
 * - taux de complétion
 * - tâches restantes à rebasculer demain
 * - une phrase d'encouragement sobre (pas coach sportif)
 */
function buildEveningSummary({ outcomes, arbitrage, mood, energy }) {
  const total = outcomes.length;
  const done = outcomes.filter(o => o.status === "done").length;
  const partial = outcomes.filter(o => o.status === "partial").length;
  const skipped = outcomes.filter(o => o.status === "skipped").length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  const skippedIds = outcomes.filter(o => o.status === "skipped").map(o => o.task_id);
  const tomorrowCandidates = skippedIds.slice(0, 3);

  // Ton chief-of-staff : factuel, pas moralisateur, pas coach.
  let tone;
  if (rate >= 80) {
    tone = "Journée propre. Vous avez tenu le cadre posé ce matin.";
  } else if (rate >= 50) {
    tone = "Journée correcte. Les glissements sont lisibles, rien d'inquiétant.";
  } else if (rate >= 25) {
    tone = "Journée fragmentée. À regarder demain : qu'est-ce qui a pris le dessus ?";
  } else {
    tone = "Journée avalée par autre chose. Ce n'est pas un échec — c'est un signal. On reprend demain.";
  }

  const lowEnergyFlag = energy && Number(energy) <= 2;
  const moodFlag = mood && /fatigu|épuis|saturé|tendu/i.test(String(mood));

  const alert = (lowEnergyFlag || moodFlag)
    ? "Signal faible détecté (énergie ou humeur). Je garde ça en tête pour l'arbitrage de demain."
    : null;

  return {
    rate,
    counts: { done, partial, skipped, total },
    tone,
    alert,
    tomorrow_candidates: tomorrowCandidates
  };
}

module.exports = {
  latestArbitrageFor,
  saveEvening,
  readEvenings,
  buildEveningSummary
};
