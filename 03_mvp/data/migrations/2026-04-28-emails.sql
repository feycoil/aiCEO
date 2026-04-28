-- ----------------------------------------------------------
-- 2026-04-28-emails.sql — Sprint v0.6 (post Phase 1)
-- Ajoute la table emails alimentee par scripts/normalize-emails.js
-- (ingestion JSON -> SQLite). Source de verite pour la file
-- d'arbitrage matin (POST /api/arbitrage/analyze-emails).
--
-- Mono-user pour l'instant ; en V1 multi-tenant, ajouter
-- tenant_id et composite PK (tenant_id, id).
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS emails (
    id                TEXT PRIMARY KEY,         -- entry_id Outlook (stable)
    account           TEXT,                     -- compte recepteur (ex: feycoil@etic.yt)
    folder            TEXT,                     -- inbox, sent, archive...
    subject           TEXT,
    from_name         TEXT,
    from_email        TEXT,
    to_addrs          TEXT,                     -- "to" est reserve, on stocke en string
    received_at       TEXT,                     -- ISO8601
    unread            INTEGER DEFAULT 0,        -- bool 0/1
    flagged           INTEGER DEFAULT 0,
    has_attach        INTEGER DEFAULT 0,
    preview           TEXT,                     -- 500 premiers chars du body
    inferred_project  TEXT,                     -- slug projet detecte par normalize
    is_self           INTEGER DEFAULT 0,        -- mes propres mails sortants
    arbitrated_at     TEXT,                     -- timestamp si email deja arbitre (NULL = a faire)
    ingested_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_emails_received_at      ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_unread           ON emails(unread);
CREATE INDEX IF NOT EXISTS idx_emails_flagged          ON emails(flagged);
CREATE INDEX IF NOT EXISTS idx_emails_inferred_project ON emails(inferred_project);
CREATE INDEX IF NOT EXISTS idx_emails_arbitrated       ON emails(arbitrated_at);
CREATE INDEX IF NOT EXISTS idx_emails_is_self          ON emails(is_self);
