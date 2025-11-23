"use client";

import GoogleButton from "@/components/shared/google-button";
import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppName } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signUpAction } from "@/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  useEffect(() => {
    if (state?.success) {
      const finalRedirect = state.data?.redirectTo || redirectTo || "/dashboard";
      router.push(finalRedirect);
    }
  }, [state, redirectTo, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
      <form
        action={formAction}
        className="w-full max-w-sm bg-muted overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-6 sm:p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Crear cuenta en {getAppName()}
            </h1>
            <p className="text-sm">Crea tu cuenta para comenzar</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-sm">
                Nombre
              </Label>
              <Input
                type="text"
                required
                name="name"
                id="name"
                defaultValue={state?.formData?.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Correo Electrónico
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                defaultValue={state?.formData?.email}
              />
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="pwd" className="text-sm">
                Contraseña
              </Label>
              <Input
                type="password"
                required
                name="password"
                id="pwd"
                className="input sz-md variant-mixed"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
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
            ¿Ya tienes una cuenta?
            <Button asChild variant="link" className="px-2">
              <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}>
                Iniciar sesión
              </Link>
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
}

