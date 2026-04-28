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

  const data = {
    generated_at: new Date().toISOString(),
    docs, adrs,
    commits: git.commits,
    tags: git.tags,
    velocity_30j: vel,
    consistence
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
