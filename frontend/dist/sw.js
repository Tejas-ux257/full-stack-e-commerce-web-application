const CACHE_NAME = 'zencart-cache-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = ['/', '/offline.html', '/manifest.json', '/icons/icon-192.svg', '/icons/icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : { title: 'ZenCart', body: 'You have a new update.' };
  const options = {
    body: payload.body || 'You have a new update.',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'ZenCart', options));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          if (request.destination === 'image' || request.destination === 'font') {
            return caches.match('/icons/icon-192.svg');
          }
          return caches.match(OFFLINE_URL);
        });
    })
  );
});
