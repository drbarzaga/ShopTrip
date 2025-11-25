"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { Currency } from "@/lib/currency";

/**
 * Obtiene la moneda preferida del usuario
 */
export async function getUserPreferredCurrency(): Promise<Currency> {
  try {
    const session = await getSession();
    if (!session) {
      return "UYU"; // Valor por defecto
    }

    const userData = await db
      .select({ preferredCurrency: user.preferredCurrency })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userData.length === 0) {
      return "UYU";
    }

    const currency = userData[0].preferredCurrency as Currency;
    return currency === "USD" ? "USD" : "UYU";
  } catch (error) {
    console.error("Error getting user preferred currency:", error);
    return "UYU";
  }
}

/**
 * Actualiza la moneda preferida del usuario
 */
export async function updatePreferredCurrencyAction(
  currency: Currency
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }

    // Validar que la moneda sea válida
    if (currency !== "UYU" && currency !== "USD") {
      return await failure("Moneda no válida");
    }

    await db
      .update(user)
      .set({ preferredCurrency: currency })
      .where(eq(user.id, session.user.id));

    return await success(undefined, "Moneda actualizada exitosamente");
  } catch (error) {
    console.error("Error updating preferred currency:", error);
    const message =
      (error as Error).message || "Ocurrió un error al actualizar la moneda";
    return await failure(message);
  }
}




