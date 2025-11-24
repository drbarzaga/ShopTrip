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
        console.warn("[OneSignal] ⚠️ App ID not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID in .env");
        return;
      }

      console.log("[OneSignal] 🚀 Starting initialization with App ID:", appId);

      const OneSignalWindow = window as any;
      
      // Inicializar OneSignal como array si no existe (patrón recomendado)
      if (!OneSignalWindow.OneSignal) {
        OneSignalWindow.OneSignal = [];
      }
      
      // Función para esperar a que el SDK esté cargado
      const waitForSDK = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Si ya está cargado y es un objeto (no array), resolver inmediatamente
          if (OneSignalWindow.OneSignal && typeof OneSignalWindow.OneSignal.init === "function") {
            console.log("[OneSignal] ✅ SDK already loaded");
            resolve();
            return;
          }

          // Si ya hay un script cargándose, esperar a que termine
          const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
          if (existingScript) {
            console.log("[OneSignal] ⏳ Waiting for existing SDK to load...");
            const checkInterval = setInterval(() => {
              if (OneSignalWindow.OneSignal && typeof OneSignalWindow.OneSignal.init === "function") {
                clearInterval(checkInterval);
                console.log("[OneSignal] ✅ SDK loaded");
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              if (!OneSignalWindow.OneSignal || typeof OneSignalWindow.OneSignal.init !== "function") {
                reject(new Error("OneSignal SDK timeout"));
              }
            }, 10000);
            return;
          }

          // Cargar el SDK
          console.log("[OneSignal] 📦 Loading SDK...");
          const script = document.createElement("script");
          script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
          script.async = true;
          
          script.onload = () => {
            console.log("[OneSignal] 📦 Script loaded, waiting for OneSignal object...");
            const checkInterval = setInterval(() => {
              if (OneSignalWindow.OneSignal && typeof OneSignalWindow.OneSignal.init === "function") {
                clearInterval(checkInterval);
                console.log("[OneSignal] ✅ SDK object available");
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              if (!OneSignalWindow.OneSignal || typeof OneSignalWindow.OneSignal.init !== "function") {
                reject(new Error("OneSignal object not available after script load"));
              }
            }, 10000);
          };
          
          script.onerror = () => {
            console.error("[OneSignal] ❌ Failed to load SDK script");
            reject(new Error("Failed to load OneSignal SDK"));
          };
          
          document.head.appendChild(script);
        });
      };

      try {
        // Esperar a que el SDK esté cargado
        await waitForSDK();

        // Ahora OneSignal debería ser un objeto con métodos, no un array
        // Pero aún debemos usar el patrón push para asegurar que esté listo
        await new Promise<void>((resolve, reject) => {
          OneSignalWindow.OneSignal.push(function() {
            try {
              console.log("[OneSignal] 🔧 Initializing SDK...");
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
              
              console.log("[OneSignal] ✅ SDK initialized successfully");
              resolve();
            } catch (error) {
              console.error("[OneSignal] ❌ Error in init:", error);
              reject(error);
            }
          });
        });

        // Esperar un momento para que la inicialización se complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar estado y obtener User ID
        await new Promise<void>((resolve) => {
          OneSignalWindow.OneSignal.push(async function() {
            try {
              const isEnabled = await OneSignalWindow.OneSignal.isPushNotificationsEnabled();
              console.log("[OneSignal] 📱 Push notifications enabled:", isEnabled);
              
              if (isEnabled) {
                const userId = await OneSignalWindow.OneSignal.getUserId();
                if (userId) {
                  console.log("[OneSignal] 👤 User ID:", userId);
                  await registerOneSignalUserId(userId);
                } else {
                  console.log("[OneSignal] ⚠️ User ID not available yet");
                }
              } else {
                console.log("[OneSignal] ℹ️ Push notifications not enabled - user needs to grant permission");
              }
            } catch (error) {
              console.error("[OneSignal] ❌ Error checking status:", error);
            }
            resolve();
          });
        });

        // Configurar listener para cambios en la suscripción
        OneSignalWindow.OneSignal.push(function() {
          OneSignalWindow.OneSignal.on("subscriptionChange", async function(isSubscribed: boolean) {
            console.log("[OneSignal] 🔔 Subscription changed:", isSubscribed);
            
            if (isSubscribed) {
              try {
                const userId = await OneSignalWindow.OneSignal.getUserId();
                if (userId) {
                  console.log("[OneSignal] 👤 User subscribed with ID:", userId);
                  await registerOneSignalUserId(userId);
                }
              } catch (error) {
                console.error("[OneSignal] ❌ Error getting user ID:", error);
              }
            }
          });
        });

        console.log("[OneSignal] ✅ Initialization complete");
      } catch (error) {
        console.error("[OneSignal] ❌ Fatal error during initialization:", error);
      }
    };

    const registerOneSignalUserId = async (userId: string) => {
      try {
        console.log("[OneSignal] 📤 Registering user ID on server:", userId);
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
