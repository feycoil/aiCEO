/**
 * src/realtime.js — bus pub/sub interne pour push SSE (S2.10).
 *
 * Spike documenté dans docs/SPIKE-WEBSOCKET.md.
 *
 * Usage (côté routes mutatrices, optionnel — non câblé en S2) :
 *   const { emitChange } = require('../realtime');
 *   emitChange('task.updated', { id: t.id, done: t.done });
 *
 * Usage (côté SSE handler) :
 *   const { bus } = require('../realtime');
 *   bus.on('change', (e) => res.write(`event: ${e.type}\ndata: ${JSON.stringify(e.payload)}\n\n`));
 *
 * Pas de persistance volontaire : le bus vit dans le process. Si le serveur
 * redémarre, les clients SSE se reconnectent et la prochaine mutation déclenche
 * à nouveau un push. Un client venant de se connecter peut systématiquement
 * appeler GET /api/cockpit/today pour resynchroniser son état.
 */
const { EventEmitter } = require('node:events');

const bus = new EventEmitter();
// Beaucoup de routes peuvent écouter (cockpit + futurs widgets) — on relâche le warning Node.
bus.setMaxListeners(50);

/**
 * Émet un changement sur le bus.
 *
 * @param {string} type   ex: 'task.updated', 'cockpit.refresh', 'evening.committed'
 * @param {object} payload  payload sérialisable
 */
function emitChange(type, payload = {}) {
  bus.emit('change', { type, payload, ts: new Date().toISOString() });
}

module.exports = { bus, emitChange };
