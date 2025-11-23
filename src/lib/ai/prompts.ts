"use server";

import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
  "price": número decimal (opcional, en dólares USD),
  "quantity": número entero (opcional, por defecto 1)
}

Si no hay información sobre precio o cantidad, omítelos del JSON.
Si mencionas un precio pero no especificas la moneda, asume que es en dólares USD.
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

