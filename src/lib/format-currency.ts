"use server";

import { getUserPreferredCurrency } from "@/actions/settings";
import { formatCurrency as formatCurrencyUtil, convertCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

/**
 * Formatea un monto usando la moneda preferida del usuario
 * Los precios están almacenados en UYU, solo se convierten si la moneda preferida es USD
 */
export async function formatCurrencyWithUserPreference(
  amount: number | null,
  storedCurrency: Currency = "UYU" // Los precios están almacenados en UYU
): Promise<string> {
  if (amount === null || amount === undefined) {
    const preferredCurrency = await getUserPreferredCurrency();
    return formatCurrencyUtil(0, preferredCurrency);
  }

  const preferredCurrency = await getUserPreferredCurrency();

  // Si la moneda almacenada es diferente a la preferida, convertir
  // Solo convertir cuando la preferida es USD (de UYU a USD)
  if (storedCurrency !== preferredCurrency && preferredCurrency === "USD") {
    try {
      const convertedAmount = await convertCurrency(
        amount,
        storedCurrency, // UYU
        preferredCurrency // USD
      );
      return formatCurrencyUtil(convertedAmount, preferredCurrency);
    } catch (error) {
      console.error("Error converting currency:", error);
      // Si falla la conversión, mostrar en la moneda almacenada (UYU)
      return formatCurrencyUtil(amount, storedCurrency);
    }
  }

  // Si la moneda preferida es UYU o es la misma que la almacenada, mostrar tal cual
  return formatCurrencyUtil(amount, preferredCurrency);
}

/**
 * Versión simplificada que asume que los montos están en UYU
 */
export async function formatCurrency(amount: number | null): Promise<string> {
  return formatCurrencyWithUserPreference(amount, "UYU");
}

/**
 * Formatea múltiples montos de una vez usando la moneda preferida del usuario
 * Optimizado para formatear muchos precios sin hacer múltiples llamadas a getUserPreferredCurrency
 */
export async function formatMultipleCurrencies(
  amounts: (number | null)[],
  storedCurrency: Currency = "UYU"
): Promise<string[]> {
  const preferredCurrency = await getUserPreferredCurrency();
  
  // Si no hay conversión necesaria, formatear directamente
  if (storedCurrency === preferredCurrency || preferredCurrency === "UYU") {
    return amounts.map((amount) => {
      if (amount === null || amount === undefined) {
        return formatCurrencyUtil(0, preferredCurrency);
      }
      return formatCurrencyUtil(amount, preferredCurrency);
    });
  }

  // Si necesitamos convertir (UYU a USD), hacer todas las conversiones
  const results = await Promise.all(
    amounts.map(async (amount) => {
      if (amount === null || amount === undefined) {
        return formatCurrencyUtil(0, preferredCurrency);
      }

      try {
        const convertedAmount = await convertCurrency(
          amount,
          storedCurrency,
          preferredCurrency
        );
        return formatCurrencyUtil(convertedAmount, preferredCurrency);
      } catch (error) {
        console.error("Error converting currency:", error);
        return formatCurrencyUtil(amount, storedCurrency);
      }
    })
  );

  return results;
}

