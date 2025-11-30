"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { inviteMemberAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface InviteMemberDialogProps {
  organizationId: string;
  organizationName: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function InviteMemberDialog({
  organizationId,
  organizationName,
  trigger,
  className,
}: InviteMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult<void> | null>(null);
  const [role, setRole] = useState<"owner" | "admin" | "member">("member");

  const handleSubmit = async (formData: FormData) => {
    formData.append("organizationId", organizationId);
    formData.append("role", role);

    startTransition(async () => {
      const result = await inviteMemberAction(state, formData);
      setState(result);

      if (result.success) {
        const email = formData.get("email") as string;
        toast.success("Invitación enviada", {
          description: `Se ha enviado una invitación a ${email}.`,
        });
        setOpen(false);
        setState(null);
        setRole("member");
        router.refresh();
      } else {
        toast.error("Error al enviar invitación", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className={`w-full sm:w-auto ${className || ""}`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar Miembro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invitar Miembro</DialogTitle>
            <DialogDescription>
              Invita a alguien a unirse a {organizationName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                Dirección de Correo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                required
                disabled={isPending}
                defaultValue={
                  state && !state.success
                    ? (state.formData?.email as string)
                    : ""
                }
              />
              {state && !state.success && state.fieldErrors?.email && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={role}
                onValueChange={(value: "owner" | "admin" | "member") =>
                  setRole(value)
                }
                disabled={isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Miembro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Propietario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setState(null);
                setRole("member");
              }}
              disabled={isPending}
              className="w-full sm:w-auto h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto h-10"
            >
              {isPending ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
