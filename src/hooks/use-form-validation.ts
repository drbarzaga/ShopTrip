"use client";

import { useState, useTransition } from "react";
import type { z } from "zod";
import { validateOnClient } from "@/lib/validations/client";

export function useFormValidation<T extends z.ZodTypeAny>(schema: T) {
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]>
  >({});
  const [isPending, startTransition] = useTransition();

  const validate = (data: unknown): data is z.infer<T> => {
    const result = validateOnClient(data, schema);
    
    if (result.success) {
      setFieldErrors({});
      return true;
    } else {
      setFieldErrors(result.errors);
      return false;
    }
  };

  const clearErrors = () => {
    setFieldErrors({});
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName]?.[0];
  };

  return {
    validate,
    fieldErrors,
    getFieldError,
    clearErrors,
    isPending,
    startTransition,
  };
}