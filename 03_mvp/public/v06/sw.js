/* aiCEO service worker — minimal cache‑first for shell + fonts */
const VERSION = 'aiceo-v0.5-design-v06';
const SHELL = [
  './hub.html',
  './index.html',
  './arbitrage.html',
  './evening.html',
  './onboarding.html',
  './settings.html',
  './components.html',
  './_shared/app.css',
  './_shared/colors_and_type.css',
  './_shared/tweaks.css',
  './_shared/app.js',
  './_shared/icons.svg.html',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL).catch(() => {/* tolerant */}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Cache-first for fonts + same-origin shell
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Opportunistic cache for fonts & icons
        if (res.ok && (req.url.endsWith('.woff2') || req.url.endsWith('.svg') || req.url.includes('/_shared/'))) {
          const clone = res.clone();
          caches.open(VERSION).then(c => c.put(req, clone)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./hub.html'));
    })
  );
});
