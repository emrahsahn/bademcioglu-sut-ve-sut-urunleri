// Service Worker temizleyici (Tarayıcıda kalan eski localhost service worker kayıtlarını temizler)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url && 'navigate' in client) {
          // Gerekirse sayfayı tazeleyebilir
        }
      });
    })
  );
});
