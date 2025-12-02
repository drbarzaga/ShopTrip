"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import type { Currency } from "@/lib/currency";

/**
 * Obtiene la moneda preferida del usuario actual
 */
export async function getUserPreferredCurrency(): Promise<Currency> {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return "UYU"; // Valor por defecto si no hay sesión
    }

    const userData = await db
      .select({ preferredCurrency: user.preferredCurrency })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userData.length === 0 || !userData[0].preferredCurrency) {
      return "UYU"; // Valor por defecto
    }

    const currency = userData[0].preferredCurrency as Currency;
    // Validar que sea una moneda válida
    if (currency === "UYU" || currency === "USD") {
      return currency;
    }

    return "UYU"; // Valor por defecto si no es válida
  } catch (error) {
    console.error("Error getting user preferred currency:", error);
    return "UYU"; // Valor por defecto en caso de error
  }
}

/**
 * Actualiza la moneda preferida del usuario actual
 */
export async function updatePreferredCurrencyAction(
  currency: Currency
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "No se encontró la sesión del usuario",
      };
    }

    // Validar que la moneda sea válida
    if (currency !== "UYU" && currency !== "USD") {
      return {
        success: false,
        message: "Moneda no válida",
      };
    }

    await db
      .update(user)
      .set({ preferredCurrency: currency })
      .where(eq(user.id, session.user.id));

    return {
      success: true,
      message: "Moneda preferida actualizada exitosamente",
    };
  } catch (error) {
    console.error("Error updating preferred currency:", error);
    return {
      success: false,
      message: "Error al actualizar la moneda preferida",
    };
  }
}
