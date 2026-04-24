/**
 * normalize-emails.js
 * Lit data/emails-raw.json (produit par fetch-outlook.ps1),
 * filtre les newsletters / notifications automatiques,
 * groupe par expéditeur + par projet inféré,
 * produit data/emails.json + stats/emails-summary.json.
 */
const fs = require("fs");
const path = require("path");
const { readJsonRobust, writeJsonAtomic } = require("../src/json-robust");

const RAW = path.join(__dirname, "..", "data", "emails-raw.json");
const OUT = path.join(__dirname, "..", "data", "emails.json");
const SUM = path.join(__dirname, "..", "data", "emails-summary.json");
const SEED = path.join(__dirname, "..", "data", "seed.json");

if (!fs.existsSync(RAW)) {
  console.error(`✗ ${RAW} introuvable.`);
  console.error(`  Lancez d'abord : powershell -ExecutionPolicy Bypass -File scripts\\fetch-outlook.ps1`);
  process.exit(1);
}

const raw = readJsonRobust(RAW);
const items = raw.items || [];

// --- Règles de filtrage bruit ---
// Patterns substring (matchés sur from_email + from_name concaténé)
const NOISE_SENDERS = [
  // générique
  /no[-_.]?reply/i, /notification/i, /newsletter/i, /\binfo@/i, /\bhello@/i,
  /\bsupport@/i, /do[-_.]?not[-_.]?reply/i, /noreply/i, /@mailchimp/i,
  /@sendgrid/i, /@linkedin\.com/i, /@facebookmail/i, /@twitter/i,
  /mailer[-_]/i, /automated/i, /bounce/i, /nepasrepondre/i, /ne[-_.]?pas[-_.]?repondre/i,
  // systèmes ETIC / Microsoft / presse
  /freescout@/i, /\bnoc@/i, /o365mc@/i, /@microsoft\.com/i, /@microsoftonline/i,
  /\badmin@/i, /\bpostmaster@/i, /mailer-daemon/i,
  /@infos-somapresse/i, /flash[-_]infos@/i,
  // bots de réunion / signatures / notifs
  /@read\.ai/i, /@e\.read\.ai/i, /@eumail\.docusign/i, /@docusign\.net/i,
  // plateformes emploi / annonces auto
  /@email\.experteer/i, /service-employeur@francetravail/i,
  // newsletters presse & médias tech
  /@ga\.journaldunet\.com/i, /@lemondeinformatique\.fr/i, /@news\.fursac\.com/i,
  /@mail\.all\.com/i, /@mail\.instagram\.com/i, /@mail\.anthropic\.com/i,
  /@votrepartenaire\.laposte\.info/i, /@e\.laposte\.info/i,
  // politique / institutionnel de masse
  /@parti-renaissance\.fr/i, /@elections-ps\.fr/i,
  // voyages, backup, apple relay
  /@kenya-airways\.com/i, /@mailer\.amazon/i,
  /veeambackup/i, /veeam\.365/i, /veeam\.etic/i, /@privaterelay\.appleid\.com/i,
  // prospection / marketing de masse
  /marketing@mc3\.fr/i, /@elevation-cp\.com/i, /@ro\.am/i, /howardlerman@/i,
  /groupementpatronal\.may@gmail\.com/i,
  // services grand public (pas pro)
  /@uber\.com/i, /ubereats/i, /@messaging\.disneyplus\.com/i,
  /@discover\.damacproperties\.com/i, /@club\.adomos\.com/i, /@app24\.fr/i,
  /@mail\.notion\.so/i, /@comm\.delltechnologies\.com/i, /@secoursdefrance\.com/i,
  /@marketing\.acceen\.com/i, /@mail\.spotify\.com/i, /@deezer\.com/i,
  /@message\.shopify\.com/i, /@squarespace\.com/i, /@stripe\.com/i,
  /@orange\.fr\/alerte/i,
  // newsletters retail / lifestyle
  /@communication\.tiffany\.com/i, /@euenews\.uniqlo\.com/i,
  /@updates\.freeletics\.com/i, /@email\.bose\.com/i, /@e\.eurostar\.com/i,
  /@infovol\.air-austral/i, /@air-austral\.net/i,
  // prospection / SaaS cold outbound
  /prospection\.ext@/i, /@getstake\.com/i, /@mobby\.paris/i,
  /@traffic\.com\.pl/i, /@atoi-consulting/i,
  /@accasoftware\.com/i, /@musclemonster\.fit/i,
  /@connect\.docusign\.com/i,
  // noms personnels polluant en cold outbound (à garder s'ils t'écrivent vraiment)
  /@siam-distribution\.com/i, /@exclusive-networks\.com/i,
  // domain providers
  /support-renew@gandi/i,
];
// Exact match sur from_email (lowercased)
const NOISE_EMAILS_EXACT = new Set([
  "commercial@etic.yt",
]);
const NOISE_SUBJECTS = [
  /^re: \[?newsletter/i, /unsubscribe/i, /désabonner/i, /facture.*mensuelle/i,
  /rapport hebdo/i, /invitation.*webinar/i, /\bpub\b/i,
  // prospection commerciale récurrente + newsletters qui passent
  /cr[ée]dit d['’]imp[ôo]t.*bornes?/i,
  /bornes?.*recharge/i,
  /revue [ée]conomique/i,
  /\bTR: \d+\s*[èe]me [ée]dition/i,
  // notifications backup / tech auto
  /\bveeam\b/i, /backup (report|succeeded|failed)/i,
  // newsletters fréquentes
  /votre (s[ée]lection|r[ée]sum[ée]|newsletter)/i,
  /livre blanc/i, /\bwebinaire\b/i, /\bOffres? de la semaine\b/i,
  /cette semaine sur journaldunet/i,
];

function isNoise(item) {
  const email = (item.from_email || "").toLowerCase().trim();
  if (email && NOISE_EMAILS_EXACT.has(email)) return true;
  const from = email + " " + (item.from_name || "");
  if (NOISE_SENDERS.some(r => r.test(from))) return true;
  const subj = item.subject || "";
  if (NOISE_SUBJECTS.some(r => r.test(subj))) return true;
  return false;
}

// --- Inférence projet par email ---
let projects = [];
let contacts = [];
try {
  const seed = readJsonRobust(SEED);
  projects = seed.projects || [];
  contacts = seed.contacts || [];
} catch (e) { /* seed pas encore là, on continue quand même */ }

// Liste des adresses qui représentent le CEO lui-même (pour filtrer self-sent)
const SELF_EMAILS_PATH = path.join(__dirname, "..", "data", "self-emails.json");
let SELF_EMAILS = [];
try {
  SELF_EMAILS = (readJsonRobust(SELF_EMAILS_PATH).emails || [])
    .map(e => e.toLowerCase());
} catch (e) { /* pas configuré, on continue */ }
function isSelf(email) {
  if (!email) return false;
  return SELF_EMAILS.includes(email.toLowerCase());
}

function inferProject(item) {
  const from = (item.from_email || "").toLowerCase();
  const fromName = (item.from_name || "").toLowerCase();
  const to = (item.to || "").toLowerCase();
  const subj = (item.subject || "").toLowerCase();
  const acc = (item.account || "").toLowerCase();
  // Note : on N'inclut PAS `to` dans le haystack (le nom du CEO y est toujours
  // présent et pollue les heuristiques). On garde `to` pour des checks ciblés.
  const haystack = from + " " + fromName + " " + subj;

  // 1. Match par contact.email → contact.projects (priorité forte)
  const c = contacts.find(x =>
    x.email && (from.includes(x.email.toLowerCase()) || to.includes(x.email.toLowerCase()))
  );
  if (c && c.projects && c.projects[0]) return c.projects[0];

  // 2. Match par domaine expéditeur (avant mots-clés, plus fiable)
  if (/@(ltm-technologies\.com|ith\.yt|aa\.yt|aa-services\.fr)/i.test(from)) return "etic-ith-ltm";
  if (/support ltm|ltm technologies/i.test(acc)) return "etic-ith-ltm";
  if (/@ca-bretagne\.fr|@ca-reunion\.fr|@inter-invest\.fr|@lgoa\.notaires\.fr/i.test(from)) return "amani-credit";
  if (/@franklin-paris\.com|@cvs-avocats\.com|@affejee-avocats\.com/i.test(from)) return "amani-legal";
  if (/@mtcmo\.fr|@integrale\.re|@ocidim\.fr|@vinci-construction\.com|@viventiumhotels\.com/i.test(from)) return "amani-chantier";
  if (/@europe-a-mayotte\.yt/i.test(from)) return "amani-feder";
  if (/@mhssn\.org/i.test(from) || /@mhssn\.org/i.test(to)) return "mhssn-gouv";
  if (/@etic\.yt/i.test(from)) return "etic-services";

  // 3. Heuristiques mots-clés (subject + sender uniquement)
  if (/\bfeder\b|mye013568|myt013568/i.test(haystack)) return "amani-feder";
  if (/breeam/i.test(haystack)) return "amani-breeam";
  if (/\bff[- ]?e\b|\bmobilier hôtelier\b/i.test(subj)) return "amani-ffe";
  if (/chantier|viventium|mtcmo|intégrale|integrale|\bocidim\b|\bvinci\b|\bhdm\b|piscine/i.test(haystack)) return "amani-chantier";
  if (/dossier 96830001|amani[- ]resort|alamowitch|franklin/i.test(haystack)) return "amani-legal";
  if (/\bcr[ée]dit\b|\bbanque\b|ca[- ]bretagne|ca[- ]r[ée]union|\bcic\b|inter[- ]invest/i.test(haystack)) return "amani-credit";
  // "mouhoussoune" uniquement si ça apparaît dans le SUBJECT (le nom propre
  // du CEO pollue le champ from_name / to — on restreint au sujet)
  if (/\b(chafick|djedid)\b|groupe mouhoussoune|assistance mouhoussoune/i.test(subj)) return "mouhoussoune-aff";
  if (/sinergia|adabu/i.test(haystack)) return "sci-start-adabu";
  if (/terres[- ]rouges/i.test(subj)) return "sci-start-adabu";
  if (/\bspa amani\b|\bwellness amani\b/i.test(haystack)) return "amani-exploit";
  if (/feirasin/i.test(haystack)) return "feirasin-holding";
  if (/\bghams\b|parcelle 1436/i.test(haystack)) return "etic-ghams";
  // AMANI générique : uniquement si présent dans le SUBJECT (sinon trop large)
  if (/\bamani\b/i.test(subj)) return "amani-chantier";

  return null;
}

// --- Traitement ---
const clean = items
  .filter(x => !isNoise(x))
  .map(x => ({
    id: x.id,
    account: x.account || null,
    folder: x.folder,
    subject: (x.subject || "(sans objet)").trim(),
    from_name: x.from_name,
    from_email: x.from_email,
    to: x.to,
    received_at: x.received_at,
    unread: !!x.unread,
    flagged: !!x.flagged,
    has_attach: !!x.has_attach,
    preview: x.body_preview || "",
    inferred_project: inferProject(x),
    is_self: isSelf(x.from_email)
  }))
  .sort((a, b) => (b.received_at || "").localeCompare(a.received_at || ""));

// --- Stats agrégées ---
function top(arr, n = 10) {
  return Object.entries(arr).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ key: k, count: v }));
}
const bySender = {};
const byProject = {};
const byDay = {};
const byAccount = {};
for (const m of clean) {
  const s = m.from_email || m.from_name || "inconnu";
  bySender[s] = (bySender[s] || 0) + 1;
  const p = m.inferred_project || "(aucun)";
  byProject[p] = (byProject[p] || 0) + 1;
  const d = (m.received_at || "").slice(0, 10);
  byDay[d] = (byDay[d] || 0) + 1;
  const acc = m.account || "(non tagué)";
  byAccount[acc] = (byAccount[acc] || 0) + 1;
}

const summary = {
  extracted_at: raw.extracted_at,
  window_days: raw.window_days,
  totals: {
    raw: items.length,
    filtered_noise: items.length - clean.length,
    kept: clean.length,
    unread: clean.filter(m => m.unread).length,
    flagged: clean.filter(m => m.flagged).length
  },
  top_senders: top(bySender, 12),
  per_project: top(byProject, 20),
  per_account: top(byAccount, 20),
  per_day: Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ day: k, count: v }))
};

writeJsonAtomic(OUT, clean, 2);
writeJsonAtomic(SUM, summary, 2);

console.log(`✓ ${clean.length} mails normalisés (filtré ${summary.totals.filtered_noise} bruit)`);
console.log(`  → ${OUT}`);
console.log(`  → ${SUM}`);
console.log(`  top expéditeurs : ${summary.top_senders.slice(0, 3).map(x => x.key + " (" + x.count + ")").join(", ")}`);
