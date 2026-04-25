/* eslint-disable */
/**
 * build-kickoff.js — génère KICKOFF-S3.pptx (12 slides, palette Coral Energy)
 * Run: node build-kickoff.js  (depuis /tmp/kickoff-s3 où pptxgenjs est installé)
 */
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const NAVY     = '1E2761';
const NAVY_2   = '2F3C7E';
const ICE      = 'CADCFC';
const CORAL    = 'F96167';
const GOLD     = 'F9E795';
const WHITE    = 'FFFFFF';
const TEXT_2   = '5B5E68';
const SURFACE  = 'F5F3EF';

const FONT_T = 'Calibri';
const FONT_B = 'Calibri';

const pptx = new PptxGenJS();
pptx.title = 'aiCEO — Kickoff Sprint S3';
pptx.subject = 'Sprint S3 — Agenda + Revues + SSE + Outlook autosync';
pptx.author = 'Major Fey · ETIC Services';
pptx.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5 inches

// --- helpers ---
function addCover(slide) {
  slide.background = { color: NAVY };
  slide.addText('Sprint S3', {
    x: 0.6, y: 0.6, w: 12, h: 0.7,
    fontFace: FONT_T, fontSize: 16, color: GOLD, bold: true,
  });
  slide.addText('Agenda hebdo · Revues · Push live SSE · Outlook autosync', {
    x: 0.6, y: 2.4, w: 12, h: 1.2,
    fontFace: FONT_T, fontSize: 36, color: WHITE, bold: true,
    valign: 'top',
  });
  slide.addText('aiCEO v0.5 · semaines 23-24 · 02/06 → 13/06/2026', {
    x: 0.6, y: 4.0, w: 12, h: 0.6,
    fontFace: FONT_B, fontSize: 18, color: ICE,
  });
  slide.addText('Major Fey — pilote · Équipe v0.5 (2 fullstack + 0,3 designer + 0,3 PMO)', {
    x: 0.6, y: 6.5, w: 12, h: 0.4,
    fontFace: FONT_B, fontSize: 12, color: ICE, italic: true,
  });
}

function addSection(slide, num, title, subtitle) {
  slide.background = { color: SURFACE };
  slide.addText(`§${num}`, {
    x: 0.6, y: 0.5, w: 1.2, h: 0.5,
    fontFace: FONT_T, fontSize: 22, color: CORAL, bold: true,
  });
  slide.addText(title, {
    x: 0.6, y: 1.0, w: 12, h: 0.7,
    fontFace: FONT_T, fontSize: 32, color: NAVY, bold: true,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 1.75, w: 12, h: 0.4,
      fontFace: FONT_B, fontSize: 14, color: TEXT_2, italic: true,
    });
  }
}

// =================================================================
// SLIDE 1 — Cover
// =================================================================
{
  const s = pptx.addSlide();
  addCover(s);
}

// =================================================================
// SLIDE 2 — Bilan S2 livré
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '0', 'D\'où on part', 'Sprint S2 livré le 25/04 — branche release/v0.5-s2 → main');

  // 4 stats en grille
  const stats = [
    { n: '10/10', l: 'issues S2 closes' },
    { n: '11', l: 'commits sur la branche' },
    { n: '55/55', l: 'tests verts' },
    { n: '—1.5 j', l: 'gain time-box (spike SSE)' },
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 3.05;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 2.4, w: 2.85, h: 1.8,
      fill: { color: NAVY }, line: { type: 'none' },
    });
    s.addText(st.n, {
      x, y: 2.5, w: 2.85, h: 0.9,
      fontFace: FONT_T, fontSize: 40, color: GOLD, bold: true,
      align: 'center', valign: 'middle',
    });
    s.addText(st.l, {
      x, y: 3.4, w: 2.85, h: 0.8,
      fontFace: FONT_B, fontSize: 12, color: ICE,
      align: 'center', valign: 'top', margin: 6,
    });
  });

  // Liste des livrables
  s.addText('Livrables clés S2', {
    x: 0.6, y: 4.6, w: 12, h: 0.4,
    fontFace: FONT_T, fontSize: 16, color: NAVY, bold: true,
  });
  s.addText([
    { text: 'Cockpit live ', options: { bold: true } },
    { text: '(GET /api/cockpit/today)\n', options: {} },
    { text: 'Arbitrage matin + Evening soir + streak persistant\n', options: {} },
    { text: 'Projets / groupes / contacts + recherche globale + IA décisions\n', options: {} },
    { text: 'Doc API ', options: { bold: true } },
    { text: '(38 exemples curl) + ', options: {} },
    { text: 'spike SSE ', options: { bold: true } },
    { text: '(bus + endpoint /stream + 3 tests) — non câblé front', options: {} },
  ], {
    x: 0.6, y: 5.05, w: 12.1, h: 1.6,
    fontFace: FONT_B, fontSize: 13, color: '111418', valign: 'top',
    paraSpaceAfter: 4,
  });
}

// =================================================================
// SLIDE 3 — Objectifs S3 (4 piliers)
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '1', 'Objectifs S3', '4 piliers, 11 issues, 22,1 k€');

  const piliers = [
    { t: 'Agenda hebdo', d: 'Vue lun-dim + drag-drop tâches → due_at\nMigration 01_app-web/agenda.html', icon: 'A' },
    { t: 'Revues', d: 'Big Rocks éditables + auto-draft Claude\nMigration 06_revues/index.html', icon: 'R' },
    { t: 'SSE live', d: 'Câblage front du bus prototypé S2.10\nToggle tab A → cockpit tab B sans F5', icon: 'S' },
    { t: 'Outlook autosync', d: 'schtasks 2 h + endpoint last-sync\nFin du lancement PowerShell manuel', icon: 'O' },
  ];
  piliers.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 6.3;
    const y = 2.5 + row * 2.3;
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: 6.0, h: 2.0,
      fill: { color: WHITE }, line: { color: ICE, width: 1 },
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.2, y: y + 0.2, w: 0.7, h: 0.7,
      fill: { color: GOLD }, line: { type: 'none' },
    });
    s.addText(p.icon, {
      x: x + 0.2, y: y + 0.2, w: 0.7, h: 0.7,
      fontFace: FONT_T, fontSize: 26, color: NAVY, bold: true,
      align: 'center', valign: 'middle',
    });
    s.addText(p.t, {
      x: x + 1.05, y: y + 0.2, w: 4.7, h: 0.5,
      fontFace: FONT_T, fontSize: 18, color: NAVY, bold: true,
    });
    s.addText(p.d, {
      x: x + 0.3, y: y + 1.0, w: 5.5, h: 0.9,
      fontFace: FONT_B, fontSize: 12, color: TEXT_2, valign: 'top',
    });
  });
}

// =================================================================
// SLIDE 4 — Périmètre : 2 pages migrées
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '2', 'Périmètre — 2 pages migrées', 'app-web (localStorage) → MVP (API SQLite)');

  // Page 1 : agenda
  s.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.6,
    fill: { color: WHITE }, line: { color: ICE, width: 1 },
  });
  s.addText('agenda.html', {
    x: 0.8, y: 2.55, w: 5.6, h: 0.5,
    fontFace: FONT_T, fontSize: 20, color: NAVY, bold: true,
  });
  s.addText('Vue hebdo lun-dim Outlook + tâches', {
    x: 0.8, y: 3.0, w: 5.6, h: 0.4,
    fontFace: FONT_B, fontSize: 12, color: TEXT_2, italic: true,
  });
  s.addText([
    { text: 'Backend\n', options: { bold: true, color: NAVY } },
    { text: '• GET /api/events/week?with_tasks=true\n', options: {} },
    { text: '\n', options: {} },
    { text: 'Frontend\n', options: { bold: true, color: NAVY } },
    { text: '• Grille hebdo Twisty\n', options: {} },
    { text: '• Drag-drop tâche → jour (PATCH due_at)\n', options: {} },
    { text: '• Sélecteur semaine deep-link ?week=YYYY-Www\n', options: {} },
    { text: '• Drawer detail event (organisateur, attendees)', options: {} },
  ], {
    x: 0.8, y: 3.5, w: 5.6, h: 3.4,
    fontFace: FONT_B, fontSize: 12, color: '111418', valign: 'top',
    paraSpaceAfter: 2,
  });

  // Page 2 : revues
  s.addShape(pptx.ShapeType.rect, {
    x: 6.9, y: 2.4, w: 6.0, h: 4.6,
    fill: { color: WHITE }, line: { color: ICE, width: 1 },
  });
  s.addText('revues/index.html', {
    x: 7.1, y: 2.55, w: 5.6, h: 0.5,
    fontFace: FONT_T, fontSize: 20, color: NAVY, bold: true,
  });
  s.addText('Big Rocks + bilan auto-drafté + archives', {
    x: 7.1, y: 3.0, w: 5.6, h: 0.4,
    fontFace: FONT_B, fontSize: 12, color: TEXT_2, italic: true,
  });
  s.addText([
    { text: 'Backend\n', options: { bold: true, color: NAVY } },
    { text: '• /api/big-rocks (CRUD, max 3/sem)\n', options: {} },
    { text: '• /api/weekly-reviews (CRUD)\n', options: {} },
    { text: '• POST /weekly-reviews/:week/draft → Claude\n', options: {} },
    { text: '\n', options: {} },
    { text: 'Frontend\n', options: { bold: true, color: NAVY } },
    { text: '• Big Rocks éditables inline\n', options: {} },
    { text: '• Markdown éditable (auto-draft + valider)\n', options: {} },
    { text: '• Archives W17+ (lien 06_revues/*.md)', options: {} },
  ], {
    x: 7.1, y: 3.5, w: 5.6, h: 3.4,
    fontFace: FONT_B, fontSize: 12, color: '111418', valign: 'top',
    paraSpaceAfter: 2,
  });
}

// =================================================================
// SLIDE 5 — Chantiers transverses (SSE + Outlook)
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '3', 'Chantiers transverses', 'Activer le push live + automatiser le sync');

  // SSE
  s.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 2.4, w: 6.0, h: 4.6,
    fill: { color: NAVY }, line: { type: 'none' },
  });
  s.addText('Câblage SSE front', {
    x: 0.8, y: 2.55, w: 5.6, h: 0.5,
    fontFace: FONT_T, fontSize: 20, color: GOLD, bold: true,
  });
  s.addText('S2.10 a livré le bus + endpoint. S3 le branche au front.', {
    x: 0.8, y: 3.0, w: 5.6, h: 0.5,
    fontFace: FONT_B, fontSize: 12, color: ICE, italic: true,
  });
  s.addText([
    { text: 'Avant\n', options: { bold: true, color: ICE } },
    { text: 'Toggle tâche tab A → cockpit tab B reste figé\n', options: { color: WHITE } },
    { text: '\n', options: {} },
    { text: 'Après\n', options: { bold: true, color: GOLD } },
    { text: 'Routes mutatrices émettent → bus → SSE → front re-fetch\n', options: { color: WHITE } },
    { text: 'Refresh < 1 s sans F5\n', options: { color: WHITE } },
    { text: 'Heartbeat 25 s (Zscaler-safe)\n', options: { color: WHITE } },
    { text: 'Reconnexion auto navigateur', options: { color: WHITE } },
  ], {
    x: 0.8, y: 3.6, w: 5.6, h: 3.3,
    fontFace: FONT_B, fontSize: 12, valign: 'top', paraSpaceAfter: 2,
  });

  // Outlook
  s.addShape(pptx.ShapeType.rect, {
    x: 6.9, y: 2.4, w: 6.0, h: 4.6,
    fill: { color: CORAL }, line: { type: 'none' },
  });
  s.addText('Outlook autosync 2 h', {
    x: 7.1, y: 2.55, w: 5.6, h: 0.5,
    fontFace: FONT_T, fontSize: 20, color: WHITE, bold: true,
  });
  s.addText('Fin du lancement PowerShell manuel par le CEO', {
    x: 7.1, y: 3.0, w: 5.6, h: 0.5,
    fontFace: FONT_B, fontSize: 12, color: WHITE, italic: true,
  });
  s.addText([
    { text: 'schtasks /create aiCEO-Outlook-Sync /sc HOURLY /mo 2\n', options: { color: WHITE } },
    { text: '→ exec scripts/import-outlook.ps1 toutes les 2 h\n', options: { color: WHITE } },
    { text: '→ logs/outlook-sync.log (rotation 10 j)\n', options: { color: WHITE } },
    { text: '\n', options: {} },
    { text: 'Endpoint introspection\n', options: { bold: true, color: WHITE } },
    { text: 'GET /api/system/last-sync → {last_run, status, mails_in, events_in, errors}\n', options: { color: WHITE } },
    { text: 'Cockpit alerte si > 4 h sans sync', options: { color: WHITE, bold: true } },
  ], {
    x: 7.1, y: 3.6, w: 5.6, h: 3.3,
    fontFace: FONT_B, fontSize: 12, valign: 'top', paraSpaceAfter: 2,
  });
}

// =================================================================
// SLIDE 6 — Issues GitHub (S3.00 → S3.10)
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '4', '11 issues à ouvrir', 'S3.00 → S3.10 · charge totale 11,1 j-dev sur 20 j capacité');

  const rows = [
    ['#',     'Titre',                                            'j-dev', 'Owner'],
    ['S3.00', 'ADR S3 + alignement méthode',                      '0,3',   'PMO'],
    ['S3.01', 'Backend events/week + weekly-reviews + big-rocks', '1,5',   'Dev1'],
    ['S3.02', 'Frontend agenda.html migré',                       '1,5',   'Dev2'],
    ['S3.03', 'Backend auto-draft revue Claude',                  '1,0',   'Dev1'],
    ['S3.04', 'Frontend revues/index.html migré',                 '1,5',   'Dev2'],
    ['S3.05', 'Câblage SSE front (cockpit + tâches)',              '0,8',   'Dev1'],
    ['S3.06', 'Outlook autosync 2 h + endpoint last-sync',        '1,0',   'Dev2'],
    ['S3.07', 'Tests e2e parcours hebdo (P4)',                    '0,5',   'Dev1'],
    ['S3.08', 'Tests unitaires extensions ≥ 65 verts',             '1,0',   'Dev2'],
    ['S3.09', 'Doc API S3 + README MVP',                          '0,5',   'PMO'],
    ['S3.10', 'Spike Service Windows (POC node-windows)',         '1,5',   'Dev1'],
  ];
  const startY = 2.5;
  const rowH = 0.36;
  rows.forEach((row, i) => {
    const y = startY + i * rowH;
    const isHeader = i === 0;
    if (isHeader) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y, w: 12.1, h: rowH,
        fill: { color: NAVY }, line: { type: 'none' },
      });
    } else if (i % 2 === 0) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y, w: 12.1, h: rowH,
        fill: { color: 'F4F2EC' }, line: { type: 'none' },
      });
    }
    const widths = [1.2, 8.1, 1.4, 1.4];
    let x = 0.6;
    row.forEach((cell, j) => {
      s.addText(cell, {
        x: x + 0.08, y, w: widths[j] - 0.16, h: rowH,
        fontFace: FONT_B, fontSize: 11,
        color: isHeader ? WHITE : '111418',
        bold: isHeader || j === 0,
        valign: 'middle',
      });
      x += widths[j];
    });
  });
}

// =================================================================
// SLIDE 7 — Critères de fin (10 conditions)
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '5', '10 critères de fin', 'Sprint scellé vendredi 13/06 17:00 si tous verts');

  const crits = [
    '2 pages neuves accessibles (curl 200)',
    'Zéro localStorage applicatif (grep)',
    'Agenda drag-drop OK (e2e + SQL)',
    'Big Rocks max 3/sem (validation 400)',
    'Auto-draft Claude rubric ≥ 5/6',
    'SSE live cockpit < 1 s',
    'Outlook autosync planifié',
    '/api/system/last-sync structuré',
    'Tests unitaires ≥ 65 verts',
    'Tests e2e P4 vert',
  ];
  crits.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15;
    const y = 2.5 + row * 0.85;
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.05, y: y + 0.1, w: 0.45, h: 0.45,
      fill: { color: GOLD }, line: { type: 'none' },
    });
    s.addText(String(i + 1), {
      x: x + 0.05, y: y + 0.1, w: 0.45, h: 0.45,
      fontFace: FONT_T, fontSize: 14, color: NAVY, bold: true,
      align: 'center', valign: 'middle',
    });
    s.addText(c, {
      x: x + 0.6, y, w: 5.4, h: 0.65,
      fontFace: FONT_B, fontSize: 13, color: '111418',
      valign: 'middle',
    });
  });
}

// =================================================================
// SLIDE 8 — Planning daily
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '6', 'Planning daily', '10 j ouvrés · daily 09:00 · demos 06/06 + 13/06');

  const rows = [
    ['Jour',    'Date',  'Focus'],
    ['J1 Lun', '02/06', 'Kickoff + 11 issues ouvertes · S3.00 ADR · S3.01 démarre'],
    ['J2 Mar', '03/06', 'S3.01 routes weekly-reviews · S3.02 squelette agenda'],
    ['J3 Mer', '04/06', 'S3.01 fini · S3.02 drag-drop · synchro 14:00'],
    ['J4 Jeu', '05/06', 'S3.04 squelette revues + Big Rocks · S3.05 câblage SSE cockpit'],
    ['J5 Ven', '06/06', 'Demo intermédiaire 16:00 · agenda + cockpit live'],
    ['J6 Lun', '09/06', 'S3.03 auto-draft Claude · S3.05 cablage taches · S3.10 spike'],
    ['J7 Mar', '10/06', 'S3.04 archives + UI éditeur · S3.06 schtasks + last-sync'],
    ['J8 Mer', '11/06', 'Mid-sprint ExCom · S3.07 e2e P4 · S3.08 tests unit'],
    ['J9 Jeu', '12/06', 'S3.09 doc API · S3.10 ADR · bug bash + polish UX'],
    ['J10 Ven', '13/06', 'Demo finale 16:00 · retro · ouverture issues S4'],
  ];
  const startY = 2.4;
  const rowH = 0.4;
  rows.forEach((row, i) => {
    const y = startY + i * rowH;
    const isHeader = i === 0;
    if (isHeader) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y, w: 12.1, h: rowH,
        fill: { color: NAVY }, line: { type: 'none' },
      });
    } else if (i % 2 === 0) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y, w: 12.1, h: rowH,
        fill: { color: 'F4F2EC' }, line: { type: 'none' },
      });
    }
    const widths = [1.4, 1.2, 9.5];
    let x = 0.6;
    row.forEach((cell, j) => {
      s.addText(cell, {
        x: x + 0.08, y, w: widths[j] - 0.16, h: rowH,
        fontFace: FONT_B, fontSize: 12,
        color: isHeader ? WHITE : '111418',
        bold: isHeader || j === 0,
        valign: 'middle',
      });
      x += widths[j];
    });
  });
}

// =================================================================
// SLIDE 9 — Risques top 5
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '7', 'Top 5 risques', 'Plans B + déclencheurs explicites');

  const risks = [
    { id: 'R1', title: 'Schtasks droits admin (poste corp)',
      mit: 'Issue P0 IT ETIC J1 · fallback tâche utilisateur',
      prob: 'Moy', impact: 'P1' },
    { id: 'R2', title: 'Auto-draft Claude faible',
      mit: 'Prompt itéré W14-W18 · rubric 6 critères ≥ 5/6',
      prob: 'Moy', impact: 'P2' },
    { id: 'R3', title: 'SSE coupé par Zscaler',
      mit: 'Heartbeat 25 s · test J3 poste CEO · fallback polling',
      prob: 'Faible', impact: 'P2' },
    { id: 'R4', title: 'Drag-drop Edge legacy',
      mit: 'Pattern arbitrage.html (S2.03) · vendre SortableJS',
      prob: 'Faible', impact: 'P3' },
    { id: 'R5', title: 'Spike Service Windows déborde',
      mit: 'Time-box 1,5 j strict · ADR uniquement si dépassement',
      prob: 'Moy', impact: 'P2' },
  ];
  risks.forEach((r, i) => {
    const y = 2.4 + i * 0.85;
    s.addShape(pptx.ShapeType.rect, {
      x: 0.6, y, w: 12.1, h: 0.75,
      fill: { color: WHITE }, line: { color: ICE, width: 1 },
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x: 0.75, y: y + 0.13, w: 0.5, h: 0.5,
      fill: { color: CORAL }, line: { type: 'none' },
    });
    s.addText(r.id, {
      x: 0.75, y: y + 0.13, w: 0.5, h: 0.5,
      fontFace: FONT_T, fontSize: 12, color: WHITE, bold: true,
      align: 'center', valign: 'middle',
    });
    s.addText(r.title, {
      x: 1.4, y: y + 0.05, w: 6.0, h: 0.35,
      fontFace: FONT_T, fontSize: 13, color: NAVY, bold: true,
      valign: 'middle',
    });
    s.addText(r.mit, {
      x: 1.4, y: y + 0.4, w: 8.5, h: 0.32,
      fontFace: FONT_B, fontSize: 11, color: TEXT_2, valign: 'middle',
    });
    s.addText(`Prob: ${r.prob}`, {
      x: 10.2, y: y + 0.1, w: 1.2, h: 0.3,
      fontFace: FONT_B, fontSize: 10, color: TEXT_2, valign: 'middle',
    });
    s.addText(`Impact: ${r.impact}`, {
      x: 11.4, y: y + 0.1, w: 1.2, h: 0.3,
      fontFace: FONT_B, fontSize: 10, color: NAVY, bold: true, valign: 'middle',
    });
  });
}

// =================================================================
// SLIDE 10 — Budget + cumul v0.5
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '8', 'Budget S3 = 22,1 k€', 'Cumul v0.5 à fin S3 : 66,3 k€ / 110 k€ → 60 %');

  // Budget S3 ventilation
  s.addText('Ventilation S3', {
    x: 0.6, y: 2.4, w: 6.0, h: 0.4,
    fontFace: FONT_T, fontSize: 16, color: NAVY, bold: true,
  });
  const ventil = [
    ['Dev fullstack (2 ETP)',  '17,0 k€', '77 %'],
    ['Designer (0,3 ETP)',     '2,1 k€',  '10 %'],
    ['PMO (0,3 ETP)',          '1,8 k€',  '8 %'],
    ['Claude API + provision', '1,2 k€',  '5 %'],
  ];
  ventil.forEach((row, i) => {
    const y = 2.9 + i * 0.45;
    if (i % 2 === 0) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y, w: 6.0, h: 0.42,
        fill: { color: 'F4F2EC' }, line: { type: 'none' },
      });
    }
    s.addText(row[0], { x: 0.7, y, w: 3.5, h: 0.42, fontFace: FONT_B, fontSize: 12, color: '111418', valign: 'middle' });
    s.addText(row[1], { x: 4.2, y, w: 1.3, h: 0.42, fontFace: FONT_T, fontSize: 12, color: NAVY, bold: true, valign: 'middle', align: 'right' });
    s.addText(row[2], { x: 5.5, y, w: 1.0, h: 0.42, fontFace: FONT_B, fontSize: 11, color: TEXT_2, valign: 'middle', align: 'right' });
  });

  // Cumul v0.5
  s.addText('Cumul v0.5', {
    x: 6.9, y: 2.4, w: 6.0, h: 0.4,
    fontFace: FONT_T, fontSize: 16, color: NAVY, bold: true,
  });
  const sprints = [
    { id: 'S1', etat: 'livré', cumul: 22.1 },
    { id: 'S2', etat: 'livré', cumul: 44.2 },
    { id: 'S3', etat: 'kickoff', cumul: 66.3 },
    { id: 'S4', etat: 'planifié', cumul: 88.4 },
    { id: 'S5', etat: 'planifié', cumul: 99.4 },
    { id: 'S6', etat: 'planifié', cumul: 110.4 },
  ];
  const baseY = 2.9;
  const barX = 8.4;
  const barMaxW = 4.4;
  sprints.forEach((sp, i) => {
    const y = baseY + i * 0.45;
    s.addText(sp.id, { x: 6.9, y, w: 0.5, h: 0.42, fontFace: FONT_T, fontSize: 12, color: NAVY, bold: true, valign: 'middle' });
    s.addText(sp.etat, { x: 7.4, y, w: 1.0, h: 0.42, fontFace: FONT_B, fontSize: 10, color: TEXT_2, valign: 'middle' });
    const w = (sp.cumul / 110) * barMaxW;
    const isDone = sp.etat === 'livré';
    s.addShape(pptx.ShapeType.rect, {
      x: barX, y: y + 0.1, w: barMaxW, h: 0.22,
      fill: { color: 'EEEBE4' }, line: { type: 'none' },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: barX, y: y + 0.1, w, h: 0.22,
      fill: { color: isDone ? NAVY : (sp.etat === 'kickoff' ? CORAL : ICE) }, line: { type: 'none' },
    });
    s.addText(`${sp.cumul.toFixed(1)} k€`, {
      x: barX, y: y + 0.05, w: barMaxW, h: 0.32,
      fontFace: FONT_B, fontSize: 10, color: isDone ? WHITE : '111418', bold: true,
      align: 'right', valign: 'middle', margin: 4,
    });
  });
}

// =================================================================
// SLIDE 11 — Dépendances S4
// =================================================================
{
  const s = pptx.addSlide();
  addSection(s, '9', 'Ce que S3 lègue à S4', 'Aucun glissement par rapport à SPEC §13');

  const items = [
    { t: 'API REST stable',
      d: 'tasks · decisions · contacts · projects · groups · events · cockpit · arbitrage · evening · weekly-reviews · big-rocks · system' },
    { t: 'Bus SSE prouvé en prod local',
      d: 'S4 active push pour assistant.html (chat live) sans nouveau spike' },
    { t: 'Outlook frais à 2 h',
      d: 'S4 compte sur la fraîcheur du contexte agent IA pour les recos proactives' },
    { t: 'POC Service Windows + ADR',
      d: 'S5 démarre directement sur l\'install MSI / NSSM avec décision validée' },
  ];
  items.forEach((it, i) => {
    const y = 2.4 + i * 1.05;
    s.addShape(pptx.ShapeType.rect, {
      x: 0.6, y, w: 12.1, h: 0.95,
      fill: { color: WHITE }, line: { color: ICE, width: 1 },
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x: 0.8, y: y + 0.25, w: 0.5, h: 0.5,
      fill: { color: GOLD }, line: { type: 'none' },
    });
    s.addText('→', {
      x: 0.8, y: y + 0.25, w: 0.5, h: 0.5,
      fontFace: FONT_T, fontSize: 18, color: NAVY, bold: true,
      align: 'center', valign: 'middle',
    });
    s.addText(it.t, {
      x: 1.5, y: y + 0.1, w: 11.0, h: 0.4,
      fontFace: FONT_T, fontSize: 16, color: NAVY, bold: true,
      valign: 'middle',
    });
    s.addText(it.d, {
      x: 1.5, y: y + 0.5, w: 11.0, h: 0.4,
      fontFace: FONT_B, fontSize: 12, color: TEXT_2,
      valign: 'middle',
    });
  });
}

// =================================================================
// SLIDE 12 — Closing / Décision GO
// =================================================================
{
  const s = pptx.addSlide();
  s.background = { color: NAVY };

  s.addText('Décision', {
    x: 0.6, y: 0.6, w: 12, h: 0.5,
    fontFace: FONT_T, fontSize: 16, color: GOLD, bold: true,
  });
  s.addText('GO Sprint S3 ?', {
    x: 0.6, y: 2.0, w: 12, h: 1.2,
    fontFace: FONT_T, fontSize: 54, color: WHITE, bold: true,
  });
  s.addText('Kickoff lundi 02/06 09:00 · Demo intermédiaire 06/06 · Demo finale 13/06', {
    x: 0.6, y: 3.5, w: 12, h: 0.5,
    fontFace: FONT_B, fontSize: 18, color: ICE,
  });

  // 3 jalons à valider en kickoff
  const jalons = [
    { t: 'Périmètre 2 pages + 2 chantiers', s: 'agenda · revues · SSE front · autosync' },
    { t: 'Budget 22,1 k€ confirmé', s: '60 % enveloppe v0.5 consommée à fin S3' },
    { t: '10 critères acceptance', s: 'tag v0.5-s3 lundi 16/06 si tous verts' },
  ];
  jalons.forEach((j, i) => {
    const x = 0.6 + i * 4.18;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 4.6, w: 3.95, h: 1.7,
      fill: { color: NAVY_2 }, line: { color: ICE, width: 1 },
    });
    s.addText(j.t, {
      x: x + 0.2, y: 4.75, w: 3.6, h: 0.6,
      fontFace: FONT_T, fontSize: 14, color: GOLD, bold: true,
      valign: 'top',
    });
    s.addText(j.s, {
      x: x + 0.2, y: 5.35, w: 3.6, h: 0.85,
      fontFace: FONT_B, fontSize: 11, color: WHITE, valign: 'top',
    });
  });

  s.addText('Major Fey · pilote aiCEO · 25/04/2026', {
    x: 0.6, y: 6.7, w: 12, h: 0.4,
    fontFace: FONT_B, fontSize: 11, color: ICE, italic: true,
  });
}

const out = process.argv[2] || '/sessions/trusting-practical-shannon/mnt/04_docs/KICKOFF-S3.pptx';
pptx.writeFile({ fileName: out }).then((f) => console.log('WROTE', f));
