/**
 * src/routes/projects.js — projets attachés à un groupe.
 *
 *   GET    /api/projects                  (filtres: group, status, q)
 *   POST   /api/projects
 *   GET    /api/projects/:id              + counts (tasks ouvertes, decisions ouvertes, contacts liés)
 *   PATCH  /api/projects/:id
 *   DELETE /api/projects/:id
 *   POST   /api/projects/:id/progress     { progress: 0-100 }
 */
const express = require('express');
const { getDb, crud } = require('../db');

const projects = crud('projects', { jsonFields: ['companies'] });
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { group, status, q, limit, offset, domain, company } = req.query;
    const filters = {};
    if (group !== undefined) filters.group_id = group;
    if (status) filters.status = status;
    // S6.36 : filtres par axe domain et company (orthogonaux)
    if (domain !== undefined) filters.domain_id = domain || null;
    if (company !== undefined) filters.company_id = company || null;
    const opts = {
      orderBy: "CASE status WHEN 'hot' THEN 0 WHEN 'active' THEN 1 WHEN 'new' THEN 2 ELSE 9 END, name ASC",
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    if (q) {
      const safe = String(q).replace(/'/g, "''");
      opts.where = `(name LIKE '%${safe}%' OR tagline LIKE '%${safe}%' OR description LIKE '%${safe}%')`;
    }
    const rows = projects.list(filters, opts);
    res.json({ projects: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !String(body.name).trim()) return res.status(400).json({ error: 'name requis' });
    const data = {
      id: body.id || undefined, // permettre slug perso
      name: String(body.name).trim(),
      group_id: body.group_id ?? null,
      tagline: body.tagline ?? null,
      status: body.status || 'active',
      description: body.description ?? null,
      color: body.color ?? null,
      icon: body.icon ?? null,
      progress: typeof body.progress === 'number' ? body.progress : 0,
      companies: body.companies ?? null,
      // S6.36 : 2 axes orthogonaux
      domain_id: body.domain_id ?? null,
      company_id: body.company_id ?? null,
    };
    const created = projects.insert(data);
    res.status(201).json({ project: created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const p = projects.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'projet introuvable' });
  const db = getDb();
  const id = req.params.id;
  const counts = {
    tasks_open: db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE project_id = ? AND done = 0").get(id).n,
    tasks_total: db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE project_id = ?").get(id).n,
    tasks_done_30d: db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE project_id = ? AND done = 1 AND updated_at >= datetime('now','-30 days')").get(id).n,
    decisions_open: db.prepare("SELECT COUNT(*) AS n FROM decisions WHERE project_id = ? AND status = 'ouverte'").get(id).n,
    decisions_total: db.prepare("SELECT COUNT(*) AS n FROM decisions WHERE project_id = ?").get(id).n,
    contacts: db.prepare("SELECT COUNT(*) AS n FROM contacts_projects WHERE project_id = ?").get(id).n,
    events_upcoming: db.prepare("SELECT COUNT(*) AS n FROM events WHERE project_id = ? AND starts_at >= datetime('now')").get(id).n
  };
  let children = [];
  let parent = null;
  let domain = null;
  let company = null;
  try {
    children = db.prepare("SELECT id, name, status, tagline, progress FROM projects WHERE parent_id = ? ORDER BY updated_at DESC").all(id);
    if (p.parent_id) parent = db.prepare("SELECT id, name FROM projects WHERE id = ?").get(p.parent_id);
    // S6.36 : axes domain + company
    if (p.domain_id) {
      try { domain = db.prepare("SELECT id, name, slug, color, icon FROM domains WHERE id = ?").get(p.domain_id); } catch (e) {}
    }
    if (p.company_id) {
      try { company = db.prepare("SELECT id, name, slug, color, icon FROM companies WHERE id = ?").get(p.company_id); } catch (e) {}
    }
  } catch (e) {}
  const recentTasks = db.prepare("SELECT id, title, done, priority, type, updated_at FROM tasks WHERE project_id = ? ORDER BY updated_at DESC LIMIT 10").all(id);
  const recentDecisions = db.prepare("SELECT id, title, status, updated_at FROM decisions WHERE project_id = ? ORDER BY updated_at DESC LIMIT 5").all(id);
  const velocity = counts.tasks_total > 0 ? Math.round((counts.tasks_total - counts.tasks_open) / counts.tasks_total * 100) : 0;
  res.json({ project: Object.assign({}, p, { counts: counts, parent: parent, children: children, domain: domain, company: company, recent_tasks: recentTasks, recent_decisions: recentDecisions, velocity_pct: velocity }) });
});

router.patch('/:id', (req, res) => {
  try {
    const existing = projects.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'projet introuvable' });
    const allowed = ['name', 'group_id', 'tagline', 'status', 'description', 'color', 'icon', 'progress', 'companies', 'parent_id', 'effort_done_days', 'effort_remaining_days', 'domain_id', 'company_id'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ project: existing });
    const updated = projects.update(req.params.id, patch);
    res.json({ project: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existed = projects.get(req.params.id);
    if (!existed) return res.status(404).json({ error: 'projet introuvable' });
    projects.remove(req.params.id);
    res.json({ ok: true, removed: existed.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/progress', (req, res) => {
  try {
    const { progress } = req.body || {};
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'progress doit être un nombre entre 0 et 100' });
    }
    const p = projects.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'projet introuvable' });
    const updated = projects.update(req.params.id, { progress });
    res.json({ project: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.get('/:id/emails', (req, res) => {
  try {
    const db = getDb();
    const proj = projects.get(req.params.id);
    if (!proj) return res.status(404).json({ error: 'projet introuvable' });
    // Tolerant si colonne emails.project_id absente
    let rows = [];
    try {
      rows = db.prepare(`
        SELECT id, subject, from_name, from_email, received_at, arbitrated_at, is_read, has_attach, inferred_project
        FROM emails
        WHERE project_id = ? OR LOWER(inferred_project) = LOWER(?)
        ORDER BY received_at DESC
        LIMIT 50
      `).all(req.params.id, proj.name || '');
    } catch (e) {
      // fallback : pas de colonne project_id
      rows = db.prepare(`
        SELECT id, subject, from_name, from_email, received_at, arbitrated_at, is_read, has_attach, inferred_project
        FROM emails
        WHERE LOWER(inferred_project) = LOWER(?)
        ORDER BY received_at DESC
        LIMIT 50
      `).all(proj.name || '');
    }
    res.json({ project_id: proj.id, project_name: proj.name, emails: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === S6.37 — Triage workflow rattachement projet ===
// POST /api/projects/suggest { text } -> { suggestions: [...top 5 projets candidats] }
// Permet au Triage de proposer 3 options (rattacher / sous-thread / nouveau) sur la base
// d'un matching simple sur name/tagline/description par mots-clés.
router.post('/suggest', (req, res) => {
  try {
    const text = String((req.body && req.body.text) || '').toLowerCase().trim();
    if (!text || text.length < 3) return res.json({ suggestions: [], reason: 'text trop court' });
    const db = getDb();
    // tokenize : mots > 3 chars, retirer accents/ponctuation
    const tokens = text
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4);
    if (!tokens.length) return res.json({ suggestions: [], reason: 'aucun token utile' });
    // limiter à 6 tokens distincts
    const uniq = [...new Set(tokens)].slice(0, 6);
    // construire un WHERE OR pour LIKE sur name/tagline/description
    const conds = [];
    const params = [];
    uniq.forEach(t => {
      const safe = t.replace(/'/g, "''");
      conds.push("(LOWER(name) LIKE ? OR LOWER(tagline) LIKE ? OR LOWER(description) LIKE ?)");
      const pat = '%' + safe + '%';
      params.push(pat, pat, pat);
    });
    const whereClause = conds.join(' OR ');
    let rows = [];
    try {
      rows = db.prepare(
        "SELECT id, name, tagline, status, domain_id, company_id, parent_id FROM projects WHERE status NOT IN ('archived') AND (" + whereClause + ") LIMIT 20"
      ).all(...params);
    } catch (e) {}
    // scorer naïvement par nombre de tokens présents dans name+tagline+description
    const scored = rows.map(p => {
      const hay = ((p.name || '') + ' ' + (p.tagline || '') + ' ' + (p.description || ''))
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let score = 0;
      uniq.forEach(t => { if (hay.includes(t)) score += 1; });
      return Object.assign({}, p, { score });
    }).sort((a, b) => b.score - a.score).slice(0, 5);
    res.json({ suggestions: scored, tokens: uniq, count: scored.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === S6.40 — Auto-classification heuristique des projets ===
// POST /api/projects/auto-classify -> { proposed: [{id, name, domain_id, score}], applied: false }
// POST /api/projects/auto-classify { apply: true } -> applique et retourne { updated: N }
router.post('/auto-classify', (req, res) => {
  try {
    const apply = !!(req.body && req.body.apply);
    const db = getDb();
    // Mots-cles par domaine (rule-based simple, LLM ameliorable en V1)
    const RULES = {
      'dom-finance':    ['finance','tresor','tresorerie','compte','bank','banque','compta','facture','paie','budget','marge','cash','solde','iban','bilan','tva'],
      'dom-sales':      ['client','prospect','deal','vente','sales','commercial','contrat','proposition','rdv','demo','partenariat','partenaire'],
      'dom-marketing':  ['marketing','communication','site','seo','social','linkedin','newsletter','event','salon','presse','brand','campagne'],
      'dom-ops':        ['production','livraison','logistique','qualite','supply','stock','operation','process','fournisseur','chantier','signature'],
      'dom-rh':         ['recrut','salar','paye','cdi','cdd','rh','formation','onboard','candidat','entretien','cv'],
      'dom-tech':       ['tech','dev','code','infra','serveur','cloud','it','informatique','app','api','site','docker','github','deploy'],
      'dom-strategie':  ['strategie','vision','board','exec','gouvernance','m&a','transformation','plan','roadmap','pivot','orientation'],
      'dom-legal':      ['legal','juridique','contrat','nda','rgpd','litige','avocat','clause','propriete','marque']
    };
    const projects = db.prepare("SELECT id, name, tagline, description, domain_id FROM projects WHERE status NOT IN ('archived')").all();
    const proposals = [];
    for (const p of projects) {
      if (p.domain_id) continue; // deja classifie
      const hay = ((p.name || '') + ' ' + (p.tagline || '') + ' ' + (p.description || ''))
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let bestId = null;
      let bestScore = 0;
      for (const [domId, keywords] of Object.entries(RULES)) {
        let score = 0;
        for (const kw of keywords) { if (hay.includes(kw)) score += 1; }
        if (score > bestScore) { bestScore = score; bestId = domId; }
      }
      if (bestId && bestScore >= 1) {
        proposals.push({ id: p.id, name: p.name, domain_id: bestId, score: bestScore });
      }
    }
    let updated = 0;
    if (apply && proposals.length) {
      const stmt = db.prepare("UPDATE projects SET domain_id = ?, updated_at = datetime('now') WHERE id = ?");
      for (const prop of proposals) {
        try { stmt.run(prop.domain_id, prop.id); updated++; } catch (e) {}
      }
    }
    res.json({
      mode: apply ? 'applied' : 'proposed',
      total_projects: projects.length,
      already_classified: projects.length - proposals.length - projects.filter(p => !p.domain_id).length + proposals.length,
      proposals: proposals,
      proposed_count: proposals.length,
      updated: updated
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/projects/bulk-company { company_id } -> assigne company_id a tous les projets sans company
router.post('/bulk-company', (req, res) => {
  try {
    const cid = req.body && req.body.company_id;
    if (!cid) return res.status(400).json({ error: 'company_id requis' });
    const db = getDb();
    const exists = db.prepare("SELECT id FROM companies WHERE id = ?").get(cid);
    if (!exists) return res.status(404).json({ error: 'company introuvable' });
    const r = db.prepare("UPDATE projects SET company_id = ?, updated_at = datetime('now') WHERE company_id IS NULL AND status NOT IN ('archived')").run(cid);
    res.json({ updated: r.changes, company_id: cid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
