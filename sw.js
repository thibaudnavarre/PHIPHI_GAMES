const CACHE = 'phiphi-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/sudocul.css',
  './css/freecul.css',
  './js/menu.js',
  './js/sudocul/game.js',
  './js/sudocul/grid.js',
  './js/sudocul/input.js',
  './js/sudocul/pieces.js',
  './js/sudocul/renderer.js',
  './js/sudocul/scoring.js',
  './js/freecul/game.js',
  './js/freecul/deck.js',
  './js/freecul/logic.js',
  './js/freecul/renderer.js',
  './js/freecul/input.js',
  './js/freecul/scoring.js',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  // Do NOT call skipWaiting() here — wait for an explicit signal from the app.
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Cache-first: serve from cache, fall back to network.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached ?? fetch(e.request)),
  );
});
