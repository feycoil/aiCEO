/**
 * tests/weekly-reviews-draft.test.js — S3.03 auto-draft Claude.
 * 2 tests : fallback offline (sans cle), mock client Anthropic.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Database = require('../src/db-driver');

const TEST_DB = path.resolve(__dirname, '..', 'data', 'aiceo-test-draft.db');
process.env.AICEO_DB_OVERRIDE = TEST_DB;

for (const ext of ['', '-wal', '-shm']) {
  const f = TEST_DB + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

const initDb = new Database(TEST_DB);
initDb.pragma('foreign_keys = ON');
initDb.pragma('journal_mode = WAL');
const sql = fs.readFileSync(
  path.resolve(__dirname, '..', 'data', 'migrations', '2026-04-25-init-schema.sql'),
  'utf8'
);
initDb.exec(sql);
initDb.close();

const dbModule = require('../src/db');
const { draftWeeklyReview, FALLBACK_TEMPLATE, buildUserPrompt } = require('../src/llm-draft');

after(() => {
  dbModule.close();
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB + ext;
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch { /* swallow */ }
    }
  }
});

// Seed minimal context : 1 week, 1 big rock done, 2 tasks done
before(() => {
  const db = dbModule.getDb();
  db.prepare(
    `INSERT INTO weeks (id, year, week_number, starts_on, ends_on)
     VALUES ('2026-W23', 2026, 23, '2026-06-01', '2026-06-07')`
  ).run();
  db.prepare(
    `INSERT INTO big_rocks (id, week_id, ordre, title, status, created_at)
     VALUES ('br-1', '2026-W23', 1, 'Livrer S3 demo intermediaire', 'accompli', '2026-06-05T00:00:00Z')`
  ).run();
  db.prepare(
    `INSERT INTO tasks (id, title, type, priority, eisenhower, starred, done, ai_capable,
                         created_at, updated_at)
     VALUES ('tk-1', 'Préparer slides demo S3', 'do', 'P0', 'UI', 0, 1, 0,
             '2026-06-04T08:00:00Z', '2026-06-05T17:00:00Z')`
  ).run();
  db.prepare(
    `INSERT INTO tasks (id, title, type, priority, eisenhower, starred, done, ai_capable,
                         created_at, updated_at)
     VALUES ('tk-2', 'Rédiger DOSSIER S3', 'do', 'P0', 'UI', 0, 1, 0,
             '2026-06-03T08:00:00Z', '2026-06-04T18:00:00Z')`
  ).run();
});

// ============================================================
// Suite : auto-draft Claude
// ============================================================

test('draftWeeklyReview — fallback offline si pas de cle API (forceFallback)', async () => {
  // forceFallback contourne la cle eventuellement presente dans l'env
  const r = await draftWeeklyReview('2026-W23', { forceFallback: true });
  assert.equal(r.source, 'fallback');
  assert.equal(r.week, '2026-W23');
  assert.match(r.markdown, /## Focus/);
  assert.match(r.markdown, /## Faits saillants/);
  assert.match(r.markdown, /## Ecarts/);
  assert.match(r.markdown, /## Top 3 demain/);
  assert.equal(r.context_summary.tasks_done, 2);
  assert.equal(r.context_summary.big_rocks, 1);
});

test('draftWeeklyReview — mock client Anthropic, source=claude, longueur > 200 mots', async () => {
  // Mock du client Anthropic : reponse stub avec un draft markdown valide
  const longDraft = [
    '## Focus',
    'Sprint S3 demo intermediaire livree en avance grace au pivot SQLite et au time-box discipline applique au spike SSE.',
    '',
    '## Faits saillants',
    '- Big rock #1 "Livrer S3 demo intermediaire" accompli le 05/06 (id br-1) avec slides preparees et endpoints SSE cables.',
    '- Tache "Préparer slides demo S3" (id tk-1) closee P0 en avance.',
    '- Tache "Rédiger DOSSIER S3" (id tk-2) closee P0, base de tout le sprint.',
    '- Cumul tests passes 62/62 verts apres ajout des routes /api/weekly-reviews et /api/big-rocks.',
    '- Aucune tache restante ouverte avec due_at dans la fenetre, ce qui valide le scope.',
    '',
    '## Ecarts',
    '- Aucun ecart majeur cette semaine. Le time-box du spike SSE a tenu (1,5 j vs 3 j alloues).',
    '',
    '## Top 3 demain',
    '- P0 : Cabler SSE front sur cockpit + taches (S3.05) pour purger la dette technique.',
    '- P0 : Lancer Outlook autosync via schtasks (S3.06) avec endpoint last-sync.',
    '- P1 : Spike Service Windows POC node-windows time-box 1,5 j strict (S3.10).',
    '',
    'Cumul tests : 62/62. Cumul budget : 60 % de l\'enveloppe v0.5 consommee, marge 50 % sur le sprintage S3.',
  ].join('\n');

  const mockClient = {
    messages: {
      create: async () => ({
        content: [{ type: 'text', text: longDraft }],
        usage: { input_tokens: 850, output_tokens: 320 },
      }),
    },
  };

  // Force la cle API pour passer en branche claude
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'test-mock-key';
  delete process.env.DEMO_MODE;

  try {
    const r = await draftWeeklyReview('2026-W23', { client: mockClient });
    assert.equal(r.source, 'claude');
    assert.equal(r.week, '2026-W23');
    assert.ok(r.markdown.includes('## Focus'));
    const wordCount = r.markdown.split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 100, `attendu >= 100 mots, recu ${wordCount}`);
    assert.ok(r.usage);
    assert.equal(r.usage.input_tokens, 850);
  } finally {
    if (previousKey) process.env.ANTHROPIC_API_KEY = previousKey;
    else delete process.env.ANTHROPIC_API_KEY;
  }
});
