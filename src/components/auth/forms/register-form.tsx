"use client";

import React from "react";
import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getAppName } from "@/lib/utils";
import GoogleButton from "@/components/shared/google-button";

function RegisterForm() {
  return (
    <form
      action=""
      className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
    >
      <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
        <div className="text-center animate-in slide-down">
          <Link
            href="/"
            aria-label="go home"
            className="mx-auto block w-fit transition-all duration-300 hover:scale-110 hover:rotate-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <LogoIcon className="relative h-12 w-12 sm:h-16 sm:w-16" />
            </div>
          </Link>
          <h1 className="mb-3 mt-6 text-xl font-bold bg-linear-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            Crear cuenta en {getAppName()}
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Crea tu cuenta para comenzar
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="block text-sm">
                Nombre
              </Label>
              <Input type="text" required name="firstname" id="firstname" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="block text-sm">
              Correo Electrónico
            </Label>
            <Input type="email" required name="email" id="email" />
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
                  ¿Olvidaste tu contraseña?
                </Link>
              </Button>
            </div>
            <Input
              type="password"
              required
              name="pwd"
              id="pwd"
              className="input sz-md variant-mixed"
            />
          </div>

          <Button className="w-full">Crear cuenta</Button>
        </div>

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed" />
          <span className="text-muted-foreground text-xs">O continúa con</span>
          <hr className="border-dashed" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <GoogleButton />
        </div>
      </div>

      <div className="p-3">
        <p className="text-accent-foreground text-center text-sm">
          ¿Ya tienes una cuenta?
          <Button asChild variant="link" className="px-2">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </p>
      </div>
    </form>
  );
}

export default RegisterForm;
