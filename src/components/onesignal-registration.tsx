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
            console.log("[OneSignal] Attempting to get Player ID...");
            console.log("[OneSignal] OneSignal object:", OneSignal);
            console.log(
              "[OneSignal] Available methods:",
              Object.keys(OneSignal).filter(
                (k) => typeof OneSignal[k] === "function"
              )
            );

            // Esperar un momento para que OneSignal esté listo
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Obtener el User ID (Player ID) - intentar múltiples métodos
            let userId: string | null = null;

            // Método 1: getUserId()
            try {
              if (typeof OneSignal.getUserId === "function") {
                userId = await OneSignal.getUserId();
                console.log("[OneSignal] getUserId() returned:", userId);
              }
            } catch (error) {
              console.error("[OneSignal] Error with getUserId():", error);
            }

            // Método 2: getUser() y acceder a .id
            if (!userId) {
              try {
                if (typeof OneSignal.getUser === "function") {
                  const user = await OneSignal.getUser();
                  console.log("[OneSignal] getUser() returned:", user);
                  userId = user?.id || user?.userId || null;
                }
              } catch (error) {
                console.error("[OneSignal] Error with getUser():", error);
              }
            }

            // Método 3: Acceso directo a User.PushSubscription.id
            if (!userId && OneSignal.User) {
              try {
                console.log(
                  "[OneSignal] Checking OneSignal.User:",
                  OneSignal.User
                );
                if (OneSignal.User.PushSubscription) {
                  userId = OneSignal.User.PushSubscription.id || null;
                  console.log("[OneSignal] User.PushSubscription.id:", userId);
                }
              } catch (error) {
                console.error(
                  "[OneSignal] Error accessing User.PushSubscription:",
                  error
                );
              }
            }

            // Método 4: Acceso directo a User.id
            if (!userId && OneSignal.User) {
              try {
                userId = OneSignal.User.id || null;
                console.log("[OneSignal] User.id:", userId);
              } catch (error) {
                console.error("[OneSignal] Error accessing User.id:", error);
              }
            }

            console.log("[OneSignal] Final Player ID:", userId);

            if (userId) {
              console.log("[OneSignal] Player ID found:", userId);

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
                console.error(
                  "[OneSignal] ❌ Registration failed:",
                  response.status,
                  error
                );
              }
            } else {
              console.warn("[OneSignal] ⚠️ User ID not available yet");
              console.warn(
                "[OneSignal] OneSignal object structure:",
                JSON.stringify(OneSignal, null, 2).substring(0, 500)
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
