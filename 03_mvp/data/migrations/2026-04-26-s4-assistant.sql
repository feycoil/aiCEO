-- ----------------------------------------------------------
-- 2026-04-26-s4-assistant.sql  Sprint S4 (S4.01)
-- Ajoute les tables assistant_conversations et assistant_messages
-- pour le chat live IA streaming Claude.
-- ----------------------------------------------------------

-- Tables (S4.01)
CREATE TABLE IF NOT EXISTS assistant_conversations (
    id          TEXT PRIMARY KEY,
    title       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assistant_messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK(role IN ('user','assistant')),
    content         TEXT NOT NULL,
    ts              TEXT NOT NULL DEFAULT (datetime('now')),
    model           TEXT,
    tokens_in       INTEGER,
    tokens_out      INTEGER
);

CREATE INDEX IF NOT EXISTS idx_assistant_msg_conv ON assistant_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_assistant_conv_updated ON assistant_conversations(updated_at);
