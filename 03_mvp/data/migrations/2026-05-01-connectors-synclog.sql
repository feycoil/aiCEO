-- ============================================================
-- 2026-05-01 — S6.41 — Connecteurs + Sync Log
-- ============================================================
-- Architecture extensible pour brancher d'autres sources que Outlook desktop :
-- Gmail, Google Agenda, Teams, Slack, Notion, ... à venir en V1.x.
--
-- Une ligne par connecteur (kind unique). Status persistent pour reprise apres
-- reboot. Config_json typique : { account: 'lamiae@etic-services.net', ... }
--
-- sync_log = histoire chronologique des syncs (1 ligne par run, success ou fail).
-- ============================================================

CREATE TABLE IF NOT EXISTS connectors (
    id            TEXT PRIMARY KEY,
    tenant_id     TEXT NOT NULL DEFAULT 'default',
    kind          TEXT NOT NULL,          -- 'outlook-desktop' | 'gmail' | 'gcal' | 'teams' | 'slack' | ...
    label         TEXT NOT NULL,          -- libelle UI
    icon          TEXT,                   -- emoji ou path
    status        TEXT NOT NULL DEFAULT 'available'  -- available | connected | error | disabled | coming_soon
                  CHECK (status IN ('available','connected','error','disabled','coming_soon')),
    config_json   TEXT,                   -- JSON config (compte, scopes, etc.)
    last_sync_at  TEXT,
    last_error    TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_connectors_tenant_kind ON connectors(tenant_id, kind);

CREATE TABLE IF NOT EXISTS sync_log (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL DEFAULT 'default',
    connector_kind  TEXT NOT NULL,
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at        TEXT,
    status          TEXT NOT NULL DEFAULT 'running'  -- running | success | error
                    CHECK (status IN ('running','success','error')),
    items_count     INTEGER DEFAULT 0,
    items_new       INTEGER DEFAULT 0,
    items_updated   INTEGER DEFAULT 0,
    duration_ms     INTEGER,
    error_message   TEXT,
    summary_json    TEXT                  -- detail libre par connecteur
);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON sync_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_connector ON sync_log(connector_kind, started_at DESC);

-- Seeds : 5 connecteurs catalogue (1 live, 4 coming_soon)
INSERT OR IGNORE INTO connectors (id, tenant_id, kind, label, icon, status) VALUES
  ('conn-outlook',  'default', 'outlook-desktop', 'Outlook (Desktop COM)', '📧', 'available'),
  ('conn-gmail',    'default', 'gmail',           'Gmail (OAuth Google)',  '✉️', 'coming_soon'),
  ('conn-gcal',     'default', 'gcal',            'Google Agenda',         '📅', 'coming_soon'),
  ('conn-teams',    'default', 'teams',           'Microsoft Teams',       '💬', 'coming_soon'),
  ('conn-slack',    'default', 'slack',           'Slack',                 '💼', 'coming_soon');
