/**
 * seed-emails-demo.js
 * Génère un fichier emails.json + emails-summary.json réalistes
 * pour tester le pipeline SANS avoir lancé fetch-outlook.ps1.
 *
 * Usage : node scripts/seed-emails-demo.js
 *
 * Simule 30 jours de boîte Inbox avec relances sur les projets amani-credit,
 * amani-chantier, adabu-sinergia. À supprimer une fois que l'import Outlook
 * réel a tourné (ou ne sera jamais écrasé : fetch-outlook.ps1 écrit
 * emails-raw.json, pas emails.json directement).
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "data", "emails.json");
const SUM = path.join(__dirname, "..", "data", "emails-summary.json");

const now = new Date("2026-04-23T18:00:00");
const daysAgo = (n) => new Date(now.getTime() - n * 86400e3).toISOString();

const emails = [
  // Marie Ansquer (CA Bretagne) relance 3× — projet amani-credit
  { id:"m1", folder:"inbox", subject:"Relance : attestation emprunteur signée", from_name:"Marie Ansquer", from_email:"marie.ansquer@ca-bretagne.fr", to:"feycoil@etic-services.net", received_at:daysAgo(1), unread:true, flagged:true, has_attach:false, preview:"Bonjour, petit rappel — l'attestation n'est pas encore revenue signée…", inferred_project:"amani-credit" },
  { id:"m2", folder:"inbox", subject:"Point AMANI 2026", from_name:"Marie Ansquer", from_email:"marie.ansquer@ca-bretagne.fr", to:"feycoil@etic-services.net", received_at:daysAgo(4), unread:false, flagged:false, has_attach:true, preview:"Ci-joint le tableau d'amortissement mis à jour…", inferred_project:"amani-credit" },
  { id:"m3", folder:"inbox", subject:"Virement CA Bretagne — confirmation", from_name:"Marie Ansquer", from_email:"marie.ansquer@ca-bretagne.fr", to:"feycoil@etic-services.net", received_at:daysAgo(6), unread:false, flagged:false, has_attach:false, preview:"Merci de confirmer le décalage du tirage…", inferred_project:"amani-credit" },
  // Olivia You (inter-invest) — même projet
  { id:"m4", folder:"inbox", subject:"Dossier AMANI — pièces manquantes", from_name:"Olivia You", from_email:"olivia.you@inter-invest.fr", to:"feycoil@etic-services.net", received_at:daysAgo(2), unread:true, flagged:false, has_attach:false, preview:"Il manque l'attestation pour finaliser…", inferred_project:"amani-credit" },
  // HDM — impayé AMANI
  { id:"m5", folder:"inbox", subject:"IMPAYÉ AMANI PROPERTIES — 3e relance", from_name:"M. Lguenot", from_email:"mlguenot@hdm-mayotte.fr", to:"feycoil@etic-services.net", received_at:daysAgo(1), unread:true, flagged:true, has_attach:false, preview:"Facture 17/02 toujours impayée…", inferred_project:"amani-credit" },
  // Équipe chantier piscine AMANI
  { id:"m6", folder:"inbox", subject:"Devis piscine — choix prestataire", from_name:"Bénédicte Wayl", from_email:"benedicte@amani-chantier.fr", to:"feycoil@etic-services.net", received_at:daysAgo(3), unread:false, flagged:false, has_attach:true, preview:"Voici les 3 devis reçus pour la piscine…", inferred_project:"amani-chantier" },
  { id:"m7", folder:"inbox", subject:"RE: Devis piscine — relance", from_name:"Bénédicte Wayl", from_email:"benedicte@amani-chantier.fr", to:"feycoil@etic-services.net", received_at:daysAgo(1), unread:true, flagged:false, has_attach:false, preview:"Peux-tu trancher cette semaine ? Les fournisseurs attendent…", inferred_project:"amani-chantier" },
  // Affejee — honoraires
  { id:"m8", folder:"inbox", subject:"Honoraires Affejee — dossier AMANI", from_name:"Cabinet Affejee", from_email:"contact@affejee.fr", to:"feycoil@etic-services.net", received_at:daysAgo(2), unread:true, flagged:true, has_attach:true, preview:"3e relance honoraires dossier…", inferred_project:"amani-credit" },
  // ADABU
  { id:"m9", folder:"inbox", subject:"Sinergia — renouvellement bail", from_name:"Bailleur Sinergia", from_email:"contact@sinergia-bailleur.fr", to:"feycoil@etic-services.net", received_at:daysAgo(5), unread:false, flagged:false, has_attach:false, preview:"Renouvellement à valider avant fin mai…", inferred_project:"adabu-sinergia" },
  // SCI
  { id:"m10", folder:"inbox", subject:"AG SCI MB — convocation", from_name:"Notaire LGOA", from_email:"alexandre.sirugue@lgoa.notaires.fr", to:"feycoil@etic-services.net", received_at:daysAgo(7), unread:false, flagged:false, has_attach:true, preview:"Convocation AG approbation des comptes…", inferred_project:"terres-rouges" },
  // Sent — envoyés par Feycoil
  { id:"m11", folder:"sent", subject:"RE: IMPAYÉ AMANI PROPERTIES", from_name:"Feyçoil Mouhoussoune", from_email:"feycoil@etic-services.net", to:"mlguenot@hdm-mayotte.fr", received_at:daysAgo(0), unread:false, flagged:false, has_attach:false, preview:"Je reviens vers vous demain avec la régularisation…", inferred_project:"amani-credit" }
];

emails.sort((a,b) => (b.received_at || "").localeCompare(a.received_at || ""));

function top(arr, n = 10) {
  return Object.entries(arr).sort((a,b) => b[1]-a[1]).slice(0,n).map(([k,v]) => ({key:k,count:v}));
}
const bySender = {}, byProject = {}, byDay = {};
for (const m of emails) {
  const s = m.from_email || m.from_name;
  bySender[s] = (bySender[s]||0) + 1;
  const p = m.inferred_project || "(aucun)";
  byProject[p] = (byProject[p]||0) + 1;
  const d = (m.received_at||"").slice(0,10);
  byDay[d] = (byDay[d]||0) + 1;
}

const summary = {
  extracted_at: now.toISOString(),
  window_days: 30,
  totals: { raw: emails.length + 8, filtered_noise: 8, kept: emails.length, unread: emails.filter(m=>m.unread).length, flagged: emails.filter(m=>m.flagged).length },
  top_senders: top(bySender, 12),
  per_project: top(byProject, 20),
  per_day: Object.entries(byDay).sort((a,b) => a[0].localeCompare(b[0])).map(([k,v])=>({day:k,count:v}))
};

fs.writeFileSync(OUT, JSON.stringify(emails, null, 2));
fs.writeFileSync(SUM, JSON.stringify(summary, null, 2));
console.log(`✓ ${emails.length} emails démo écrits`);
console.log(`  → ${OUT}`);
console.log(`  → ${SUM}`);
console.log(`  top : ${summary.top_senders.slice(0,3).map(x=>x.key+" ("+x.count+")").join(", ")}`);
