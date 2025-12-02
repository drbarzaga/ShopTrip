"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { offlineDB } from "@/lib/offline/db";
import { syncPendingActions } from "@/lib/offline/sync";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineStatus() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Cargar cantidad de acciones pendientes
    const loadPendingCount = async () => {
      try {
        await offlineDB.init();
        const actions = await offlineDB.getPendingActions();
        setPendingCount(actions.length);
      } catch (error) {
        console.error("Error loading pending count:", error);
      }
    };

    loadPendingCount();

    // Escuchar eventos de sincronización
    const handleSyncComplete = () => {
      loadPendingCount();
      setIsSyncing(false);
    };

    window.addEventListener("sync-complete", handleSyncComplete);
    window.addEventListener("online", handleSyncComplete);

    return () => {
      window.removeEventListener("sync-complete", handleSyncComplete);
      window.removeEventListener("online", handleSyncComplete);
    };
  }, []);

  // Sincronizar cuando se recupera la conexión
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline]);

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      await syncPendingActions();
      const actions = await offlineDB.getPendingActions();
      setPendingCount(actions.length);
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // No mostrar nada si está online y no hay pendientes
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {!isOnline ? (
        <Badge
          variant="destructive"
          className="flex items-center gap-1.5 px-3 py-1.5 shadow-lg"
        >
          <WifiOff className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Sin conexión</span>
        </Badge>
      ) : pendingCount > 0 ? (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 px-3 py-1.5 shadow-lg cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={handleSync}
        >
          {isSyncing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wifi className="h-3.5 w-3.5" />
          )}
          <span className="text-xs font-medium">
            {isSyncing
              ? "Sincronizando..."
              : `${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}`}
          </span>
        </Badge>
      ) : null}
    </div>
  );
}

