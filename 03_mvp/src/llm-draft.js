/**
 * src/llm-draft.js — génération auto-draft revue hebdo via Claude (S3.03).
 *
 *   buildWeekContext(weekId) -> { tasks, evening_sessions, arbitrage_sessions, big_rocks }
 *   draftWeeklyReview(weekId) -> { markdown, model, source: 'claude'|'fallback', usage? }
 *
 * Fallback offline si pas de clé : draft template figé (squelette markdown vide).
 * Conformément au plan B mid-sprint S3.03 du DOSSIER §1.2.
 *
 * Rubric d'evaluation 6 criteres (ADR S3.00) :
 *   1. focus (1 ligne)
 *   2. ton (factuel non emphatique)
 *   3. longueur (200-400 mots)
 *   4. sources citees (>= 3 taches/sessions)
 *   5. top 3 demain presents
 *   6. surfacage des ecarts
 */
const { getDb } = require('./db');
const { createAnthropicClient } = require('./anthropic-client');

const SYSTEM_PROMPT_DRAFT = `Tu es l'assistant CEO d'aiCEO. Tu rediges la **revue hebdomadaire** du CEO a partir des donnees brutes de la semaine.

Format markdown structure attendu :
## Focus
(1 phrase : la chose essentielle qui ressort de la semaine)

## Faits saillants
(3-6 puces, factuelles, citant nommement les taches/sessions/big rocks accomplis ou rates)

## Ecarts
(1-3 puces : ce qui n'a pas ete fait, dette accumulee, deboires)

## Top 3 demain
(top 3 priorites pour la semaine suivante en P0/P1)

Contraintes :
- 200 a 400 mots au total
- Ton factuel, non emphatique, pas de "bravo / bien joue / tu as fait du bon travail"
- Cite au moins 3 sources (titre de tache, id, big rock, etc.)
- Pas de blabla intro/outro. Demarre direct sur "## Focus".`;

const FALLBACK_TEMPLATE = (weekId) => `## Focus
_(template offline — l'IA n'est pas disponible. Resume manuellement la chose essentielle de la semaine ${weekId} en 1 phrase.)_

## Faits saillants
- _(item 1 : citer une tache ou session reelle)_
- _(item 2 : ...)_
- _(item 3 : ...)_

## Ecarts
- _(ecart eventuel ou "RAS")_

## Top 3 demain
- _(P0 : ...)_
- _(P1 : ...)_
- _(P1 : ...)_

---
_Brouillon genere offline (pas de cle ANTHROPIC_API_KEY). Editez puis sauvegardez via POST /api/weekly-reviews._`;

function isoWeekDates(weekId) {
  const m = String(weekId).match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const wk = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Dow - 1) * 86400000);
  const monday = new Date(week1Monday.getTime() + (wk - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 7 * 86400000);
  return { from: monday.toISOString(), to: sunday.toISOString() };
}

function buildWeekContext(weekId) {
  const range = isoWeekDates(weekId);
  if (!range) throw new Error(`week_id invalide: ${weekId}`);
  const db = getDb();

  // Taches done dans la semaine
  const tasksDone = db.prepare(
    `SELECT id, title, priority, project_id, updated_at FROM tasks
     WHERE done = 1 AND updated_at >= ? AND updated_at < ?
     ORDER BY updated_at`
  ).all(range.from, range.to);

  // Taches restantes ouvertes avec due_at dans la semaine
  const tasksOpen = db.prepare(
    `SELECT id, title, priority, due_at FROM tasks
     WHERE done = 0 AND due_at IS NOT NULL AND due_at >= ? AND due_at < ?
     ORDER BY priority, due_at`
  ).all(range.from, range.to);

  // Sessions arbitrage matin (table arbitrage_sessions, supposee, cle date)
  let arbitrageSessions = [];
  try {
    arbitrageSessions = db.prepare(
      `SELECT date, faire_count, deleguer_count, reporter_count FROM arbitrage_sessions
       WHERE date >= ? AND date < ?
       ORDER BY date`
    ).all(range.from.slice(0, 10), range.to.slice(0, 10));
  } catch { /* table peut ne pas avoir ces colonnes selon version */ }

  // Bilans soir
  let eveningSessions = [];
  try {
    eveningSessions = db.prepare(
      `SELECT date, mood, energy, notes FROM evening_sessions
       WHERE date >= ? AND date < ?
       ORDER BY date`
    ).all(range.from.slice(0, 10), range.to.slice(0, 10));
  } catch { /* tolerant */ }

  // Big rocks de la semaine
  const bigRocks = db.prepare(
    `SELECT id, ordre, title, status FROM big_rocks WHERE week_id = ? ORDER BY ordre`
  ).all(weekId);

  return {
    week: weekId,
    range,
    tasks_done: tasksDone,
    tasks_open: tasksOpen,
    arbitrage_sessions: arbitrageSessions,
    evening_sessions: eveningSessions,
    big_rocks: bigRocks,
  };
}

function buildUserPrompt(ctx) {
  const lines = [];
  lines.push(`# Semaine ${ctx.week} (du ${ctx.range.from.slice(0, 10)} au ${ctx.range.to.slice(0, 10)})`);
  lines.push('');
  lines.push(`## Big rocks (${ctx.big_rocks.length})`);
  if (ctx.big_rocks.length) {
    ctx.big_rocks.forEach(r => lines.push(`- [${r.status}] #${r.ordre} ${r.title} (id: ${r.id.slice(0, 8)})`));
  } else {
    lines.push('- (aucun big rock pose pour cette semaine)');
  }
  lines.push('');
  lines.push(`## Taches done (${ctx.tasks_done.length})`);
  ctx.tasks_done.slice(0, 30).forEach(t => lines.push(`- [${t.priority || 'P2'}] ${t.title} (id: ${t.id.slice(0, 8)}, projet: ${t.project_id || '-'})`));
  lines.push('');
  lines.push(`## Taches restantes ouvertes due cette semaine (${ctx.tasks_open.length})`);
  ctx.tasks_open.slice(0, 20).forEach(t => lines.push(`- [${t.priority || 'P2'}] ${t.title} (due: ${t.due_at ? t.due_at.slice(0, 10) : '?'})`));
  lines.push('');
  if (ctx.arbitrage_sessions.length) {
    lines.push(`## Sessions arbitrage matin (${ctx.arbitrage_sessions.length})`);
    ctx.arbitrage_sessions.forEach(s => lines.push(`- ${s.date} : ${s.faire_count || '?'} faire / ${s.deleguer_count || '?'} deleguer / ${s.reporter_count || '?'} reporter`));
    lines.push('');
  }
  if (ctx.evening_sessions.length) {
    lines.push(`## Bilans soir (${ctx.evening_sessions.length})`);
    ctx.evening_sessions.forEach(s => lines.push(`- ${s.date} : humeur=${s.mood || '?'} / energie=${s.energy || '?'}${s.notes ? ' — ' + String(s.notes).slice(0, 100) : ''}`));
    lines.push('');
  }
  lines.push('Redige maintenant la revue hebdomadaire au format markdown impose.');
  return lines.join('\n');
}

async function draftWeeklyReview(weekId, opts = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const demo = opts.forceFallback || process.env.DEMO_MODE === '1' || !apiKey;
  const ctx = buildWeekContext(weekId);

  if (demo) {
    return {
      week: weekId,
      markdown: FALLBACK_TEMPLATE(weekId),
      source: 'fallback',
      reason: opts.forceFallback ? 'forceFallback' : (apiKey ? 'DEMO_MODE=1' : 'no ANTHROPIC_API_KEY'),
      context_summary: {
        tasks_done: ctx.tasks_done.length,
        tasks_open: ctx.tasks_open.length,
        big_rocks: ctx.big_rocks.length,
      },
    };
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  // Permet de mocker le client en test (opts.client)
  const client = opts.client || createAnthropicClient();
  const userPrompt = buildUserPrompt(ctx);

  const msg = await client.messages.create({
    model,
    max_tokens: 1500,
    system: SYSTEM_PROMPT_DRAFT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const markdown = (msg.content && msg.content[0] && msg.content[0].text) || '';

  return {
    week: weekId,
    markdown: markdown.trim(),
    source: 'claude',
    model,
    usage: msg.usage,
    context_summary: {
      tasks_done: ctx.tasks_done.length,
      tasks_open: ctx.tasks_open.length,
      big_rocks: ctx.big_rocks.length,
    },
  };
}

module.exports = { draftWeeklyReview, buildWeekContext, buildUserPrompt, FALLBACK_TEMPLATE, SYSTEM_PROMPT_DRAFT };
