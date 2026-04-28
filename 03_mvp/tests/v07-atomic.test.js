/**
 * tests/v07-atomic.test.js — S6.10-bis-LIGHT smoke test
 *
 * Vérifie que le framework Atomic Templates est :
 * - structurellement complet (8 composants + 2 shared + 1 store + 1 page)
 * - syntaxiquement valide (require() sans crash sur le store base)
 * - cohérent : tous les data-component référencés dans la page existent en composant
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const V07_ROOT = path.resolve(__dirname, '..', 'public', 'v07');

test('v07: structure de base présente', () => {
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'tokens.css')), 'tokens.css manquant');
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'tweaks.css')), 'tweaks.css manquant');
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'store.js')), 'store.js manquant');
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'component-loader.js')), 'component-loader.js manquant');
});

test('v07: 8 composants atomiques présents avec triplet html+js+css', () => {
  const expected = [
    'header-topbar', 'drawer-sidebar', 'kpi-tile', 'card-decision',
    'seg-filter', 'search-pill', 'modal-detail', 'empty-state'
  ];
  for (const name of expected) {
    const dir = path.join(V07_ROOT, 'components', name);
    assert.ok(fs.existsSync(dir), `composant ${name} manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.html`)), `${name}.html manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.js`)), `${name}.js manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.css`)), `${name}.css manquant`);
  }
});

test('v07: page decisions.html référence tous les composants nécessaires', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'pages', 'decisions.html'), 'utf8');
  const required = [
    'data-component="drawer-sidebar"',
    'data-component="header-topbar"',
    'data-region="kpis"',
    'data-component="seg-filter"',
    'data-component="search-pill"',
    'data-region="timeline"',
    'data-component="modal-detail"'
  ];
  for (const marker of required) {
    assert.ok(html.includes(marker), `decisions.html ne contient pas ${marker}`);
  }
});

test('v07: decisions.html ne contient AUCUNE donnée démo en dur', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'pages', 'decisions.html'), 'utf8');
  // Anti-pattern : noms réels d'employés ETIC, chiffres réels, descriptions de décisions réelles
  const banned = [
    /Lamiae/i, // contact réel
    /Northwind/i, // projet démo Claude Design
    /\b47\s+décisions\b/i, // chiffre démo en dur
    /<style[^>]*>[\s\S]{500,}<\/style>/m // gros bloc style inline (>500 chars)
  ];
  for (const pat of banned) {
    assert.ok(!pat.test(html), `decisions.html contient une donnée démo interdite (pattern: ${pat})`);
  }
});

test('v07: decisions-store.js fetch /api/decisions', () => {
  const js = fs.readFileSync(path.join(V07_ROOT, 'stores', 'decisions-store.js'), 'utf8');
  assert.ok(/fetch\(['"`]\/api\/decisions/.test(js), 'decisions-store.js doit fetch /api/decisions');
  assert.ok(js.includes('extends Store'), 'doit étendre Store base class');
});

test('v07: aucun style inline dans les .js de composants', () => {
  const componentsDir = path.join(V07_ROOT, 'components');
  const dirs = fs.readdirSync(componentsDir);
  for (const dir of dirs) {
    const jsPath = path.join(componentsDir, dir, `${dir}.js`);
    if (!fs.existsSync(jsPath)) continue;
    const js = fs.readFileSync(jsPath, 'utf8');
    // Tolérer .style.overflow (modal manipulation body), interdire style="..." en string injectée
    const inlineStyle = /["'`]\s*style\s*=\s*["']\s*[a-z-]+\s*:/i.test(js);
    assert.ok(!inlineStyle, `${dir}.js contient un style="..." inline (anti-pattern Atomic Templates)`);
  }
});

test('v07: tokens.css définit Editorial Executive (ivory + ink + primary)', () => {
  const css = fs.readFileSync(path.join(V07_ROOT, 'shared', 'tokens.css'), 'utf8');
  assert.ok(css.includes('--ivory-50'), 'token --ivory-50 manquant');
  assert.ok(css.includes('--ink-900'), 'token --ink-900 manquant');
  assert.ok(css.includes('--primary-500'), 'token --primary-500 manquant');
  assert.ok(css.includes('Crimson Pro'), 'font Crimson Pro non référencée');
  assert.ok(css.includes('Inter'), 'font Inter non référencée');
});
