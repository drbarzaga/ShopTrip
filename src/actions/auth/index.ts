"use server";

import type { ActionState, ActionResult } from "@/types/actions";
import type {
  SignInInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/schemas/auth";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import { auth } from "@/lib/auth";

export const signInAction = async (
  prevState: ActionResult<{ email: string; password: string }> | null,
  formData: FormData
): Promise<ActionResult<{ email: string; password: string }>> => {
  return withValidation(formData, signInSchema, async ({ email, password }) => {
    try {
      await auth.api.signInEmail({
        body: { email, password },
      });

      return await success({ email, password }, "¡Inicio de sesión exitoso!");
    } catch (error) {
      const message =
        (error as Error).message ||
        "Ocurrió un error durante el inicio de sesión";
      return await failure(message, undefined, { email });
    }
  });
};

export const signUpAction = async (
  prevState: ActionResult<{ redirectTo?: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> => {
  const redirectTo = formData.get("redirect") as string | null;

  return withValidation(
    formData,
    signUpSchema,
    async ({ name, email, password }) => {
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
    }
  );
};

export const forgotPasswordAction = async (
  prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> => {
  return withValidation(formData, forgotPasswordSchema, async ({ email }) => {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

      await auth.api.requestPasswordReset({
        body: {
          email,
          redirectTo: resetUrl,
        },
      });

      // Always return success to prevent email enumeration
      return await success(
        undefined as never,
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."
      );
    } catch (error) {
      // Always return success to prevent email enumeration
      return await success(
        undefined as never,
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."
      );
    }
  });
};

export const resetPasswordAction = async (
  prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> => {
  return withValidation(
    formData,
    resetPasswordSchema,
    async ({ password, token }) => {
      try {
        await auth.api.resetPassword({
          body: {
            newPassword: password,
            token,
          },
        });

        return await success(
          undefined as never,
          "¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión."
        );
      } catch (error) {
        const message =
          (error as Error).message ||
          "El token es inválido o ha expirado. Por favor, solicita un nuevo enlace.";
        return await failure(message);
      }
    }
  );
};
