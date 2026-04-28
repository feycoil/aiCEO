/**
 * tests/v07-atomic.test.js — S6.10-bis-LIGHT + S6.10-EE + S6.10-EE-FIX smoke test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const V07_ROOT = path.resolve(__dirname, '..', 'public', 'v07');

test('v07: structure de base presente', () => {
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'tokens.css')));
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'tweaks.css')));
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'store.js')));
  assert.ok(fs.existsSync(path.join(V07_ROOT, 'shared', 'component-loader.js')));
});

test('v07: 12 composants atomiques presents avec triplet html+js+css', () => {
  const expected = [
    'header-topbar', 'drawer-sidebar', 'kpi-tile', 'card-decision',
    'seg-filter', 'search-pill', 'modal-detail', 'empty-state',
    'pill-project', 'pill-type', 'pill-status', 'time-filter'
  ];
  for (const name of expected) {
    const dir = path.join(V07_ROOT, 'components', name);
    assert.ok(fs.existsSync(dir), `composant ${name} manquant`);
    assert.ok(fs.existsSync(path.join(dir, `${name}.html`)));
    assert.ok(fs.existsSync(path.join(dir, `${name}.js`)));
    assert.ok(fs.existsSync(path.join(dir, `${name}.css`)));
  }
});

test('v07: page decisions.html reference tous les composants', () => {
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
  const banned = [/Northwind/i, /Solstice/i, /Helix/i];
  for (const pat of banned) {
    assert.ok(!pat.test(html), `decisions.html contient une donnee demo: ${pat}`);
  }
});

test('v07: decisions-store.js fetch /api/decisions', () => {
  const js = fs.readFileSync(path.join(V07_ROOT, 'stores', 'decisions-store.js'), 'utf8');
  assert.ok(/fetch\(['"\`]\/api\/decisions/.test(js));
  assert.ok(js.includes('extends Store'));
  assert.ok(js.includes('setHorizon'));
});

test('v07: aucun style inline dans les .js de composants', () => {
  const componentsDir = path.join(V07_ROOT, 'components');
  const dirs = fs.readdirSync(componentsDir);
  for (const dir of dirs) {
    const jsPath = path.join(componentsDir, dir, `${dir}.js`);
    if (!fs.existsSync(jsPath)) continue;
    const js = fs.readFileSync(jsPath, 'utf8');
    const inlineStyleAttr = /["'\`]\s*style\s*=\s*["']\s*[a-z-]+\s*:[^"']*[^-]\s*["']/i.test(js);
    assert.ok(!inlineStyleAttr, `${dir}.js contient un style="..." inline`);
  }
});

test('v07: tokens.css aligne v06 (ivory + ink + Fira Sans)', () => {
  const css = fs.readFileSync(path.join(V07_ROOT, 'shared', 'tokens.css'), 'utf8');
  assert.ok(css.includes('--ivory-50'));
  assert.ok(css.includes('--ink-900'));
  assert.ok(css.includes('--primary-500'));
  assert.ok(css.includes('Fira Sans'));
});

test('v07: drawer-sidebar a 3 sections (Pilotage/Travail/Capital) + sprite SVG', () => {
  const js = fs.readFileSync(path.join(V07_ROOT, 'components', 'drawer-sidebar', 'drawer-sidebar.js'), 'utf8');
  assert.ok(js.includes("'Pilotage'"));
  assert.ok(js.includes("'Travail'"));
  assert.ok(js.includes("'Capital'"));
  assert.ok(js.includes('use href="#i-'), 'doit utiliser le sprite SVG (use href="#i-...")');
});

test('v07: card-decision a rail tone + grid 2-col + source link', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'components', 'card-decision', 'card-decision.html'), 'utf8');
  assert.ok(html.includes('cd-rail'));
  assert.ok(html.includes('cd-grid'));
  assert.ok(html.includes('cd-source'));
  assert.ok(html.includes('cd-time'));
});

test('v07: decisions.html charge colors_and_type.css v06 + sprite SVG', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'pages', 'decisions.html'), 'utf8');
  assert.ok(html.includes('v06/_shared/colors_and_type.css'), 'doit importer colors_and_type.css v06');
  assert.ok(html.includes('v06/_shared/icons.svg.html'), 'doit charger le sprite SVG v06');
});
