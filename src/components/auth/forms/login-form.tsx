"use client";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Mail, Lock } from "lucide-react";

import { getAppName } from "@/lib/utils";
import GoogleButton from "@/components/shared/google-button";
import { startTransition, useActionState, useEffect } from "react";
import { actions } from "@/actions";
import { ActionResult } from "@/types/actions";
import { SignInInput, signInSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { analytics } from "@/lib/analytics";

const INITIAL_STATE: ActionResult<{ email: string; password: string }> = {
  success: false,
  message: "",
  fieldErrors: {},
  formData: {},
};

function LoginForm() {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(
    actions.auth.signInAction,
    INITIAL_STATE
  );

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
    setError,
    clearErrors,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: formState.data?.email ?? "",
      password: "",
    },
  });

  function onSubmit(data: SignInInput) {
    const formData = new FormData();
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
          setError(field as keyof SignInInput, {
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
    if (formState.message) {
      toast[formState.success ? "success" : "error"](formState.message);
    }

    if (formState.success) {
      // Trackear login exitoso
      analytics.login("email");
      router.push("/dashboard");
    }
  }, [formState, router]);

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
            Iniciar Sesión en {getAppName()}
          </h1>
          <p className="text-sm text-muted-foreground/80">
            ¡Bienvenido de nuevo! Inicia sesión para continuar
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Button asChild variant="link" size="sm">
                  <Link
                    href="/forgot-password"
                    className="link intent-info variant-ghost text-sm"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Button>
              </div>
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

          <Button className="w-full">Iniciar sesión</Button>
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
          ¿No tienes una cuenta?
          <Button asChild variant="link" className="px-2">
            <Link href="/register">Crear cuenta</Link>
          </Button>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;
