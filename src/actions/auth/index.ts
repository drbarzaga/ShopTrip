"use server";

import type { ActionState, ActionResult } from "@/types/actions";
import type { SignInInput, SignUpInput } from "@/schemas/auth";
import { signInSchema, signUpSchema } from "@/schemas/auth";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const signInAction = async (
  prevState: ActionResult<{ redirectTo?: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> => {
  const redirectTo = formData.get("redirect") as string | null;
  
  return withValidation(formData, signInSchema, async ({ email, password }) => {
    try {
      await auth.api.signInEmail({
        body: { email, password },
      });

      return await success(
        { redirectTo: redirectTo || undefined },
        "¡Inicio de sesión exitoso!"
      );
    } catch (error) {
      const message =
        (error as Error).message || "Ocurrió un error durante el inicio de sesión";
      return await failure(message, undefined, { email });
    }
  });
};

export const signUpAction = async (
  prevState: ActionResult<{ redirectTo?: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> => {
  const redirectTo = formData.get("redirect") as string | null;
  
  return withValidation(formData, signUpSchema, async ({ name, email, password }) => {
    try {
      await auth.api.signUpEmail({
        body: { name, email, password },
      });

      return await success(
        { redirectTo: redirectTo || undefined },
        "¡Cuenta creada exitosamente!"
      );
    } catch (error) {
      const message =
        (error as Error).message || "Ocurrió un error durante el registro";
      return await failure(message, undefined, { name, email });
    }
  });
};
