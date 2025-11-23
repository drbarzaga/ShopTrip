"use server";

import { z } from "zod";
import type { ActionResult } from "@/types/actions";

// Helper para crear un resultado exitoso
export async function success<T>(
  data: T,
  message?: string
): Promise<ActionResult<T>> {
  return { success: true, data, message };
}

// Helper para crear un resultado con error
export async function failure(
  message: string,
  fieldErrors?: Record<string, string[]>,
  formData?: Record<string, unknown>
): Promise<ActionResult<never>> {
  return { success: false, message, fieldErrors, formData };
}

/**
 * Convierte FormData a un objeto plano
 */
function formDataToObject(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

/**
 * Valida FormData con un schema de Zod
 * Retorna los datos validados si tiene éxito, o un ActionResult si falla
 * Incluye los datos originales en el error para mantener el estado del formulario
 */
export async function validate<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
): Promise<z.infer<T> | ActionResult<never>> {
  const data = formDataToObject(formData);

  try {
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
      return await failure("Validation failed", fieldErrors, data);
    }
    return await failure("An unexpected error occurred", undefined, data);
  }
}

/**
 * Valida FormData y retorna un objeto con success, data y error
 * Útil para validaciones que necesitan manejar el resultado de forma explícita
 */
export async function validateActionInput<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; error: ActionResult<never> }
> {
  const result = await validate(formData, schema);

  if (isActionResult(result) && !result.success) {
    return { success: false, error: result };
  }

  return { success: true, data: result as z.infer<T> };
}

/**
 * Helper para manejar la validación en actions de forma más legible
 * Si la validación falla, retorna el error directamente
 * Si tiene éxito, ejecuta la función callback con los datos validados
 */
// Type guard para verificar si es un ActionResult
function isActionResult(value: unknown): value is ActionResult<never> {
  return typeof value === "object" && value !== null && "success" in value;
}

export async function withValidation<
  T extends z.ZodTypeAny,
  TReturn extends ActionResult<unknown>
>(
  formData: FormData,
  schema: T,
  callback: (data: z.infer<T>) => Promise<TReturn> | TReturn
): Promise<TReturn | ActionResult<never>> {
  const result = await validate(formData, schema);

  // Si es un error de validación, retornarlo directamente
  if (isActionResult(result) && !result.success) {
    return result;
  }

  // Ejecutar el callback con los datos validados
  const callbackResult = callback(result as z.infer<T>);

  // Manejar tanto promesas como valores directos
  return callbackResult instanceof Promise
    ? await callbackResult
    : callbackResult;
}
