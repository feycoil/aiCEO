#!/usr/bin/env node
/* generate-pilotage.js — Genere 04_docs/00-pilotage-projet.html */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(PROJECT_ROOT, '04_docs', '00-pilotage-projet.html');
const TEMPLATE = path.join(__dirname, 'pilotage-template.html');

function scanMd(dir, base, results) {
  base = base || PROJECT_ROOT;
  results = results || [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      if (['.git', 'node_modules', '_archive', '.claude', '_audit-2026-04-25'].includes(e.name)) continue;
      scanMd(full, base, results);
    } else if (e.isFile() && e.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(full, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : e.name.replace('.md', '');
        const stat = fs.statSync(full);
        let category = 'autre';
        if (/00_BOUSSOLE/.test(rel)) category = 'gouvernance';
        else if (/audit/i.test(rel)) category = 'audit';
        else if (/methode|method/i.test(rel)) category = 'methode';
        else if (/release-notes/i.test(rel)) category = 'release';
        else if (/sprint/i.test(rel)) category = 'sprint';
        else if (/api/i.test(rel)) category = 'api';
        else if (/recette|onboarding/i.test(rel)) category = 'recette';
        else if (/^04_docs\//.test(rel)) category = 'doc';
        else if (/03_mvp/.test(rel)) category = 'tech';
        else if (rel === 'CLAUDE.md' || rel === 'README.md') category = 'racine';
        results.push({
          path: rel, title, category,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
          excerpt: content.slice(0, 300).replace(/[#*\n]/g, ' ').trim().slice(0, 200)
        });
      } catch (e) { /* skip */ }
    }
  }
  return results;
}

function parseAdrs() {
  const adrPath = path.join(PROJECT_ROOT, '00_BOUSSOLE', 'DECISIONS.md');
  if (!fs.existsSync(adrPath)) return [];
  const content = fs.readFileSync(adrPath, 'utf-8');
  const adrs = [];
  const regex = /^## (\d{4}-\d{2}-\d{2})(?:\s+v?(\d+))?\s*[·\-]?\s*(.+)$/gm;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const date = m[1];
    const vNum = m[2];
    const title = m[3];
    const start = m.index + m[0].length;
    const next = content.slice(start).search(/^## \d{4}-\d{2}-\d{2}/m);
    const block = next > 0 ? content.slice(start, start + next) : content.slice(start, start + 1500);
    const statutMatch = block.match(/\*\*Statut\*\*\s*:\s*([^·\n*]+)/);
    const statut = statutMatch ? statutMatch[1].trim() : 'Acte';
    adrs.push({
      date,
      version: vNum || null,
      title: title.trim(),
      statut,
      summary: block.slice(0, 600).replace(/[#*]/g, '').replace(/\n+/g, ' ').trim().slice(0, 500)
    });
  }
  return adrs;
}

function gitData() {
  try {
    const log = execSync('git log --pretty=format:"%H|%h|%ad|%s|%an" --date=short -n 100', {
      cwd: PROJECT_ROOT, encoding: 'utf-8'
    });
    const commits = log.trim().split('\n').map(line => {
      const parts = line.split('|');
      return { hash: parts[0], short: parts[1], date: parts[2], message: parts[3] || '', author: parts[4] || '' };
    });
    const tagsRaw = execSync('git tag --sort=-creatordate', { cwd: PROJECT_ROOT, encoding: 'utf-8' })
      .trim().split('\n').filter(Boolean);
    const tags = tagsRaw.map(t => {
      try {
        const sha = execSync('git rev-list -n 1 ' + t, { cwd: PROJECT_ROOT, encoding: 'utf-8' }).trim();
        const date = execSync('git log -1 --format=%ad --date=short ' + t, { cwd: PROJECT_ROOT, encoding: 'utf-8' }).trim();
        return { tag: t, sha: sha.slice(0, 7), date };
      } catch (e) { return { tag: t, sha: '', date: '' }; }
    });
    return { commits, tags };
  } catch (e) { return { commits: [], tags: [] }; }
}

function loadConsistence() {
  const p = path.join(PROJECT_ROOT, 'consistence-dump.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch (e) { return null; }
}

// Scan tree : structure du dossier projet (3 niveaux max)
function scanTree(dir, base, depth) {
  base = base || PROJECT_ROOT;
  depth = depth || 0;
  if (depth > 3) return null;
  const name = path.basename(dir);
  const rel = path.relative(base, dir).replace(/\\/g, '/');
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    return { type: 'file', name, path: rel, size: stat.size, mtime: stat.mtime.toISOString() };
  }
  if (['.git', 'node_modules', '_archive', '.claude'].includes(name)) return null;
  const children = [];
  try {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
      const sub = path.join(dir, e.name);
      const node = scanTree(sub, base, depth + 1);
      if (node) children.push(node);
    });
  } catch (e) { /* skip */ }
  // Sort : dirs first, then files
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return {
    type: 'dir',
    name: name === '' ? 'aiCEO' : name,
    path: rel || '.',
    children,
    file_count: children.filter(c => c.type === 'file').length,
    dir_count: children.filter(c => c.type === 'dir').length
  };
}

// GitHub state : dernier consistence-dump.json + tentative gh CLI
function githubState() {
  const dump = loadConsistence();
  let snapshot = { milestones: [], issues_open: 0, issues_closed: 0, releases: [] };
  if (dump) {
    snapshot.milestones = dump.milestones || [];
    snapshot.releases = dump.releases || [];
    if (dump.issues) {
      snapshot.issues_open = dump.issues.filter(i => i.state === 'open').length;
      snapshot.issues_closed = dump.issues.filter(i => i.state === 'closed').length;
    }
  }
  return snapshot;
}

// Embarque le contenu complet des .md essentiels pour viewer integre
// (evite fetch CORS sur file://). Limite raisonnable : ~300 KB total.
function loadEssentialDocs() {
  const essentials = {};
  const patterns = [
    /^00_BOUSSOLE\//,
    /^04_docs\/00_methode\//,
    /^04_docs\/_release-notes\//,
    /^04_docs\/_sprints\//,
    /^04_docs\/audits\//,
    /^04_docs\/03_roadmap\//,
    /^04_docs\/api\//,
    /^CLAUDE\.md$/,
    /^README\.md$/,
    /^04_docs\/0[0-9].*\.md$/  // 00-README, 01-vision, etc.
  ];
  function scan(dir, base) {
    base = base || PROJECT_ROOT;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = path.relative(base, full).replace(/\\/g, '/');
      if (e.isDirectory()) {
        if (['.git', 'node_modules', '_archive', '.claude'].includes(e.name)) continue;
        scan(full, base);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        const matchEssential = patterns.some(p => p.test(rel));
        if (matchEssential) {
          try {
            const content = fs.readFileSync(full, 'utf-8');
            // Cap a 60 KB par fichier pour eviter explosion
            essentials[rel] = content.slice(0, 60000);
          } catch (e) { /* skip */ }
        }
      }
    }
  }
  scan(PROJECT_ROOT);
  const totalSize = Object.values(essentials).reduce((s, c) => s + c.length, 0);
  console.log('  Embedded ' + Object.keys(essentials).length + ' essential docs (' + Math.round(totalSize/1024) + ' KB)');
  return essentials;
}

function parseReleases() {
  const dir = path.join(PROJECT_ROOT, '04_docs', '_release-notes');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  return files.map(f => {
    const full = path.join(dir, f);
    const content = fs.readFileSync(full, 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const stat = fs.statSync(full);
    const version = f.replace('.md', '');
    return {
      version,
      file: f,
      title: titleMatch ? titleMatch[1].trim() : version,
      mtime: stat.mtime.toISOString(),
      size: stat.size,
      summary: content.slice(0, 800).replace(/[#*]/g, '').replace(/\n+/g, ' ').trim().slice(0, 500),
      path: '_release-notes/' + f
    };
  }).sort((a, b) => b.version.localeCompare(a.version));
}

function velocity(commits) {
  const byDay = {};
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  commits.forEach(c => { if (byDay[c.date] !== undefined) byDay[c.date]++; });
  return Object.entries(byDay).reverse().map(([date, count]) => ({ date, count }));
}

function generate() {
  console.log('Scanning .md files...');
  const docs = scanMd(PROJECT_ROOT);
  console.log('  Found ' + docs.length + ' .md files');

  console.log('Parsing ADRs...');
  const adrs = parseAdrs();
  console.log('  Found ' + adrs.length + ' ADRs');

  console.log('Reading git log...');
  const git = gitData();
  console.log('  ' + git.commits.length + ' commits, ' + git.tags.length + ' tags');

  const vel = velocity(git.commits);
  const consistence = loadConsistence();

  console.log('Scanning project tree...');
  const tree = scanTree(PROJECT_ROOT);
  console.log('  ' + (tree ? tree.dir_count : 0) + ' top-level dirs');

  console.log('Loading GitHub state...');
  const ghState = githubState();

  console.log('Parsing release notes...');
  const releases = parseReleases();
  console.log('  Found ' + releases.length + ' releases');

  console.log('Loading essential .md content for embedded viewer...');
  const essentialDocs = loadEssentialDocs();
  console.log('  ' + ghState.milestones.length + ' milestones, ' + ghState.issues_open + ' open issues');

  const data = {
    generated_at: new Date().toISOString(),
    docs, adrs,
    commits: git.commits,
    tags: git.tags,
    velocity_30j: vel,
    consistence,
    tree,
    github: ghState,
    releases,
    essential_docs: essentialDocs
  };

  if (!fs.existsSync(TEMPLATE)) {
    console.error('Template not found: ' + TEMPLATE);
    process.exit(1);
  }
  let html = fs.readFileSync(TEMPLATE, 'utf-8');
  html = html.replace('/*PILOTAGE_DATA*/', JSON.stringify(data));

  fs.writeFileSync(OUTPUT, html, 'utf-8');
  console.log('\nGenerated: ' + OUTPUT);
  console.log('Size: ' + (fs.statSync(OUTPUT).size / 1024).toFixed(1) + ' KB');
}

generate();
