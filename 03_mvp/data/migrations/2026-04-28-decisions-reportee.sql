-- ----------------------------------------------------------
-- 2026-04-28-decisions-reportee.sql -- Sprint v0.7-S6.6
-- Ajoute le status 'reportee' a decisions.
-- SQLite ne permet pas ALTER TABLE pour modifier CHECK : on recree la table.
-- NB : init-db.js wrap deja en transaction (db.transaction). Pas de BEGIN/COMMIT.
-- ----------------------------------------------------------

ALTER TABLE decisions RENAME TO decisions_old_v06;

CREATE TABLE decisions (
    id          TEXT PRIMARY KEY,
    project_id  TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    context     TEXT,
    decision    TEXT,
    owner       TEXT,
    status      TEXT CHECK(status IN ('ouverte','decidee','executee','abandonnee','reportee')) DEFAULT 'ouverte',
    decided_at  TEXT,
    deadline    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO decisions (id, project_id, title, context, decision, owner, status, decided_at, deadline, created_at, updated_at)
SELECT id, project_id, title, context, decision, owner, status, decided_at, deadline, created_at, updated_at
FROM decisions_old_v06;

CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);

DROP TABLE decisions_old_v06;
