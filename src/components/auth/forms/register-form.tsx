"use client";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react";

import { getAppName } from "@/lib/utils";
import GoogleButton from "@/components/shared/google-button";
import { startTransition, useActionState, useEffect } from "react";
import { actions } from "@/actions";
import { ActionResult } from "@/types/actions";
import { SignUpInput, signUpSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { analytics } from "@/lib/analytics";

const INITIAL_STATE: ActionResult<{ redirectTo?: string }> = {
  success: false,
  message: "",
  fieldErrors: {},
  formData: {},
};

function RegisterForm() {
  const [formState, formAction, isPending] = useActionState(
    actions.auth.signUpAction,
    INITIAL_STATE
  );

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
    setError,
    clearErrors,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      name:
        ((!formState.success &&
          "formData" in formState &&
          formState.formData?.name) as string) ?? "",
      email:
        ((!formState.success &&
          "formData" in formState &&
          formState.formData?.email) as string) ?? "",
      password: "",
    },
  });

  function onSubmit(data: SignUpInput) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
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
          setError(field as keyof SignUpInput, {
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

  useEffect(() => {
    // Trackear registro exitoso
    if (formState.success) {
      analytics.signUp("email");
    }
  }, [formState.success]);

  // Mostrar pantalla de confirmación si el registro fue exitoso
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
              ¡Cuenta creada exitosamente!
            </h1>

            <p className="text-sm text-muted-foreground/80 mb-6">
              {formState.message || "Tu cuenta ha sido creada exitosamente."}
            </p>

            <p className="text-sm text-muted-foreground/80 mb-6">
              Revisa tu correo electrónico para activar tu cuenta y comenzar a
              usar {getAppName()}.
            </p>

            <Button asChild className="w-full">
              <Link href="/login">Ir al inicio de sesión</Link>
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
          <div className="space-y-2">
            <Field>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  id="name"
                  disabled={isPending}
                  {...register("name")}
                  aria-invalid={!!clientErrors.name}
                  className="pl-10"
                />
              </div>
              <FieldError>
                {clientErrors.name?.message ||
                  (!formState.success &&
                    formState.fieldErrors?.name?.[0]?.toString())}
              </FieldError>
            </Field>
          </div>

          <div className="space-y-2">
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
                />
              </div>
              <FieldError>
                {clientErrors.email?.message ||
                  (!formState.success &&
                    formState.fieldErrors?.email?.[0]?.toString())}
              </FieldError>
            </Field>
          </div>

          <div className="space-y-0.5">
            <Field>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  id="password"
                  disabled={isPending}
                  {...register("password")}
                  aria-invalid={!!clientErrors.password}
                  className="pl-10"
                />
              </div>
              <FieldError>
                {clientErrors.password?.message ||
                  (!formState.success &&
                    formState.fieldErrors?.password?.[0]?.toString())}
              </FieldError>
            </Field>
          </div>

          <Button className="w-full" disabled={isPending}>
            {isPending ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
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
