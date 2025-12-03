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

export interface TripFromPrompt {
  name: string;
  destination?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface ItemFromPrompt {
  name: string;
  description?: string;
  price?: number;
  quantity?: number;
}

/**
 * Procesa un prompt de texto para crear un viaje
 */
export async function createTripFromPrompt(
  prompt: string
): Promise<TripFromPrompt> {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY no configurada. Por favor configura la variable de entorno GROQ_API_KEY.");
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente que ayuda a crear viajes desde descripciones en lenguaje natural. 
Extrae la información del viaje y responde SOLO con un JSON válido en este formato exacto:
{
  "name": "Nombre del viaje",
  "destination": "Destino (opcional)",
  "startDate": "YYYY-MM-DD (opcional, formato ISO)",
  "endDate": "YYYY-MM-DD (opcional, formato ISO)"
}

Si no hay información sobre algún campo, omítelo del JSON. 
Si no hay fecha específica, no incluyas startDate ni endDate.
Responde SOLO con el JSON, sin texto adicional.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new Error("No se recibió respuesta de Groq");
    }

    const tripData = JSON.parse(response) as TripFromPrompt;
    
    // Validar que al menos tenga nombre
    if (!tripData.name || tripData.name.trim() === "") {
      throw new Error("No se pudo extraer el nombre del viaje del prompt");
    }

    return tripData;
  } catch (error) {
    console.error("Error creating trip from prompt:", error);
    throw error;
  }
}

/**
 * Procesa un prompt de texto para crear un producto/item
 */
export async function createItemFromPrompt(
  prompt: string
): Promise<ItemFromPrompt> {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY no configurada. Por favor configura la variable de entorno GROQ_API_KEY.");
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente que ayuda a crear productos/artículos para listas de compras desde descripciones en lenguaje natural.
Extrae la información del producto y responde SOLO con un JSON válido en este formato exacto:
{
  "name": "Nombre del producto",
  "description": "Descripción detallada (opcional)",
  "price": número decimal (SOLO si el usuario menciona explícitamente un precio),
  "quantity": número entero (SOLO si el usuario menciona explícitamente una cantidad)
}

IMPORTANTE:
- Si el usuario NO menciona un precio, NO incluyas el campo "price" en el JSON.
- Si el usuario NO menciona una cantidad, NO incluyas el campo "quantity" en el JSON.
- NO inventes precios ni cantidades si no se mencionan explícitamente.
- Si mencionas un precio pero no especificas la moneda, asume que es en dólares USD.
Responde SOLO con el JSON, sin texto adicional.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new Error("No se recibió respuesta de Groq");
    }

    const itemData = JSON.parse(response) as ItemFromPrompt;
    
    // Validar que al menos tenga nombre
    if (!itemData.name || itemData.name.trim() === "") {
      throw new Error("No se pudo extraer el nombre del producto del prompt");
    }

    // Asegurar que quantity sea al menos 1
    if (itemData.quantity !== undefined && itemData.quantity < 1) {
      itemData.quantity = 1;
    }

    return itemData;
  } catch (error) {
    console.error("Error creating item from prompt:", error);
    throw error;
  }
}

