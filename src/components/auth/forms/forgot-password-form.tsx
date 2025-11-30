"use client";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Mail, CheckCircle2 } from "lucide-react";

import { startTransition, useActionState, useEffect } from "react";
import { actions } from "@/actions";
import { ActionResult } from "@/types/actions";
import { ForgotPasswordInput, forgotPasswordSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";

const INITIAL_STATE: ActionResult<void> = {
  success: false,
  message: "",
  fieldErrors: {},
  formData: {},
};

function ForgotPasswordForm() {
  const [formState, formAction, isPending] = useActionState(
    actions.auth.forgotPasswordAction,
    INITIAL_STATE
  );

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email:
        ((!formState.success &&
          "formData" in formState &&
          formState.formData?.email) as string) ?? "",
    },
  });

  function onSubmit(data: ForgotPasswordInput) {
    const formData = new FormData();
    formData.append("email", data.email);
    startTransition(() => {
      formAction(formData);
    });
  }

  useEffect(() => {
    if (formState.success) {
      clearErrors();
      return;
    }

    const fieldErrors = formState.fieldErrors;
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (messages?.[0]) {
          setError(field as keyof ForgotPasswordInput, {
            type: "server",
            message: messages[0].toString(),
          });
        }
      });
    } else {
      clearErrors();
    }
  }, [formState.success, formState, setError, clearErrors]);

  useEffect(() => {
    if (formState.message && !formState.success) {
      toast.error(formState.message);
    }
  }, [formState]);

  // Mostrar pantalla de confirmación si el envío fue exitoso
  if (formState.success) {
    return (
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center animate-in slide-down">
            <div className="mx-auto mb-6 w-fit transition-all duration-300 hover:scale-110 hover:rotate-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <LogoIcon className="relative h-12 w-12 sm:h-16 sm:w-16" />
              </div>
            </div>

            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="mb-3 text-xl font-bold bg-linear-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              ¡Enlace enviado!
            </h1>

            <p className="text-sm text-muted-foreground/80 mb-6">
              {formState.message ||
                "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."}
            </p>

            <p className="text-sm text-muted-foreground/80 mb-6">
              Revisa tu bandeja de entrada y sigue las instrucciones para
              restablecer tu contraseña.
            </p>

            <Button asChild className="w-full">
              <Link href="/login">Volver al inicio de sesión</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
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
          <Field>
            <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                required
                id="email"
                disabled={isPending}
                {...register("email")}
                aria-invalid={!!clientErrors.email}
                className="pl-10"
                placeholder="name@example.com"
              />
            </div>
            <FieldError>
              {clientErrors.email?.message ||
                (!formState.success &&
                  formState.fieldErrors?.email?.[0]?.toString())}
            </FieldError>
          </Field>

          <Button className="w-full" disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
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
