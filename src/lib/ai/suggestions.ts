"use server";

import { Groq } from "groq-sdk";

/**
 * Obtiene el cliente de Groq solo cuando se necesita
 * Retorna null si no hay API key configurada
 */
function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new Groq({ apiKey });
}

export interface TripSuggestion {
  id: string;
  type: "tip" | "reminder" | "info" | "recommendation";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon?: string;
}

export interface TripContext {
  name: string;
  destination?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  daysUntilTrip?: number;
  itemCount?: number;
  purchasedItemCount?: number;
}

/**
 * Genera sugerencias inteligentes basadas en un viaje próximo
 */
export async function generateTripSuggestions(
  trip: TripContext
): Promise<TripSuggestion[]> {
  const groq = getGroqClient();
  if (!groq) {
    // Si no hay API key, retornar sugerencias por defecto
    console.warn("GROQ_API_KEY no configurada, usando sugerencias por defecto");
    return getDefaultSuggestions(trip);
  }

  try {
    const today = new Date();
    const daysUntil = trip.daysUntilTrip ?? 0;
    
    // Construir contexto detallado para la IA
    let contextPrompt = `Necesito sugerencias específicas y detalladas para un viaje con la siguiente información:\n\n`;
    
    contextPrompt += `Nombre del viaje: "${trip.name}"\n`;
    
    if (trip.destination) {
      contextPrompt += `Destino: ${trip.destination}\n`;
      contextPrompt += `Por favor, proporciona información REAL y ESPECÍFICA sobre ${trip.destination}.\n`;
    }
    
    if (trip.startDate) {
      const startDate = new Date(trip.startDate);
      const startDateStr = startDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const startMonth = startDate.toLocaleDateString("es-ES", { month: "long" });
      const startYear = startDate.getFullYear();
      
      contextPrompt += `Fecha de inicio: ${startDateStr} (${startMonth} ${startYear})\n`;
      
      if (daysUntil > 0) {
        contextPrompt += `El viaje comienza en ${daysUntil} ${daysUntil === 1 ? "día" : "días"}\n`;
      } else if (daysUntil === 0) {
        contextPrompt += `El viaje comienza HOY\n`;
      } else {
        contextPrompt += `El viaje ya comenzó\n`;
      }
    }
    
    if (trip.endDate) {
      const endDate = new Date(trip.endDate);
      const endDateStr = endDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const endMonth = endDate.toLocaleDateString("es-ES", { month: "long" });
      
      contextPrompt += `Fecha de fin: ${endDateStr}\n`;
      
      if (trip.startDate) {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        contextPrompt += `Duración del viaje: ${diffDays} ${diffDays === 1 ? "día" : "días"}\n`;
      }
      
      contextPrompt += `Época del año: ${endMonth}\n`;
    }
    
    if (trip.itemCount !== undefined) {
      contextPrompt += `\nEstado de la lista de compras:\n`;
      contextPrompt += `- Total de artículos: ${trip.itemCount}\n`;
      if (trip.purchasedItemCount !== undefined && trip.purchasedItemCount > 0) {
        const progress = Math.round((trip.purchasedItemCount / trip.itemCount) * 100);
        contextPrompt += `- Artículos comprados: ${trip.purchasedItemCount} (${progress}% completado)\n`;
      } else {
        contextPrompt += `- Aún no se han comprado artículos\n`;
      }
    }
    
    contextPrompt += `\nPor favor, proporciona sugerencias ESPECÍFICAS basadas en:\n`;
    if (trip.destination) {
      contextPrompt += `- Información real sobre ${trip.destination}\n`;
    }
    if (trip.startDate) {
      const startDate = new Date(trip.startDate);
      const month = startDate.toLocaleDateString("es-ES", { month: "long" });
      contextPrompt += `- Clima y condiciones en ${month}\n`;
      contextPrompt += `- Eventos o temporadas especiales en esa época\n`;
    }
    contextPrompt += `- Requisitos específicos del destino (visas, vacunas, documentos)\n`;
    contextPrompt += `- Artículos esenciales para ese destino y época del año\n`;
    contextPrompt += `- Consejos prácticos y culturales específicos\n`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente experto en viajes que proporciona sugerencias específicas, útiles y prácticas basadas en información real del destino y las fechas del viaje.

IMPORTANTE: Debes proporcionar información REAL y ESPECÍFICA sobre:
- El clima esperado en el destino durante las fechas del viaje
- Eventos, festivales o temporadas especiales en esas fechas
- Requisitos de documentos, visas o vacunas específicos del destino
- Costumbres culturales importantes del destino
- Moneda local y consejos de cambio (IMPORTANTE: El peso cubano es CUP, NO CUC. CUC fue eliminado en 2021)
- Artículos específicos que se necesitan para ese destino y época del año
- Consejos de seguridad relevantes para el destino

NOTA SOBRE MONEDAS: Asegúrate de usar los códigos de moneda correctos. Por ejemplo, el peso cubano es CUP (no CUC, que fue eliminado en 2021).

Responde SOLO con un JSON válido en este formato exacto:
{
  "suggestions": [
    {
      "type": "tip" | "reminder" | "info" | "recommendation",
      "title": "Título corto y específico (máximo 50 caracteres)",
      "description": "Descripción detallada y específica con información real (máximo 250 caracteres)",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Tipos de sugerencias:
- "tip": Consejos prácticos específicos del destino y época (ej: "Lleva protector solar SPF 50+ - el índice UV es muy alto en [destino] en [mes]")
- "reminder": Recordatorios importantes específicos (ej: "Necesitas visa para [destino] - tramítala con anticipación")
- "info": Información útil y específica (ej: "En [destino] en [mes] la temperatura promedio es X°C con lluvias frecuentes")
- "recommendation": Recomendaciones específicas (ej: "Agrega repelente de mosquitos - [destino] tiene temporada de dengue en [mes]")

Prioridades:
- "high": Crítico para el viaje (documentos, vacunas, requisitos legales, clima extremo)
- "medium": Importante pero no urgente (artículos recomendados, información cultural)
- "low": Información útil adicional (tips de ahorro, actividades recomendadas)

Genera entre 4 y 6 sugerencias ESPECÍFICAS basadas en información real del destino y las fechas. Si no tienes información específica sobre el destino, indica que es información general.

Responde SOLO con el JSON, sin texto adicional.`,
        },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new Error("No se recibió respuesta de Groq");
    }

    const data = JSON.parse(response) as { suggestions: Omit<TripSuggestion, "id">[] };
    
    // Agregar IDs únicos a las sugerencias
    const suggestions: TripSuggestion[] = data.suggestions.map((suggestion, index) => ({
      ...suggestion,
      id: `suggestion-${Date.now()}-${index}`,
    }));

    // Validar y filtrar sugerencias
    return suggestions.filter((s) => s.title && s.description);
  } catch (error) {
    console.error("Error generating trip suggestions:", error);
    // Retornar sugerencias por defecto si falla la IA
    return getDefaultSuggestions(trip);
  }
}

/**
 * Sugerencias por defecto si falla la IA
 */
function getDefaultSuggestions(trip: TripContext): TripSuggestion[] {
  const suggestions: TripSuggestion[] = [];
  const daysUntil = trip.daysUntilTrip ?? 0;

  if (daysUntil <= 7 && daysUntil >= 0) {
    suggestions.push({
      id: "default-1",
      type: "reminder",
      title: "Revisa tus documentos",
      description: "Asegúrate de tener pasaporte, visa y documentos necesarios listos",
      priority: "high",
    });
  }

  if (trip.destination) {
    suggestions.push({
      id: "default-2",
      type: "info",
      title: `Información sobre ${trip.destination}`,
      description: `Investiga sobre el clima, cultura y costumbres de ${trip.destination}`,
      priority: "medium",
    });
  }

  if (trip.itemCount === 0 || (trip.itemCount && trip.itemCount < 5)) {
    suggestions.push({
      id: "default-3",
      type: "recommendation",
      title: "Agrega artículos a tu lista",
      description: "Comienza a agregar los artículos esenciales que necesitarás para tu viaje",
      priority: "medium",
    });
  }

  return suggestions;
}
