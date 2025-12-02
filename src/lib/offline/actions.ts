/**
 * Helpers para acciones offline
 * Detectan si estamos offline y guardan en IndexedDB en lugar de hacer llamadas al servidor
 */

import { offlineDB } from "./db";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Verifica si estamos offline
 */
export function isOffline(): boolean {
  if (typeof window === "undefined") return false;
  return !navigator.onLine;
}

/**
 * Guarda un viaje offline
 */
export async function saveTripOffline(data: {
  id: string;
  name: string;
  slug: string;
  destination: string | null;
  startDate: Date | null;
  endDate: Date | null;
  userId: string;
  organizationId: string | null;
}): Promise<void> {
  await offlineDB.init();
  
  await offlineDB.saveTrip({
    ...data,
    startDate: data.startDate?.toISOString() || null,
    endDate: data.endDate?.toISOString() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Agregar acción pendiente
  await offlineDB.addPendingAction({
    type: "create_trip",
    data: {
      id: data.id,
      name: data.name,
      destination: data.destination,
      startDate: data.startDate?.toISOString().split("T")[0] || null,
      endDate: data.endDate?.toISOString().split("T")[0] || null,
    },
  });
}

/**
 * Guarda un item offline
 */
export async function saveItemOffline(data: {
  id: string;
  tripId: string;
  name: string;
  description: string | null;
  price: number | null;
  quantity: number;
  addedBy: string;
}): Promise<void> {
  await offlineDB.init();
  
  await offlineDB.saveItem({
    ...data,
    purchased: false,
    purchasedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Agregar acción pendiente
  await offlineDB.addPendingAction({
    type: "create_item",
    data: {
      id: data.id,
      tripId: data.tripId,
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
    },
  });
}

/**
 * Actualiza el estado purchased de un item offline
 */
export async function togglePurchasedOffline(
  itemId: string,
  purchased: boolean,
  purchasedBy: string | null
): Promise<void> {
  await offlineDB.init();
  
  // Agregar acción pendiente
  await offlineDB.addPendingAction({
    type: "toggle_purchased",
    data: {
      id: itemId,
      purchased,
      purchasedBy,
    },
  });
}

