-- ============================================================
-- 2026-04-30 — Multi-tenant readiness (A6 audit Phase 1D)
-- ============================================================
-- Pendant de l'audit "Plan de réalignement aiCEO 2026-04-28" recommandation A6 :
--   "Préparer V1 multi-tenant : ajouter colonne tenant_id TEXT NOT NULL DEFAULT 'default'
--    partout dès maintenant. Migration coûteuse plus tard."
--
-- Cette migration ajoute tenant_id à toutes les tables métier (16 tables).
-- Toutes les lignes existantes héritent de tenant_id='default'.
--
-- Avant V1 : la couche routing/auth filtrera par tenant_id (Express middleware).
-- Pas de FK ajoutée ici (pas de table tenants encore — sera créée en V1).
-- Indexes composites tenant_id+id ajoutés sur les tables fréquemment requêtées.
--
-- BLOQUANT V1 levé.
-- ============================================================

-- 1. Pilotage ----------------------------------------------------
ALTER TABLE tasks                  ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE decisions              ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE contacts               ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE projects               ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE groups                 ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE events                 ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE emails                 ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

-- 2. Rituels -----------------------------------------------------
ALTER TABLE weekly_reviews         ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE weeks                  ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE big_rocks              ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE evening_sessions       ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE arbitrage_sessions     ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

-- 3. Préférences -------------------------------------------------
ALTER TABLE settings               ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE user_preferences       ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

-- 4. Assistant + connaissance ------------------------------------
ALTER TABLE assistant_conversations ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE assistant_messages     ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE knowledge_pins         ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

-- 5. Indexes composites pour requêtes filtrées par tenant -------
-- (les indexes existants restent — ces nouveaux sont prefix tenant_id pour V1 routing)
CREATE INDEX IF NOT EXISTS idx_tasks_tenant     ON tasks(tenant_id, project_id, done);
CREATE INDEX IF NOT EXISTS idx_decisions_tenant ON decisions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_tenant  ON projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_emails_tenant    ON emails(tenant_id, received_at);
CREATE INDEX IF NOT EXISTS idx_events_tenant    ON events(tenant_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_pins_tenant      ON knowledge_pins(tenant_id, pinned_at);

-- 6. Note sur email_feedback (CREATE TABLE IF NOT EXISTS dans arbitrage.js) ----
-- La table email_feedback est créée à chaud par src/routes/arbitrage.js.
-- Le tenant_id sera ajouté à cette définition source dans un commit séparé.
-- En attendant, le defaut 'default' est implicite via la logique applicative.
