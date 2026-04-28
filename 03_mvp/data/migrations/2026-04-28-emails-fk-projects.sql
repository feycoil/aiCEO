-- ----------------------------------------------------------
-- 2026-04-28-emails-fk-projects.sql — Sprint v0.7-S6.7
-- Ajoute emails.project_id (FK projects.id ON DELETE SET NULL).
-- Permet le rattachement manuel ou auto-suggéré d'un email à un projet.
-- ----------------------------------------------------------

ALTER TABLE emails ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_emails_project_id ON emails(project_id);

-- knowledge_pins : table pour épinglage decisions/critères côté connaissance.html
CREATE TABLE IF NOT EXISTS knowledge_pins (
    id           TEXT PRIMARY KEY,
    kind         TEXT CHECK(kind IN ('decision','criterion','principle','note')) DEFAULT 'note',
    title        TEXT NOT NULL,
    content      TEXT,
    source_type  TEXT,                     -- 'decision','task','arbitrage','manuel'
    source_id    TEXT,
    pinned_at    TEXT NOT NULL DEFAULT (datetime('now')),
    archived_at  TEXT,
    tags         TEXT,                     -- JSON array
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_knowledge_pins_kind ON knowledge_pins(kind);
CREATE INDEX IF NOT EXISTS idx_knowledge_pins_archived ON knowledge_pins(archived_at);
