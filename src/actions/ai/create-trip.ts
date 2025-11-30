"use server";

import { createTripFromPrompt } from "@/lib/ai/prompts";
import { createTripAction } from "@/actions/trips";
import type { ActionResult } from "@/types/actions";

/**
 * Crea un viaje desde un prompt de texto usando IA
 */
export async function createTripFromAIPromptAction(
  prompt: string
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Procesar el prompt con IA
    const tripData = await createTripFromPrompt(prompt);

    // Crear FormData para la acción existente
    const formData = new FormData();
    formData.append("name", tripData.name);
    if (tripData.destination) {
      formData.append("destination", tripData.destination);
    }
    if (tripData.startDate) {
      formData.append("startDate", tripData.startDate);
    }
    if (tripData.endDate) {
      formData.append("endDate", tripData.endDate);
    }

    // Usar la acción existente para crear el viaje
    const result = await createTripAction(null, formData);
    return result;
  } catch (error) {
    console.error("Error creating trip from AI prompt:", error);
    const message =
      (error as Error).message ||
      "Ocurrió un error al crear el viaje con IA";
    return {
      success: false,
      message,
    };
  }
}





