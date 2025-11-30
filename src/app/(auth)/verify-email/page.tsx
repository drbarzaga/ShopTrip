import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login?error=missing_token");
  }

  try {
    const headersList = await headers();
    
    // Verificar el email usando Better Auth
    const result = await auth.api.verifyEmail({
      query: {
        token,
      },
      headers: headersList,
    });

    if (result?.user) {
      // Si autoSignInAfterVerification está habilitado, el usuario ya está autenticado
      // Redirigir al dashboard
      redirect("/dashboard?verified=true");
    } else {
      // Si no se pudo verificar, redirigir al login con error
      redirect("/login?error=verification_failed");
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    redirect("/login?error=verification_failed");
  }
}

