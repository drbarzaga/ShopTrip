"use client";

import { useEffect, useState } from "react";

/**
 * Componente para registrar usuarios en OneSignal
 * OneSignal tiene mejor soporte para PWAs en iOS
 */
export function OneSignalRegistration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      return;
    }

    const initializeOneSignal = () => {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.warn("[OneSignal] App ID not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID in .env");
        return;
      }

      console.log("[OneSignal] Starting initialization...");

      // Inicializar OneSignal usando el patrón push (recomendado por OneSignal)
      const OneSignalWindow = window as any;
      
      // Inicializar OneSignal como array si no existe
      if (!OneSignalWindow.OneSignal) {
        OneSignalWindow.OneSignal = [];
      }
      
      // Cargar el SDK si no está cargado
      if (!document.querySelector('script[src*="OneSignalSDK"]')) {
        const script = document.createElement("script");
        script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
        script.async = true;
        document.head.appendChild(script);
      }

      console.log("[OneSignal] Initializing SDK with App ID:", appId);
      
      // Inicializar usando el patrón push
      OneSignalWindow.OneSignal.push(function() {
        try {
          OneSignalWindow.OneSignal.init({
            appId: appId,
            safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID || undefined,
            notifyButton: {
              enable: false,
            },
            allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
            serviceWorkerParam: {
              scope: "/",
            },
            serviceWorkerPath: "OneSignalSDKWorker.js",
          });
          
          console.log("[OneSignal] SDK initialized");
          
          // Verificar estado después de inicializar
          OneSignalWindow.OneSignal.push(async function() {
            try {
              // Verificar si las notificaciones están habilitadas
              const isEnabled = await OneSignalWindow.OneSignal.isPushNotificationsEnabled();
              console.log("[OneSignal] Push notifications enabled:", isEnabled);
              
              if (isEnabled) {
                const userId = await OneSignalWindow.OneSignal.getUserId();
                if (userId) {
                  console.log("[OneSignal] User ID:", userId);
                  registerOneSignalUserId(userId);
                }
              } else {
                console.log("[OneSignal] Push notifications not enabled");
              }
            } catch (error) {
              console.error("[OneSignal] Error checking status:", error);
            }
          });

          // Escuchar cambios en la suscripción
          OneSignalWindow.OneSignal.on("subscriptionChange", async function(isSubscribed: boolean) {
            console.log("[OneSignal] Subscription changed:", isSubscribed);
            
            if (isSubscribed) {
              try {
                const userId = await OneSignalWindow.OneSignal.getUserId();
                if (userId) {
                  console.log("[OneSignal] User subscribed with ID:", userId);
                  registerOneSignalUserId(userId);
                }
              } catch (error) {
                console.error("[OneSignal] Error getting user ID:", error);
              }
            }
          });

          console.log("[OneSignal] ✅ Initialized successfully");
        } catch (error) {
          console.error("[OneSignal] ❌ Error initializing:", error);
        }
      });
    };

    const registerOneSignalUserId = async (userId: string) => {
      try {
        console.log("[OneSignal] Registering user ID on server:", userId);
        const response = await fetch("/api/push/register-onesignal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onesignalUserId: userId }),
        });

        if (response.ok) {
          console.log("[OneSignal] ✅ User ID registered successfully on server");
        } else {
          const errorText = await response.text();
          console.error("[OneSignal] ❌ Failed to register user ID:", response.status, errorText);
        }
      } catch (error) {
        console.error("[OneSignal] ❌ Error registering user ID:", error);
      }
    };

    initializeOneSignal();
  }, [mounted]);

  return null;
}
