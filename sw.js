const CACHE_NAME = 'plongee-n2-v15';
const BASE = '/Formation_PLONGEE_NIVEAU_2_GALATHEE';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png'
];

// Activation immédiate sans attendre
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', event => {
  // Prendre le contrôle immédiatement
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS).catch(err => console.warn('Cache partiel:', err))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    // Supprimer tous les anciens caches
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Prendre contrôle de tous les onglets ouverts
  );
});

self.addEventListener('fetch', event => {
  // Stratégie Network First : essayer le réseau d'abord, cache en fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache avec la nouvelle version
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        // Hors ligne : utiliser le cache
        caches.match(event.request).then(r => r || caches.match(BASE + '/index.html'))
      )
  );
});
