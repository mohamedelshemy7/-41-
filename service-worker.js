const CACHE_NAME = 'rescuer-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});

/* مستقبلاً يمكنك إضافة استقبال Push هنا */
self.addEventListener('push', (evt) => {
  let data = { title: 'المنقذ الذكي', body: 'تنبيه طوارئ — افتح التطبيق', url: '/' };
  try { data = evt.data.json(); } catch(e){}
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' }
  };
  evt.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (evt) => {
  evt.notification.close();
  const url = evt.notification.data && evt.notification.data.url ? evt.notification.data.url : '/';
  evt.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
