// -------------------------------- Authentication Actions --------------------------------

import { failure, success, validateActionInput } from "@/lib/actions/helpers";
import { auth } from "@/lib/auth";
import { schemas } from "@/schemas";
import { FormAction } from "@/types/actions";
import { headers } from "next/headers";

export const signInAction: FormAction<{ userId: string }> = async (
  prevState,
  formData
) => {
  const validation = await validateActionInput(formData, schemas.signIn);

  if (!validation.success) {
    return validation.error;
  }

  const { email, password } = validation.data;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    // Get the userId from the session after sign-in
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return failure("Error al obtener la sesión del usuario después del inicio de sesión");
    }

    return success({ userId: session.user.id }, "Inicio de sesión exitoso");
  } catch (error) {
    return failure((error as Error).message || "Ocurrió un error inesperado");
  }
};
