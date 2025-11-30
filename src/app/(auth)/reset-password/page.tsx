"use client";

import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  Suspense,
} from "react";
import { ActionResult } from "@/types/actions";
import { ResetPasswordInput, resetPasswordSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { resetPasswordAction } from "@/actions/auth";

const INITIAL_STATE: ActionResult<void> = {
  success: false,
  message: "",
  fieldErrors: {},
  formData: {},
};

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [formState, formAction, isPending] = useActionState(
    resetPasswordAction,
    INITIAL_STATE
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
    setError,
    clearErrors,
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token || "",
    },
  });

  function onSubmit(data: ResetPasswordInput) {
    const formData = new FormData();
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    formData.append("token", data.token);
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
          setError(field as keyof ResetPasswordInput, {
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

  // Si no hay token o hay error en la URL, mostrar error
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

  // Mostrar pantalla de confirmación si el restablecimiento fue exitoso
  if (formState.success) {
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
                {formState.message ||
                  "Tu contraseña ha sido restablecida exitosamente."}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Ya puedes iniciar sesión con tu nueva contraseña.
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-sm bg-card/70 backdrop-blur-2xl overflow-hidden rounded-3xl border-2 border-border/40 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in slide-up"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/20 dark:from-white/5 dark:via-transparent dark:to-white/5"></div>
        <input type="hidden" {...register("token")} value={token || ""} />
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
            <Field>
              <FieldLabel htmlFor="password">Nueva Contraseña</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  id="password"
                  disabled={isPending}
                  {...register("password")}
                  aria-invalid={!!clientErrors.password}
                  className="pl-10 pr-10"
                  minLength={6}
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
              <FieldError>
                {clientErrors.password?.message ||
                  (!formState.success &&
                    formState.fieldErrors?.password?.[0]?.toString())}
              </FieldError>
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 6 caracteres
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirmar Contraseña
              </FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  id="confirmPassword"
                  disabled={isPending}
                  {...register("confirmPassword")}
                  aria-invalid={!!clientErrors.confirmPassword}
                  className="pl-10 pr-10"
                  minLength={6}
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
              <FieldError>
                {clientErrors.confirmPassword?.message ||
                  (!formState.success &&
                    formState.fieldErrors?.confirmPassword?.[0]?.toString())}
              </FieldError>
            </Field>

            <Button
              className="w-full shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isPending}
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

function ResetPasswordForm() {
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
      <ResetPasswordFormContent />
    </Suspense>
  );
}

export default ResetPasswordForm;
