-- ============================================================
-- 2026-05-01 — Hiérarchie projets + champs vélocité (UX fix)
-- ============================================================
-- Pendant des feedbacks CEO sur la page Projets :
--   1. Sous-projets (hiérarchie parent → enfants)
--   2. Vélocité (effort fourni / à fournir visible sur card)
--
-- Ajoute :
--   - parent_id TEXT (self-FK soft) pour arborescence projets
--   - effort_done_days INTEGER (cumul depuis création)
--   - effort_remaining_days INTEGER (estimation restante CEO)
--
-- Backward compatible : NULL par défaut, pas de cascade.
-- ============================================================

ALTER TABLE projects ADD COLUMN parent_id              TEXT;
ALTER TABLE projects ADD COLUMN effort_done_days       REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN effort_remaining_days  REAL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_projects_parent ON projects(parent_id);
