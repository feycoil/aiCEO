-- ============================================================
-- 2026-05-01 — S6.36 — Schéma Domains + Companies + projects.domain_id/company_id
-- ============================================================
-- Architecture validée 1/5 (CEO + Claude) :
-- 2 axes orthogonaux pour les projets : Domaine + Société (NON-hiérarchique).
-- 3 vues toggle dans /projets : Société (défaut) / Domaine / À traiter.
--
-- Domaine = thématique entrepreneuriale (Finance, RH, Sales, Ops, Tech, ...).
-- Société = entité juridique / business unit (ETIC Services, holding X, ...).
-- Un projet peut avoir 0 ou 1 domain_id ET 0 ou 1 company_id (deux axes indépendants).
--
-- Le champ projects.companies (JSON array) existant reste — il représente les
-- sociétés impactées (M:N étendu). Le nouveau company_id est la société principale.
--
-- Tenant_id ajouté pour cohérence multi-tenant V1.
-- ============================================================

-- 1. Table domains -----------------------------------------------
CREATE TABLE IF NOT EXISTS domains (
    id            TEXT PRIMARY KEY,
    tenant_id     TEXT NOT NULL DEFAULT 'default',
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL,
    color         TEXT,                          -- hex token, ex: #7C3AED
    icon          TEXT,                          -- emoji ou code SVG
    description   TEXT,
    display_order INTEGER DEFAULT 50,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_tenant_slug ON domains(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_domains_order ON domains(display_order);

-- 2. Table companies ---------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id            TEXT PRIMARY KEY,
    tenant_id     TEXT NOT NULL DEFAULT 'default',
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL,
    color         TEXT,
    icon          TEXT,
    description   TEXT,
    parent_id     TEXT REFERENCES companies(id) ON DELETE SET NULL,  -- holding
    display_order INTEGER DEFAULT 50,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_tenant_slug ON companies(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_companies_parent ON companies(parent_id);

-- 3. Projects : ajouter domain_id et company_id (1:1 axe principal) ---
ALTER TABLE projects ADD COLUMN domain_id  TEXT REFERENCES domains(id)   ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_domain  ON projects(domain_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);

-- 4. Seed : 8 domaines entrepreneuriaux de base (tenant 'default') ----
INSERT OR IGNORE INTO domains (id, tenant_id, name, slug, color, icon, description, display_order) VALUES
  ('dom-finance',   'default', 'Finance',     'finance',   '#10B981', '💰', 'Trésorerie, comptabilité, financement, contrôle de gestion', 10),
  ('dom-sales',     'default', 'Sales',       'sales',     '#F59E0B', '🤝', 'Commercial, prospection, deals, partenariats stratégiques',  20),
  ('dom-marketing', 'default', 'Marketing',   'marketing', '#EC4899', '📢', 'Communication, brand, contenu, événements',                  30),
  ('dom-ops',       'default', 'Operations',  'operations','#3B82F6', '⚙️', 'Production, qualité, supply chain, logistique',              40),
  ('dom-rh',        'default', 'RH',          'rh',        '#8B5CF6', '👥', 'Recrutement, formation, paie, climat',                       50),
  ('dom-tech',      'default', 'Tech',        'tech',      '#0EA5E9', '💻', 'Produit, IT, infra, dev, sécurité',                          60),
  ('dom-strategie', 'default', 'Stratégie',   'strategie', '#F97316', '🧭', 'Vision, gouvernance, M&A, transformations',                  70),
  ('dom-legal',     'default', 'Legal',       'legal',     '#64748B', '⚖️', 'Juridique, contractuel, conformité, propriété intellectuelle', 80);

-- 5. Seed : 1 société par défaut (tenant 'default') -------------------
INSERT OR IGNORE INTO companies (id, tenant_id, name, slug, color, icon, description, display_order) VALUES
  ('comp-default', 'default', 'Mon entreprise', 'default', '#0F172A', '🏢', 'Société par défaut — à renommer dans Réglages > Sociétés', 10);
