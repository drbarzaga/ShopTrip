"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/actions/settings/delete-account";
import type { ActionResult } from "@/types/actions";

interface DeleteAccountSectionProps {
  userEmail: string;
}

export function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleDelete = () => {
    if (confirmEmail !== userEmail) {
      setState({
        success: false,
        message: "El email no coincide",
      });
      return;
    }

    startTransition(async () => {
      const result = await deleteAccountAction();
      setState(result);
      if (result.success) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    });
  };

  const isEmailMatch = confirmEmail === userEmail;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-6">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-destructive/20 dark:bg-destructive/30 shrink-0">
          <Trash2 className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-destructive mb-1">
            Eliminar Cuenta
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Eliminar Mi Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader className="space-y-4 pb-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-destructive/10 dark:bg-destructive/20">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2 text-center">
                  <DialogTitle className="text-xl font-semibold">
                    Eliminar cuenta permanentemente
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Esta es una acción irreversible. Por favor, confirma que deseas continuar.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Información de lo que se eliminará */}
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Se eliminará permanentemente:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Tu cuenta y perfil de usuario</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Todos tus viajes personales y sus elementos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Todas las organizaciones de las que eres propietario</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Tus membresías en organizaciones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Todas tus invitaciones enviadas</span>
                    </li>
                  </ul>
                </div>

                {/* Campo de confirmación de email */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="confirm-email" className="text-sm font-medium">
                      Confirma tu email para continuar
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Escribe <span className="font-mono font-medium text-foreground">{userEmail}</span> para confirmar
                    </p>
                  </div>
                  <Input
                    id="confirm-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={confirmEmail}
                    onChange={(e) => {
                      setConfirmEmail(e.target.value);
                      setState(null);
                    }}
                    disabled={isPending}
                    className={`transition-colors ${
                      confirmEmail && !isEmailMatch
                        ? "border-destructive focus-visible:ring-destructive"
                        : confirmEmail && isEmailMatch
                        ? "border-green-500 focus-visible:ring-green-500"
                        : ""
                    }`}
                  />
                  {confirmEmail && !isEmailMatch && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>El email no coincide con tu cuenta</span>
                    </div>
                  )}
                  {confirmEmail && isEmailMatch && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Email confirmado correctamente</span>
                    </div>
                  )}
                </div>

                {/* Mensajes de estado */}
                {state && !state.success && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 dark:bg-destructive/20 p-3">
                    <p className="text-sm text-destructive font-medium">{state.message}</p>
                  </div>
                )}
                {state && state.success && (
                  <div className="rounded-lg border border-green-500/50 bg-green-500/10 dark:bg-green-500/20 p-3">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Cuenta eliminada exitosamente. Serás redirigido...
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setConfirmEmail("");
                    setState(null);
                  }}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending || !isEmailMatch}
                  className="w-full sm:w-auto"
                >
                  {isPending ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar cuenta permanentemente
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
