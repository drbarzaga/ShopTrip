import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Formato de correo inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type SignInInput = z.infer<typeof signInSchema>;
