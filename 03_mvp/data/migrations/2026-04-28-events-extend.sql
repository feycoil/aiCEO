-- ----------------------------------------------------------
-- 2026-04-28-events-extend.sql -- Sprint v0.7-S6.6
-- Etend events pour ingerer le calendrier Outlook (fetch+normalize).
-- NB SQLite : ALTER TABLE ADD COLUMN refuse les defauts non-constants
-- (datetime('now'), CURRENT_TIMESTAMP). On utilise des defauts constants ou NULL.
-- ----------------------------------------------------------

ALTER TABLE events ADD COLUMN organizer TEXT;
ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'confirmed';
ALTER TABLE events ADD COLUMN body_preview TEXT;
ALTER TABLE events ADD COLUMN ingested_at TEXT;

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_ingested ON events(ingested_at);
CREATE INDEX IF NOT EXISTS idx_events_source_type ON events(source_type);

UPDATE events SET ingested_at = datetime('now') WHERE ingested_at IS NULL;
