"use client";

import React from "react";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function ForgotPasswordForm() {
  return (
    <form
      action=""
      className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
    >
      <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
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
          <h1 className="mb-3 mt-6 text-xl font-bold bg-linear-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña
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
              placeholder="name@example.com"
            />
          </div>

          <Button className="w-full">Enviar enlace de recuperación</Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
      </div>

      <div className="p-3">
        <p className="text-accent-foreground text-center text-sm">
          ¿Recordaste tu contraseña?
          <Button asChild variant="link" className="px-2">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </p>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
