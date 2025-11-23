import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type Currency = "UYU" | "USD";

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}

/**
 * Obtiene el cambio de moneda actual usando Groq
 * Esta función debe ejecutarse en el servidor
 */
export async function getExchangeRate(
  from: Currency,
  to: Currency
): Promise<number> {
  // Si es la misma moneda, retornar 1
  if (from === to) {
    return 1;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente experto en tipos de cambio de moneda. Responde SOLO con el número del tipo de cambio actual, sin texto adicional, sin explicaciones, solo el número decimal. Por ejemplo, si 1 ${from} = 0.025 ${to}, responde solo: 0.025`,
        },
        {
          role: "user",
          content: `¿Cuál es el tipo de cambio actual de ${from} a ${to}? Responde solo con el número decimal.`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new Error("No se recibió respuesta de Groq");
    }

    // Extraer el número del tipo de cambio
    const rate = Number.parseFloat(response);
    if (Number.isNaN(rate) || rate <= 0) {
      throw new Error(`Respuesta inválida de Groq: ${response}`);
    }

    return rate;
  } catch (error) {
    console.error("Error obteniendo tipo de cambio:", error);
    // Valores por defecto aproximados si falla la API
    if (from === "UYU" && to === "USD") {
      return 0.025; // Aproximadamente 1 UYU = 0.025 USD
    }
    if (from === "USD" && to === "UYU") {
      return 40; // Aproximadamente 1 USD = 40 UYU
    }
    throw error;
  }
}

/**
 * Convierte un monto de una moneda a otra
 */
export async function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> {
  if (from === to) {
    return amount;
  }

  const rate = await getExchangeRate(from, to);
  return amount * rate;
}

/**
 * Obtiene el símbolo de la moneda
 */
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case "UYU":
      return "$";
    case "USD":
      return "US$";
    default:
      return "$";
  }
}

/**
 * Obtiene el código ISO de la moneda para formateo
 */
export function getCurrencyCode(currency: Currency): string {
  switch (currency) {
    case "UYU":
      return "UYU";
    case "USD":
      return "USD";
    default:
      return "USD";
  }
}

/**
 * Formatea un monto según la moneda especificada
 */
export function formatCurrency(
  amount: number | null,
  currency: Currency = "UYU"
): string {
  if (amount === null || amount === undefined) {
    return `${getCurrencySymbol(currency)}0.00`;
  }

  const code = getCurrencyCode(currency);

  // Para UYU, usar formato personalizado sin decimales si es entero
  if (currency === "UYU") {
    if (Number.isInteger(amount)) {
      return `${getCurrencySymbol(currency)}${amount.toLocaleString("es-UY")}`;
    }
    return `${getCurrencySymbol(currency)}${amount.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Para USD, usar formato estándar
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
  }).format(amount);
}
