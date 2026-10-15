// Kreuzblock – kleiner Offline-Helfer (Service Worker)
// Online: lädt immer die neueste Version und merkt sie sich.
// Offline: startet die zuletzt gespeicherte Version.
const CACHE = 'kreuzblock';
const FILES = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const net = await Promise.race([
        fetch(e.request),
        new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 4000))
      ]);
      if (net && net.ok) cache.put(e.request, net.clone());
      return net;
    } catch (err) {
      return (await cache.match(e.request, { ignoreSearch: true })) || (await cache.match('./index.html')) || Response.error();
    }
  })());
});
