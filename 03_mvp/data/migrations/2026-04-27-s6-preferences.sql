-- ----------------------------------------------------------
-- 2026-04-27-s6-preferences.sql — Sprint S6.3 (Palier 3)
-- Ajoute la table user_preferences (key/value JSON) pour les 8
-- onglets Settings : Général, Langue, Maisons, Rituels, Coaching,
-- Données, Apparence, Zone sensible.
--
-- Pas de tenant_id pour l'instant (mono-user). En V1 multi-tenant,
-- ajouter user_id FK + composite PK (user_id, key).
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_preferences (
    key         TEXT PRIMARY KEY,
    value       TEXT,                              -- JSON encoded
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed défauts (sans écraser si existe)
INSERT OR IGNORE INTO user_preferences (key, value) VALUES
    ('user.firstName',      '"Major"'),
    ('user.coaching.tone',  '"mesuree"'),
    ('user.greeting.script','true'),
    ('user.footer.posture', 'true'),
    ('locale.lang',         '"fr"'),
    ('locale.firstDay',     '"monday"'),
    ('locale.dateFormat',   '"long"'),
    ('locale.currency',     '"EUR"'),
    ('locale.timezone',     '"Europe/Paris"'),
    ('rituals.morning',     '"07:00"'),
    ('rituals.morning.on',  'true'),
    ('rituals.weekly.on',   'true'),
    ('rituals.weekly.cadence','"weekly"'),
    ('rituals.evening',     '"18:30"'),
    ('rituals.evening.on',  'true'),
    ('coaching.depth',       '3'),
    ('coaching.during.arbitrage','true'),
    ('appearance.theme',    '"system"'),
    ('appearance.density',  '"comfortable"'),
    ('appearance.reduceMotion','false');
