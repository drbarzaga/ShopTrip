"use client";

import GoogleButton from "@/components/shared/google-button";
import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppName } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { signInAction } from "@/actions/auth";
import { useEffect, Suspense } from "react";
import type { ActionResult } from "@/types/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const router = useRouter();
  const [state, formAction] = useFormState<
    ActionResult<{ redirectTo?: string }> | null,
    FormData
  >(signInAction, null);
  const isPending = false;

  useEffect(() => {
    if (state?.success) {
      const finalRedirect =
        state.data?.redirectTo || redirectTo || "/dashboard";
      router.push(finalRedirect);
    }
  }, [state, redirectTo, router]);

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
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}
        <div className="relative bg-card/90 backdrop-blur-sm -m-px rounded-3xl border-2 border-border/30 p-8 sm:p-10 pb-8">
          <div className="text-center animate-in slide-down">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit transition-all duration-300 hover:scale-110 hover:rotate-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <LogoIcon className="relative" />
              </div>
            </Link>
            <h1 className="mb-3 mt-6 text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              Iniciar Sesión en {getAppName()}
            </h1>
            <p className="text-sm text-muted-foreground/80">
              ¡Bienvenido de nuevo! Inicia sesión para continuar
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Correo Electrónico
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                defaultValue={
                  state && !state.success
                    ? (state.formData?.email as string)
                    : undefined
                }
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">
                  Contraseña
                </Label>
                <Button asChild variant="link" size="sm">
                  <Link
                    href="/forgot-password"
                    className="link intent-info variant-ghost text-sm"
                  >
                    ¿Olvidaste tu Contraseña?
                  </Link>
                </Button>
              </div>
              <Input
                type="password"
                required
                name="password"
                id="pwd"
                className="input sz-md variant-mixed"
              />
            </div>

            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button className="w-full shadow-md hover:shadow-lg transition-all duration-200" type="submit" disabled={isPending}>
              {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              O continúa con
            </span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <GoogleButton redirectTo={redirectTo} />
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            ¿No tienes una cuenta?
            <Button asChild variant="link" className="px-2">
              <Link
                href={
                  redirectTo
                    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
                    : "/register"
                }
              >
                Crear cuenta
              </Link>
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
