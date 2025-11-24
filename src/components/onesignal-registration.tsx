"use client";

import { useEffect } from "react";

/**
 * Componente para registrar usuarios en OneSignal
 * OneSignal tiene mejor soporte para PWAs en iOS
 */
export function OneSignalRegistration() {
  useEffect(() => {
    const initializeOneSignal = async () => {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.log("[OneSignal] App ID not configured, skipping OneSignal registration");
        return;
      }

      // Verificar que OneSignal esté disponible
      if (typeof window === "undefined" || !(window as any).OneSignal) {
        // Cargar OneSignal SDK dinámicamente
        try {
          const script = document.createElement("script");
          script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
          script.async = true;
          document.head.appendChild(script);

          script.onload = () => {
            initializeOneSignalSDK(appId);
          };
        } catch (error) {
          console.error("[OneSignal] Error loading SDK:", error);
        }
      } else {
        initializeOneSignalSDK(appId);
      }
    };

    const initializeOneSignalSDK = (appId: string) => {
      try {
        const OneSignal = (window as any).OneSignal;
        
        OneSignal.init({
          appId: appId,
          safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID, // Opcional para Safari
          notifyButton: {
            enable: false, // No mostrar botón, usar el nuestro
          },
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
        });

        OneSignal.on("subscriptionChange", (isSubscribed: boolean) => {
          console.log("[OneSignal] Subscription changed:", isSubscribed);
          
          if (isSubscribed) {
            OneSignal.getUserId().then((userId: string) => {
              console.log("[OneSignal] User ID:", userId);
              // Enviar userId al servidor para asociarlo con el usuario
              registerOneSignalUserId(userId);
            });
          }
        });

        console.log("[OneSignal] Initialized successfully");
      } catch (error) {
        console.error("[OneSignal] Error initializing:", error);
      }
    };

    const registerOneSignalUserId = async (userId: string) => {
      try {
        const response = await fetch("/api/push/register-onesignal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onesignalUserId: userId }),
        });

        if (response.ok) {
          console.log("[OneSignal] User ID registered successfully");
        } else {
          console.error("[OneSignal] Failed to register user ID");
        }
      } catch (error) {
        console.error("[OneSignal] Error registering user ID:", error);
      }
    };

    void initializeOneSignal();
  }, []);

  return null;
}

