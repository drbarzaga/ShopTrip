"use server";

import { z } from "zod";
import type { ActionResult } from "@/types/actions";
import { failure } from "@/lib/actions/helpers";

/**
 * Converts FormData to a plain object for validation with Zod
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (object[key]) {
      const existing = object[key];
      object[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      object[key] = value;
    }
  }

  return object;
}

/**
 * Validate FormData with a Zod schema and return the typed result
 */
export function validateFormData<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: ActionResult<never> } {
  try {
    const object = formDataToObject(formData);
    const validated = schema.parse(object);

    return { success: true, data: validated };
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

      return {
        success: false,
        error: failure("Validation failed", fieldErrors),
      };
    }

    return {
      success: false,
      error: failure("An unexpected error occurred"),
    };
  }
}
