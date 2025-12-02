"use client";

import { useEffect } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { offlineDB } from "@/lib/offline/db";
import { initializeSync } from "@/lib/offline/sync";
import { OfflineStatus } from "./offline-status";

interface OfflineProviderProps {
  children: React.ReactNode;
}

/**
 * Provider que maneja la funcionalidad offline
 * - Inicializa IndexedDB
 * - Detecta cambios de conexión
 * - Sincroniza automáticamente cuando se recupera la conexión
 */
export function OfflineProvider({ children }: OfflineProviderProps) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Inicializar IndexedDB al cargar la app
    offlineDB.init().catch((error) => {
      console.error("Error initializing offline DB:", error);
    });
  }, []);

  useEffect(() => {
    // Sincronizar cuando se recupera la conexión
    if (isOnline) {
      initializeSync();
    }
  }, [isOnline]);

  // Escuchar eventos de sincronización manual
  useEffect(() => {
    const handleSync = () => {
      if (isOnline) {
        initializeSync();
      }
    };

    window.addEventListener("manual-sync", handleSync);

    return () => {
      window.removeEventListener("manual-sync", handleSync);
    };
  }, [isOnline]);

  return (
    <>
      {children}
      <OfflineStatus />
    </>
  );
}

