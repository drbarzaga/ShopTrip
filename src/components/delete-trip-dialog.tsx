"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTripAction } from "@/actions/trips";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteTripDialogProps {
  tripId: string;
  tripName: string;
  trigger?: React.ReactNode;
}

export function DeleteTripDialog({
  tripId,
  tripName,
  trigger,
}: DeleteTripDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteTripAction(tripId);
      if (result.success) {
        toast.success("Viaje eliminado", {
          description: `El viaje "${tripName}" ha sido eliminado permanentemente.`,
        });
        setDeleteDialogOpen(false);
        // Redirigir a la lista de viajes después de eliminar
        router.push("/trips");
      } else {
        toast.error("Error al eliminar viaje", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
        setIsDeleting(false);
      }
    });
  };

  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 px-2 sm:px-3"
            aria-label="Eliminar viaje"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Eliminar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>¿Eliminar viaje?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El viaje &quot;{tripName}&quot; y
            todos sus artículos serán eliminados permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

