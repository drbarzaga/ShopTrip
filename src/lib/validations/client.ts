"use client";

import { z } from "zod";

/**
 * Valida datos en el cliente usando un schema de Zod
 * Retorna un objeto con success y errors (si hay errores)
 */
export function validateOnClient<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T
): { success: true } | { success: false; errors: Record<string, string[]> } {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    // Si no es un ZodError, retornar un error genérico
    return { success: false, errors: { _form: ["Validation failed"] } };
  }
}

