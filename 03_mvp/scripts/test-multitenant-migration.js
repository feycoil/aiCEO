const Database = require('../src/db-driver');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data/aiceo.db');
const DST = path.join(ROOT, 'data/aiceo-test-mt.db');
const MIG_DIR = path.join(ROOT, 'data/migrations');

if (fs.existsSync(DST)) fs.unlinkSync(DST);
if (fs.existsSync(SRC)) {
  fs.copyFileSync(SRC, DST);
  console.log('cloned existing DB');
} else {
  console.log('no existing DB, init blank');
  const db0 = new Database(DST);
  db0.pragma('foreign_keys = ON');
  for (const m of fs.readdirSync(MIG_DIR).sort()) {
    if (m === '2026-04-30-multitenant.sql') continue;
    try { db0.exec(fs.readFileSync(path.join(MIG_DIR, m), 'utf-8')); console.log(' applied', m); } catch(e) { console.log(' skip', m, e.message.slice(0,80)); }
  }
  db0.close();
}
const db = new Database(DST);
db.pragma('foreign_keys = ON');
try {
  db.exec(fs.readFileSync(path.join(MIG_DIR, '2026-04-30-multitenant.sql'), 'utf-8'));
  console.log('\n==> MIGRATION 2026-04-30-multitenant.sql APPLIED OK');
} catch (e) {
  console.log('\n==> MIGRATION FAILED:', e.message);
  process.exit(1);
}
const tables = ['tasks','decisions','projects','big_rocks','knowledge_pins','emails','events','contacts','groups','weekly_reviews','weeks','evening_sessions','arbitrage_sessions','settings','user_preferences','assistant_conversations','assistant_messages'];
let ok=0, miss=[];
for (const t of tables) {
  try {
    const cols = db.prepare("PRAGMA table_info(" + t + ")").all();
    const has = cols.find(c => c.name === 'tenant_id');
    if (has) { ok++; } else miss.push(t);
  } catch(e) { miss.push(t + ' [no table]'); }
}
console.log('\nVerification : ' + ok + '/' + tables.length + ' tables ont tenant_id');
if (miss.length) console.log('Manquantes:', miss.join(', '));
fs.unlinkSync(DST);
console.log('\n[OK] sandbox DB cleaned');
