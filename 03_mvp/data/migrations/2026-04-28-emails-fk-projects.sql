-- ----------------------------------------------------------
-- 2026-04-28-emails-fk-projects.sql — DEPRECATED (S6.42 fix)
--
-- Cette migration etait alphabetiquement avant 2026-04-28-emails.sql
-- (`emails-` < `emails.`), ce qui faisait planter --reset car emails
-- n'existait pas encore au moment de l'ALTER.
--
-- Le contenu a ete deplace dans 2026-04-28b-emails-fk-projects.sql
-- (suffixe `b` pour passer apres emails.sql).
--
-- Ce fichier reste vide pour preserver le tracking schema_migrations
-- des DBs existantes (qui ont deja applique cette migration).
-- ----------------------------------------------------------

-- no-op (voir 2026-04-28b-emails-fk-projects.sql)
SELECT 1;
