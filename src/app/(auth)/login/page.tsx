"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/forms/login-form";

export default function LoginPage() {
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
        <LoginForm />
      </section>
    </Suspense>
  );
}
