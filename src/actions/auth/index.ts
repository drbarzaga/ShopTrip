"use server";

import type { ActionState, ActionResult } from "@/types/actions";
import type { SignInInput } from "@/schemas/auth";
import { signInSchema } from "@/schemas/auth";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import { auth } from "@/lib/auth";

export const signInAction = async (
  prevState: ActionState<SignInInput>,
  formData: FormData
): Promise<ActionResult<void>> => {
  return withValidation(formData, signInSchema, async ({ email, password }) => {
    try {
      await auth.api.signInEmail({
        body: { email, password },
      });

      return await success(undefined, "¡Inicio de sesión exitoso!");
    } catch (error) {
      const message =
        (error as Error).message || "Ocurrió un error durante el inicio de sesión";
      return await failure(message, undefined, { email });
    }
  });
};
