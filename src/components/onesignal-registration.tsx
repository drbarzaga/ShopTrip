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
      try {
        await OneSignal.init({
          appId: appId,
          safari_web_id: safariWebId || undefined,
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });

        console.log("[OneSignal] SDK initialized");

        // Función para registrar el Player ID usando la API correcta
        const registerPlayerId = async () => {
          try {
            // Esperar un momento para que OneSignal esté completamente inicializado
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Obtener el Player ID desde OneSignal.User.PushSubscription.id
            let userId: string | null = null;

            try {
              // La API correcta es OneSignal.User.PushSubscription.id
              if (OneSignal.User && OneSignal.User.PushSubscription) {
                userId = OneSignal.User.PushSubscription.id || null;
                console.log(
                  "[OneSignal] Player ID from PushSubscription.id:",
                  userId
                );
              }
            } catch (error) {
              console.error(
                "[OneSignal] Error accessing PushSubscription.id:",
                error
              );
            }

            // Si aún no tenemos el ID, intentar acceder a User.id directamente
            if (!userId && OneSignal.User) {
              try {
                userId = OneSignal.User.id || null;
                console.log("[OneSignal] Player ID from User.id:", userId);
              } catch (error) {
                console.error("[OneSignal] Error accessing User.id:", error);
              }
            }

            if (userId) {
              console.log("[OneSignal] ✅ Player ID found:", userId);

              // Registrar en el servidor
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
                  "[OneSignal] ❌ Registration failed:",
                  response.status,
                  error
                );
              }
            } else {
              console.warn(
                "[OneSignal] ⚠️ Player ID not available yet - user may not be subscribed"
              );
            }
          } catch (error) {
            console.error("[OneSignal] Error in registerPlayerId:", error);
          }
        };

        // Intentar registrar el Player ID después de un delay
        setTimeout(() => {
          registerPlayerId();
        }, 3000);

        // También intentar cada 10 segundos por si el usuario se suscribe después
        const checkInterval = setInterval(() => {
          registerPlayerId();
        }, 10000);

        // Limpiar después de 2 minutos
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 120000);

        console.log("[OneSignal] ✅ Initialized successfully");
      } catch (error) {
        console.error("[OneSignal] ❌ Initialization error:", error);
      }
    });
  }, []);

  return null;
}
