"use client";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppName } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { resetPasswordAction } from "@/actions/auth";
import { useEffect, Suspense, useState } from "react";
import type { ActionResult } from "@/types/actions";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [state, formAction] = useFormState<ActionResult<void> | null, FormData>(
    resetPasswordAction,
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isPending = false;

  useEffect(() => {
    if (state?.success) {
      // Redirect to login after successful reset
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  // If no token or error in URL, show error
  if (!token || error === "INVALID_TOKEN") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative w-full max-w-sm bg-card/70 backdrop-blur-2xl overflow-hidden rounded-3xl border-2 border-destructive/40 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in slide-up">
          <div className="relative bg-card/90 backdrop-blur-sm -m-px rounded-3xl border-2 border-border/30 p-8 sm:p-10 pb-8">
            <div className="text-center animate-in slide-down">
              <h1 className="mb-3 text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                Token Inválido o Expirado
              </h1>
              <p className="text-sm text-muted-foreground/80 mb-6">
                El enlace de restablecimiento de contraseña es inválido o ha
                expirado.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Los enlaces de recuperación expiran después de 1 hora por
                seguridad. Por favor, solicita un nuevo enlace de recuperación.
              </p>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
        <div className="relative w-full max-w-sm bg-card/70 backdrop-blur-2xl overflow-hidden rounded-3xl border-2 border-border/40 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/20 dark:from-white/5 dark:via-transparent dark:to-white/5"></div>
          <div className="relative bg-card/90 backdrop-blur-sm -m-px rounded-3xl border-2 border-border/30 p-8 sm:p-10 pb-8">
            <div className="text-center animate-in slide-down">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="mb-3 text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                ¡Contraseña Restablecida!
              </h1>
              <p className="text-sm text-muted-foreground/80 mb-6">
                {state.message ||
                  "Tu contraseña ha sido restablecida exitosamente."}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Ir al inicio de sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const passwordError = confirmPassword.length > 0 && !passwordsMatch;

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      <form
        action={formAction}
        className="relative w-full max-w-sm bg-card/70 backdrop-blur-2xl overflow-hidden rounded-3xl border-2 border-border/40 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in slide-up"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/20 dark:from-white/5 dark:via-transparent dark:to-white/5"></div>
        <input type="hidden" name="token" value={token} />
        <div className="relative bg-card/90 backdrop-blur-sm -m-px rounded-3xl border-2 border-border/30 p-8 sm:p-10 pb-8">
          <div className="text-center animate-in slide-down">
            <Link
              href="/login"
              aria-label="volver al login"
              className="mx-auto block w-fit transition-all duration-300 hover:scale-110 hover:rotate-3 mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <LogoIcon className="relative h-12 w-12 sm:h-16 sm:w-16" />
              </div>
            </Link>
            <h1 className="mb-3 mt-6 text-xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              Restablecer Contraseña
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  name="password"
                  id="password"
                  className="pl-10 pr-10"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="block text-sm">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  id="confirmPassword"
                  className={`pl-10 pr-10 ${passwordError ? "border-destructive" : ""}`}
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-destructive">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button
              className="w-full shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isPending || !passwordsMatch || password.length < 6}
            >
              {isPending ? "Restableciendo..." : "Restablecer Contraseña"}
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Volver al inicio de sesión</Link>
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
