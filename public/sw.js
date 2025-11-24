// Service Worker para notificaciones push y PWA
// Este archivo debe estar en la carpeta public/

const CACHE_NAME = "shop-trip-v1";
const urlsToCache = [
  "/",
  "/icon.svg",
  "/apple-icon.svg",
  "/manifest.json",
];

// Instalar Service Worker y cachear recursos
self.addEventListener("install", function (event) {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activar inmediatamente
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener("activate", function (event) {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Tomar control inmediatamente
});

// Interceptar requests y servir desde cache si está disponible
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar desde cache si está disponible, sino hacer fetch
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("push", function (event) {
  console.log("[SW] Push event received", event);
  
  let data = {};
  try {
    if (event.data) {
      // Intentar parsear como JSON primero
      try {
        data = event.data.json();
        console.log("[SW] Parsed push data as JSON:", data);
      } catch (jsonError) {
        // Si falla, intentar como texto
        try {
          const text = event.data.text();
          console.log("[SW] Push data as text:", text);
          // Intentar parsear el texto como JSON
          data = JSON.parse(text);
          console.log("[SW] Parsed text as JSON:", data);
        } catch (parseError) {
          // Si tampoco es JSON válido, usar el texto como mensaje
          const text = event.data.text();
          console.log("[SW] Using text as message:", text);
          data = {
            title: "Shop Trip",
            body: text,
            message: text,
          };
        }
      }
    } else {
      console.warn("[SW] No data in push event");
    }
  } catch (error) {
    console.error("[SW] Error parsing push data:", error);
    // Intentar obtener el texto como fallback
    try {
      const text = event.data?.text() || "Nueva notificación";
      data = {
        title: "Shop Trip",
        body: text,
        message: text,
      };
    } catch {
      data = {
        title: "Shop Trip",
        body: "Nueva notificación",
      };
    }
  }

  const title = data.title || "Shop Trip";
  const options = {
    body: data.body || data.message || "Nueva notificación",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: data.data || {},
    tag: data.tripId || data.itemId || "notification",
    requireInteraction: false,
  };

  console.log("[SW] Showing notification:", title, options);
  console.log("[SW] Registration available:", !!self.registration);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log("[SW] Notification shown successfully");
      })
      .catch((error) => {
        console.error("[SW] Error showing notification:", error);
        console.error("[SW] Error details:", {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        });
        // Si falla por permisos, intentar obtenerlos desde el cliente
        if (error?.name === "NotAllowedError" || error?.message?.includes("permission")) {
          console.warn("[SW] Notification permission denied - user needs to grant permission in the app");
        }
      })
  );
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

