"use server";

import { getUserPreferredCurrency } from "@/actions/settings";
import { formatCurrency as formatCurrencyUtil, convertCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

/**
 * Formatea un monto usando la moneda preferida del usuario
 * Si el monto está almacenado en otra moneda, lo convierte automáticamente
 */
export async function formatCurrencyWithUserPreference(
  amount: number | null,
  storedCurrency: Currency = "USD" // Por defecto, los precios están en USD
): Promise<string> {
  if (amount === null || amount === undefined) {
    const preferredCurrency = await getUserPreferredCurrency();
    return formatCurrencyUtil(0, preferredCurrency);
  }

  const preferredCurrency = await getUserPreferredCurrency();

  // Si la moneda almacenada es diferente a la preferida, convertir
  if (storedCurrency !== preferredCurrency) {
    try {
      const convertedAmount = await convertCurrency(
        amount,
        storedCurrency,
        preferredCurrency
      );
      return formatCurrencyUtil(convertedAmount, preferredCurrency);
    } catch (error) {
      console.error("Error converting currency:", error);
      // Si falla la conversión, mostrar en la moneda almacenada
      return formatCurrencyUtil(amount, storedCurrency);
    }
  }

  return formatCurrencyUtil(amount, preferredCurrency);
}

/**
 * Versión simplificada que asume que los montos están en USD
 * (para mantener compatibilidad con código existente)
 */
export async function formatCurrency(amount: number | null): Promise<string> {
  return formatCurrencyWithUserPreference(amount, "USD");
}

