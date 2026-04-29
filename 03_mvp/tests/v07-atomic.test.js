/**
 * tests/v07-atomic.test.js — S6.11-EE : 17 pages migrees v06->v07 + aide v07
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const V07_ROOT = path.resolve(__dirname, '..', 'public', 'v07');
const PAGES = ['decisions', 'projets', 'equipe', 'revues', 'agenda', 'taches', 'evening', 'settings', 'projet', 'index', 'arbitrage', 'onboarding', 'hub', 'assistant', 'connaissance', 'coaching', 'components', 'aide'];

test('v07: structure de base presente', () => {
  ['shared/tokens.css','shared/tweaks.css','shared/store.js','shared/component-loader.js'].forEach(f =>
    assert.ok(fs.existsSync(path.join(V07_ROOT, f)), f + ' manquant'));
});

test('v07: 12 composants atomiques presents avec triplet html+js+css', () => {
  ['header-topbar','drawer-sidebar','kpi-tile','card-decision','seg-filter','search-pill','modal-detail','empty-state','pill-project','pill-type','pill-status','time-filter'].forEach(name => {
    const dir = path.join(V07_ROOT, 'components', name);
    assert.ok(fs.existsSync(dir), name);
    ['.html','.js','.css'].forEach(ext =>
      assert.ok(fs.existsSync(path.join(dir, name + ext)), name + ext));
  });
});

test('v07: 18 pages migrees + 18 stores presents', () => {
  PAGES.forEach(id => {
    assert.ok(fs.existsSync(path.join(V07_ROOT, 'pages', id + '.html')), 'page ' + id);
    assert.ok(fs.existsSync(path.join(V07_ROOT, 'stores', id + '-store.js')), 'store ' + id);
  });
});

test('v07: chaque page reference les composants essentiels', () => {
  PAGES.forEach(id => {
    const html = fs.readFileSync(path.join(V07_ROOT, 'pages', id + '.html'), 'utf8');
    // Pages avec UX specifique :
    // - hub : hero greeting custom (pas de header-topbar standard)
    // - aide : contenu statique (pas de data-region timeline, sections en dur)
    let required;
    if (id === 'aide') {
      required = ['data-component="drawer-sidebar"','data-component="header-topbar"','data-component="modal-detail"'];
    } else if (id === 'hub') {
      required = ['data-component="drawer-sidebar"','data-component="modal-detail"','data-region="timeline"'];
    } else {
      required = ['data-component="drawer-sidebar"','data-component="header-topbar"','data-component="modal-detail"','data-region="timeline"'];
    }
    required.forEach(m => assert.ok(html.includes(m), id + '.html manque ' + m));
  });
});

test('v07: chaque page importe colors_and_type v06 + sprite SVG', () => {
  PAGES.forEach(id => {
    const html = fs.readFileSync(path.join(V07_ROOT, 'pages', id + '.html'), 'utf8');
    assert.ok(html.includes('v06/_shared/colors_and_type.css'), id);
    assert.ok(html.includes('v06/_shared/icons.svg.html'), id);
  });
});

test('v07: chaque page a une bottom-tab nav (mobile)', () => {
  PAGES.forEach(id => {
    const html = fs.readFileSync(path.join(V07_ROOT, 'pages', id + '.html'), 'utf8');
    assert.ok(html.includes('class="bottom-tab-nav"'), id + ' bottom-tab manquant');
    assert.ok(html.includes('fab-trigger'), id + ' FAB manquant');
  });
});

test('v07: chaque page a un footer strategic-q', () => {
  PAGES.forEach(id => {
    const html = fs.readFileSync(path.join(V07_ROOT, 'pages', id + '.html'), 'utf8');
    assert.ok(html.includes('app-footer'), id + ' footer manquant');
    assert.ok(html.includes('strategic-q'), id + ' strategic-q manquant');
  });
});

test('v07: tokens.css aligne v06 (ivory + ink + Fira Sans)', () => {
  const css = fs.readFileSync(path.join(V07_ROOT, 'shared', 'tokens.css'), 'utf8');
  ['--ivory-50','--ink-900','--primary-500','Fira Sans'].forEach(t =>
    assert.ok(css.includes(t), t));
});

test('v07: drawer-sidebar a 3 sections + sprite SVG', () => {
  const js = fs.readFileSync(path.join(V07_ROOT, 'components', 'drawer-sidebar', 'drawer-sidebar.js'), 'utf8');
  ["'Pilotage'", "'Travail'", "'Capital'", 'use href="#i-'].forEach(t =>
    assert.ok(js.includes(t), t));
});

test('v07: card-decision a rail + grid + source + time', () => {
  const html = fs.readFileSync(path.join(V07_ROOT, 'components', 'card-decision', 'card-decision.html'), 'utf8');
  ['cd-rail','cd-grid','cd-source','cd-time'].forEach(c =>
    assert.ok(html.includes(c), c));
});
