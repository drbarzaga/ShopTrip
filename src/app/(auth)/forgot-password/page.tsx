"use client";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppName } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { forgotPasswordAction } from "@/actions/auth";
import { useEffect, Suspense } from "react";
import type { ActionResult } from "@/types/actions";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

function ForgotPasswordForm() {
  const router = useRouter();
  const [state, formAction] = useFormState<ActionResult<void> | null, FormData>(
    forgotPasswordAction,
    null
  );
  const isPending = false;

  useEffect(() => {
    if (state?.success) {
      // Show success message for a few seconds, then redirect to login
      const timer = setTimeout(() => {
        router.push("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  if (state?.success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative w-full max-w-sm bg-card/70 backdrop-blur-2xl overflow-hidden rounded-3xl border-2 border-border/40 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/20 dark:from-white/5 dark:via-transparent dark:to-white/5"></div>
          <div className="relative bg-card/90 backdrop-blur-sm -m-px rounded-3xl border-2 border-border/30 p-8 sm:p-10 pb-8">
            <div className="text-center animate-in slide-down">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="mb-3 text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                Correo Enviado
              </h1>
              <p className="text-sm text-muted-foreground/80 mb-6">
                {state.message || "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Revisa tu bandeja de entrada y sigue las instrucciones del correo. El enlace expirará en 1 hora.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      <form
        action={formAction}
        className="relative w-full max-w-sm bg-card/70 backdrop-blur-2xl overflow-hidden rounded-3xl border-2 border-border/40 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in slide-up"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/20 dark:from-white/5 dark:via-transparent dark:to-white/5"></div>
        <div className="relative bg-card/90 backdrop-blur-sm -m-px rounded-3xl border-2 border-border/30 p-8 sm:p-10 pb-8">
          <div className="text-center animate-in slide-down">
            <Link href="/login" aria-label="volver al login" className="mx-auto block w-fit transition-all duration-300 hover:scale-110 hover:rotate-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <LogoIcon className="relative" />
              </div>
            </Link>
            <h1 className="mb-3 mt-6 text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  name="email"
                  id="email"
                  className="pl-10"
                  defaultValue={
                    state && !state.success
                      ? (state.formData?.email as string)
                      : undefined
                  }
                />
              </div>
            </div>

            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button className="w-full shadow-md hover:shadow-lg transition-all duration-200" type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            <Button asChild variant="link" className="px-2">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}

