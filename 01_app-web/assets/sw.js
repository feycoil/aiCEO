/* aiCEO — Service Worker v4.0 (REBUILD seed réel)
   Stratégie offline-first :
   - HTML          → stale-while-revalidate
   - CSS/JS/assets → cache-first
   - Origine externe → network-only (jamais caché)

   v4.0 : bump version → purge anciens caches → forcer reload de
   tous les assets (data.js, app.js, app.css) après reset localStorage.
*/

const VERSION = "aiCEO-v4.0.0";
const CACHE_STATIC  = VERSION + "-static";
const CACHE_RUNTIME = VERSION + "-runtime";

// Fichiers essentiels pré-cachés (chemins relatifs au scope).
// Les sous-dossiers (projets/, revues/, journeys/) sont ajoutés
// dynamiquement à la première visite.
const PRECACHE = [
  "./",
  "index.html",
  "taches.html",
  "agenda.html",
  "decisions.html",
  "groupes.html",
  "projets.html",
  "contacts.html",
  "assistant.html",
  "revues/index.html",
  "journeys/index.html",
  "assets/app.css",
  "assets/app.js",
  "assets/app-nba.js",
  "assets/data.js",
  "assets/project-page.js",
  "journeys/journey.css"
];

// ------- install -------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRECACHE).catch(() => {
        // Certains chemins peuvent manquer selon le déploiement ;
        // on cache ce qu'on peut sans bloquer l'install.
        return Promise.all(PRECACHE.map(u => cache.add(u).catch(() => {})));
      }))
      .then(() => self.skipWaiting())
  );
});

// ------- activate -------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(k => k.startsWith("aiCEO-") && k !== CACHE_STATIC && k !== CACHE_RUNTIME)
        .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// ------- fetch -------
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // external → network-only, pas de cache

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    // stale-while-revalidate
    event.respondWith(
      caches.open(CACHE_RUNTIME).then(cache =>
        cache.match(req).then(cached => {
          const network = fetch(req)
            .then(resp => {
              if (resp && resp.status === 200) cache.put(req, resp.clone());
              return resp;
            })
            .catch(() => cached || caches.match("./index.html"));
          return cached || network;
        })
      )
    );
    return;
  }

  // cache-first pour le reste (CSS/JS/fonts/images)
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === "basic"){
          const copy = resp.clone();
          caches.open(CACHE_RUNTIME).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});

// ------- message : force update -------
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
