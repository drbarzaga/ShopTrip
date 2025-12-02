/**
 * Sistema de sincronización offline
 * Sincroniza acciones pendientes cuando se recupera la conexión
 */

import { offlineDB, type PendingAction } from "./db";

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ action: PendingAction; error: string }>;
}

/**
 * Sincroniza todas las acciones pendientes con el servidor
 */
export async function syncPendingActions(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  try {
    const pendingActions = await offlineDB.getPendingActions();

    if (pendingActions.length === 0) {
      return result;
    }

    // Ordenar por timestamp (más antiguas primero)
    pendingActions.sort((a, b) => a.timestamp - b.timestamp);

    // Sincronizar cada acción
    for (const action of pendingActions) {
      try {
        // Evitar demasiados reintentos
        if (action.retries >= 5) {
          console.error(`[Sync] Skipping action ${action.id} - too many retries`);
          await offlineDB.removePendingAction(action.id);
          result.failed++;
          result.errors.push({
            action,
            error: "Too many retries",
          });
          continue;
        }

        const success = await syncAction(action);

        if (success) {
          await offlineDB.removePendingAction(action.id);
          result.synced++;
        } else {
          await offlineDB.incrementActionRetries(action.id);
          result.failed++;
          result.success = false;
        }
      } catch (error) {
        console.error(`[Sync] Error syncing action ${action.id}:`, error);
        await offlineDB.incrementActionRetries(action.id);
        result.failed++;
        result.success = false;
        result.errors.push({
          action,
          error: (error as Error).message || "Unknown error",
        });
      }
    }

    return result;
  } catch (error) {
    console.error("[Sync] Error getting pending actions:", error);
    result.success = false;
    return result;
  }
}

/**
 * Sincroniza una acción individual con el servidor
 */
async function syncAction(action: PendingAction): Promise<boolean> {
  try {
    switch (action.type) {
      case "create_trip":
        return await syncCreateTrip(action.data);
      case "update_trip":
        return await syncUpdateTrip(action.data);
      case "delete_trip":
        return await syncDeleteTrip(action.data);
      case "create_item":
        return await syncCreateItem(action.data);
      case "update_item":
        return await syncUpdateItem(action.data);
      case "delete_item":
        return await syncDeleteItem(action.data);
      case "toggle_purchased":
        return await syncTogglePurchased(action.data);
      default:
        console.warn(`[Sync] Unknown action type: ${action.type}`);
        return false;
    }
  } catch (error) {
    console.error(`[Sync] Error syncing action ${action.type}:`, error);
    return false;
  }
}

/**
 * Sincroniza creación de viaje usando la server action
 */
async function syncCreateTrip(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { createTripAction } = await import("@/actions/trips");
    
    const formData = new FormData();
    // Solo incluir los campos necesarios para crear el viaje
    if (data.name) formData.append("name", String(data.name));
    if (data.destination) formData.append("destination", String(data.destination));
    if (data.startDate) formData.append("startDate", String(data.startDate));
    if (data.endDate) formData.append("endDate", String(data.endDate));

    const result = await createTripAction(null, formData);
    
    // Si el viaje se creó exitosamente, marcar como sincronizado en IndexedDB
    if (result.success && data.id) {
      await offlineDB.markTripSynced(data.id as string);
    }

    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error creating trip:", error);
    return false;
  }
}

/**
 * Sincroniza actualización de viaje
 */
async function syncUpdateTrip(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { updateTripAction } = await import("@/actions/trips");
    
    const formData = new FormData();
    if (data.id) formData.append("id", String(data.id));
    if (data.name) formData.append("name", String(data.name));
    if (data.destination) formData.append("destination", String(data.destination));
    if (data.startDate) formData.append("startDate", String(data.startDate));
    if (data.endDate) formData.append("endDate", String(data.endDate));

    const result = await updateTripAction(null, formData);
    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error updating trip:", error);
    return false;
  }
}

/**
 * Sincroniza eliminación de viaje
 */
async function syncDeleteTrip(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { deleteTripAction } = await import("@/actions/trips");
    
    if (!data.id) return false;
    
    const result = await deleteTripAction(String(data.id));
    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error deleting trip:", error);
    return false;
  }
}

/**
 * Sincroniza creación de item usando la server action
 */
async function syncCreateItem(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { createTripItemAction } = await import("@/actions/trip-items");
    
    const formData = new FormData();
    if (data.tripId) formData.append("tripId", String(data.tripId));
    if (data.name) formData.append("name", String(data.name));
    if (data.description) formData.append("description", String(data.description));
    if (data.price !== null && data.price !== undefined) {
      formData.append("price", String(data.price));
    }
    if (data.quantity !== null && data.quantity !== undefined) {
      formData.append("quantity", String(data.quantity));
    }

    const result = await createTripItemAction(null, formData);
    
    // Si el item se creó exitosamente, marcar como sincronizado
    if (result.success && data.id) {
      await offlineDB.markItemSynced(data.id as string);
    }

    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error creating item:", error);
    return false;
  }
}

/**
 * Sincroniza actualización de item
 */
async function syncUpdateItem(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { updateTripItemAction } = await import("@/actions/trip-items");
    
    const formData = new FormData();
    if (data.id) formData.append("id", String(data.id));
    if (data.name) formData.append("name", String(data.name));
    if (data.description) formData.append("description", String(data.description));
    if (data.price !== null && data.price !== undefined) {
      formData.append("price", String(data.price));
    }
    if (data.quantity !== null && data.quantity !== undefined) {
      formData.append("quantity", String(data.quantity));
    }

    const result = await updateTripItemAction(null, formData);
    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error updating item:", error);
    return false;
  }
}

/**
 * Sincroniza eliminación de item
 */
async function syncDeleteItem(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { deleteTripItemAction } = await import("@/actions/trip-items");
    
    if (!data.id) return false;
    
    const result = await deleteTripItemAction(String(data.id));
    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error deleting item:", error);
    return false;
  }
}

/**
 * Sincroniza toggle de purchased
 */
async function syncTogglePurchased(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Importar la server action dinámicamente
    const { toggleItemPurchasedAction } = await import("@/actions/trip-items");
    
    if (!data.id || data.purchased === undefined) return false;
    
    const result = await toggleItemPurchasedAction(
      String(data.id),
      Boolean(data.purchased)
    );
    return result.success === true;
  } catch (error) {
    console.error("[Sync] Error toggling purchased:", error);
    return false;
  }
}

/**
 * Inicializa el sistema de sincronización
 * Se ejecuta cuando se detecta conexión online
 */
export async function initializeSync(): Promise<void> {
  if (typeof window === "undefined") return;

  // Verificar si hay conexión
  if (!navigator.onLine) {
    return;
  }

  // Sincronizar acciones pendientes
  try {
    const result = await syncPendingActions();
    
    if (result.synced > 0) {
      console.log(`[Sync] Synced ${result.synced} actions`);
    }
    
    if (result.failed > 0) {
      console.warn(`[Sync] Failed to sync ${result.failed} actions`);
    }

    // Disparar evento personalizado para notificar a la UI
    window.dispatchEvent(
      new CustomEvent("sync-complete", {
        detail: result,
      })
    );
  } catch (error) {
    console.error("[Sync] Error initializing sync:", error);
  }
}

