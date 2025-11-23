"use server";

import { createItemFromPrompt } from "@/lib/ai/prompts";
import { createTripItemAction } from "@/actions/trip-items";
import type { ActionResult } from "@/types/actions";

/**
 * Crea un producto/item desde un prompt de texto usando IA
 */
export async function createItemFromAIPromptAction(
  prompt: string,
  tripId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Procesar el prompt con IA
    const itemData = await createItemFromPrompt(prompt);

    // Crear FormData para la acción existente
    const formData = new FormData();
    formData.append("tripId", tripId);
    formData.append("name", itemData.name);
    if (itemData.description) {
      formData.append("description", itemData.description);
    }
    // Solo agregar precio si se especificó explícitamente y es mayor a 0
    if (itemData.price !== undefined && itemData.price !== null && itemData.price > 0) {
      formData.append("price", itemData.price.toString());
    }
    // Cantidad: usar la especificada o 1 por defecto
    const quantity = itemData.quantity !== undefined && itemData.quantity !== null && itemData.quantity > 0 
      ? itemData.quantity 
      : 1;
    formData.append("quantity", quantity.toString());

    // Usar la acción existente para crear el item
    const result = await createTripItemAction(null, formData);
    return result;
  } catch (error) {
    console.error("Error creating item from AI prompt:", error);
    const message =
      (error as Error).message ||
      "Ocurrió un error al crear el producto con IA";
    return {
      success: false,
      message,
    };
  }
}

