"use client";

import { useEffect, useState } from "react";

export function PWASplashScreen() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Detectar si es una PWA instalada
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    // Detectar tema para el splash screen
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    // Crear el splash screen después de que React se haya hidratado
    const createSplash = () => {
      if (document.getElementById("pwa-splash-screen-inline")) {
        return; // Ya existe
      }

      const splashHTML = `
        <div id="pwa-splash-screen-inline" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom right, ${theme === 'dark' ? '#0f172a, #111827, #0f172a' : '#eff6ff, #ffffff, #eff6ff'});
          opacity: 1;
          transition: opacity 0.5s ease-out;
        ">
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            animation: fadeIn 0.5s ease-out;
          ">
            <img 
              src="/icon.png" 
              alt="Shop Trip" 
              style="
                width: 64px;
                height: 64px;
                animation: bounce 1s infinite;
              "
            />
            <div style="text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
              <h1 style="
                font-size: 1.875rem;
                font-weight: 700;
                color: ${theme === 'dark' ? '#ffffff' : '#111827'};
                letter-spacing: -0.025em;
                margin: 0;
                animation: fadeIn 0.7s ease-out;
              ">Shop Trip</h1>
              <p style="
                font-size: 0.875rem;
                color: ${theme === 'dark' ? '#9ca3af' : '#4b5563'};
                margin: 0;
                animation: fadeIn 0.7s ease-out 0.1s both;
              ">Organiza las compras de tu viaje</p>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 0.5rem;
              animation: fadeIn 0.7s ease-out 0.2s both;
            ">
              <div style="
                width: 0.5rem;
                height: 0.5rem;
                background: ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                border-radius: 9999px;
                animation: bounce 1s infinite -0.3s;
              "></div>
              <div style="
                width: 0.5rem;
                height: 0.5rem;
                background: ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                border-radius: 9999px;
                animation: bounce 1s infinite -0.15s;
              "></div>
              <div style="
                width: 0.5rem;
                height: 0.5rem;
                background: ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                border-radius: 9999px;
                animation: bounce 1s infinite;
              "></div>
            </div>
          </div>
        </div>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-0.5rem); }
          }
        </style>
      `;

      if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', splashHTML);
      }
    };

    // Crear splash screen después de la hidratación
    requestAnimationFrame(() => {
      createSplash();
    });

    // Función para ocultar el splash screen
    const hideSplash = () => {
      const splash = document.getElementById("pwa-splash-screen-inline");
      if (splash) {
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";
        setTimeout(() => {
          splash.remove();
          setShowSplash(false);
        }, 500);
      }
    };

    // Ocultar cuando la página esté completamente cargada
    const hideAfterLoad = () => {
      const delay = isStandalone ? 1200 : 800;
      setTimeout(hideSplash, delay);
    };

    // Verificar si ya está cargado
    if (document.readyState === "complete") {
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

  // Este componente no renderiza nada en el servidor, solo controla el splash en el cliente
  return null;
}

