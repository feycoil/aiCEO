/**
 * drafts.js — génère un brouillon de mail de délégation pour une tâche.
 *
 * Principes :
 *  - Le destinataire est un MEMBRE DE L'ÉQUIPE INTERNE (assistant/co-pilote),
 *    PAS le tiers externe mentionné dans la tâche. Exemple : pour "renvoyer
 *    attestation à Marie Ansquer (CA Bretagne)", le mail de délégation va à
 *    Sikina (assistante), qui ensuite renverra le doc à Marie.
 *  - On injecte le contexte email récent lié à la tâche (fil avec le tiers,
 *    dernière relance, nombre de relances) pour que le brouillon puisse citer
 *    le sujet du mail original et éviter d'être générique.
 *  - Si Claude ne peut pas inventer un détail (montant, date exacte, pièce
 *    jointe), il utilise un placeholder [À VÉRIFIER: xxx].
 */

const fs = require("fs");
const path = require("path");

const DRAFTS_PATH = path.join(__dirname, "..", "data", "drafts.json");
const TEAM_PATH = path.join(__dirname, "..", "data", "team.json");

function loadTeam() {
  try {
    const j = JSON.parse(fs.readFileSync(TEAM_PATH, "utf8"));
    return j.members || [];
  } catch (e) { return []; }
}

const SYSTEM_PROMPT = `Tu rédiges des brouillons de mails de délégation INTERNES pour Feyçoil Mouhoussoune, CEO d'ETIC Services (groupes ADABU, AMANI, Terres Rouges/SCI).

RÈGLE CARDINALE :
Un mail de délégation va à un MEMBRE DE L'ÉQUIPE INTERNE de Feyçoil (Sikina, Lamiae, Soibahadini…), PAS au tiers externe qui est mentionné dans la tâche.
Exemple : pour la tâche "renvoyer l'attestation à Marie Ansquer (CA Bretagne)", le mail va à Sikina (l'assistante qui exécute) — Marie est évoquée dans le corps comme destinataire final de l'action.

Profil à respecter :
- Ton : chief-of-staff senior parlant à son équipe. Direct, respectueux, factuel. Tutoiement si membre interne ETIC. Pas de familiarité, pas de "bonjour chère", pas d'emoji.
- Signature : "Feyçoil".
- Longueur : 4 à 8 lignes maximum. L'équipier doit savoir quoi faire en 10 secondes.
- Structure : (1) contexte en 1 ligne qui cite le fil ou le tiers, (2) demande claire avec délai et destinataire final, (3) infos utiles / pièce jointe attendue, (4) remerciement sobre.
- Jamais de "J'espère que tu vas bien", "N'hésite pas à revenir vers moi si…".

GESTION DE L'INCERTITUDE :
- Si tu n'as pas un détail précis (montant exact, pièce jointe, adresse, référence dossier), UTILISE un placeholder [À VÉRIFIER: description].
- Exemple : "Pièce jointe : l'attestation signée [À VÉRIFIER: version signée du 22/04]".
- N'invente JAMAIS un montant, une date ou un numéro de dossier qui ne serait pas dans le contexte fourni.

CHOIX DU DESTINATAIRE :
- Regarde la liste "Équipe interne" fournie et le champ "delegable_for".
- Croise avec la nature de la tâche (admin / contrat / chantier / banque / technique).
- Si plusieurs candidats possibles, privilégie celui dont "delegable_for" matche le mieux.
- Si vraiment aucun ne convient, mets recipient_email à null et propose un rôle générique.

Tu renvoies UNIQUEMENT un JSON strict, sans markdown, de la forme :
{
  "recipient_name": "Prénom",
  "recipient_email": "email@etic.yt ou null si inconnu",
  "subject": "Objet court (60 car max)",
  "body": "Corps du mail, avec \\n pour les sauts de ligne",
  "reasoning": "1 phrase : pourquoi ce destinataire, pourquoi ce ton",
  "confidence": "high" | "medium" | "low"
}`;

function buildDraftUserPrompt({ task, project, team, externalContacts, emailContext, reason }) {
  const teamLines = (team || []).map(m =>
    `- ${m.name} <${m.email}> — ${m.role} — délégable pour : ${(m.delegable_for||[]).join(", ")}${m.note ? " — " + m.note : ""}`
  ).join("\n") || "(équipe interne non renseignée)";

  const externalLines = (externalContacts || []).slice(0, 5).map(c =>
    `- ${c.name} (${c.role || "?"}, ${c.org || "?"}) — ${c.email || "email inconnu"}`
  ).join("\n") || "(aucun tiers externe connu sur ce projet)";

  const emailBlock = emailContext && emailContext.count > 0 ? `
Contexte email lié à cette tâche (7 derniers jours) :
- ${emailContext.count} mail${emailContext.count>1?"s":""} échangé${emailContext.count>1?"s":""} sur ce projet
- ${emailContext.unread || 0} non lu${emailContext.unread>1?"s":""}
- ${emailContext.relances || 0} relance${emailContext.relances>1?"s":""} du/des contact${emailContext.relances>1?"s":""}
${(emailContext.top || []).slice(0,3).map(m => `- Dernier mail : "${m.subject}" — de ${m.from} — reçu ${(m.received_at||"").slice(0,10)}${m.unread ? " (non lu)" : ""}`).join("\n")}
` : "\nContexte email : aucun mail récent détecté sur cette tâche.\n";

  return `Tâche à déléguer (ID ${task.id}) :
- Titre : ${task.title}
- Projet : ${project?.name || task.project || "(hors projet)"}
- Priorité : ${task.priority || "normal"}
- Échéance : ${task.due || "non fixée"}
- Estimation : ${task.estimatedMin || "?"} min
- Contexte métier : ${task.context || "—"}
- Note IA : ${task.aiProposal || "—"}

Raison de la délégation (analyse arbitrage) :
${reason || "Tâche opérationnelle où la valeur ajoutée du CEO est faible."}
${emailBlock}
Équipe interne ETIC (destinataires possibles du mail de délégation) :
${teamLines}

Tiers externes liés à ce projet (à citer dans le corps si pertinent, PAS comme destinataire) :
${externalLines}

Aujourd'hui : ${new Date().toISOString().slice(0,10)}.

Rédige le brouillon au format JSON demandé. Rappel : le destinataire est un MEMBRE DE L'ÉQUIPE INTERNE. Le tiers externe est évoqué dans le corps (ex : "renvoyer à Marie Ansquer (CA Bretagne)").`;
}

/**
 * Choisit le meilleur membre d'équipe pour une tâche via heuristique locale.
 * Sert au fallback démo et aussi à produire des suggestions dans la réponse API.
 */
function scoreTeamMember(member, task, emailContext) {
  const text = [
    task.title || "",
    task.context || "",
    task.aiProposal || "",
    task.project || "",
    (emailContext?.top || []).map(m => m.subject).join(" ")
  ].join(" ").toLowerCase();

  let score = 0;
  for (const kw of member.delegable_for || []) {
    if (text.includes(kw.toLowerCase())) score += 2;
  }
  // Correspondance projet explicite
  const tags = member.delegable_for || [];
  if (task.project && tags.some(t => (task.project||"").toLowerCase().includes(t))) score += 1;
  return score;
}

function chooseDelegate(team, task, emailContext) {
  if (!team.length) return null;
  const scored = team.map(m => ({ m, s: scoreTeamMember(m, task, emailContext) }));
  scored.sort((a, b) => b.s - a.s);
  // Par défaut Sikina (admin/transmission) si aucun score > 0
  if (scored[0].s === 0) {
    return team.find(m => /sikina/i.test(m.name)) || team[0];
  }
  return scored[0].m;
}

/**
 * Fallback local sans appel LLM.
 */
function demoFallbackDraft({ task, project, team, externalContacts, emailContext, reason }) {
  const delegate = chooseDelegate(team, task, emailContext);
  const recipientName = delegate?.name || "Assistant·e ETIC";
  const recipientEmail = delegate?.email || null;

  // Citer le tiers externe dans le corps SI pertinent :
  //  - on cherche d'abord un contact dont le nom apparait dans le titre de la tache
  //  - si aucun ne matche, on n'insere pas de "à X" (le titre est auto-suffisant)
  //  - si le titre contient deja "à <Nom>", on ne re-duplique pas
  const title = (task.title || "");
  const mentionedContact = (externalContacts || []).find(c => {
    const first = (c.name || "").split(" ")[0];
    return first && title.toLowerCase().includes(first.toLowerCase());
  });
  // Si le prenom du contact apparait deja dans le titre (ex : "Renvoyer attestation a Marie"),
  // on ne re-cite pas le contact dans "peux-tu prendre en charge X a <Nom>".
  const externalClause = (mentionedContact && !title.toLowerCase().includes(mentionedContact.name.split(" ")[0].toLowerCase()))
    ? ` à ${mentionedContact.name}${mentionedContact.org ? " (" + mentionedContact.org + ")" : ""}`
    : "";

  const lastMail = (emailContext?.top || [])[0];
  const emailClause = lastMail
    ? `Fil concerné : "${lastMail.subject}" (${lastMail.from}, reçu ${(lastMail.received_at||"").slice(0,10)}).`
    : "";

  const relancesClause = emailContext?.relances >= 2
    ? ` — ${emailContext.relances} relances en cours, à traiter vite.`
    : "";

  const dueLine = task.due ? ` avant le ${new Date(task.due).toLocaleDateString("fr-FR")}` : "";

  const short = task.title.length > 55 ? task.title.slice(0, 55) + "…" : task.title;
  const subject = `[${project?.name?.split("—")[0]?.trim() || "ETIC"}] ${short}`;

  const body = [
    `${recipientName?.split(" ")[0] || "Bonjour"},`,
    ``,
    `Peux-tu prendre en charge : ${task.title}${externalClause}${dueLine} ?${relancesClause}`,
    emailClause ? `` : null,
    emailClause || null,
    ``,
    reason ? `Pourquoi je te la passe : ${reason}` : null,
    task.project ? `[À VÉRIFIER: pièce jointe nécessaire selon le dossier ${task.project}]` : null,
    ``,
    `Merci, reviens vers moi uniquement en cas de blocage.`,
    ``,
    `Feyçoil`
  ].filter(l => l !== null).join("\n");

  return {
    recipient_name: recipientName,
    recipient_email: recipientEmail,
    subject,
    body,
    reasoning: delegate
      ? `${delegate.name} est délégable pour : ${(delegate.delegable_for||[]).join(", ")}${lastMail ? " ; fil email actif sur ce projet." : ""}`
      : `Pas de délégataire évident — rôle générique, à préciser.`,
    confidence: delegate ? (lastMail ? "medium" : "low") : "low",
    _meta: { source: "demo", reason: "pas de clé API ou DEMO_MODE=1" }
  };
}

async function generateDraft({ task, project, contacts, reason, emailContext }) {
  const team = loadTeam();
  const externalContacts = contacts || [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const demo = process.env.DEMO_MODE === "1" || !apiKey;

  if (demo) {
    return demoFallbackDraft({ task, project, team, externalContacts, emailContext, reason });
  }

  const { createAnthropicClient } = require("./anthropic-client");
  const client = createAnthropicClient();
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildDraftUserPrompt({ task, project, team, externalContacts, emailContext, reason }) }]
  });

  const text = msg.content?.[0]?.text || "";
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s < 0 || e < 0) throw new Error("Claude a renvoyé un JSON invalide : " + text.slice(0, 200));
  const parsed = JSON.parse(text.slice(s, e + 1));
  parsed._meta = { source: "claude", model, usage: msg.usage };
  return parsed;
}

function saveDraft(entry) {
  let all = [];
  if (fs.existsSync(DRAFTS_PATH)) {
    try { all = JSON.parse(fs.readFileSync(DRAFTS_PATH, "utf8")); }
    catch (e) { all = []; }
  }
  const record = { ...entry, saved_at: new Date().toISOString() };
  all.push(record);
  fs.writeFileSync(DRAFTS_PATH, JSON.stringify(all, null, 2), "utf8");
  return record;
}

function readDrafts() {
  if (!fs.existsSync(DRAFTS_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DRAFTS_PATH, "utf8")); }
  catch (e) { return []; }
}

/**
 * Résout les contacts TIERS EXTERNES pertinents pour une tâche.
 * (Ces contacts sont cités dans le corps du brouillon, pas destinataires.)
 */
function resolveContactsForTask(task, allContacts) {
  if (!task?.project) return [];
  const matches = allContacts.filter(c => (c.projects || []).includes(task.project));
  matches.sort((a, b) => {
    const pa = (a.tags || []).includes("priorité") ? 0 : 1;
    const pb = (b.tags || []).includes("priorité") ? 0 : 1;
    return pa - pb;
  });
  return matches;
}

module.exports = {
  generateDraft,
  saveDraft,
  readDrafts,
  resolveContactsForTask,
  loadTeam
};
