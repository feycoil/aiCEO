/* aiCEO Platform — Shared data store
   Projets, tâches, décisions, événements agenda, sociétés.
   Identifiés depuis les emails du 23 mars au 23 avril 2026 + agenda Outlook.
*/

window.AICEO = window.AICEO || {};

/* ─────────────────────── SOCIÉTÉS ─────────────────────── */
AICEO.COMPANIES = {
  TR:    { code:"TR",    name:"Terres Rouges Holding",   full:"TERRES ROUGES Holding SAS",   role:"Holding familiale" },
  ADB:   { code:"ADB",   name:"Adabu Holding",           full:"Adabu Holding SAS",           role:"Holding groupe ETIC" },
  ETIC:  { code:"ETIC",  name:"ETIC Services",           full:"ETIC Services SARL",          role:"Services numériques" },
  ITH:   { code:"ITH",   name:"ITH Data Center",         full:"ITH Data Center SAS",         role:"Data Center" },
  LTM:   { code:"LTM",   name:"LTM Technologies",        full:"LTM Technologies SARL",       role:"Technologies" },
  SCIS:  { code:"SCIS",  name:"SCI Start",               full:"SCI START",                   role:"Foncier groupe ETIC" },
  FEIR:  { code:"FEIR",  name:"Feirasin Holding",        full:"Feirasin Holding SASU",       role:"Services externalisés" },
  AMR:   { code:"AMR",   name:"AMANI Resorts",           full:"AMANI Resorts SAS",           role:"Exploitation hôtel" },
  AMP:   { code:"AMP",   name:"AMANI Properties",        full:"AMANI Properties SA",         role:"SPV CAPEX immobilier" },
  TAM:   { code:"TAM",   name:"TAMARIN LOC 38",          full:"TAMARIN LOC 38 SAS",          role:"SPV CAPEX FF&E" },
  SCIMB: { code:"SCIMB", name:"SCI MHSSN-Boustane",      full:"SCI MHSSN-BOUSTANE",          role:"Foncier Dembeni" },
};

/* ─────────────────────── PROJETS ───────────────────────
   Identifiés depuis 80+ emails (Jan–Avr 2026) et agenda Outlook.
*/
AICEO.PROJECTS = [
  {
    id: "amani",
    name: "Projet AMANI — Hôtel Pamandzi",
    icon: "🏨",
    color: "amber",
    companies: ["AMP", "AMR", "TAM"],
    owner: "Djedid (directeur projet) + Feyçoil (CEO)",
    status: "active",
    phase: "Financement + construction + FF&E",
    kickoff: "2025-09",
    milestone: "Ouverture hôtel 2027",
    description: "Construction et exploitation de l'hôtel AMANI à Pamandzi (Mayotte). Structuration financière (CA Bretagne, CDC, OC), FF&E (Bénédicte/VIA DI Italia), certification BREEAM, gouvernance (pacte, HMA, CPI).",
    workstreams: [
      { name: "Financement", items: ["Tirage CA Bretagne (décalé 30/04)", "CDC 2e tranche", "OC 1,35M€", "FEDER MYT013568"] },
      { name: "FF&E", items: ["Contrat Bénédicte + annexe BREEAM", "VIA DI Italia", "RV matériaux Mayotte 27/04"] },
      { name: "Construction", items: ["Réunion chantier hebdo jeudi", "MOE/MOA Integrale", "OCIDIM AMO"] },
      { name: "BREEAM", items: ["Réunion OCIDIM", "Certificateur Terao"] },
      { name: "Gouvernance", items: ["Pacte associés ✓", "HMA ✓", "CPI ✓ avenant 15.2"] },
      { name: "Reporting", items: ["Plaquette comptes 2025", "RV Thomas Delelis CA Réunion"] },
    ],
    kpi: { open: 10, overdue: 2, done: 6, progress: 55 },
    taskIds: ["d1","d2","d3","p1","p4","p5","p6","p7","g1","g2"],
    decisionIds: ["dec-pacte","dec-credits","dec-oc","dec-cdc","dec-hma","dec-cno","dec-cpi","dec-sûretés","dec-ocidim-paid"],
    contacts: [
      { name: "David Affejee", org: "Cabinet Affejee", role: "Avocat conseil", email: "david@affejee.com" },
      { name: "Marie Ansquer", org: "CA Bretagne", role: "Chargée crédit", email: "Marie.ANSQUER@ca-bretagne.fr" },
      { name: "Jean Hentgen", org: "Franklin Paris", role: "Conseil juridique", email: "jhentgen@franklin-paris.com" },
      { name: "Thomas Delelis", org: "CA Réunion", role: "Déblocage AMANI", email: "Thomas.DELELIS@ca-reunion.fr" },
      { name: "Rémi Giannetti", org: "OCIDIM", role: "BREEAM / AMO", email: "remi.giannetti@ocidim.fr" },
      { name: "Nassebati Saïd", org: "FEDER", role: "Dossier MYT013568", email: "" },
      { name: "Mathilde Troquier", org: "—", role: "Plaquette comptes", email: "" },
      { name: "Yann Cornec", org: "Intégrale Réunion", role: "MOE/MOA", email: "yann.cornec@integrale.re" },
      { name: "Michel Delafosse", org: "MTC.MO", role: "AMO", email: "michel.delafosse@mtcmo.fr" },
      { name: "Christophe Carlier", org: "Viventium Hotels", role: "Exploitant HMA", email: "christophecarlier@viventiumhotels.com" },
    ],
    latestReview: "revue-2026-W17.md",
  },
  {
    id: "sci-start",
    name: "SCI Start / Adabu — Convention & Donation",
    icon: "🏗️",
    color: "indigo",
    companies: ["SCIS", "ADB"],
    owner: "Feyçoil + Lamiae (RAF)",
    status: "active",
    phase: "Validation convention + choix notaire",
    kickoff: "2026-03",
    milestone: "Lancement mission Affejee + donation parts",
    description: "Validation de la convention modifiée SCI Start / Adabu (2025 inclus) pour lancer la mission Affejee, et choix du notaire pour la donation des parts de la SCI Start (en attente depuis 30 jours).",
    workstreams: [
      { name: "Convention", items: ["Validation 2025 inclus", "Co-signature ADB"] },
      { name: "Donation parts", items: ["Choix notaire", "Coordination Affejee"] },
    ],
    kpi: { open: 2, overdue: 0, done: 0, progress: 40 },
    taskIds: ["d4","p2"],
    decisionIds: [],
    contacts: [
      { name: "David Affejee", org: "Cabinet Affejee", role: "Avocat conseil", email: "david@affejee.com" },
      { name: "Lamiae Ouazzani-Touhami", org: "ETIC Services", role: "RAF", email: "lamiae@etic.yt" },
    ],
    latestReview: "revue-2026-W17.md",
  },
  {
    id: "etic-depots",
    name: "ETIC — Régularisation dépôts 2019-2022",
    icon: "💻",
    color: "sky",
    companies: ["ETIC"],
    owner: "Comptable (délégué)",
    status: "active",
    phase: "Compilation pièces",
    kickoff: "2026-04",
    milestone: "Dépôt greffe selon plan Affejee",
    description: "Régularisation des dépôts comptables annuels ETIC Services 2019-2022 auprès du greffe, sous coordination du cabinet Affejee.",
    workstreams: [
      { name: "Pièces", items: ["Compiler comptes 2019", "Compiler comptes 2020", "Compiler comptes 2021", "Compiler comptes 2022"] },
      { name: "Dépôt", items: ["Cadencement plan Affejee"] },
    ],
    kpi: { open: 1, overdue: 0, done: 0, progress: 15 },
    taskIds: ["g3"],
    decisionIds: [],
    contacts: [
      { name: "David Affejee", org: "Cabinet Affejee", role: "Avocat conseil", email: "david@affejee.com" },
    ],
    latestReview: "revue-2026-W17.md",
  },
  {
    id: "scimb",
    name: "SCI MHSSN-Boustane — Foncier Dembeni",
    icon: "🌴",
    color: "emerald",
    companies: ["SCIMB"],
    owner: "Fratrie (Chafick, Djedid, Naïr, Feyçoil)",
    status: "active",
    phase: "Montage juridique",
    kickoff: "2026-03",
    milestone: "Constitution SCI + acquisition foncière",
    description: "Création d'une SCI familiale pour détenir le foncier de Dembeni. Parties : Chafick, Djedid, Naïr, Feyçoil Mouhoussoune.",
    workstreams: [
      { name: "Création", items: ["Call famille", "Statuts + apports"] },
    ],
    kpi: { open: 1, overdue: 0, done: 0, progress: 20 },
    taskIds: ["p8"],
    decisionIds: [],
    contacts: [
      { name: "Djedid Mouhoussoune", org: "MHSSN", role: "Fratrie", email: "djedid@mhssn.org" },
      { name: "Chafick Mouhoussoune", org: "PwC", role: "Fratrie", email: "chafick@mhssn.org" },
    ],
    latestReview: "revue-2026-W17.md",
  },
  {
    id: "ith-lloyds",
    name: "ITH Data Center — Assurance Lloyd's",
    icon: "💾",
    color: "sky",
    companies: ["ITH"],
    owner: "Feyçoil",
    status: "new",
    phase: "Instruction proposition",
    kickoff: "2026-04",
    milestone: "Décision souscription",
    description: "Proposition d'assurance Lloyd's pour ITH Data Center reçue de Serge Vlody. À instruire (couverture, montant, conditions).",
    workstreams: [
      { name: "Analyse", items: ["Lire proposition", "Benchmark", "Décision"] },
    ],
    kpi: { open: 1, overdue: 0, done: 0, progress: 10 },
    taskIds: ["p3"],
    decisionIds: [],
    contacts: [
      { name: "Serge Vlody", org: "Lloyd's", role: "Courtier assurance", email: "" },
    ],
    latestReview: "revue-2026-W17.md",
  },
  {
    id: "honoraires",
    name: "Honoraires conseil — Affejee & Franklin",
    icon: "⚖️",
    color: "rose",
    companies: ["AMP", "TR"],
    owner: "Feyçoil → Lamiae / comptable",
    status: "hot",
    phase: "Règlement — 3ᵉ relance",
    kickoff: "2026-04-12",
    milestone: "Paiement effectif avant 24/04",
    description: "Gestion du règlement des honoraires du cabinet Affejee (dossier Amani, 3ᵉ relance le 23/04) et de Franklin (Géraldine Machinet, relance date de paiement).",
    workstreams: [
      { name: "Affejee (Amani)", items: ["Virement honoraires", "Débours"] },
      { name: "Franklin", items: ["Date paiement Géraldine"] },
    ],
    kpi: { open: 3, overdue: 1, done: 0, progress: 25 },
    taskIds: ["d1","d5","g1"],
    decisionIds: [],
    contacts: [
      { name: "David Affejee", org: "Cabinet Affejee", role: "Avocat", email: "david@affejee.com" },
      { name: "Géraldine Machinet", org: "Franklin", role: "Facturation", email: "" },
      { name: "Lamiae Ouazzani-Touhami", org: "ETIC Services", role: "RAF", email: "lamiae@etic.yt" },
    ],
    latestReview: "revue-2026-W17.md",
  },
  {
    id: "feder",
    name: "FEDER MYT013568 — AMANI-RESORTS",
    icon: "🇪🇺",
    color: "violet",
    companies: ["AMR"],
    owner: "Feyçoil (à instruire)",
    status: "new",
    phase: "Qualification",
    kickoff: "2026-04",
    milestone: "Dépôt dossier complet",
    description: "Dossier de subvention FEDER MYT013568 adressé par Nassebati Saïd pour AMANI-RESORTS. À qualifier : éligibilité, montant, pièces à fournir, calendrier.",
    workstreams: [
      { name: "Analyse", items: ["Qualifier dossier", "Identifier parties prenantes", "Cartographier jalons"] },
    ],
    kpi: { open: 1, overdue: 0, done: 0, progress: 5 },
    taskIds: ["p6"],
    decisionIds: [],
    contacts: [
      { name: "Nassebati Saïd", org: "FEDER", role: "Instruction", email: "" },
    ],
    latestReview: "revue-2026-W17.md",
  },
];

/* ─────────────────────── TÂCHES ───────────────────────
   Extraites de la revue W17 (matrice 4D).
   Chaque tâche a un project pour le lien revue ↔ projet.
*/
AICEO.TASKS = [
  // FAIRE (Do)
  { id:"d1", type:"do", project:"honoraires",  companies:["AMP"], text:"Instruire comptable — honoraires Affejee dossier Amani (3ᵉ relance 23/04)", meta:"Moi → Lamiae/compta", due:"2026-04-24", overdue:true, priority:"critical", starred:true, done:false },
  { id:"d2", type:"do", project:"amani",       companies:["AMP"], text:"Confirmer par écrit le décalage tirage CA Bretagne au 30/04", meta:"Moi · M. Ansquer", due:"2026-04-30", overdue:false, priority:"critical", starred:true, done:false },
  { id:"d3", type:"do", project:"amani",       companies:["TAM"], text:"Valider contrat FF&E Bénédicte AVEC annexe critères BREEAM", meta:"Moi · demande Chafick 22/04", due:"2026-04-24", overdue:false, priority:"critical", starred:true, done:false },
  { id:"d4", type:"do", project:"sci-start",   companies:["SCIS","ADB"], text:"Valider convention SCI Start / Adabu (2025 inclus)", meta:"Moi + Lamiae — déclenche mission Affejee", due:"2026-04-24", overdue:false, priority:"high", starred:false, done:false },
  { id:"d5", type:"do", project:"honoraires",  companies:["TR"],  text:"Communiquer date paiement à Géraldine Machinet (Franklin)", meta:"Moi", due:"2026-04-24", overdue:false, priority:"high", starred:false, done:false },

  // PLANIFIER (Plan)
  { id:"p1", type:"plan", project:"amani",     companies:["AMR"], text:"Coordination Marc / Yann — arbitrage Marc full time Mayotte", meta:"Bloc jeudi AM", due:"2026-04-24", overdue:false, priority:"high", starred:true, done:false },
  { id:"p2", type:"plan", project:"sci-start", companies:["SCIS"], text:"Choisir notaire donation parts SCI Start (en attente 30j)", meta:"30-45 min", due:"2026-04-25", overdue:false, priority:"high", starred:true, done:false },
  { id:"p3", type:"plan", project:"ith-lloyds",companies:["ITH"], text:"Instruire proposition assurance Lloyd's ITH (Serge Vlody)", meta:"Bloc vendredi", due:"2026-04-24", overdue:false, priority:"medium", starred:false, done:false },
  { id:"p4", type:"plan", project:"amani",     companies:["AMR"], text:"Préparer RV Thomas Delelis (CA Réunion) — déblocage AMANI", meta:"À caler", due:"2026-04-28", overdue:false, priority:"high", starred:false, done:false },
  { id:"p5", type:"plan", project:"amani",     companies:["AMP"], text:"Réunion BREEAM OCIDIM (invit. Rémi Giannetti)", meta:"Teams", due:"2026-05-06", overdue:false, priority:"medium", starred:false, done:false },
  { id:"p6", type:"plan", project:"feder",     companies:["AMR"], text:"Qualifier dossier FEDER MYT013568 (Nassebati Saïd)", meta:"30 min", due:"2026-04-29", overdue:false, priority:"medium", starred:false, done:false },
  { id:"p7", type:"plan", project:"amani",     companies:["AMR"], text:"Produire plaquette comptes AMANI-RESORTS 2025 (M. Troquier)", meta:"À déléguer EC", due:"2026-04-30", overdue:false, priority:"medium", starred:false, done:false },
  { id:"p8", type:"plan", project:"scimb",     companies:["SCIMB"], text:"Créer SCI Mhssn-Boustane (fratrie)", meta:"Call famille", due:"2026-05-15", overdue:false, priority:"medium", starred:false, done:false },

  // DÉLÉGUER (Delegate)
  { id:"g1", type:"delegate", project:"honoraires", companies:["AMP","TR"], text:"Exécuter virements Affejee + Franklin + débours Amani", meta:"→ Lamiae / compta · AUJOURD'HUI 17h", due:"2026-04-23", overdue:true, priority:"critical", starred:false, done:false },
  { id:"g2", type:"delegate", project:"amani",      companies:["AMR","TAM"], text:"RV Bénédicte Mayotte lundi 27/04 — valider échantillons", meta:"→ Karim + Naïma + Naïr", due:"2026-04-27", overdue:false, priority:"high", starred:false, done:false },
  { id:"g3", type:"delegate", project:"etic-depots",companies:["ETIC"], text:"Compiler pièces dépôts comptes ETIC 2019-2022", meta:"→ Comptable", due:"2026-05-15", overdue:false, priority:"medium", starred:false, done:false },
  { id:"g4", type:"delegate", project:"amani",      companies:["AMR"], text:"Produire plaquette comptes AMANI-RESORTS 2025", meta:"→ EC", due:"2026-04-30", overdue:false, priority:"medium", starred:false, done:false },

  // DROP
  { id:"x1", type:"drop", project:null, companies:[], text:"Newsletters marketing (Todoist, Alibaba, Meilleurtaux…)", meta:"Désinscription batch", priority:"low", starred:false, done:false },
  { id:"x2", type:"drop", project:null, companies:[], text:"Notifications Revolut IBAN lituanien désactivé", meta:"Archiver", priority:"low", starred:false, done:false },
  { id:"x3", type:"drop", project:null, companies:[], text:"Alertes automatiques ArchiLid", meta:"Router dossier dédié", priority:"low", starred:false, done:false },
  { id:"x4", type:"drop", project:null, companies:[], text:"Read.ai — relance renouvellement abonnement", meta:"Décision plus tard", priority:"low", starred:false, done:false },
];

/* ─────────────────────── DÉCISIONS ACTÉES ─────────────────────── */
AICEO.DECISIONS = [
  { id:"dec-pacte",       date:"2026-03-26", project:"amani", companies:["AMP","AMR","TAM"], title:"Pacte d'associés AMANI — version finale signée/validée", parties:"Cabinet Nova + ECP", note:"Gouvernance fondatrice du projet" },
  { id:"dec-hma",         date:"2026-03-27", project:"amani", companies:["AMR"], title:"HMA AMANI (Hotel Management Agreement) — clause bonne foi, version finale", parties:"Christophe Carlier / Viventium", note:"Clause renégociée" },
  { id:"dec-cno",         date:"2026-03-27", project:"amani", companies:["AMR"], title:"CNO AMANI-Resorts — certificat de non opposition reçu", parties:"—", note:"Permis de construire purgé" },
  { id:"dec-oc",          date:"2026-03-27", project:"amani", companies:["AMP"], title:"Émission OC 1,350 M€ — décidée, délégation AG/CA confirmée", parties:"—", note:"Instrument de financement mezzanine" },
  { id:"dec-sûretés",     date:"2026-03-27", project:"amani", companies:["TAM"], title:"Sûretés AMANI-TAMARIN — observations CVS intégrées et validées", parties:"CVS Avocats", note:"Prérequis tirage crédit" },
  { id:"dec-cpi",         date:"2026-03-31", project:"amani", companies:["AMP"], title:"CPI AMANI / OCIDIM — avenant article 15.2 négocié", parties:"OCIDIM", note:"Contrat promoteur immobilier" },
  { id:"dec-credits",     date:"2026-04-02", project:"amani", companies:["AMP"], title:"Contrat de Crédits AMANI PROPERTIES — signé", parties:"Crédit Agricole Bretagne + CDC", note:"Pool bancaire finalisé" },
  { id:"dec-cdc",         date:"2026-04-02", project:"amani", companies:["AMP"], title:"Avis juridique CDC (KYC) — finalisé", parties:"Franklin", note:"Étape préalable tirage" },
  { id:"dec-ocidim-paid", date:"2026-04-22", project:"amani", companies:["AMP"], title:"Virement OCIDIM envoyé (12h57)", parties:"OCIDIM", note:"Confirme le paiement auparavant flaggé 'non reçu' par Chafick" },
];

/* ─────────────────────── REVUES HEBDO ─────────────────────── */
AICEO.REVIEWS = [
  { iso:"2026-W17", year:2026, week:17, dateRange:"20–26 avril 2026", status:"current", progress:35,
    mdPath:"revues/revue-2026-W17.md", widgetPath:"revues/revue-2026-W17-widget.html" },
];

/* ─────────────────────── AGENDA OUTLOOK ───────────────────────
   Scan calendar 2026-04-16 → 2026-05-21 (29 événements)
   Catégories dérivées du contenu pour mapper aux projets.
*/
AICEO.EVENTS = [
  // 16/04/2026
  { start:"2026-04-16T05:00:00Z", end:"2026-04-16T07:30:00Z", subject:"Réunion chantier", project:"amani", category:"amani", recurrent:true, organizer:"feycoil@mhssn.org", webLink:"https://outlook.office365.com/calendar" },
  { start:"2026-04-16T13:00:00Z", end:"2026-04-16T14:00:00Z", subject:"Projet AMANI — FF&E Contract", project:"amani", category:"amani", organizer:"jhentgen@franklin-paris.com", teams:true, attendees:["Jean Hentgen","Chafick","Djedid","Feyçoil"] },
  // 17/04/2026
  { start:"2026-04-17T07:00:00Z", end:"2026-04-17T09:00:00Z", subject:"AMANI Hôtel — Comité d'exécution", project:"amani", category:"amani", organizer:"el-nachdy.selemani@ocidim.fr", teams:true, attendees:["OCIDIM","VINCI","MTC.MO","Rémi Giannetti"] },
  // 19/04/2026
  { start:"2026-04-19T15:45:00Z", end:"2026-04-19T18:00:00Z", subject:"Vie Feyçoil & Lamiae — séjour parents / régime marital / budget", project:null, category:"personal", organizer:"Lamiae", teams:true, recurrent:true },
  // 20/04/2026
  { start:"2026-04-20T06:30:00Z", end:"2026-04-20T07:00:00Z", subject:"⚡ QuickSync Hebdo — Management Board ETIC", project:null, category:"etic", organizer:"feycoil@etic.yt", teams:true, recurrent:true, attendees:["ETIC Management"] },
  // 21/04/2026
  { start:"2026-04-21T08:00:00Z", end:"2026-04-21T08:30:00Z", subject:"AMANI PROPERTIES — Déblocage", project:"amani", category:"amani", organizer:"Thomas.DELELIS@ca-reunion.fr", teams:true, attendees:["Thomas Delelis","Caroline Wadin","Alexandre Sirugue","Marie Ansquer","CVS"] },
  // 22/04/2026
  { start:"2026-04-22T11:00:00Z", end:"2026-04-22T13:00:00Z", subject:"AMANI — Réunion technique MOE/MOA / Exploitant", project:"amani", category:"amani", organizer:"yann.cornec@integrale.re", teams:true, attendees:["Intégrale","Djedid","OCIDIM","Viventium","SMTPC"] },
  { start:"2026-04-22T16:00:00Z", end:"2026-04-22T17:00:00Z", subject:"Weekly catch-up famille MHSSN", project:null, category:"personal", organizer:"djedid@mhssn.org", teams:true, recurrent:true, attendees:["Djedid","Chafick","Nahéma","Naïr","Karim","Feyçoil"] },
  // 23/04/2026
  { start:"2026-04-23T05:00:00Z", end:"2026-04-23T07:30:00Z", subject:"Réunion chantier", project:"amani", category:"amani", recurrent:true, organizer:"feycoil@mhssn.org" },
  // 26/04/2026
  { start:"2026-04-26T15:45:00Z", end:"2026-04-26T18:00:00Z", subject:"Vie Feyçoil & Lamiae — séjour parents / régime marital / budget", project:null, category:"personal", organizer:"Lamiae", teams:true, recurrent:true },
  // 27/04/2026
  { start:"2026-04-27T06:30:00Z", end:"2026-04-27T07:00:00Z", subject:"⚡ QuickSync Hebdo — Management Board ETIC", project:null, category:"etic", organizer:"feycoil@etic.yt", teams:true, recurrent:true },
  { start:"2026-04-27T16:30:00Z", end:"2026-04-27T17:30:00Z", subject:"Weekly catch-up famille MHSSN", project:null, category:"personal", organizer:"djedid@mhssn.org", teams:true, recurrent:true },
  // 28/04/2026
  { start:"2026-04-28T07:00:00Z", end:"2026-04-28T09:00:00Z", subject:"Comité de pilotage Hôtel AMANI — FTM / FF&E", project:"amani", category:"amani", organizer:"remi.giannetti@ocidim.fr", teams:true, attendees:["OCIDIM","MTC.MO","VINCI"] },
  // 30/04/2026
  { start:"2026-04-30T05:00:00Z", end:"2026-04-30T07:30:00Z", subject:"Réunion chantier", project:"amani", category:"amani", recurrent:true, organizer:"feycoil@mhssn.org" },
  // 03/05/2026
  { start:"2026-05-03T15:45:00Z", end:"2026-05-03T18:00:00Z", subject:"Vie Feyçoil & Lamiae — séjour parents / régime marital / budget", project:null, category:"personal", organizer:"Lamiae", teams:true, recurrent:true },
  // 04/05/2026
  { start:"2026-05-04T06:30:00Z", end:"2026-05-04T07:00:00Z", subject:"⚡ QuickSync Hebdo — Management Board ETIC", project:null, category:"etic", organizer:"feycoil@etic.yt", teams:true, recurrent:true },
  { start:"2026-05-04T16:30:00Z", end:"2026-05-04T17:30:00Z", subject:"Weekly catch-up famille MHSSN", project:null, category:"personal", organizer:"djedid@mhssn.org", teams:true, recurrent:true },
  // 05/05/2026
  { start:"2026-05-05T11:00:00Z", end:"2026-05-05T13:00:00Z", subject:"AMANI — DET Réunion Technique AMO Preneur", project:"amani", category:"amani", organizer:"yann.cornec@integrale.re", teams:true, attendees:["Intégrale","Viventium","OCIDIM","SMTPC"] },
  // 06/05/2026
  { start:"2026-05-06T08:30:00Z", end:"2026-05-06T10:30:00Z", subject:"Réunion d'avancement BREEAM — Hôtel AMANI", project:"amani", category:"amani", organizer:"remi.giannetti@ocidim.fr", teams:true, attendees:["OCIDIM","MTC.MO","VINCI","Terao"] },
  // 07/05/2026
  { start:"2026-05-07T05:00:00Z", end:"2026-05-07T07:30:00Z", subject:"Réunion chantier", project:"amani", category:"amani", recurrent:true, organizer:"feycoil@mhssn.org" },
  // 10/05/2026
  { start:"2026-05-10T15:45:00Z", end:"2026-05-10T18:00:00Z", subject:"Vie Feyçoil & Lamiae — séjour parents / régime marital / budget", project:null, category:"personal", organizer:"Lamiae", teams:true, recurrent:true },
  // 11/05/2026
  { start:"2026-05-11T06:30:00Z", end:"2026-05-11T07:00:00Z", subject:"⚡ QuickSync Hebdo — Management Board ETIC", project:null, category:"etic", organizer:"feycoil@etic.yt", teams:true, recurrent:true },
  { start:"2026-05-11T16:30:00Z", end:"2026-05-11T17:30:00Z", subject:"Weekly catch-up famille MHSSN", project:null, category:"personal", organizer:"djedid@mhssn.org", teams:true, recurrent:true },
  // 12/05/2026 - all day
  { start:"2026-05-12T00:00:00Z", end:"2026-05-13T00:00:00Z", subject:"🎂 Anniversaire KIRAN", project:null, category:"personal", allDay:true },
  // 14/05/2026
  { start:"2026-05-14T05:00:00Z", end:"2026-05-14T07:30:00Z", subject:"Réunion chantier", project:"amani", category:"amani", recurrent:true, organizer:"feycoil@mhssn.org" },
  // 17/05/2026
  { start:"2026-05-17T15:45:00Z", end:"2026-05-17T18:00:00Z", subject:"Vie Feyçoil & Lamiae — séjour parents / régime marital / budget", project:null, category:"personal", organizer:"Lamiae", teams:true, recurrent:true },
  // 18/05/2026
  { start:"2026-05-18T06:30:00Z", end:"2026-05-18T07:00:00Z", subject:"⚡ QuickSync Hebdo — Management Board ETIC", project:null, category:"etic", organizer:"feycoil@etic.yt", teams:true, recurrent:true },
  { start:"2026-05-18T16:30:00Z", end:"2026-05-18T17:30:00Z", subject:"Weekly catch-up famille MHSSN", project:null, category:"personal", organizer:"djedid@mhssn.org", teams:true, recurrent:true },
  // 21/05/2026
  { start:"2026-05-21T05:00:00Z", end:"2026-05-21T07:30:00Z", subject:"Réunion chantier", project:"amani", category:"amani", recurrent:true, organizer:"feycoil@mhssn.org" },
];

/* ─────────────────────── CONTACTS ─────────────────────── */
/* Agrégé depuis projets.contacts + organizers/attendees d'agenda + scan emails. */
AICEO.CONTACTS = [
  // ───── Juridique & Conseil ─────
  { id:"c-affejee", name:"David Affejee", role:"Avocat conseil", org:"Cabinet Affejee", email:"david@affejee.com", phone:"", tags:["legal","avocat"], projects:["amani","sci-start","etic-depots","honoraires"], companies:["AMP","AMR","SCIS","ADB","ETIC"], notes:"Dossier AMANI + convention SCI Start/Adabu + régularisation dépôts ETIC 2019-2022. 3ᵉ relance honoraires 23/04." },
  { id:"c-hentgen", name:"Jean Hentgen", role:"Conseil juridique", org:"Franklin Paris", email:"jhentgen@franklin-paris.com", phone:"", tags:["legal","honoraires"], projects:["amani","honoraires"], companies:["AMP","AMR"], notes:"Contrat FF&E AMANI + honoraires Franklin en attente de règlement." },
  { id:"c-machinet", name:"Géraldine Machinet", role:"Facturation", org:"Franklin", email:"", phone:"", tags:["finance","honoraires"], projects:["honoraires"], companies:["TR","AMP"], notes:"Cadrage échéancier honoraires Franklin." },
  { id:"c-vlody", name:"Serge Vlody", role:"Courtier assurance", org:"Lloyd's", email:"", phone:"", tags:["assurance","ith"], projects:["ith-lloyds"], companies:["ITH"], notes:"ITH Data Center — police Lloyd's." },

  // ───── AMANI : MOE / AMO / Exploitant ─────
  { id:"c-giannetti", name:"Rémi Giannetti", role:"BREEAM / AMO", org:"OCIDIM", email:"remi.giannetti@ocidim.fr", phone:"", tags:["amani","breeam","amo"], projects:["amani"], companies:["AMP","AMR"], notes:"Certif BREEAM + COPIL FTM / FF&E Hôtel AMANI. Organise le COPIL hebdo." },
  { id:"c-selemani", name:"El Nachdy Selemani", role:"Chef de projet", org:"OCIDIM", email:"el-nachdy.selemani@ocidim.fr", phone:"", tags:["amani","amo"], projects:["amani"], companies:["AMP","AMR"], notes:"Organise les comités d'exécution AMANI." },
  { id:"c-cornec", name:"Yann Cornec", role:"MOE/MOA", org:"Intégrale Réunion", email:"yann.cornec@integrale.re", phone:"", tags:["amani","moe"], projects:["amani"], companies:["AMP","AMR"], notes:"Réunions techniques MOE/MOA + DET AMO Preneur." },
  { id:"c-delafosse", name:"Michel Delafosse", role:"AMO", org:"MTC.MO", email:"michel.delafosse@mtcmo.fr", phone:"", tags:["amani","amo"], projects:["amani"], companies:["AMP","AMR"], notes:"Assistance maîtrise d'ouvrage AMANI." },
  { id:"c-carlier", name:"Christophe Carlier", role:"Exploitant HMA", org:"Viventium Hotels", email:"christophecarlier@viventiumhotels.com", phone:"", tags:["amani","exploitant"], projects:["amani"], companies:["AMP","AMR"], notes:"Exploitant Hotel Management Agreement AMANI." },

  // ───── AMANI : Banques & financement ─────
  { id:"c-delelis", name:"Thomas Delelis", role:"Conseiller entreprise", org:"CA Réunion", email:"Thomas.DELELIS@ca-reunion.fr", phone:"", tags:["finance","banque"], projects:["amani"], companies:["AMP"], notes:"Déblocage crédit AMANI Properties. RV à planifier." },
  { id:"c-ansquer", name:"Marie Ansquer", role:"Chargée crédit", org:"CA Bretagne", email:"Marie.ANSQUER@ca-bretagne.fr", phone:"", tags:["finance","banque"], projects:["amani"], companies:["AMP"], notes:"Décalage tirage CA Bretagne → 30/04 à confirmer par écrit." },
  { id:"c-wadin", name:"Caroline Wadin", role:"Équipe AMANI", org:"CA Réunion", email:"", phone:"", tags:["banque"], projects:["amani"], companies:["AMP"], notes:"Équipe Thomas Delelis." },
  { id:"c-sirugue", name:"Alexandre Sirugue", role:"Équipe AMANI", org:"CA Réunion", email:"", phone:"", tags:["banque"], projects:["amani"], companies:["AMP"], notes:"Équipe Thomas Delelis." },

  // ───── AMANI : FF&E / Chantier / BREEAM ─────
  { id:"c-benedicte", name:"Bénédicte", role:"Architecte d'intérieur FF&E", org:"Atelier Bénédicte", email:"", phone:"", tags:["amani","ffe"], projects:["amani"], companies:["AMR","TAM"], notes:"Contrat FF&E + annexe BREEAM à finaliser. RV matériaux Mayotte lundi 27/04." },

  // ───── Subventions ─────
  { id:"c-nassebati", name:"Nassebati Saïd", role:"Instruction FEDER", org:"FEDER Mayotte", email:"", phone:"", tags:["subvention","feder"], projects:["feder"], companies:["AMP","AMR"], notes:"Dossier MYT013568 — instruction en cours." },
  { id:"c-troquier", name:"Mathilde Troquier", role:"Préparation plaquette", org:"—", email:"", phone:"", tags:["comms"], projects:["feder"], companies:["AMR"], notes:"Plaquette comptes AMR pour déblocage dossier." },

  // ───── ETIC / Intra-groupe ─────
  { id:"c-lamiae", name:"Lamiae Ouazzani-Touhami", role:"RAF", org:"ETIC Services", email:"lamiae@etic.yt", phone:"", tags:["etic","finance","famille"], projects:["sci-start","etic-depots","honoraires"], companies:["ETIC","SCIS","ADB"], notes:"Responsable administratif et financier — épouse. Pilote virements honoraires + dépôts comptables + convention SCI." },

  // ───── Famille MHSSN (SCIMB + personnel) ─────
  { id:"c-djedid", name:"Djedid Mouhoussoune", role:"Fratrie", org:"MHSSN", email:"djedid@mhssn.org", phone:"", tags:["famille","scimb"], projects:["scimb"], companies:["SCIMB"], notes:"Organise weekly catch-up famille. Co-porteur SCI Mhssn-Boustane." },
  { id:"c-chafick", name:"Chafick Mouhoussoune", role:"Fratrie", org:"PwC", email:"chafick@mhssn.org", phone:"", tags:["famille","scimb","kobi"], projects:["scimb"], companies:["SCIMB"], notes:"Cadrage KOBI + reporting — société à clarifier." },
  { id:"c-nahema", name:"Nahéma", role:"Fratrie", org:"MHSSN", email:"", phone:"", tags:["famille"], projects:[], companies:["SCIMB"], notes:"Famille MHSSN." },
  { id:"c-nair", name:"Naïr", role:"Fratrie", org:"MHSSN", email:"", phone:"", tags:["famille","ffe"], projects:[], companies:["TAM"], notes:"Coordination RV Bénédicte FF&E." },
  { id:"c-karim", name:"Karim", role:"Fratrie", org:"MHSSN", email:"", phone:"", tags:["famille","ffe"], projects:[], companies:["TAM"], notes:"Coordination RV Bénédicte FF&E." },
  { id:"c-naima", name:"Naïma", role:"Famille", org:"MHSSN", email:"", phone:"", tags:["famille","ffe"], projects:[], companies:["TAM"], notes:"Coordination RV Bénédicte FF&E." },

  // ───── Personnel ─────
  { id:"c-lamiae-perso", name:"Lamiae (Vie personnelle)", role:"Conjointe", org:"—", email:"", phone:"", tags:["personnel"], projects:[], companies:[], notes:"Séjour parents / régime marital / budget familial — hebdo dimanche." },

  // ───── ETIC Management Board ─────
  { id:"c-etic-board", name:"Management Board ETIC", role:"Équipe direction", org:"ETIC Services", email:"", phone:"", tags:["etic"], projects:[], companies:["ETIC"], notes:"QuickSync hebdo lundi 8h30 (heure locale)." },
];

/* ─────────────────────── CONSTANTES UI ─────────────────────── */
AICEO.PROJECT_COLOR = {
  amber:   { bg:"#f5e8d6", fg:"#6d4816", accent:"#b88237" },
  indigo:  { bg:"#eeebe4", fg:"#111418", accent:"#111418" },
  sky:     { bg:"#e9eef4", fg:"#3b506a", accent:"#7790ae" },
  emerald: { bg:"#e2ece8", fg:"#234236", accent:"#3d7363" },
  rose:    { bg:"#fdecdf", fg:"#8a3b1b", accent:"#d96d3e" },
  violet:  { bg:"#ece7f0", fg:"#463a54", accent:"#7a6a8a" },
};

AICEO.STATUS_BADGE = {
  active: { cls:"indigo", label:"Actif" },
  hot:    { cls:"rose",   label:"🔥 Brûlant" },
  new:    { cls:"sky",    label:"Nouveau" },
  done:   { cls:"emerald",label:"Soldé" },
  paused: { cls:"slate",  label:"En pause" },
};

AICEO.PRIORITY_BADGE = {
  critical: { cls:"rose",  label:"Critique" },
  high:     { cls:"amber", label:"Haute" },
  medium:   { cls:"sky",   label:"Moyenne" },
  low:      { cls:"slate", label:"Basse" },
};
