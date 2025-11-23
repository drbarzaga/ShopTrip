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
      // Solicitar permiso de notificaciones
      const permission = await requestPermission();
      if (!permission) {
        return;
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Verificar si ya hay una suscripción
      let subscription = await registration.pushManager.getSubscription();

      // Si no hay suscripción, crear una nueva
      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn("VAPID public key not configured");
          return;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      // Enviar suscripción al servidor
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

      if (!response.ok) {
        console.error("Failed to register push subscription");
      }
    } catch (error) {
      console.error("Error initializing push notifications:", error);
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
