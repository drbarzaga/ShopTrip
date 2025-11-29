import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Formato de correo inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().min(1, "El correo electrónico es requerido").email("Formato de correo inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Formato de correo inválido"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  token: z.string().min(1, "El token es requerido"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
