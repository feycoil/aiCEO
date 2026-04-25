/**
 * src/db.js — accès SQLite singleton + helpers CRUD partagés.
 *
 * Exporte :
 *   - getDb() : Database (singleton, lazy init)
 *   - uuid7() : ID UUIDv7-like, triable chronologiquement (ms timestamp + 80 bits aléatoires)
 *   - now()   : timestamp ISO 8601 UTC
 *   - crud(table)            : générateur de helpers CRUD pour une table simple
 *   - asJsonOrNull(v)        : sérialise/désérialise les colonnes JSON en transparence
 *   - parseJsonOrNull(v)
 */
const path = require('node:path');
const crypto = require('node:crypto');
const Database = require('better-sqlite3');

const DB_PATH = path.resolve(__dirname, '..', 'data', 'aiceo.db');

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('foreign_keys = ON');
  _db.pragma('journal_mode = WAL');
  return _db;
}

function close() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

/**
 * UUIDv7-like : 48 bits de timestamp ms + 80 bits aléatoires.
 * Format : 018xxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx (RFC 9562 compatible).
 */
function uuid7() {
  const ts = BigInt(Date.now());
  const tsHex = ts.toString(16).padStart(12, '0'); // 12 hex = 48 bits
  const randBytes = crypto.randomBytes(10);
  // Force version 7 (0111) dans le 7e octet (index 6 dans 16 octets, mais ici on construit en hex).
  const rand = randBytes.toString('hex'); // 20 hex chars
  // Layout : 8-4-4-4-12 = tsHex(8)-tsHex(4)-7+rand(3)-yrand(4)-rand(12)
  const seg1 = tsHex.slice(0, 8);
  const seg2 = tsHex.slice(8, 12);
  const seg3 = '7' + rand.slice(0, 3);
  // Variant 10xx pour le 9e bit du seg4.
  const variantHex = (parseInt(rand.slice(3, 4), 16) & 0x3 | 0x8).toString(16);
  const seg4 = variantHex + rand.slice(4, 7);
  const seg5 = rand.slice(7, 19);
  return `${seg1}-${seg2}-${seg3}-${seg4}-${seg5}`;
}

function now() {
  return new Date().toISOString();
}

function asJsonOrNull(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v; // déjà sérialisé
  return JSON.stringify(v);
}

function parseJsonOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

/**
 * Génère un set de helpers CRUD pour une table à clé primaire `id` (TEXT).
 * Exemple :
 *   const tasks = crud('tasks', { jsonFields: ['attendees'] });
 *   tasks.list({ done: 0 });
 *   tasks.get(id);
 *   tasks.insert({ ... });
 *   tasks.update(id, { ... });
 *   tasks.remove(id);
 */
function crud(table, opts = {}) {
  const db = getDb();
  const jsonFields = new Set(opts.jsonFields || []);
  const allowedColumns = opts.columns || null;

  const decode = (row) => {
    if (!row) return row;
    const out = { ...row };
    for (const f of jsonFields) {
      if (f in out) out[f] = parseJsonOrNull(out[f]);
    }
    return out;
  };

  const encode = (data) => {
    const out = { ...data };
    for (const f of jsonFields) {
      if (f in out) out[f] = asJsonOrNull(out[f]);
    }
    return out;
  };

  return {
    /**
     * list(filters?, opts?)
     *   filters : { col: value, ... } => col = ? AND ...
     *   opts    : { orderBy, limit, offset, where (raw) }
     */
    list(filters = {}, options = {}) {
      const where = [];
      const params = [];
      for (const [k, v] of Object.entries(filters)) {
        if (v === undefined) continue;
        if (v === null) {
          where.push(`${k} IS NULL`);
        } else {
          where.push(`${k} = ?`);
          params.push(v);
        }
      }
      if (options.where) where.push(options.where);
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const orderSql = options.orderBy ? `ORDER BY ${options.orderBy}` : '';
      const limitSql = options.limit ? `LIMIT ${Number(options.limit)}` : '';
      const offsetSql = options.offset ? `OFFSET ${Number(options.offset)}` : '';
      const sql = `SELECT * FROM ${table} ${whereSql} ${orderSql} ${limitSql} ${offsetSql}`.trim();
      return db.prepare(sql).all(...params).map(decode);
    },

    get(id) {
      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
      return decode(row);
    },

    /**
     * insert(data) : génère id si absent, applique created_at/updated_at si colonne présente.
     */
    insert(data) {
      const row = { ...encode(data) };
      if (!row.id) row.id = uuid7();
      const cols = Object.keys(row);
      const placeholders = cols.map(() => '?').join(', ');
      const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;
      db.prepare(sql).run(...cols.map((c) => row[c]));
      return this.get(row.id);
    },

    update(id, data) {
      const row = { ...encode(data), updated_at: now() };
      delete row.id;
      delete row.created_at;
      const cols = Object.keys(row);
      if (!cols.length) return this.get(id);
      // updated_at peut ne pas exister dans toutes les tables (ex: contacts_projects)
      const sql = `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`;
      try {
        db.prepare(sql).run(...cols.map((c) => row[c]), id);
      } catch (e) {
        if (String(e.message).includes('no such column: updated_at')) {
          delete row.updated_at;
          const cols2 = Object.keys(row);
          if (!cols2.length) return this.get(id);
          const sql2 = `UPDATE ${table} SET ${cols2.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`;
          db.prepare(sql2).run(...cols2.map((c) => row[c]), id);
        } else {
          throw e;
        }
      }
      return this.get(id);
    },

    remove(id) {
      const r = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      return r.changes > 0;
    },

    count(filters = {}) {
      const where = [];
      const params = [];
      for (const [k, v] of Object.entries(filters)) {
        if (v === undefined) continue;
        if (v === null) where.push(`${k} IS NULL`);
        else { where.push(`${k} = ?`); params.push(v); }
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const r = db.prepare(`SELECT COUNT(*) AS n FROM ${table} ${whereSql}`).get(...params);
      return r.n;
    },

    raw(sql, ...params) {
      return db.prepare(sql).all(...params).map(decode);
    },
  };
}

module.exports = {
  getDb,
  close,
  uuid7,
  now,
  asJsonOrNull,
  parseJsonOrNull,
  crud,
};
