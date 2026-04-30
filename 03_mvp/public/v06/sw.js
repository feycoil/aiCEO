/* aiCEO service worker - KILLSWITCH (S6.22 Lot 14)
 * Le SW v06 cache-first interceptait les fichiers v07 et servait l'ancien code.
 * Ce SW remplace l'ancien : skipWaiting + claim + delete all caches + unregister self.
 * Reinstaller un SW propre en V1 si necessaire.
 */
const VERSION = 'killswitch-2026-04-30';

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // 1. Vider tous les caches
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    console.warn('[sw killswitch] caches deleted:', keys.length);

    // 2. Claim tous les clients (les pages ouvertes)
    await self.clients.claim();

    // 3. Reload tous les clients pour qu'ils chargent les fichiers frais
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.navigate(c.url));

    // 4. Auto-desinstaller le SW
    await self.registration.unregister();
    console.warn('[sw killswitch] self unregistered');
  })());
});

// Tous les fetch passent au reseau (pas de cache)
self.addEventListener('fetch', e => {
  // Laisser le browser gerer normalement (pas d'e.respondWith)
});
