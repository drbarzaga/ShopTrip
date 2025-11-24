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

        // Función para registrar el Player ID
        const registerPlayerId = async () => {
          try {
            // Esperar un momento para que OneSignal esté listo
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Obtener el User ID (Player ID)
            let userId: string | null = null;

            try {
              // Intentar obtener el ID usando el método estándar
              if (typeof OneSignal.getUserId === "function") {
                userId = await OneSignal.getUserId();
              }
            } catch (error) {
              console.error("[OneSignal] Error getting User ID:", error);
            }

            if (userId) {
              console.log("[OneSignal] Player ID:", userId);

              // Registrar en el servidor
              const response = await fetch("/api/push/register-onesignal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ onesignalUserId: userId }),
              });

              if (response.ok) {
                const result = await response.json();
                console.log("[OneSignal] ✅ Player ID registered:", result);
              } else {
                const error = await response.text();
                console.error("[OneSignal] ❌ Registration failed:", error);
              }
            } else {
              console.warn("[OneSignal] ⚠️ User ID not available yet");
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
