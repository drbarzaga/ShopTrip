"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        // Redirigir a la página de inicio después de eliminar la cuenta
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    });
  };

  const isEmailMatch = confirmEmail === userEmail;

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Eliminar Cuenta
        </CardTitle>
        <CardDescription>
          Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Eliminar Mi Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                ¿Eliminar tu cuenta?
              </DialogTitle>
              <DialogDescription className="pt-2">
                Esta acción eliminará permanentemente:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Tu cuenta y perfil</li>
                  <li>Todos tus viajes personales</li>
                  <li>Todas las organizaciones de las que eres propietario</li>
                  <li>Tus membresías en organizaciones</li>
                  <li>Todas tus invitaciones enviadas</li>
                </ul>
                <p className="mt-3 font-semibold">
                  Esta acción no se puede deshacer.
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm-email">
                  Para confirmar, escribe tu email: <strong>{userEmail}</strong>
                </Label>
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
                  className={confirmEmail && !isEmailMatch ? "border-destructive" : ""}
                />
                {confirmEmail && !isEmailMatch && (
                  <p className="text-sm text-destructive">
                    El email no coincide
                  </p>
                )}
              </div>
              {state && !state.success && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
              {state && state.success && (
                <p className="text-sm text-green-600">
                  Cuenta eliminada exitosamente. Serás redirigido...
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setConfirmEmail("");
                  setState(null);
                }}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending || !isEmailMatch}
              >
                {isPending ? "Eliminando..." : "Eliminar Cuenta Permanentemente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}




