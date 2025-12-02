"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar el estado de conexión online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Verificar estado inicial
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true; // Asumir online en SSR
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

