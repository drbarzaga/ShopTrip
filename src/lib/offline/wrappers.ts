"use client";

/**
 * Wrappers client-side para acciones offline
 * Detectan si estamos offline y guardan en IndexedDB en lugar de llamar al servidor
 */

import { isOffline, saveTripOffline, saveItemOffline } from "./actions";
import { offlineDB } from "./db";
import { createTripAction } from "@/actions/trips";
import { createTripItemAction } from "@/actions/trip-items";
import type { ActionResult } from "@/types/actions";
import { generateSlug } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

/**
 * Wrapper para crear viaje que funciona offline
 */
export async function createTripOfflineWrapper(
  prevState: ActionResult<{ id: string; slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  // Si estamos online, usar la acción normal del servidor
  if (!isOffline()) {
    return await createTripAction(prevState, formData);
  }

  // Si estamos offline, guardar localmente
  try {
    await offlineDB.init();

    const name = formData.get("name") as string;
    const destination = formData.get("destination") as string | null;
    const startDateStr = formData.get("startDate") as string | null;
    const endDateStr = formData.get("endDate") as string | null;

    if (!name) {
      return {
        success: false,
        message: "El nombre del viaje es requerido",
      };
    }

    // Generar ID y slug localmente
    const tripId = crypto.randomUUID();
    const slug = generateSlug(name);

    // Obtener userId del cliente
    let userId = "offline-user";
    let organizationId: string | null = null;
    
    try {
      const session = await authClient.getSession();
      if (session?.data?.user?.id) {
        userId = session.data.user.id;
      }
      if (session?.data?.session?.activeOrganizationId) {
        organizationId = session.data.session.activeOrganizationId;
      }
    } catch (error) {
      console.warn("Could not get session for offline save:", error);
      // Continuar con valores por defecto
    }

    const startDate = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
    const endDate = endDateStr ? new Date(endDateStr + "T00:00:00") : null;

    // Guardar en IndexedDB
    await saveTripOffline({
      id: tripId,
      name,
      slug,
      destination: destination || null,
      startDate,
      endDate,
      userId,
      organizationId,
    });

    return {
      success: true,
      data: { id: tripId, slug },
      message: "Viaje guardado offline. Se sincronizará cuando recuperes la conexión.",
    };
  } catch (error) {
    console.error("Error saving trip offline:", error);
    return {
      success: false,
      message: "Error al guardar el viaje offline",
    };
  }
}

/**
 * Wrapper para crear item que funciona offline
 */
export async function createTripItemOfflineWrapper(
  prevState: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  // Si estamos online, usar la acción normal del servidor
  if (!isOffline()) {
    return await createTripItemAction(prevState, formData);
  }

  // Si estamos offline, guardar localmente
  try {
    await offlineDB.init();

    const tripId = formData.get("tripId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const priceStr = formData.get("price") as string | null;
    const quantityStr = formData.get("quantity") as string | null;

    if (!tripId || !name) {
      return {
        success: false,
        message: "El ID del viaje y el nombre son requeridos",
      };
    }

    // Generar ID localmente
    const itemId = crypto.randomUUID();

    const price = priceStr ? parseFloat(priceStr) : null;
    const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;

    // Obtener userId del cliente
    let addedBy = "offline-user";
    
    try {
      const session = await authClient.getSession();
      if (session?.data?.user?.id) {
        addedBy = session.data.user.id;
      }
    } catch (error) {
      console.warn("Could not get session for offline save:", error);
      // Continuar con valor por defecto
    }

    // Guardar en IndexedDB
    await saveItemOffline({
      id: itemId,
      tripId,
      name,
      description: description || null,
      price,
      quantity,
      addedBy,
    });

    return {
      success: true,
      data: { id: itemId },
      message: "Artículo guardado offline. Se sincronizará cuando recuperes la conexión.",
    };
  } catch (error) {
    console.error("Error saving item offline:", error);
    return {
      success: false,
      message: "Error al guardar el artículo offline",
    };
  }
}

