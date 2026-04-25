-- ============================================================
-- aiCEO v0.5 — Schéma initial SQLite
-- Migration 2026-04-25 (Sprint S1)
-- ============================================================
-- Conventions :
--   - IDs en TEXT (UUIDv7 pour entités, slugs pour groups/projects)
--   - Timestamps en ISO 8601 (TEXT)
--   - JSON stocké en TEXT, parsé côté app
--   - Booléens : INTEGER 0/1
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ------------------------------------------------------------
-- 1. groups — portefeuille sociétés (3-4 holding)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS groups (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    tagline     TEXT,
    description TEXT,
    color       TEXT,                  -- token Twisty (rose|amber|indigo|emerald|sky|violet)
    icon        TEXT,                  -- emoji
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- 2. projects — projets attachés à un groupe
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id           TEXT PRIMARY KEY,
    group_id     TEXT REFERENCES groups(id) ON DELETE SET NULL,
    name         TEXT NOT NULL,
    tagline      TEXT,
    status       TEXT CHECK(status IN ('active','hot','new','suspended','archived')) DEFAULT 'active',
    description  TEXT,
    color        TEXT,                 -- override token Twisty
    icon         TEXT,                 -- emoji
    progress     INTEGER DEFAULT 0,    -- 0-100
    companies    TEXT,                 -- JSON array
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_group ON projects(group_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ------------------------------------------------------------
-- 3. tasks — tâches opérationnelles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id              TEXT PRIMARY KEY,
    project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    type            TEXT CHECK(type IN ('do','plan','delegate','defer')) DEFAULT 'do',
    priority        TEXT CHECK(priority IN ('P0','P1','P2','P3')) DEFAULT 'P2',
    eisenhower      TEXT CHECK(eisenhower IN ('UI','U-','-I','--')) DEFAULT '--',
    starred         INTEGER NOT NULL DEFAULT 0,
    done            INTEGER NOT NULL DEFAULT 0,
    due_at          TEXT,
    estimated_min   INTEGER,
    energy          TEXT CHECK(energy IN ('light','medium','deep')),
    ai_capable      INTEGER NOT NULL DEFAULT 0,
    ai_proposal     TEXT,
    context         TEXT,                          -- 'email','deep-work','meeting','phone'...
    source_type     TEXT,                          -- 'mail','event','arbitrage','manuel','auto-detect'
    source_id       TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- ------------------------------------------------------------
-- 4. decisions — registre décisions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decisions (
    id          TEXT PRIMARY KEY,
    project_id  TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    context     TEXT,
    decision    TEXT,
    owner       TEXT,
    status      TEXT CHECK(status IN ('ouverte','decidee','executee','abandonnee')) DEFAULT 'ouverte',
    decided_at  TEXT,
    deadline    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);

-- ------------------------------------------------------------
-- 5. contacts — annuaire
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    role         TEXT,
    company      TEXT,
    email        TEXT,
    phone        TEXT,
    trust_level  TEXT CHECK(trust_level IN ('haute','moyenne','basse','nouvelle')) DEFAULT 'moyenne',
    notes        TEXT,
    last_seen_at TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_trust ON contacts(trust_level);

-- ------------------------------------------------------------
-- 6. contacts_projects — table de liaison N:N
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts_projects (
    contact_id  TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role        TEXT,
    PRIMARY KEY (contact_id, project_id)
);

-- ------------------------------------------------------------
-- 7. events — événements calendrier (Outlook + manuels)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id              TEXT PRIMARY KEY,
    project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    starts_at       TEXT NOT NULL,
    ends_at         TEXT,
    duration_min    INTEGER,
    location        TEXT,
    attendees       TEXT,                         -- JSON array
    notes           TEXT,
    source_type     TEXT,                         -- 'outlook','manuel'
    source_id       TEXT,                         -- entry_id Outlook
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id);

-- ------------------------------------------------------------
-- 8. weeks — semaines référentielles (pour revues hebdo)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weeks (
    id           TEXT PRIMARY KEY,                -- '2026-W17'
    year         INTEGER NOT NULL,
    week_number  INTEGER NOT NULL,
    starts_on    TEXT NOT NULL,                   -- lundi (YYYY-MM-DD)
    ends_on      TEXT NOT NULL                    -- dimanche
);

-- ------------------------------------------------------------
-- 9. big_rocks — top 3 priorités hebdo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS big_rocks (
    id           TEXT PRIMARY KEY,
    week_id      TEXT NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
    ordre        INTEGER NOT NULL,                -- 1, 2, 3
    title        TEXT NOT NULL,
    description  TEXT,
    status       TEXT CHECK(status IN ('defini','en-cours','accompli','rate')) DEFAULT 'defini',
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bigrocks_week ON big_rocks(week_id);

-- ------------------------------------------------------------
-- 10. weekly_reviews — bilans hebdo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_reviews (
    id              TEXT PRIMARY KEY,
    week_id         TEXT NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
    intention       TEXT,
    big_rocks_done  TEXT,                         -- JSON
    bilan           TEXT,
    cap_prochaine   TEXT,
    mood            TEXT,
    notes           TEXT,
    draft_by_llm    INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_week ON weekly_reviews(week_id);

-- ------------------------------------------------------------
-- 11. arbitrage_sessions — sessions matin (3 FAIRE / 2 DÉLÉGUER / N REPORTER)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS arbitrage_sessions (
    id              TEXT PRIMARY KEY,
    date            TEXT NOT NULL,                -- YYYY-MM-DD
    raw_emails      TEXT,                         -- JSON
    raw_events      TEXT,                         -- JSON
    proposals       TEXT,                         -- JSON propositions Claude
    user_decisions  TEXT,                         -- JSON décisions CEO
    duration_sec    INTEGER,
    tokens_in       INTEGER,
    tokens_out      INTEGER,
    cost_eur        REAL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_arbitrage_date ON arbitrage_sessions(date);

-- ------------------------------------------------------------
-- 12. evening_sessions — boucle du soir (debrief)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evening_sessions (
    id              TEXT PRIMARY KEY,
    date            TEXT NOT NULL,                -- YYYY-MM-DD
    bilan           TEXT,                         -- JSON {fait, partiel, pas_fait}
    humeur          TEXT CHECK(humeur IN ('tres-bien','bien','neutre','tendu','difficile')),
    energie         INTEGER,                      -- 1-5
    tomorrow_prep   TEXT,                         -- JSON top 3 demain
    duration_sec    INTEGER,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evening_date ON evening_sessions(date);

-- ------------------------------------------------------------
-- 13. delegations — brouillons de délégation + envoi
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delegations (
    id             TEXT PRIMARY KEY,
    task_id        TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    contact_id     TEXT REFERENCES contacts(id) ON DELETE SET NULL,
    subject        TEXT,
    draft_content  TEXT,
    sent_status    TEXT CHECK(sent_status IN ('draft','sent','acknowledged','failed')) DEFAULT 'draft',
    sent_at        TEXT,
    followup_at    TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_delegations_task ON delegations(task_id);

-- ------------------------------------------------------------
-- 14. task_events — historique d'une tâche (event sourcing léger)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_events (
    id           TEXT PRIMARY KEY,
    task_id      TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    event_type   TEXT NOT NULL,                   -- 'created','edited','done','undone','deferred','delegated'
    payload      TEXT,                            -- JSON contextuel
    occurred_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_taskevents_task ON task_events(task_id);

-- ------------------------------------------------------------
-- (bonus) settings — kill-switch, streaks, préférences globales
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key          TEXT PRIMARY KEY,
    value        TEXT NOT NULL,
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- (bonus) schema_migrations — versionnage des migrations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
