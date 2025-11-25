"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

export function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Detectar si es una PWA instalada
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    // Ocultar el splash screen después de que la app haya cargado
    const hideSplash = () => {
      setTimeout(() => {
        setIsVisible(false);
        // Remover del DOM después de la animación
        setTimeout(() => {
          const splash = document.getElementById("pwa-splash-screen");
          if (splash) {
            splash.remove();
          }
        }, 500);
      }, isStandalone ? 1200 : 800); // Mostrar más tiempo en PWA instalada
    };

    // Ocultar cuando la página esté completamente cargada
    if (document.readyState === "complete") {
      hideSplash();
    } else {
      window.addEventListener("load", hideSplash);
    }

    // Fallback: ocultar después de máximo 2 segundos
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearTimeout(maxTimer);
      window.removeEventListener("load", hideSplash);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      id="pwa-splash-screen"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-gray-900 dark:to-blue-950 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        {/* Logo/Icono animado */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-3xl p-6 shadow-2xl transform transition-transform duration-300 hover:scale-105">
            <Plane className="h-16 w-16 text-white animate-bounce" />
          </div>
        </div>

        {/* Nombre de la app */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight animate-in fade-in duration-700">
            Shop Trip
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-in fade-in duration-700 delay-100">
            Organiza tus compras de viaje
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 animate-in fade-in duration-700 delay-200">
          <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

