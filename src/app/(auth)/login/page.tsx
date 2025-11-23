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
import { useEffect } from "react";
import type { ActionResult } from "@/types/actions";

export default function LoginPage() {
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
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
      <form
        action={formAction}
        className="w-full max-w-sm bg-muted overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-6 sm:p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Iniciar Sesión en {getAppName()}
            </h1>
            <p className="text-sm">
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
                    href="#"
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

            <Button className="w-full" type="submit" disabled={isPending}>
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
