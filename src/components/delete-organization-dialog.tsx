"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
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
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteOrganizationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface DeleteOrganizationDialogProps {
  organizationId: string;
  organizationName: string;
  trigger?: React.ReactNode;
}

export function DeleteOrganizationDialog({
  organizationId,
  organizationName,
  trigger,
}: DeleteOrganizationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrganizationAction(organizationId);
      setState(result);

      if (result.success) {
        toast.success("Organización eliminada", {
          description: `"${organizationName}" ha sido eliminada permanentemente.`,
        });
        setOpen(false);
        router.refresh();
        setState(null);
      } else {
        toast.error("Error al eliminar organización", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Organización
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Organización
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar <strong>{organizationName}</strong>? Esta acción
            no se puede deshacer. Todos los miembros, invitaciones y viajes asociados con esta
            organización serán eliminados.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {state && !state.success && (
            <p className="text-sm text-destructive mb-4">{state.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              setState(null);
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Eliminar Organización"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


