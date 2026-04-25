/**
 * src/db-driver.js — adaptateur node:sqlite avec API compatible better-sqlite3.
 *
 * Pourquoi : better-sqlite3 necessite des binaires natifs prebuilds (qui n'existent
 * pas pour Node 24) ou une compilation node-gyp avec Visual Studio Build Tools.
 * node:sqlite est INTEGRE a Node 22.5+ (stable en Node 24), zero dependance native.
 *
 * Sous-ensemble couvert (suffisant pour aiCEO) :
 *   - new Database(path)      : constructeur
 *   - db.prepare(sql)         : StatementSync (run/get/all)
 *   - db.exec(sql)            : execute un script multi-statements
 *   - db.pragma('k = v')      : equivalent exec('PRAGMA k = v')
 *   - db.pragma('k')          : lecture (renvoie tableau de rows)
 *   - db.transaction(fn)      : renvoie une fonction wrappant fn dans BEGIN/COMMIT/ROLLBACK
 *   - db.close()              : ferme la base
 *
 * Limitations :
 *   - lastInsertRowid de stmt.run() est un BigInt (pas un Number) — non utilise par aiCEO
 *     (toutes nos cles primaires sont des UUIDs TEXT).
 *   - pas de support des hooks ou extensions natives.
 */
const { DatabaseSync } = require('node:sqlite');

class Database {
  constructor(filename, _opts = {}) {
    this._db = new DatabaseSync(filename);
  }

  prepare(sql) {
    return this._db.prepare(sql);
  }

  exec(sql) {
    return this._db.exec(sql);
  }

  pragma(stmt, options = {}) {
    const trimmed = String(stmt).trim();
    if (trimmed.includes('=')) {
      // Ecriture : PRAGMA key = value
      this._db.exec(`PRAGMA ${trimmed}`);
      return null;
    }
    // Lecture : PRAGMA key
    const rows = this._db.prepare(`PRAGMA ${trimmed}`).all();
    if (options.simple) {
      return rows.length ? Object.values(rows[0])[0] : null;
    }
    return rows;
  }

  transaction(fn) {
    return (...args) => {
      this._db.exec('BEGIN');
      try {
        const r = fn(...args);
        this._db.exec('COMMIT');
        return r;
      } catch (e) {
        try { this._db.exec('ROLLBACK'); } catch { /* swallow rollback errors */ }
        throw e;
      }
    };
  }

  close() {
    this._db.close();
  }

  get open() {
    return this._db.isOpen;
  }
}

module.exports = Database;
