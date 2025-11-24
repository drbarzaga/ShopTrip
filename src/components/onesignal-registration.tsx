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
          console.log("[OneSignal] Attempting to register Player ID...");

          // Esperar un momento para que OneSignal procese la suscripción
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Intentar obtener el User ID
          let userId: string | null = null;

          try {
            userId = await OneSignal.getUserId();
            console.log("[OneSignal] getUserId() returned:", userId);
          } catch (error) {
            console.error("[OneSignal] Error calling getUserId():", error);
          }

          console.log("[OneSignal] Final User ID:", userId);

          if (userId) {
            // Registrar el Player ID en el servidor
            console.log(
              "[OneSignal] Sending registration request to server..."
            );
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
                response.status,
                error
              );
            }
          } else {
            console.warn("[OneSignal] ⚠️ User ID is null");
          }
        } catch (error) {
          console.error("[OneSignal] ❌ Error registering Player ID:", error);
        }
      };

      // Verificar si ya está suscrito al inicializar
      try {
        const isEnabled = await OneSignal.isPushNotificationsEnabled();
        console.log("[OneSignal] Push notifications enabled:", isEnabled);

        if (isEnabled) {
          await registerPlayerId();
        } else {
          console.log("[OneSignal] User not subscribed yet");
        }

        // Verificar periódicamente cada 5 segundos por si el usuario se suscribe
        const checkInterval = setInterval(async () => {
          try {
            const isEnabled = await OneSignal.isPushNotificationsEnabled();
            if (isEnabled) {
              await registerPlayerId();
              // Limpiar el intervalo después de registrar exitosamente
              clearInterval(checkInterval);
            }
          } catch (error) {
            console.error("[OneSignal] Error checking subscription:", error);
          }
        }, 5000);

        // Limpiar después de 60 segundos
        setTimeout(() => clearInterval(checkInterval), 60000);
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
