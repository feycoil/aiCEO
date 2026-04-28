/**
 * components-gallery.test.js — Smoke test S6.1.5 (gallery composants)
 *
 * Mode : filesystem-only (pas de spawn serveur). Le smoke HTTP cote serveur
 * est couvert par smoke-all.ps1 (S5.02). Ce test valide les livrables S6.1
 * sur disque pour ne pas dependre du boot serveur ni d'une DB / API key.
 *
 * Verifie :
 *   - public/components.html existe + contient les 27 ancres + structure HTML
 *   - public/_shared/icons.svg existe + contient 30 symbols Lucide
 *   - public/_shared/index.css existe + contient 27 imports composants actifs
 *   - 27 fichiers public/_shared/06_components/c-*.css existent et sont non-vides
 *   - 3 fichiers public/_shared/01_settings/tokens-*.css existent
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const COMPONENTS = [
  // Atoms (11)
  "c-button", "c-input", "c-badge", "c-avatar", "c-icon", "c-spinner",
  "c-skeleton", "c-switch", "c-checkbox", "c-radio", "c-tag",
  // Molecules (9)
  "c-search-pill", "c-form-field", "c-toast", "c-tooltip", "c-progress-meter",
  "c-stepper", "c-dropdown", "c-tabs", "c-pagination",
  // Organisms (7)
  "c-drawer", "c-header", "c-footer", "c-modal", "c-cmdk",
  "c-empty-state", "c-error-state",
];

test("S6.1.5 - public/components.html existe + 27 ancres + structure HTML", () => {
  const f = path.join(PUBLIC, "components.html");
  assert.ok(fs.existsSync(f), "components.html manquant");
  const html = fs.readFileSync(f, "utf-8");
  assert.match(html, /<title>aiCEO/, "title aiCEO absent");
  assert.match(html, /Components Gallery/, "intitule Gallery absent");
  assert.match(html, /<link rel="stylesheet" href="\/_shared\/index.css">/, "link index.css absent");
  for (const c of COMPONENTS) {
    const id = c.replace(/^c-/, "");
    assert.ok(html.includes(`id="${id}"`), `section #${id} manquante dans components.html`);
  }
});

test("S6.1.6 - public/_shared/icons.svg existe + 30 symbols", () => {
  const f = path.join(PUBLIC, "_shared", "icons.svg");
  assert.ok(fs.existsSync(f), "icons.svg manquant");
  const svg = fs.readFileSync(f, "utf-8");
  const symbolCount = (svg.match(/<symbol /g) || []).length;
  assert.equal(symbolCount, 30, `attendu 30 symbols, trouve ${symbolCount}`);
  // Verifier 4 icones cles couvrant les 4 categories
  assert.match(svg, /id="icon-home"/,     "icone navigation absente");
  assert.match(svg, /id="icon-plus"/,     "icone action absente");
  assert.match(svg, /id="icon-check"/,    "icone status absente");
  assert.match(svg, /id="icon-sparkles"/, "icone coaching absente");
});

test("S6.1.1 - public/_shared/index.css existe + 27 imports actifs", () => {
  const f = path.join(PUBLIC, "_shared", "index.css");
  assert.ok(fs.existsSync(f), "index.css manquant");
  const css = fs.readFileSync(f, "utf-8");
  // Imports tokens (3 niveaux)
  assert.match(css, /@import url\("\.\/01_settings\/tokens-primitive\.css"\)/);
  assert.match(css, /@import url\("\.\/01_settings\/tokens-semantic\.css"\)/);
  assert.match(css, /@import url\("\.\/01_settings\/tokens-component\.css"\)/);
  // 27 imports composants actifs (decommentes)
  let active = 0;
  for (const c of COMPONENTS) {
    const re = new RegExp(`^@import url\\("\\./06_components/${c}\\.css"\\);`, "m");
    if (re.test(css)) active++;
  }
  assert.equal(active, 27, `attendu 27 imports actifs, trouve ${active}`);
});

test("S6.1.2/3/4 - 27 fichiers c-*.css existent et sont non-vides (>200 chars)", () => {
  for (const c of COMPONENTS) {
    const f = path.join(PUBLIC, "_shared", "06_components", `${c}.css`);
    assert.ok(fs.existsSync(f), `${c}.css manquant`);
    const css = fs.readFileSync(f, "utf-8");
    assert.ok(css.length > 200, `${c}.css trop court (${css.length} chars)`);
    // Verifier BEM strict : presence de la classe racine
    assert.match(css, new RegExp(`\\.${c}[\\s,{]`), `classe .${c} absente du fichier`);
  }
});

test("S6.1.1 - 3 fichiers tokens-*.css existent + non-vides", () => {
  for (const f of ["tokens-primitive.css", "tokens-semantic.css", "tokens-component.css"]) {
    const p = path.join(PUBLIC, "_shared", "01_settings", f);
    assert.ok(fs.existsSync(p), `${f} manquant`);
    const css = fs.readFileSync(p, "utf-8");
    assert.ok(css.length > 500, `${f} trop court (${css.length} chars)`);
    assert.match(css, /:root\s*\{/, `${f} sans :root { ... }`);
  }
});

test("S6.1.x - sanity check : zero hex en dur dans les composants (sauf transparent/tokens primitive)", () => {
  // Regle DS : composants doivent reference var(--token), pas de #xxx en dur
  // Tolere : #fff, #000 (rare cas pour bordures), transparent
  const FORBIDDEN = /#[0-9a-fA-F]{6}/g;
  let violations = [];
  for (const c of COMPONENTS) {
    const f = path.join(PUBLIC, "_shared", "06_components", `${c}.css`);
    const css = fs.readFileSync(f, "utf-8");
    const matches = css.match(FORBIDDEN) || [];
    for (const m of matches) {
      if (m.toLowerCase() === "#ffffff" || m.toLowerCase() === "#000000") continue;
      violations.push(`${c}.css : ${m}`);
    }
  }
  assert.equal(violations.length, 0,
    `${violations.length} hex en dur trouves : ${violations.slice(0, 5).join(", ")}`);
});
