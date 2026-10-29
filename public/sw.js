// Spider Math Platform — Web Notifications & PWA Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client && urlToOpen) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'منصة سبايدر ماث التعليمية';
    const options = {
      body: data.body || '',
      icon: data.icon || '/assets/branding/spider-math-logo.png',
      badge: data.badge || '/assets/branding/spider-math-logo.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'spider-math-alert',
      data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Push notification handling error:', err);
  }
});
