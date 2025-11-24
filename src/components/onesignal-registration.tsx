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

    const initializeOneSignal = async () => {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.warn("[OneSignal] App ID not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID in .env");
        return;
      }

      console.log("[OneSignal] Starting initialization...");

      // Cargar OneSignal SDK y esperar a que esté disponible
      const loadOneSignalSDK = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Verificar si ya está cargado
          if ((window as any).OneSignal) {
            console.log("[OneSignal] SDK already loaded");
            resolve();
            return;
          }

          // Verificar si el script ya está en el DOM
          const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
          if (existingScript) {
            // Esperar a que OneSignal esté disponible
            const checkInterval = setInterval(() => {
              if ((window as any).OneSignal) {
                console.log("[OneSignal] SDK became available");
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);

            // Timeout después de 10 segundos
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!(window as any).OneSignal) {
                reject(new Error("OneSignal SDK timeout"));
              }
            }, 10000);
            return;
          }

          const script = document.createElement("script");
          script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
          script.async = true;
          
          script.onload = () => {
            console.log("[OneSignal] Script loaded, waiting for OneSignal object...");
            // Esperar a que OneSignal esté disponible (puede tardar un momento)
            const checkInterval = setInterval(() => {
              if ((window as any).OneSignal) {
                console.log("[OneSignal] SDK object available");
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);

            // Timeout después de 5 segundos
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!(window as any).OneSignal) {
                reject(new Error("OneSignal object not available after script load"));
              }
            }, 5000);
          };
          
          script.onerror = () => {
            console.error("[OneSignal] Failed to load SDK script");
            reject(new Error("Failed to load OneSignal SDK"));
          };
          
          document.head.appendChild(script);
        });
      };

      try {
        await loadOneSignalSDK();
        
        const OneSignal = (window as any).OneSignal;
        
        if (!OneSignal) {
          console.error("[OneSignal] OneSignal object not available after loading SDK");
          return;
        }

        console.log("[OneSignal] Initializing SDK with App ID:", appId);
        
        OneSignal.init({
          appId: appId,
          safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID || undefined,
          notifyButton: {
            enable: false, // No mostrar botón, usar el nuestro
          },
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
        });

        // Verificar estado de suscripción inicial
        OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
          console.log("[OneSignal] Push notifications enabled:", isEnabled);
          
          if (isEnabled) {
            OneSignal.getUserId((userId: string | null) => {
              if (userId) {
                console.log("[OneSignal] User ID:", userId);
                registerOneSignalUserId(userId);
              }
            });
          } else {
            console.log("[OneSignal] Push notifications not enabled, user needs to grant permission");
          }
        });

        // Escuchar cambios en la suscripción
        OneSignal.on("subscriptionChange", (isSubscribed: boolean) => {
          console.log("[OneSignal] Subscription changed:", isSubscribed);
          
          if (isSubscribed) {
            OneSignal.getUserId((userId: string | null) => {
              if (userId) {
                console.log("[OneSignal] User subscribed with ID:", userId);
                registerOneSignalUserId(userId);
              }
            });
          }
        });

        console.log("[OneSignal] ✅ Initialized successfully");
      } catch (error) {
        console.error("[OneSignal] ❌ Error initializing:", error);
      }
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

    void initializeOneSignal();
  }, [mounted]);

  return null;
}

