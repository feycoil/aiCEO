#!/usr/bin/env node
// 02_design-system/scripts/export.js
//
// Régénère les blocs GENERATED de colors_and_type.css depuis tokens.json,
// puis pousse une copie identique vers 03_mvp/public/assets/colors_and_type.css.
//
// Contrat :
// - tokens.json est la source canonique des tokens.
// - colors_and_type.css contient 2 blocs GENERATED (délimités par marqueurs
//   /* === GENERATED FROM tokens.json — do not edit by hand === */ …
//   /* === END GENERATED === */). Hors marqueurs = hand-written
//   (semantic type roles .display, .h1, .body, etc.) préservés tel quels.
// - Le push vers 03_mvp/public/assets/ crée le fichier s'il n'existe pas.
//
// Décision fondatrice : S7 atelier cohérence 2026-04 (bundle reco CEO).
// ADR : 00_BOUSSOLE/DECISIONS.md · "2026-04-24 · Pipeline tokens DS → CSS
// + maintien unifié".
//
// Usage : npm run ds:export  (ou `node scripts/export.js`).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DS_ROOT = join(__dirname, '..')
const REPO_ROOT = join(DS_ROOT, '..')

const GEN_START = '/* === GENERATED FROM tokens.json — do not edit by hand === */'
const GEN_END = '/* === END GENERATED === */'

const MVP_CSS_PATH = join(REPO_ROOT, '03_mvp', 'public', 'assets', 'colors_and_type.css')
const DS_CSS_PATH = join(DS_ROOT, 'colors_and_type.css')
const TOKENS_PATH = join(DS_ROOT, 'tokens.json')

/* ─── lecture source ─── */
const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))

/* ─── rendu ─── */
function renderFontFaces (faces) {
  return faces.map(f => {
    const note = f.note ? `  /* ${f.note} */\n` : ''
    return `${note}@font-face {
  font-family: "${f.family}"; font-style: normal;
  font-weight: ${f.weight};
  src: url("${f.src}") format("${f.format}");
  font-display: swap;
}`
  }).join('\n\n')
}

function renderRootVars (vars) {
  const groups = Object.entries(vars).map(([groupLabel, entries]) => {
    const lines = Object.entries(entries)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')
    return `  /* ${groupLabel} */\n${lines}`
  })
  return `:root {\n${groups.join('\n\n')}\n}`
}

const generated = [
  GEN_START,
  '/* Généré automatiquement — ne pas éditer à la main. */',
  `/* Source : ${tokens.$meta.source} · Version : ${tokens.$meta.version} · Dernière MAJ : ${tokens.$meta.lastUpdated} */`,
  '',
  '/* ── Webfonts (self-hosted, no CDN fallbacks needed) ── */',
  renderFontFaces(tokens.fonts.faces),
  '',
  '/* ── Design tokens (:root CSS custom properties) ── */',
  renderRootVars(tokens.vars),
  '',
  GEN_END
].join('\n')

/* ─── réécriture colors_and_type.css (préserve hand-written) ─── */
function rewriteCss (cssPath, generatedBlock) {
  let current = ''
  if (existsSync(cssPath)) {
    current = readFileSync(cssPath, 'utf8')
  }

  // GEN_START : première occurrence (début structurel).
  // GEN_END : dernière occurrence — protège contre une mention littérale
  // du marqueur dans un commentaire descriptif placé entre les deux bornes
  // (bug constaté au premier run S7 : le marqueur cité en prose était
  // confondu avec le vrai marqueur de fin).
  const startIdx = current.indexOf(GEN_START)
  const endIdx = current.lastIndexOf(GEN_END)

  let next
  if (startIdx >= 0 && endIdx > startIdx) {
    const before = current.slice(0, startIdx)
    const after = current.slice(endIdx + GEN_END.length)
    next = `${before}${generatedBlock}${after}`
  } else {
    // Premier run : pas de marqueurs. On prépend le bloc au fichier existant
    // (ou on crée un fichier neuf si absent). Les sections hand-written
    // éventuelles (semantic type roles) restent en queue.
    next = current
      ? `${generatedBlock}\n\n${current}`
      : `${generatedBlock}\n`
  }

  mkdirSync(dirname(cssPath), { recursive: true })
  writeFileSync(cssPath, next, 'utf8')
  return next.length
}

const dsBytes = rewriteCss(DS_CSS_PATH, generated)
const mvpBytes = rewriteCss(MVP_CSS_PATH, generated)

/* ─── rapport ─── */
const nbFaces = tokens.fonts.faces.length
const nbTokens = Object.values(tokens.vars)
  .reduce((n, group) => n + Object.keys(group).length, 0)
const nbGroups = Object.keys(tokens.vars).length

console.log(`[ds:export] régénéré ${nbFaces} @font-face + ${nbTokens} tokens répartis en ${nbGroups} groupes`)
console.log(`  → ${DS_CSS_PATH}  (${dsBytes} octets)`)
console.log(`  → ${MVP_CSS_PATH}  (${mvpBytes} octets)`)
console.log('')
console.log('Prochaines étapes suggérées :')
console.log('  1. git diff --stat   pour lire le diff')
console.log('  2. ouvrir 02_design-system/preview/colors-*.html pour contrôle visuel')
console.log('  3. git add -p        pour committer')
console.log('  4. PR avec référence à l\'issue DS concernée')
