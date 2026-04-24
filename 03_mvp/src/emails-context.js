/**
 * emails-context.js
 * Charge data/emails.json + data/emails-summary.json (produits par normalize-emails.js)
 * et construit un contexte email par tâche pour enrichir le prompt d'arbitrage.
 *
 * Si les fichiers n'existent pas (pas encore d'import Outlook), renvoie
 * un contexte vide — l'arbitrage tourne quand même normalement.
 */

const fs = require("fs");
const path = require("path");
const { readJsonRobust } = require("./json-robust");

const EMAILS_PATH = path.join(__dirname, "..", "data", "emails.json");
const SUMMARY_PATH = path.join(__dirname, "..", "data", "emails-summary.json");

/**
 * Charge emails + summary. Retourne {emails, summary, available}.
 * available=false si fichiers absents ou vides.
 */
function loadEmails() {
  const available = fs.existsSync(EMAILS_PATH) && fs.existsSync(SUMMARY_PATH);
  if (!available) return { emails: [], summary: null, available: false };
  try {
    const emails = readJsonRobust(EMAILS_PATH);
    const summary = readJsonRobust(SUMMARY_PATH);
    return { emails, summary, available: true };
  } catch (e) {
    return { emails: [], summary: null, available: false };
  }
}

/**
 * Filtre un email comme "chaud" : moins de N jours, non archivé, pertinent.
 */
function isRecent(email, sinceIso) {
  return (email.received_at || "") >= sinceIso;
}

/**
 * Pour une tâche donnée, renvoie :
 *  - count : nombre d'emails récents (7 derniers jours) liés au projet
 *  - unread : combien non lus
 *  - top : 3 derniers avec {from, subject, received_at, unread}
 *  - relances : nombre d'emails du/des contacts rattachés (signal pression)
 */
function contextForTask(task, emails, contacts, sinceIso) {
  if (!task || !task.project) return { count: 0, unread: 0, top: [], relances: 0 };

  const contactEmails = new Set(
    (contacts || [])
      .filter(c => (c.projects || []).includes(task.project) && c.email)
      .map(c => c.email.toLowerCase())
  );

  const related = emails.filter(m => {
    if (!isRecent(m, sinceIso)) return false;
    if (m.inferred_project === task.project) return true;
    const from = (m.from_email || "").toLowerCase();
    return contactEmails.has(from);
  });

  // Emails reçus seulement pour compter les relances (exclure ceux envoyés par le CEO,
  // même s'ils arrivent en Inbox via CC ou transfert depuis une autre de ses boîtes)
  const incoming = related.filter(m => m.folder !== "sent" && !m.is_self);
  const unread = incoming.filter(m => m.unread).length;
  const relances = incoming.filter(m => {
    const from = (m.from_email || "").toLowerCase();
    return contactEmails.has(from);
  }).length;

  const top = incoming.slice(0, 3).map(m => ({
    from: m.from_name || m.from_email,
    subject: (m.subject || "").slice(0, 80),
    received_at: m.received_at,
    unread: m.unread
  }));

  return { count: related.length, unread, top, relances };
}

/**
 * Stats globales pour le prompt : top expéditeurs, volume total,
 * non lus, jours les plus chargés.
 */
function globalDigest(summary) {
  if (!summary) return null;
  const topSenders = (summary.top_senders || []).slice(0, 5)
    .map(s => `${s.key} (${s.count})`).join(", ");
  return {
    total_kept: summary.totals?.kept || 0,
    total_unread: summary.totals?.unread || 0,
    top_senders: topSenders,
    per_project: (summary.per_project || []).slice(0, 8)
  };
}

/**
 * Produit le bloc texte injectable dans le prompt utilisateur.
 * Passe vide (chaîne vide) si pas d'emails — la prompt continue.
 */
function buildEmailBlock({ tasks, contacts, emails, summary, windowDays = 7 }) {
  if (!emails || emails.length === 0) return "";
  const since = new Date(Date.now() - windowDays * 86400e3).toISOString();

  // Par tâche : une ligne condensée si signal
  const perTask = tasks.map(t => {
    const ctx = contextForTask(t, emails, contacts || [], since);
    if (ctx.count === 0) return null;
    const parts = [`${t.id}:`];
    parts.push(`${ctx.count} mail${ctx.count > 1 ? "s" : ""} 7j`);
    if (ctx.unread) parts.push(`${ctx.unread} non lu${ctx.unread > 1 ? "s" : ""}`);
    if (ctx.relances >= 2) parts.push(`${ctx.relances} relances contact`);
    if (ctx.top[0]) {
      const last = ctx.top[0];
      parts.push(`dernier: "${last.subject}" (${last.from})`);
    }
    return "  " + parts.join(" · ");
  }).filter(Boolean);

  const digest = globalDigest(summary);
  const globalLines = digest ? [
    `Total utile 30j : ${digest.total_kept} mails · non lus : ${digest.total_unread}`,
    `Top expéditeurs : ${digest.top_senders}`,
    `Répartition par projet : ${digest.per_project.map(p => `${p.key} (${p.count})`).join(", ")}`
  ].join("\n") : "";

  return `
CONTEXTE EMAIL (30 derniers jours, filtrés) :
${globalLines}

Signaux par tâche (7 derniers jours) :
${perTask.length ? perTask.join("\n") : "  (aucun signal email sur les tâches listées)"}

Règles d'usage de ce contexte :
- "N relances contact" = signal de pression externe : la tâche doit remonter en priorité (FAIRE ou DÉLÉGUER vite).
- Emails non lus sur un projet ≥ 3 : considère un créneau de tri dans FAIRE.
- N'invente pas de mails — n'utilise QUE ce qui est listé ci-dessus.
`;
}

/**
 * Hydrate le résultat de l'arbitrage avec le contexte email par tâche,
 * pour que l'UI puisse afficher "3 mails 7j" sur une carte.
 */
function hydrateWithEmails(arbitrage, { emails, contacts, tasksAll, windowDays = 7 }) {
  if (!emails || emails.length === 0) return arbitrage;
  const since = new Date(Date.now() - windowDays * 86400e3).toISOString();
  const byId = Object.fromEntries((tasksAll || []).map(t => [t.id, t]));
  const enrich = (arr) => (arr || []).map(it => {
    const t = byId[it.task_id];
    if (!t) return it;
    const ctx = contextForTask(t, emails, contacts || [], since);
    return { ...it, email_context: ctx };
  });
  return {
    ...arbitrage,
    faire: enrich(arbitrage.faire),
    deleguer: enrich(arbitrage.deleguer),
    reporter: enrich(arbitrage.reporter)
  };
}

module.exports = {
  loadEmails,
  contextForTask,
  globalDigest,
  buildEmailBlock,
  hydrateWithEmails
};
