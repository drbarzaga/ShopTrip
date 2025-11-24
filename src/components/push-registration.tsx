"use client";

import { useEffect, useCallback } from "react";
import { useNotificationsContext } from "@/components/notifications-provider";

export function PushRegistration() {
  const { requestPermission } = useNotificationsContext();

  // Convertir VAPID key de base64 a Uint8Array
  const urlBase64ToUint8Array = useCallback(
    (base64String: string): Uint8Array => {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replaceAll("-", "+")
        .replaceAll("_", "/");

      const rawData = globalThis.window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.codePointAt(i) || 0;
      }
      return outputArray;
    },
    []
  );

  const initializePush = useCallback(async () => {
    try {
      console.log("[Push Client] Starting push initialization...");

      // Solicitar permiso de notificaciones
      const permission = await requestPermission();
      console.log(`[Push Client] Notification permission: ${permission}`);
      if (!permission) {
        console.warn(
          "[Push Client] Permission denied, skipping push registration"
        );
        return;
      }

      // Registrar Service Worker
      console.log("[Push Client] Registering service worker...");
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log(
        "[Push Client] Service worker registered, waiting for ready..."
      );
      await navigator.serviceWorker.ready;
      console.log("[Push Client] Service worker ready");

      // Verificar si ya hay una suscripción
      let subscription = await registration.pushManager.getSubscription();
      console.log(
        `[Push Client] Existing subscription: ${subscription ? "found" : "not found"}`
      );

      // Si no hay suscripción, crear una nueva
      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error("[Push Client] VAPID public key not configured");
          return;
        }

        console.log("[Push Client] Creating new subscription...");
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
        console.log("[Push Client] Subscription created successfully");
      }

      // Enviar suscripción al servidor
      console.log("[Push Client] Sending subscription to server...");
      const response = await fetch("/api/push/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: JSON.stringify(subscription),
          deviceInfo: navigator.userAgent,
        }),
      });

      if (response.ok) {
        console.log("[Push Client] Successfully registered push subscription");
      } else {
        const errorText = await response.text();
        console.error(
          `[Push Client] Failed to register push subscription: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error(
        "[Push Client] Error initializing push notifications:",
        error
      );
    }
  }, [requestPermission, urlBase64ToUint8Array]);

  useEffect(() => {
    // Verificar soporte de Service Worker y Push API
    if (
      globalThis.window !== undefined &&
      "serviceWorker" in navigator &&
      "PushManager" in globalThis.window
    ) {
      // Llamar async para evitar setState síncrono en effect
      void initializePush();
    }
  }, [initializePush]);

  // Este componente no renderiza nada, solo maneja el registro
  return null;
}
