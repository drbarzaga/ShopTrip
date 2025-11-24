"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    OneSignalDeferred: any[];
    OneSignal: any;
  }
}

/**
 * Componente para inicializar OneSignal según la documentación oficial
 * Usa el patrón OneSignalDeferred para esperar a que el SDK se cargue
 */
export function OneSignalRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const safariWebId = process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID;

    if (!appId) {
      console.warn(
        "[OneSignal] App ID not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID in .env"
      );
      return;
    }

    // Inicializar OneSignal usando el patrón OneSignalDeferred según la documentación oficial
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.init({
        appId: appId,
        safari_web_id: safariWebId || undefined,
        notifyButton: {
          enable: true, // Mostrar el botón de notificaciones de OneSignal
        },
        allowLocalhostAsSecureOrigin: true, // Permitir localhost para desarrollo
      });

      // Registrar el Player ID cuando el usuario se suscribe
      OneSignal.on(
        "subscriptionChange",
        async function (isSubscribed: boolean) {
          if (isSubscribed) {
            try {
              const userId = await OneSignal.getUserId();
              if (userId) {
                // Registrar el Player ID en el servidor
                await fetch("/api/push/register-onesignal", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ onesignalUserId: userId }),
                });
                console.log("[OneSignal] Player ID registered:", userId);
              }
            } catch (error) {
              console.error("[OneSignal] Error registering Player ID:", error);
            }
          }
        }
      );

      // También verificar si ya está suscrito al inicializar
      const isEnabled = await OneSignal.isPushNotificationsEnabled();
      if (isEnabled) {
        const userId = await OneSignal.getUserId();
        if (userId) {
          fetch("/api/push/register-onesignal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ onesignalUserId: userId }),
          }).catch(console.error);
        }
      }

      console.log("[OneSignal] Initialized successfully");
    });
  }, []);

  return null;
}
