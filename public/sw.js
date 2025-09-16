/* es una implementación de un serviceworker para gestionar notificaciones push en una aplicación web. */

self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Nuevo mensaje en CriptoChat',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('CriptoChat', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  clients.openWindow('/');
});