"use client";

import { useEffect } from "react";

export function PWASplashScreen() {
  useEffect(() => {
    // Detectar si es una PWA instalada
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    // Obtener el splash screen inline que ya existe en el DOM
    const splashElement = document.getElementById("pwa-splash-screen-inline");
    
    if (!splashElement) {
      return; // Si no existe, no hacer nada (puede que no sea PWA)
    }

    // Función para ocultar el splash screen
    const hideSplash = () => {
      const splash = document.getElementById("pwa-splash-screen-inline");
      if (splash) {
        // Fade out
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";
        
        // Remover del DOM después de la animación
        setTimeout(() => {
          splash.remove();
        }, 500);
      }
    };

    // Ocultar cuando la página esté completamente cargada y React haya hidratado
    const hideAfterLoad = () => {
      // Esperar un poco más para que la UI esté lista
      const delay = isStandalone ? 1200 : 800;
      setTimeout(hideSplash, delay);
    };

    // Verificar si ya está cargado
    if (document.readyState === "complete") {
      // Esperar un frame para asegurar que React haya hidratado
      requestAnimationFrame(() => {
        requestAnimationFrame(hideAfterLoad);
      });
    } else {
      window.addEventListener("load", () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(hideAfterLoad);
        });
      });
    }

    // Fallback: ocultar después de máximo 2.5 segundos
    const maxTimer = setTimeout(() => {
      hideSplash();
    }, 2500);

    return () => {
      clearTimeout(maxTimer);
      window.removeEventListener("load", hideAfterLoad);
    };
  }, []);

  // Este componente no renderiza nada, solo controla el splash inline
  return null;
}

