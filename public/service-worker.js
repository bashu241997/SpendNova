const CACHE_NAME = 'spendnova-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler is enough to satisfy the PWA install criteria
  event.respondWith(fetch(event.request));
});
