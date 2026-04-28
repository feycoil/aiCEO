/**
 * tests/v07-atomic.test.js — S6.10-bis-LIGHT + S6.10-EE smoke test
 *
 * Verifie :
 * - Structure framework Atomic Templates v07
 * - 12 composants atomiques (8 LIGHT + 4 EE)
 * - Squelette decisions.html sans donnees demo en dur
 * - Anti-patterns Atomic Templates respectes (pas de style inline JS)
 * - Tokens DS Editorial Executive presents
 * - Decisions store fetch /api/decisions
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const V07_ROOT = path.resolve(__dirname, '..', 'public', 'v07');

test('v07: structure de base presente', () => {
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'tokens.css')), 'tokens.css manquant');
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'tweaks.css')), 'tweaks.css manquant');
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'store.js')), 'store.js manquant');
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'component-loader.js')), 'component-loader.js manquant');
});

test('v07: 12 composants atomiques presents (8 LIGHT + 4 EE) avec triplet html+js+css', () => {
  const expected = [
    'header-topbar', 'drawer-sidebar', 'kpi-tile', 'card-decision',
    'seg-filter', 'search-pill', 'modal-detail', 'empty-state',
    'pill-project', 'pill-type', 'pill-status', 'time-filter'
  ];
  for (const name of expected) {
    const dir = path.join(V07_ROOT, 'components', name);
    assert.ok(fs.existsSync(dir), `composant ${name} manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.html`)), `${name}.html manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.js`)), `${name}.js manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.css`)), `${name}.css manquant`);
  }
});

test('v07: page decisions.html reference tous les composants necessaires', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'pages', 'decisions.html'), 'utf8');
  const required = [
    'data-component="drawer-sidebar"',
    'data-component="header-topbar"',
    'data-region="kpis"',
    'data-component="seg-filter"',
    'data-component="time-filter"',
    'data-region="timeline"',
    'data-component="modal-detail"',
    'data-component="empty-state"'
  ];
  for (const marker of required) {
    assert.ok(html.includes(marker), `decisions.html ne contient pas ${marker}`);
  }
});

test('v07: decisions.html ne contient AUCUNE donnee demo en dur', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'pages', 'decisions.html'), 'utf8');
  // Anti-pattern : noms de projets demo Claude Design, chiffres reels, decisions reelles
  const banned = [
    /Northwind/i,
    /Solstice/i,
    /Helix/i,
    /\b47\s+decisions\s+tranchees\b/i,
    /3\s+criteres\s+pour\s+qualifier\s+les\s+RFP/i
  ];
  for (const pat of banned) {
    assert.ok(!pat.test(html), `decisions.html contient une donnee demo interdite: ${pat}`);
  }
});

test('v07: decisions-store.js fetch /api/decisions', () => {
  const js = fs.readFileSync(path.join(V07_ROOT, 'stores', 'decisions-store.js'), 'utf8');
  assert.ok(/fetch\(['"`]\/api\/decisions/.test(js), 'decisions-store.js doit fetch /api/decisions');
  assert.ok(js.includes('extends Store'), 'doit etendre Store base class');
  assert.ok(js.includes('setHorizon'), 'doit avoir setHorizon (filtre temporel)');
});

test('v07: aucun style inline dans les .js de composants', () => {
  const componentsDir = path.join(V07_ROOT, 'components');
  const dirs = fs.readdirSync(componentsDir);
  for (const dir of dirs) {
    const jsPath = path.join(componentsDir, dir, `${dir}.js`);
    if (!fs.existsSync(jsPath)) continue;
    const js = fs.readFileSync(jsPath, 'utf8');
    // Tolerer .style.background = color (token ref via prop), interdire style="..." en string injectee
    const inlineStyleAttr = /["'`]\s*style\s*=\s*["']\s*[a-z-]+\s*:[^"']*[^-]\s*["']/i.test(js);
    assert.ok(!inlineStyleAttr, `${dir}.js contient un style="..." inline (anti-pattern Atomic Templates)`);
  }
});

test('v07: tokens.css definit Editorial Executive (ivory + ink + primary)', () => {
  const css = fs.readFileSync(path.join(V07_ROOT, 'shared', 'tokens.css'), 'utf8');
  assert.ok(css.includes('--ivory-50'), 'token --ivory-50 manquant');
  assert.ok(css.includes('--ink-900'), 'token --ink-900 manquant');
  assert.ok(css.includes('--primary-500'), 'token --primary-500 manquant');
  assert.ok(css.includes('Crimson Pro'), 'font Crimson Pro non referencee');
  assert.ok(css.includes('Inter'), 'font Inter non referencee');
});

test('v07: drawer-sidebar a 3 sections (Pilotage/Travail/Capital)', () => {
  const js = fs.readFileSync(path.join(V07_ROOT, 'components', 'drawer-sidebar', 'drawer-sidebar.js'), 'utf8');
  assert.ok(js.includes("'Pilotage'"), 'section Pilotage manquante');
  assert.ok(js.includes("'Travail'"), 'section Travail manquante');
  assert.ok(js.includes("'Capital'"), 'section Capital manquante');
});

test('v07: card-decision a rail tone + grid 2-col + source link (parite Claude Design)', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'components', 'card-decision', 'card-decision.html'), 'utf8');
  assert.ok(html.includes('cd-rail'), 'rail vertical manquant');
  assert.ok(html.includes('cd-grid'), 'grid 2-col manquant');
  assert.ok(html.includes('cd-source'), 'source link manquant');
  assert.ok(html.includes('cd-time'), 'time column manquant');
});
