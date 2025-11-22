"use server";

import { z } from "zod";
import type { ActionResult } from "@/types/actions";

// Helper para crear un resultado exitoso
export function success<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

// Helper para crear un resultado con error
export function failure(
  message: string,
  fieldErrors?: Record<string, string[]>,
  formData?: Record<string, unknown>
): ActionResult<never> {
  return { success: false, message, fieldErrors, formData };
}

/**
 * Valida FormData con un schema de Zod
 * Retorna los datos validados si tiene éxito, o un ActionResult si falla
 * Incluye los datos originales en el error para mantener el estado del formulario
 */
export function validate<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
): z.infer<T> | ActionResult<never> {
  // Convertir FormData a objeto (siempre lo hacemos para poder retornarlo en errores)
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  try {
    // Validar con Zod y retornar los datos directamente
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });
      // Retornar los datos originales junto con los errores
      return failure("Validation failed", fieldErrors, data);
    }
    return failure("An unexpected error occurred", undefined, data);
  }
}
