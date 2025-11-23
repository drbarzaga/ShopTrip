// Service Worker para notificaciones push
// Este archivo debe estar en la carpeta public/

self.addEventListener("push", function (event) {
  const data = event.data?.json() || {};
  const title = data.title || "Shop Trip";
  const options = {
    body: data.body || data.message || "Nueva notificación",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: data.data || {},
    tag: data.tripId || data.itemId || "notification",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  let url = "/dashboard";

  // Determinar la URL basada en el tipo de notificación
  if (data.tripId) {
    url = "/trips"; // Redirigir a la lista de viajes
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Buscar si hay una ventana abierta con la misma URL
        for (const client of clientList) {
          if (client.url.includes(url.split("/")[1]) && "focus" in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

