const CACHE = 'fe-madrid-v2';
const BASE = '/fe-madrid-2026';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(ASSETS.map(a => fetch(a).then(r => r.ok ? c.put(a, r) : null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebasejs') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'FE Madrid', body: 'Nouvelle mise à jour' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: BASE + '/icon-192.png',
      badge: BASE + '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: BASE + '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || BASE + '/'));
});
