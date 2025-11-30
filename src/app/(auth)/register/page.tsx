import { Suspense } from "react";
import RegisterForm from "@/components/auth/forms/register-form";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
        <RegisterForm />
      </section>
    </Suspense>
  );
}
