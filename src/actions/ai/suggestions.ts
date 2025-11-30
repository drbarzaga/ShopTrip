"use server";

import { generateTripSuggestions, type TripSuggestion, type TripContext } from "@/lib/ai/suggestions";
import { getTripItems } from "@/lib/trip-items";
import { getTripBySlug } from "@/actions/trips";
import { getSession } from "@/lib/auth-server";


/**
 * Obtiene sugerencias para un viaje específico por su slug
 * Solo genera sugerencias si el viaje tiene destino y fecha de inicio definidos
 */
export async function getTripSuggestionsBySlug(slug: string): Promise<TripSuggestion[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    // Obtener información del viaje
    const trip = await getTripBySlug(slug, session.user.id);
    if (!trip) {
      return [];
    }

    // Solo generar sugerencias si hay destino y fecha de inicio
    if (!trip.destination || !trip.startDate) {
      return [];
    }

    // Calcular días hasta el viaje
    let daysUntilTrip: number | undefined;
    if (trip.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(trip.startDate);
      startDate.setHours(0, 0, 0, 0);
      const diffTime = startDate.getTime() - today.getTime();
      daysUntilTrip = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Obtener estadísticas de items
    const items = await getTripItems(trip.id);
    const itemCount = items.length;
    const purchasedItemCount = items.filter((item) => item.purchased).length;

    const tripContext: TripContext = {
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      daysUntilTrip,
      itemCount,
      purchasedItemCount,
    };

    const suggestions = await generateTripSuggestions(tripContext);
    return suggestions;
  } catch (error) {
    console.error("Error getting trip suggestions:", error);
    return [];
  }
}
