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

      // Función helper para registrar el Player ID
      const registerPlayerId = async () => {
        try {
          // Esperar un momento para que OneSignal procese la suscripción
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const userId = await OneSignal.getUserId();
          console.log("[OneSignal] Got User ID:", userId);

          if (userId) {
            // Registrar el Player ID en el servidor
            const response = await fetch("/api/push/register-onesignal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ onesignalUserId: userId }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log(
                "[OneSignal] ✅ Player ID registered successfully:",
                result
              );
            } else {
              const error = await response.text();
              console.error(
                "[OneSignal] ❌ Failed to register Player ID:",
                error
              );
            }
          } else {
            console.warn("[OneSignal] ⚠️ User ID is null, will retry...");
            // Reintentar después de 2 segundos
            setTimeout(async () => {
              const retryUserId = await OneSignal.getUserId();
              if (retryUserId) {
                await fetch("/api/push/register-onesignal", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ onesignalUserId: retryUserId }),
                }).catch(console.error);
              }
            }, 2000);
          }
        } catch (error) {
          console.error("[OneSignal] ❌ Error registering Player ID:", error);
        }
      };

      // Registrar el Player ID cuando el usuario se suscribe
      OneSignal.on(
        "subscriptionChange",
        async function (isSubscribed: boolean) {
          console.log("[OneSignal] Subscription changed:", isSubscribed);
          if (isSubscribed) {
            await registerPlayerId();
          }
        }
      );

      // También verificar si ya está suscrito al inicializar
      try {
        const isEnabled = await OneSignal.isPushNotificationsEnabled();
        console.log("[OneSignal] Push notifications enabled:", isEnabled);

        if (isEnabled) {
          await registerPlayerId();
        } else {
          console.log("[OneSignal] User not subscribed yet");
        }
      } catch (error) {
        console.error(
          "[OneSignal] Error checking initial subscription:",
          error
        );
      }

      console.log("[OneSignal] Initialized successfully");
    });
  }, []);

  return null;
}
