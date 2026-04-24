/* aiCEO – Données réelles v4 (23 avril 2026)
   REBUILD COMPLET : seed reconstruit à partir de 1 025 mails Outlook (1–23 avril 2026)
   et 56 événements calendrier (24 mars – 30 avril 2026).

   Schéma v4 (identique à v3) :
   - GROUPS : 3 grands groupes (MHSSN / AMANI / ETIC)
   - PROJECTS : attachés à un group, réalignés sur les vrais flux
   - TASKS enrichies : estimatedMin, energy, aiCapable, aiProposal, context, source (id mail/event)
   - DECISIONS : réelles, statut, owner, deadline
   - EVENTS : tirés du calendrier Outlook (24 mars → 30 avril)
   - AI_PROPOSALS : tirées de mails concrets en souffrance
   - REVIEWS : W15 → W18
*/
(function(){
  const A = (window.AICEO = window.AICEO || {});

  // ========= GROUPES (réalignés sur la vraie structure holding) =========
  A.GROUPS = [
    { id:"mhssn", name:"MHSSN Holding",   tagline:"Gouvernance · Famille · SCI", icon:"🏛️", color:"indigo", description:"Holding familial Mouhoussoune. Gouvernance, SCI Start / Adabu, assistance Affejee, FEIRASIN Holding, dossiers cyber & conformité." },
    { id:"amani", name:"Groupe AMANI",    tagline:"Hôtel & Spa Mayotte",        icon:"🌴", color:"rose",   description:"AMANI Properties / AMANI Resorts / AMANI Hospitality — chantier hôtel, financement CA Bretagne, FF&E, exploitation Viventium, certification BREEAM, FEDER." },
    { id:"etic",  name:"ETIC Services",   tagline:"Services · Mayotte",         icon:"🏝️", color:"amber",  description:"ETIC Services / ITH / LTM / AA. Facturation débours, dépôt comptes 2019-2023, accès bancaires, dossiers fonciers (Ghams)." },
  ];

  // ========= PROJETS =========
  A.PROJECTS = [
    // --- MHSSN ---
    { id:"mhssn-gouv",       group:"mhssn", name:"Gouvernance MHSSN",          tagline:"Pacte · Cyber · Famille",        status:"active", color:"indigo", icon:"🛡️", companies:["MHSSN"],                                kpi:{ open:3, overdue:1, events:2, decisions:1 }, progress:48 },
    { id:"sci-start-adabu",  group:"mhssn", name:"SCI Start / Adabu",           tagline:"Comptes + convention Affejee",   status:"hot",    color:"indigo", icon:"📐", companies:["SCI Start","SCI Adabu"],                kpi:{ open:2, overdue:0, events:1, decisions:1 }, progress:70 },
    { id:"feirasin-holding", group:"mhssn", name:"FEIRASIN Holding",            tagline:"CAM Expertise · prélèvements",   status:"active", color:"indigo", icon:"📊", companies:["FEIRASIN Holding"],                     kpi:{ open:2, overdue:1, events:0, decisions:0 }, progress:35 },
    { id:"mouhoussoune-aff", group:"mhssn", name:"Assistance Mouhoussoune",     tagline:"Affejee · honoraires forfait",   status:"active", color:"indigo", icon:"⚖️", companies:["Groupe Mouhoussoune"],                  kpi:{ open:2, overdue:1, events:1, decisions:1 }, progress:55 },

    // --- AMANI ---
    { id:"amani-credit",     group:"amani", name:"Crédits CA Bretagne",         tagline:"Contrat 02/04 · Tirage d'Avance",status:"hot",    color:"rose",   icon:"🏦", companies:["AMANI Properties","CA Bretagne","Inter-Invest"], kpi:{ open:5, overdue:0, events:2, decisions:2 }, progress:62 },
    { id:"amani-ffe",        group:"amani", name:"FF&E AMANI",                  tagline:"Contrat Franklin / Bénédicte",   status:"hot",    color:"rose",   icon:"🛋️", companies:["AMANI Hospitality","Franklin Paris","Viventium"], kpi:{ open:3, overdue:0, events:2, decisions:1 }, progress:58 },
    { id:"amani-chantier",   group:"amani", name:"Chantier AMANI",              tagline:"MOE/MOA · Vinci · Ocidim",       status:"hot",    color:"rose",   icon:"🏗️", companies:["AMANI Hospitality","Ocidim","Vinci Construction","MTCMO","Integrale","Viventium"], kpi:{ open:4, overdue:1, events:6, decisions:2 }, progress:71 },
    { id:"amani-legal",      group:"amani", name:"Dossier 96830001 AMANI-RESORTS", tagline:"Honoraires Franklin · Jeantet", status:"active", color:"rose", icon:"📜", companies:["AMANI Resorts SAS","Franklin Paris","Jeantet"], kpi:{ open:2, overdue:1, events:0, decisions:0 }, progress:40 },
    { id:"amani-exploit",    group:"amani", name:"Exploitation Viventium",      tagline:"Préouverture · staffing",        status:"active", color:"rose",   icon:"🎩", companies:["AMANI Hospitality","Viventium Hotels"],kpi:{ open:1, overdue:0, events:2, decisions:0 }, progress:25 },
    { id:"amani-feder",      group:"amani", name:"FEDER MYT013568",             tagline:"Complétude · pièces 05/05",      status:"active", color:"rose",   icon:"🇪🇺", companies:["AMANI Resorts SAS","Inter-Invest"],     kpi:{ open:2, overdue:0, events:1, decisions:0 }, progress:30 },
    { id:"amani-breeam",     group:"amani", name:"Certification BREEAM",        tagline:"Marge · reporting chantier",     status:"active", color:"rose",   icon:"🌿", companies:["AMANI Hospitality","Ocidim"],           kpi:{ open:1, overdue:0, events:1, decisions:0 }, progress:20 },

    // --- ETIC ---
    { id:"etic-services",    group:"etic",  name:"ETIC Services",               tagline:"Facturation · Dépôts comptes",   status:"active", color:"amber",  icon:"📁", companies:["ETIC Services","Affejee"],              kpi:{ open:2, overdue:0, events:1, decisions:0 }, progress:50 },
    { id:"etic-ith-ltm",     group:"etic",  name:"ITH / LTM / AA",              tagline:"Accès CA · consolidation",       status:"active", color:"amber",  icon:"🔑", companies:["ITH","LTM","AA"],                       kpi:{ open:1, overdue:0, events:0, decisions:0 }, progress:30 },
    { id:"etic-ghams",       group:"etic",  name:"Ghams parcelle 1436",         tagline:"Foncier Mayotte",                status:"new",    color:"amber",  icon:"🗺️", companies:["ETIC Services"],                        kpi:{ open:1, overdue:0, events:0, decisions:0 }, progress:10 },
  ];

  // ========= COULEURS PROJET (DA Twisty) =========
  A.PROJECT_COLOR = {
    amber:   { bg:"#f5e8d6", fg:"#6d4816", accent:"#b88237" },
    indigo:  { bg:"#e3e7ee", fg:"#2a3658", accent:"#3d4e7d" },
    sky:     { bg:"#e9eef4", fg:"#3b506a", accent:"#7790ae" },
    emerald: { bg:"#e2ece8", fg:"#234236", accent:"#3d7363" },
    rose:    { bg:"#f7dfd0", fg:"#8a3b1b", accent:"#d96d3e" },
    violet:  { bg:"#ece7f0", fg:"#463a54", accent:"#7a6a8a" },
  };

  // ========= COULEURS GROUPE (alignées avec CSS v3) =========
  A.GROUP_COLOR = {
    "mhssn": { bg:"#e3e7ee", fg:"#2a3658", accent:"#3d4e7d", soft:"#f1f4f9" },
    "amani": { bg:"#f7dfd0", fg:"#8a3b1b", accent:"#d96d3e", soft:"#fcf3ec" },
    "etic":  { bg:"#f5e8d6", fg:"#6d4816", accent:"#b88237", soft:"#faf3e6" },
  };

  // ========= TÂCHES =========
  // Schéma : { id, title, project, type, priority, due, starred, done,
  //          estimatedMin, energy, aiCapable, aiProposal?, context, source? }
  A.TASKS = [
    // === AMANI CRÉDIT (URGENT) ===
    { id:"t1",  title:"Renvoyer l'Attestation Emprunteur signée à Marie Ansquer (CA Bretagne)", project:"amani-credit", type:"do", priority:"critical", due:"2026-04-23", starred:true, done:false, estimatedMin:15, energy:"light", aiCapable:true, aiProposal:"Compiler attestation à jour + pièces CPs + envoyer mail sec", context:"email", source:"mail:URGENT AMANI PROPERTIES / Contrat de Crédits 02/04" },
    { id:"t2",  title:"Signer Attestation modifiée PRET CA via LGoA (Maeva Ferrere)",            project:"amani-credit", type:"do", priority:"critical", due:"2026-04-23", starred:true, done:false, estimatedMin:20, energy:"light", aiCapable:false, context:"deep-work", source:"mail:URGENT Attestation modifiée à signer (23/04)" },
    { id:"t3",  title:"Régulariser impayé AMANI PROPERTIES / HDM (facture 17/02)",                project:"amani-credit", type:"do", priority:"high",     due:"2026-04-24", starred:false, done:false, estimatedMin:10, energy:"light", aiCapable:true, aiProposal:"Rédiger réponse HDM + reprogrammer prélèvement", context:"email", source:"mail:AMANI PROPERTIES IMPAYE (MLGUENOT)" },
    { id:"t4",  title:"Compléter CPs restants du tirage (Inter-Invest ⇄ CA Bretagne)",           project:"amani-credit", type:"plan", priority:"high",    due:"2026-04-27", starred:true, done:false, estimatedMin:45, energy:"deep", aiCapable:true, aiProposal:"Cartographier CPs levés/restants depuis thread et prioriser", context:"deep-work", source:"mail:RE URGENT AMANI PROPERTIES Tirage d'une Avance" },

    // === AMANI FF&E ===
    { id:"t5",  title:"Transférer observations Bénédicte à Jean Hentgen (FF&E Contract)",         project:"amani-ffe", type:"do", priority:"critical", due:"2026-04-23", starred:true, done:false, estimatedMin:20, energy:"medium", aiCapable:true, aiProposal:"Synthétiser annotations PDF Bénédicte + relancer Jean", context:"email", source:"mail:Projet AMANI - FF&E Contract (chafick 22/04)" },
    { id:"t6",  title:"Valider version finale contrat FF&E (relecture + signature)",              project:"amani-ffe", type:"do", priority:"high", due:"2026-04-25", starred:true, done:false, estimatedMin:60, energy:"deep", aiCapable:true, aiProposal:"Générer checklist points à valider (annexe BREEAM, planning, paiements)", context:"deep-work", source:"mail:Projet AMANI - FF&E Contract" },
    { id:"t7",  title:"Brief RV matériaux Mayotte (mission 27/04)",                                project:"amani-ffe", type:"plan", priority:"high", due:"2026-04-24", starred:false, done:false, estimatedMin:30, energy:"medium", aiCapable:true, aiProposal:"Agenda mission + liste matériaux à challenger + budgets", context:"deep-work" },

    // === AMANI CHANTIER ===
    { id:"t8",  title:"Valider CR chantier S17 (Integrale / Viventium)",                          project:"amani-chantier", type:"do", priority:"high", due:"2026-04-24", starred:false, done:false, estimatedMin:25, energy:"medium", aiCapable:true, aiProposal:"Résumer CR + extraire 3 actions owners", context:"deep-work", source:"mail:21-02-HOT. AMANI - DET - CR Réunion" },
    { id:"t9",  title:"Statuer sur Octroi de mer AMANI (impact enveloppe)",                       project:"amani-chantier", type:"do", priority:"high", due:"2026-04-28", starred:true, done:false, estimatedMin:40, energy:"deep", aiCapable:false, context:"deep-work", source:"mail:AMANI - MOD - Octroi de mer (delafosse)" },
    { id:"t10", title:"Répondre Yann Cornec — analyse devis ENERGIE CONCEPT",                     project:"amani-chantier", type:"do", priority:"medium", due:"2026-04-25", starred:false, done:false, estimatedMin:30, energy:"medium", aiCapable:true, aiProposal:"Rédiger position technique vs devis D-260628", context:"email", source:"mail:21-02-HOT. AMANI - GTC - Analyse devis ENERGIE CONCEPT" },
    { id:"t11", title:"Préparer Comité de pilotage AMANI 28/04 (Ocidim/Vinci)",                   project:"amani-chantier", type:"plan", priority:"high", due:"2026-04-27", starred:true, done:false, estimatedMin:45, energy:"deep", aiCapable:true, aiProposal:"ODJ + points FTM/FF&E + relance Marge pour BREEAM", context:"meeting", source:"event:Comité pilotage 28/04" },
    { id:"t12", title:"Confirmer nouvelle date Réunion BREEAM (après 30/04 avec Marge)",          project:"amani-breeam",  type:"delegate", priority:"medium", due:"2026-04-24", starred:false, done:false, estimatedMin:10, energy:"light", aiCapable:true, aiProposal:"Proposer 3 créneaux début mai à Marge + Ocidim", context:"email", source:"mail:Réunion BREEAM - Hôtel AMANI" },
    { id:"t13", title:"Arbitrer choix prestataire piscine AMANI",                                  project:"amani-chantier", type:"do", priority:"high", due:"2026-04-28", starred:true, done:false, estimatedMin:60, energy:"deep", aiCapable:false, context:"meeting" },
    { id:"t14", title:"Archiver/traiter alertes ArchiLid (plate-forme projet)",                    project:"amani-chantier", type:"delegate", priority:"low", due:"2026-04-28", starred:false, done:false, estimatedMin:15, energy:"light", aiCapable:true, aiProposal:"Filtrer alertes par projet + extraire rappels actionnables", context:"email", source:"mail:Alerte ArchiLid (3 mails récents)" },

    // === AMANI LEGAL / HONORAIRES FRANKLIN ===
    { id:"t15", title:"Exécuter virement honoraires Franklin (Alamowitch)",                       project:"amani-legal", type:"do", priority:"critical", due:"2026-04-23", starred:true, done:false, estimatedMin:10, energy:"light", aiCapable:false, context:"deep-work", source:"mail:Honoraires Franklin (08/04 + relance 22/04)" },
    { id:"t16", title:"Confirmer virements déjà passés à Franklin (Machinet)",                    project:"amani-legal", type:"do", priority:"high", due:"2026-04-24", starred:false, done:false, estimatedMin:15, energy:"light", aiCapable:true, aiProposal:"Joindre justificatifs Qonto + mail réponse Machinet", context:"email", source:"mail:Dossier 96830001 - AMANI-RESORTS SAS (23/04)" },

    // === AMANI EXPLOIT / FEDER ===
    { id:"t17", title:"Transmettre pièces FEDER MYT013568 avant 05/05 (Nassebati)",               project:"amani-feder", type:"do", priority:"high", due:"2026-05-04", starred:true, done:false, estimatedMin:90, energy:"deep", aiCapable:true, aiProposal:"Lister pièces manquantes depuis lettre de complétude + cadrer owners", context:"deep-work", source:"mail:INSTRUCTION FEDER MYT013568 (23/04)" },
    { id:"t18", title:"Clarifier avec Inter-Invest (Delpech) signature attestation TVA FEDER",    project:"amani-feder", type:"do", priority:"medium", due:"2026-04-28", starred:false, done:false, estimatedMin:20, energy:"medium", aiCapable:true, aiProposal:"Synthèse position SA AMANI Properties + option alternative", context:"email", source:"mail:[FEDER] Attestation non récupération TVA" },

    // === MHSSN ===
    { id:"t19", title:"Payer honoraires Affejee (dossier AMANI — 3ᵉ relance)",                    project:"mouhoussoune-aff", type:"do", priority:"critical", due:"2026-04-23", starred:true, done:false, estimatedMin:10, energy:"light", aiCapable:false, context:"deep-work", source:"mail:TR groupe MOUHOUSSOUNE assistance + RE approbation comptes (23/04)" },
    { id:"t20", title:"Valider convention modifiée Affejee (forfait 2025 inclus)",                project:"sci-start-adabu",  type:"do", priority:"high", due:"2026-04-25", starred:true, done:false, estimatedMin:40, energy:"deep", aiCapable:true, aiProposal:"Diff convention v1 vs v2 + points de vigilance", context:"deep-work", source:"mail:RE approbation comptes sci start et adabu (21/04)" },
    { id:"t21", title:"Résoudre prélèvement CAM Expertise échoué (FEIRASIN Holding)",              project:"feirasin-holding", type:"do", priority:"high", due:"2026-04-24", starred:false, done:false, estimatedMin:15, energy:"light", aiCapable:true, aiProposal:"Vérifier solde Qonto FEIRASIN + relancer GoCardless", context:"email", source:"mail:Votre paiement à CAM EXPERTISE a échoué (gocardless 23/04)" },
    { id:"t22", title:"Traiter demandes Tiime CAM Expertise (FEIRASIN Holding)",                  project:"feirasin-holding", type:"delegate", priority:"medium", due:"2026-04-28", starred:false, done:false, estimatedMin:20, energy:"light", aiCapable:true, aiProposal:"Compiler pièces compta + déléguer à DG FEIRASIN", context:"email", source:"mail:FEIRASIN HOLDING - CAM EXPERTISE demandes (tiime)" },
    { id:"t23", title:"Vérifier mails suspects ALEFPA (cyberattaque 21/04)",                      project:"mhssn-gouv", type:"do", priority:"high", due:"2026-04-24", starred:true, done:false, estimatedMin:15, energy:"light", aiCapable:true, aiProposal:"Scanner inbox mots-clés ALEFPA + marquer + alerter équipe", context:"email", source:"mail:IMPORTANT CYBER ATTAQUE (ALEFPA 21/04)" },
    { id:"t24", title:"Prendre décision suite Courrier du médecin (famille)",                     project:"mhssn-gouv", type:"do", priority:"medium", due:"2026-04-25", starred:false, done:false, estimatedMin:15, energy:"medium", aiCapable:false, context:"phone", source:"mail:Courrier du médecin (goulamhoussen 23/04)" },

    // === ETIC ===
    { id:"t25", title:"Régler facture débours Affejee ETIC (dépôts comptes 2019-2023)",           project:"etic-services", type:"do", priority:"high", due:"2026-04-25", starred:false, done:false, estimatedMin:10, energy:"light", aiCapable:false, context:"deep-work", source:"mail:ETIC SERVICES - Facturation débours - Dépôts 2019-2022" },
    { id:"t26", title:"Consolider accès bancaires ETIC / ITH / LTM / AA (CA)",                    project:"etic-ith-ltm",  type:"plan", priority:"medium", due:"2026-05-02", starred:false, done:false, estimatedMin:45, energy:"medium", aiCapable:true, aiProposal:"Matrice accès par société + propositions simplification", context:"deep-work", source:"mail:Accès personnalisés aux comptes CA - ETIC/ITH/LTM/AA (direction-af 09/04)" },
    { id:"t27", title:"Suivre dossier Ghams parcelle 1436",                                        project:"etic-ghams", type:"plan", priority:"low", due:"2026-05-10", starred:false, done:false, estimatedMin:30, energy:"medium", aiCapable:false, context:"deep-work", source:"mail:Ghams parcelle 1436 (16/04)" },
    { id:"t28", title:"Traiter relance facture TERAO N°25.01060",                                  project:"etic-services", type:"delegate", priority:"medium", due:"2026-04-28", starred:false, done:false, estimatedMin:15, energy:"light", aiCapable:true, aiProposal:"Rédiger réponse TERAO + vérifier statut virement", context:"email", source:"mail:URGENT TERAO Relance facture (21/04)" },
  ];

  // ========= DÉCISIONS =========
  A.DECISIONS = [
    { id:"d1", title:"Tirage d'Avance AMANI PROPERTIES — conditions suspensives",  date:"2026-04-23", project:"amani-credit", parties:["Feyçoil","Marie Ansquer (CA Bretagne)","Olivia You (Inter-Invest)"], outcome:"CPs acceptés sous réserve Attestation Emprunteur renvoyée le matin du tirage.", rationale:"Tirage d'avance nécessaire pour tenir planning FF&E + chantier.", status:"to-execute", owner:"Feyçoil", deadline:"2026-04-24", tags:["banque","AMANI","urgent"] },
    { id:"d2", title:"Attestation modifiée PRET CA — signature parents",           date:"2026-04-23", project:"amani-credit", parties:["Feyçoil","Maeva Ferrere (LGoA)","Parents Mouhoussoune"], outcome:"Attestation à régulariser via étude LGoA d'ici 24/04.", rationale:"Urgence notariale avant tirage.", status:"to-execute", owner:"Feyçoil", deadline:"2026-04-24", tags:["juridique","AMANI","notaire"] },
    { id:"d3", title:"Convention Affejee forfait 2025 inclus (SCI Start/Adabu)",   date:"2026-04-21", project:"sci-start-adabu", parties:["Feyçoil","Lamiae","David Affejee"], outcome:"Convention modifiée envoyée — go dès validation MHSSN.", rationale:"Régulariser le forfait avant approbation des comptes.", status:"to-execute", owner:"Feyçoil", deadline:"2026-04-25", tags:["juridique","SCI"] },
    { id:"d4", title:"Report Réunion BREEAM après 30/04",                           date:"2026-04-21", project:"amani-breeam", parties:["Feyçoil","Rémi Giannetti (Ocidim)","Michel Delafosse (MTCMO)","Marge"], outcome:"Créneau initial abandonné, 3 propositions à envoyer.", rationale:"Indisponibilité Marge cette semaine.", status:"to-execute", owner:"Ocidim", deadline:"2026-04-30", tags:["chantier","certification"] },
    { id:"d5", title:"Octroi de mer AMANI — impact enveloppe à chiffrer",           date:"2026-04-17", project:"amani-chantier", parties:["Feyçoil","Michel Delafosse (MTCMO)","Rémi Giannetti (Ocidim)"], outcome:"Sujet à instruire : impact potentiel sur enveloppe financière.", rationale:"Soulevé post-réunion MOD 17/04.", status:"to-execute", owner:"MTCMO", deadline:"2026-04-30", tags:["AMANI","finance"] },
    { id:"d6", title:"Acter version finale contrat FF&E (Franklin/Bénédicte)",      date:"2026-04-22", project:"amani-ffe", parties:["Feyçoil","Chafick","Jean Hentgen (Franklin)","Bénédicte"], outcome:"Observations Bénédicte à intégrer puis signature cible 25/04.", rationale:"Bloquant pour mission Mayotte 27/04.", status:"to-execute", owner:"Feyçoil", deadline:"2026-04-25", tags:["AMANI","contrat"] },
    { id:"d7", title:"Vigilance cyber ALEFPA — messages suspects 20/04 14h-15h",    date:"2026-04-21", project:"mhssn-gouv", parties:["Feyçoil","Contacts ALEFPA"], outcome:"Scanner boîtes sur période impactée, flag et suppression.", rationale:"Risque phishing latéral depuis compte ALEFPA compromis.", status:"executed", owner:"Feyçoil", deadline:"2026-04-22", tags:["cyber","conformité"] },
    { id:"d8", title:"Prélèvement CAM Expertise à rejouer — FEIRASIN Holding",      date:"2026-04-23", project:"feirasin-holding", parties:["Feyçoil","GoCardless","CAM Expertise"], outcome:"Reprogrammer prélèvement 180 € après solde Qonto.", rationale:"Paiement rejeté mécaniquement.", status:"to-execute", owner:"Feyçoil", deadline:"2026-04-25", tags:["trésorerie"] },
    { id:"d9", title:"Exploitation AMANI — limites de prestations FTM/FF&E",        date:"2026-04-21", project:"amani-exploit", parties:["Feyçoil","Rémi Giannetti (Ocidim)","Viventium","Vinci"], outcome:"Comité 28/04 dédié à l'ODJ limites FTM / FF&E.", rationale:"Clarifier périmètres avant commandes.", status:"to-execute", owner:"Ocidim", deadline:"2026-04-28", tags:["AMANI","exploit"] },
    { id:"d10", title:"Dépôt FEDER MYT013568 — pièces avant 05/05",                  date:"2026-04-23", project:"amani-feder", parties:["Feyçoil","Nassebati Said (Europe-à-Mayotte)","Inter-Invest"], outcome:"Rassembler et transmettre pièces de complétude.", rationale:"Échéance réglementaire stricte.", status:"to-execute", owner:"Feyçoil", deadline:"2026-05-05", tags:["subvention","AMANI"] },
  ];

  // ========= ÉVÉNEMENTS (tirés calendrier Outlook) =========
  A.EVENTS = [
    // Passés
    { id:"e1",  title:"Comité de pilotage Hôtel AMANI (Ocidim)",                 date:"2026-04-14T09:00", duration_min:120, category:"amani",   project:"amani-chantier", location:"Teams", attendees:["Feyçoil","Rémi Giannetti","Philippe Bourget (Vinci)","Michel Delafosse (MTCMO)"], prep_needed:false },
    { id:"e2",  title:"AMANI Hôtel : Comité d'exécution",                         date:"2026-04-17T09:00", duration_min:120, category:"amani",   project:"amani-chantier", location:"Vinci Teams Room", attendees:["Feyçoil","el-nachdy.selemani","Philippe Bourget","Michel Delafosse","Rémi Giannetti"], prep_needed:false },
    { id:"e3",  title:"Projet AMANI — FF&E Contract",                             date:"2026-04-16T15:00", duration_min:60, category:"amani",   project:"amani-ffe",     location:"Teams", attendees:["Feyçoil","Chafick","Djedid","Jean Hentgen (Franklin)"], prep_needed:false },
    { id:"e4",  title:"21-02-HOT. AMANI — MOE/MOA — Exploitant",                  date:"2026-04-22T13:00", duration_min:120, category:"amani",  project:"amani-chantier", location:"Teams", attendees:["Feyçoil","Yann Cornec (Integrale)","Djedid","Rémi Giannetti","Christophe Carlier (Viventium)"], prep_needed:false },
    { id:"e5",  title:"AMANI PROPERTIES — déblocage CA Réunion",                  date:"2026-04-21T10:00", duration_min:30, category:"amani",    project:"amani-credit",   location:"Teams", attendees:["Feyçoil","Thomas Delelis (CA Réunion)","Caroline Wadin (Inter-Invest)","Alexandre Sirugue (LGoA)","Marie Ansquer (CA Bretagne)"], prep_needed:false },
    { id:"e6",  title:"Weekly catch-up MHSSN",                                    date:"2026-04-22T18:00", duration_min:60, category:"mhssn",    project:"mhssn-gouv",     location:"Teams", attendees:["Feyçoil","Chafick","Djedid","Nahema","Nair","Karim","Chafick Mouhoussoune (PwC)"], prep_needed:false },
    { id:"e7",  title:"⚡ QuickSync Hebdo — Management Board ETIC",                date:"2026-04-20T08:30", duration_min:30, category:"etic",    project:"etic-services", location:"Teams", attendees:["Feyçoil","Mouhamadil","Johan","Sikina","Zayed","Lamiae","Imane","Soibahadini"], prep_needed:false },
    { id:"e8",  title:"Réunion chantier AMANI (récurrent jeudi)",                 date:"2026-04-16T07:00", duration_min:150, category:"amani",  project:"amani-chantier", location:"Mayotte", attendees:["Feyçoil"], prep_needed:false },

    // À venir (≥ 23/04)
    { id:"e9",  title:"Réunion chantier AMANI",                                   date:"2026-04-23T07:00", duration_min:150, category:"amani",  project:"amani-chantier", location:"Mayotte", attendees:["Feyçoil"], prep_needed:true },
    { id:"e10", title:"Vie Feycoil + Lamiae — formalité mariage / budget",        date:"2026-04-26T17:45", duration_min:135, category:"personal", project:null,            location:"Teams", attendees:["Feyçoil","Lamiae"], prep_needed:true },
    { id:"e11", title:"⚡ QuickSync ETIC Management Board",                        date:"2026-04-27T08:30", duration_min:30, category:"etic",    project:"etic-services", location:"Teams", attendees:["Feyçoil","Mouhamadil","Johan","Sikina","Zayed","Lamiae","Imane","Soibahadini"], prep_needed:true },
    { id:"e12", title:"Weekly catch-up MHSSN",                                    date:"2026-04-27T18:30", duration_min:60, category:"mhssn",   project:"mhssn-gouv",     location:"Teams", attendees:["Feyçoil","Chafick","Djedid","Nahema","Nair","Karim","PwC"], prep_needed:true },
    { id:"e13", title:"Comité de pilotage Hôtel AMANI — limites FTM/FF&E",        date:"2026-04-28T09:00", duration_min:120, category:"amani",  project:"amani-chantier", location:"Teams", attendees:["Feyçoil","Rémi Giannetti","Philippe Bourget","Michel Delafosse","el-nachdy.selemani"], prep_needed:true },
    { id:"e14", title:"Réunion chantier AMANI",                                   date:"2026-04-30T07:00", duration_min:150, category:"amani",  project:"amani-chantier", location:"Mayotte", attendees:["Feyçoil"], prep_needed:true },
    { id:"e15", title:"Mission Mayotte — matériaux + visite chantier",            date:"2026-04-27T10:00", duration_min:360, category:"amani",  project:"amani-ffe",      location:"Mayotte", attendees:["Feyçoil","Équipe technique ETIC"], prep_needed:true },
    { id:"e16", title:"Signature contrat FF&E AMANI",                             date:"2026-04-25T15:00", duration_min:60, category:"amani",   project:"amani-ffe",      location:"Teams", attendees:["Feyçoil","Bénédicte","Jean Hentgen"], prep_needed:true },
    { id:"e17", title:"Rdv notaire LGoA — Attestation modifiée",                  date:"2026-04-24T10:00", duration_min:45, category:"amani",   project:"amani-credit",   location:"Étude LGoA", attendees:["Feyçoil","Maeva Ferrere","Alexandre Sirugue"], prep_needed:true },
    { id:"e18", title:"Réunion BREEAM AMANI (date cible)",                        date:"2026-05-05T10:00", duration_min:90, category:"amani",   project:"amani-breeam",   location:"Teams", attendees:["Feyçoil","Marge","Rémi Giannetti","Michel Delafosse"], prep_needed:true },
    { id:"e19", title:"Call Olivia You (Inter-Invest) — CPs restants",            date:"2026-04-24T11:30", duration_min:30, category:"amani",   project:"amani-credit",   location:"Teams", attendees:["Feyçoil","Olivia You","Caroline Wadin"], prep_needed:true },
    { id:"e20", title:"Dépôt dossier FEDER MYT013568 (envoi)",                    date:"2026-05-04T17:00", duration_min:30, category:"amani",   project:"amani-feder",    location:"Dématérialisé", attendees:["Feyçoil"], prep_needed:true },
    { id:"e21", title:"Mission Mayotte — retour & debrief",                        date:"2026-04-29T18:00", duration_min:60, category:"amani",  project:"amani-ffe",      location:"Visio", attendees:["Feyçoil","Bénédicte","Viventium"], prep_needed:false },
    { id:"e22", title:"Point honoraires Franklin (Machinet)",                     date:"2026-04-24T09:30", duration_min:30, category:"amani",   project:"amani-legal",    location:"Téléphone", attendees:["Feyçoil","Géraldine Machinet"], prep_needed:false },
    { id:"e23", title:"Call Marie Ansquer — confirmation tirage",                 date:"2026-04-24T14:00", duration_min:30, category:"amani",   project:"amani-credit",   location:"Téléphone", attendees:["Feyçoil","Marie Ansquer"], prep_needed:false },
    { id:"e24", title:"Arbitrage piscine AMANI — visite fournisseurs",            date:"2026-04-28T14:00", duration_min:120, category:"amani",  project:"amani-chantier", location:"Mayotte", attendees:["Feyçoil","Bénédicte"], prep_needed:true },
    { id:"e25", title:"AG approbation comptes SCI Start + Adabu",                 date:"2026-05-06T10:00", duration_min:90, category:"mhssn",   project:"sci-start-adabu", location:"Affejee Cabinet", attendees:["Feyçoil","David Affejee","Lamiae","Chafick"], prep_needed:true },
  ];

  // ========= CONTACTS (tirés des top senders réels) =========
  A.CONTACTS = [
    { id:"c1",  name:"Marie Ansquer",        org:"CA Bretagne",          role:"Chargée d'affaires AMANI",          email:"marie.ansquer@ca-bretagne.fr",        phone:"+33 2 99 xx xx xx", tags:["banque","priorité"],      projects:["amani-credit"] },
    { id:"c2",  name:"Olivia You",            org:"Inter-Invest",         role:"Montage financier",                 email:"olivia.you@inter-invest.fr",          phone:"+33 1 42 xx xx xx", tags:["finance","priorité"],    projects:["amani-credit","amani-feder"] },
    { id:"c3",  name:"Caroline Wadin",        org:"Inter-Invest",         role:"Directrice projets",                email:"caroline.wadin@inter-invest.fr",       phone:"+33 1 42 xx xx xx", tags:["finance","priorité"],    projects:["amani-credit"] },
    { id:"c4",  name:"Thérèse Ho",            org:"Inter-Invest",         role:"Gestion dossier",                   email:"therese.ho@inter-invest.fr",           phone:"+33 1 42 xx xx xx", tags:["finance"],                projects:["amani-credit"] },
    { id:"c5",  name:"Alexandre Sirugue",    org:"LGoA Notaires",         role:"Notaire",                           email:"alexandre.sirugue@lgoa.notaires.fr",   phone:"+33 1 45 xx xx xx", tags:["juridique","priorité"],  projects:["amani-credit"] },
    { id:"c6",  name:"Maeva Ferrere",         org:"LGoA Notaires",         role:"Clerc de notaire",                  email:"maeva.ferrere@lgoa.notaires.fr",       phone:"+33 1 45 xx xx xx", tags:["juridique"],              projects:["amani-credit"] },
    { id:"c7",  name:"Jean Hentgen",          org:"Franklin Paris",        role:"Avocat — FF&E",                     email:"jhentgen@franklin-paris.com",          phone:"+33 1 45 02 79 24", tags:["juridique","priorité"],  projects:["amani-ffe"] },
    { id:"c8",  name:"Stéphan Alamowitch",   org:"Franklin Paris",        role:"Avocat à la Cour — honoraires",     email:"salamowitch@franklin-paris.com",       phone:"+33 1 45 02 79 24", tags:["juridique"],              projects:["amani-legal"] },
    { id:"c9",  name:"Géraldine Machinet",   org:"Franklin Paris",        role:"Comptabilité cabinet",              email:"gmachinet@franklin-paris.com",         phone:"+33 1 45 02 79 24", tags:["compta"],                 projects:["amani-legal"] },
    { id:"c10", name:"Michel Delafosse",     org:"MTCMO",                 role:"MOD / MOA chantier AMANI",          email:"michel.delafosse@mtcmo.fr",            phone:"+262 6 xx xx xx xx", tags:["chantier","priorité"],  projects:["amani-chantier"] },
    { id:"c11", name:"Yann Cornec",           org:"Integrale",             role:"MOE AMANI",                         email:"yann.cornec@integrale.re",             phone:"+262 6 xx xx xx xx", tags:["chantier","priorité"], projects:["amani-chantier"] },
    { id:"c12", name:"Rémi Giannetti",        org:"Ocidim",                role:"Pilotage AMANI",                    email:"remi.giannetti@ocidim.fr",             phone:"+33 6 xx xx xx xx", tags:["chantier","priorité"],  projects:["amani-chantier","amani-breeam","amani-exploit"] },
    { id:"c13", name:"el-nachdy Selemani",    org:"Ocidim / SMTPC",        role:"Comité exécution AMANI",            email:"el-nachdy.selemani@ocidim.fr",         phone:"+262 6 xx xx xx xx", tags:["chantier"],              projects:["amani-chantier"] },
    { id:"c14", name:"Philippe Bourget",      org:"Vinci Construction",    role:"Entreprise générale",               email:"Philippe.BOURGET@vinci-construction.com", phone:"+33 6 xx xx xx xx", tags:["chantier"],          projects:["amani-chantier"] },
    { id:"c15", name:"Christophe Carlier",    org:"Viventium Hotels",      role:"Exploitant AMANI",                  email:"christophecarlier@viventiumhotels.com", phone:"+33 6 xx xx xx xx", tags:["exploit","priorité"],  projects:["amani-exploit","amani-chantier"] },
    { id:"c16", name:"David Affejee",         org:"Affejee & Associés",    role:"Avocat conseil famille",            email:"david.affejee@affejee-avocats.com",    phone:"+262 6 xx xx xx xx", tags:["juridique","famille"], projects:["mouhoussoune-aff","sci-start-adabu","etic-services"] },
    { id:"c17", name:"Mathilde Troquier",     org:"Affejee & Associés",    role:"Juriste",                            email:"mathilde.troquier@affejee-avocats.com",phone:"+262 6 xx xx xx xx", tags:["juridique"],              projects:["etic-services"] },
    { id:"c18", name:"Chafick Mouhoussoune", org:"MHSSN",                 role:"Associé / famille",                 email:"chafick@mhssn.org",                    phone:"+262 6 xx xx xx xx", tags:["famille","priorité"],   projects:["amani-ffe","mhssn-gouv"] },
    { id:"c19", name:"Djedid Mouhoussoune",  org:"MHSSN",                 role:"Associé / famille",                 email:"djedid@mhssn.org",                     phone:"+262 6 xx xx xx xx", tags:["famille","priorité"],   projects:["amani-legal","mhssn-gouv"] },
    { id:"c20", name:"Thomas Delelis",        org:"CA Réunion",            role:"Chargé d'affaires AMANI",           email:"Thomas.DELELIS@ca-reunion.fr",         phone:"+262 2 62 xx xx xx", tags:["banque"],                projects:["amani-credit"] },
    { id:"c21", name:"Nassebati Said",        org:"Europe à Mayotte",      role:"Instructrice FEDER",                email:"nassebati.said@europe-a-mayotte.yt",    phone:"+262 2 69 xx xx xx", tags:["subvention","priorité"], projects:["amani-feder"] },
    { id:"c22", name:"Natacha Chaney",        org:"CVS Avocats",           role:"Avocat conseil",                    email:"NChaney@cvs-avocats.com",               phone:"+33 1 xx xx xx xx", tags:["juridique"],              projects:["amani-credit","mhssn-gouv"] },
    { id:"c23", name:"Bénédicte DG Design",   org:"BdG Design",            role:"Design & FF&E AMANI",               email:"bdegdesign@gmail.com",                 phone:"+33 6 xx xx xx xx", tags:["design","priorité"],     projects:["amani-ffe"] },
    { id:"c24", name:"Mouhamadil",            org:"ETIC Services",         role:"Board member",                      email:"Mouhamadil@etic.yt",                   phone:"+262 6 xx xx xx xx", tags:["exec"],                   projects:["etic-services"] },
    { id:"c25", name:"Lamiae",                org:"MHSSN / ETIC",          role:"Famille · Co-pilote",               email:"lamiae@etic.yt",                        phone:"+262 6 xx xx xx xx", tags:["famille","exec"],        projects:["etic-services","sci-start-adabu"] },
  ];

  // ========= ORGANISATIONS =========
  A.COMPANIES = [
    { id:"mhssn",        name:"MHSSN",                  group:"mhssn", kind:"Holding familial" },
    { id:"feirasin",     name:"FEIRASIN Holding",       group:"mhssn", kind:"Holding" },
    { id:"sci-start",    name:"SCI Start",              group:"mhssn", kind:"SCI" },
    { id:"sci-adabu",    name:"SCI Adabu",              group:"mhssn", kind:"SCI" },
    { id:"amani-props",  name:"AMANI Properties SA",    group:"amani", kind:"Foncière hôtelière" },
    { id:"amani-resorts",name:"AMANI Resorts SAS",      group:"amani", kind:"Société d'exploitation" },
    { id:"amani-hosp",   name:"AMANI Hospitality",      group:"amani", kind:"Exploitation hôtelière" },
    { id:"etic-services",name:"ETIC Services",          group:"etic",  kind:"Société de services" },
    { id:"ith",          name:"ITH",                    group:"etic",  kind:"Société de services" },
    { id:"ltm",          name:"LTM",                    group:"etic",  kind:"Société de services" },
    { id:"aa",           name:"AA",                     group:"etic",  kind:"Société de services" },
  ];

  // ========= AI_PROPOSALS (toutes ancrées sur mails/events réels) =========
  A.AI_PROPOSALS = [
    { id:"p1", kind:"email-draft", title:"Brouillon : envoi Attestation Emprunteur à Marie Ansquer", source:"task:t1", urgency:"now", estimatedGain:"~10 min", status:"pending",
      summary:"Récap CPs levés + Attestation signée + pièces jointes.",
      rationale:"Tirage CA Bretagne bloque si l'attestation n'arrive pas le matin du tirage.",
      preview:"Chère Marie,\n\nComme convenu, veuillez trouver ci-joint :\n• l'Attestation Emprunteur signée,\n• le récapitulatif des CPs levés à date,\n• les pièces Inter-Invest mises à jour (envoyées par Olivia You).\n\nRestant disponible pour toute précision.\n\nCordialement,\nFeyçoil Mouhoussoune"
    },
    { id:"p2", kind:"email-draft", title:"Brouillon : transfert observations Bénédicte → Jean Hentgen", source:"task:t5", urgency:"now", estimatedGain:"~8 min", status:"pending",
      summary:"Relaye annotations PDF + demande version finale contrat.",
      rationale:"Déblocage FF&E avant signature 25/04 + mission Mayotte 27/04.",
      preview:"Cher Jean,\n\nJe te transmets ci-joint les observations de Bénédicte sur la dernière version du contrat FF&E. Peux-tu intégrer ses remarques et nous renvoyer une V finale avant vendredi midi, pour signature en début de semaine prochaine ?\n\nMerci encore pour ta disponibilité,\nFeyçoil"
    },
    { id:"p3", kind:"email-draft", title:"Brouillon : réponse FEDER MYT013568 à Nassebati Said", source:"task:t17", urgency:"this-week", estimatedGain:"~20 min", status:"pending",
      summary:"Accusé + plan de transmission des pièces avant 05/05.",
      rationale:"Échéance FEDER stricte.",
      preview:"Bonjour Madame Said,\n\nBonne réception de votre lettre de complétude. Nous mobilisons les équipes pour vous transmettre les pièces manquantes avant le 05/05/2026 inclus. Un premier lot vous parviendra en début de semaine prochaine.\n\nBien cordialement,\nFeyçoil Mouhoussoune"
    },
    { id:"p4", kind:"meeting-prep", title:"Préparation : Comité de pilotage AMANI 28/04", source:"event:e13", urgency:"this-week", estimatedGain:"~45 min", status:"pending",
      summary:"ODJ + matrice limites FTM/FF&E + 3 arbitrages clés.",
      rationale:"Ordre du jour : limites de prestations FTM et FF&E (Ocidim).",
      preview:"ODJ proposé :\n1. Limites FTM vs FF&E — validation matrice (Ocidim 20')\n2. Arbitrage prestataire piscine (Feyçoil 15')\n3. Suivi Octroi de mer — impact enveloppe (MTCMO 20')\n4. CR chantier S17 + actions S18 (Integrale/Viventium 25')\n5. Divers (20')"
    },
    { id:"p5", kind:"task-from-event", title:"Créer tâches de prép. (9 événements prep_needed)", source:"events", urgency:"this-week", estimatedGain:"~20 min", status:"pending",
      summary:"9 rdv ont 'prep_needed' sans tâche rattachée.",
      rationale:"Auto-détection : événements futurs avec prep_needed=true et aucune tâche linkée.",
      preview:"Événements : e9 (chantier 23/04), e10 (Lamiae), e11 (QuickSync), e12 (Weekly MHSSN), e13 (CoPil AMANI), e14 (chantier 30/04), e15 (mission Mayotte), e16 (signature FF&E), e17 (rdv LGoA), e18 (BREEAM), e19 (CPs), e20 (FEDER), e25 (AG SCI)."
    },
    { id:"p6", kind:"workload-rebalance", title:"Vendredi 24/04 surchargé — lisser", source:"calendar", urgency:"now", estimatedGain:"Réduire risque", status:"pending",
      summary:"Vendredi 24/04 : 5 tâches critiques + 3 rdv (Rdv LGoA, Machinet, Ansquer).",
      rationale:"> 7h de charge, risque saturation.",
      preview:"Proposition : décaler t7 (brief RV matériaux) au week-end matin ; pousser t21 (CAM Expertise) sur lundi 27/04."
    },
    { id:"p7", kind:"summary", title:"Synthèse : 7 décisions à exécuter cette semaine", source:"decisions", urgency:"now", estimatedGain:"~5 min", status:"pending",
      summary:"7 décisions 'to-execute' avec deadline ≤ 30/04.",
      rationale:"Revue avant CoPil 28/04.",
      preview:"1. d1 — Tirage CA Bretagne (24/04)\n2. d2 — Attestation modifiée LGoA (24/04)\n3. d3 — Convention Affejee SCI (25/04)\n4. d6 — Contrat FF&E signature (25/04)\n5. d8 — Prélèvement CAM à rejouer (25/04)\n6. d4 — BREEAM nouvelle date (30/04)\n7. d9 — Limites FTM/FF&E CoPil (28/04)"
    },
    { id:"p8", kind:"email-draft", title:"Brouillon : relance prestataires Octroi de mer (MTCMO)", source:"task:t9", urgency:"this-week", estimatedGain:"~10 min", status:"pending",
      summary:"Demande synthèse impact Octroi de mer sur enveloppe AMANI.",
      rationale:"Sujet soulevé le 17/04, toujours sans chiffrage.",
      preview:"Bonjour Michel,\n\nPour préparer le CoPil du 28/04, pourrais-tu nous transmettre la synthèse chiffrée de l'impact Octroi de mer sur l'enveloppe financière AMANI ? Idéal : fourchette basse / fourchette haute + risques associés.\n\nMerci d'avance,\nFeyçoil"
    },
    { id:"p9", kind:"automation", title:"Auto-archiver alertes ArchiLid récurrentes", source:"task:t14", urgency:"this-week", estimatedGain:"~15 min/semaine", status:"pending",
      summary:"3 alertes ArchiLid reçues en 10 jours, peu actionnables.",
      rationale:"Règle mail : classer auto dans dossier 'Veille chantier' + extraire uniquement rappels à échéance 7j.",
      preview:"Proposition : règle Outlook 'From:archi-lid-ne-pas-repondre@archilid.fr → dossier Veille chantier' + digest hebdo généré par aiCEO."
    },
  ];

  // ========= REVUES HEBDO =========
  A.REVIEWS = [
    { id:"w15", week:"2026-W15", label:"S15 — 6-12 avril", status:"archived", progress:78,
      intention:"Sécuriser le contrat de crédits AMANI (CA Bretagne, signature 02/04) et solder attestations FEDER.",
      bigRocks:["Signer Contrat de Crédits 02/04","Relance honoraires Franklin","Cadrer attestation TVA FEDER"],
      done:["Contrat de Crédits AMANI PROPERTIES signé 02/04","Honoraires Franklin facturés 08/04"],
      pending:["Attestation TVA FEDER — position Inter-Invest à clarifier"],
      decisions:[],
      mood:"productive", notes:"Signature crédit OK — mais tirage encore à caler."
    },
    { id:"w16", week:"2026-W16", label:"S16 — 13-19 avril", status:"archived", progress:62,
      intention:"Aligner MOE/MOA + Viventium sur chantier AMANI ; lancer revue contrat FF&E.",
      bigRocks:["CoPil AMANI 14/04","Comité exécution AMANI 17/04","Revue FF&E Contract"],
      done:["CoPil 14/04 tenu","Comité exécution 17/04 tenu","V1 contrat FF&E reçue"],
      pending:["Octroi de mer — à instruire","FF&E Contract — relance Bénédicte"],
      decisions:["d5 — Octroi de mer à instruire"],
      mood:"intense", notes:"Chantier dense, exploitant Viventium bien intégré."
    },
    { id:"w17", week:"2026-W17", label:"S17 — 20-26 avril", status:"current", progress:40,
      intention:"Débloquer le tirage d'avance AMANI (attestations CA Bretagne + LGoA), signer contrat FF&E, et solder honoraires Affejee/Franklin.",
      bigRocks:[
        "URGENT — Attestation Emprunteur + Attestation modifiée LGoA (tirage CA Bretagne)",
        "FF&E AMANI — intégrer observations Bénédicte et signer contrat Franklin 25/04",
        "MHSSN — régler honoraires Affejee (3ᵉ relance) + valider convention SCI Start/Adabu"
      ],
      done:[],
      pending:["Attestations (t1, t2)","Transfert obs Bénédicte (t5)","Honoraires Affejee (t19)"],
      decisions:["d1 — Tirage CA Bretagne","d2 — Attestation LGoA","d3 — Convention Affejee","d6 — Contrat FF&E"],
      mood:"urgent", notes:"Semaine critique : 3 échéances bancaires + signature FF&E + pièces FEDER à cadrer."
    },
    { id:"w18", week:"2026-W18", label:"S18 — 27 avril-3 mai", status:"upcoming", progress:0,
      intention:"(À définir dimanche — générable automatiquement depuis tâches/events S18)",
      bigRocks:[],
      done:[],
      pending:[],
      decisions:[],
      mood:"pending", notes:"Big items probables : mission Mayotte 27/04, CoPil AMANI 28/04, Dépôt FEDER 05/05, AG SCI 06/05."
    },
  ];

  // ========= RACCOURCIS =========
  A.getProject = (id) => (A.PROJECTS || []).find(p => p.id === id);
  A.getGroup   = (id) => (A.GROUPS   || []).find(g => g.id === id);
  A.getContact = (id) => (A.CONTACTS || []).find(c => c.id === id);
  A.getTasksOfProject = (pid) => (A.TASKS || []).filter(t => t.project === pid);
  A.getProjectsOfGroup = (gid) => (A.PROJECTS || []).filter(p => p.group === gid);
  A.getDecisionsOfProject = (pid) => (A.DECISIONS || []).filter(d => d.project === pid);
  A.getEventsOfProject = (pid) => (A.EVENTS || []).filter(e => e.project === pid);

  // Calcul charge de travail jour J
  A.workloadForDate = function(isoDate){
    const tasks = (A.TASKS || []).filter(t => !t.done && t.due === isoDate);
    const events= (A.EVENTS|| []).filter(e => (e.date||"").slice(0,10) === isoDate);
    const taskMin = tasks.reduce((a,t)=>a+(t.estimatedMin||0),0);
    const evMin   = events.reduce((a,e)=>a+(e.duration_min||0),0);
    return { tasks: tasks.length, events: events.length, totalMin: taskMin+evMin, taskMin, evMin };
  };
})();
