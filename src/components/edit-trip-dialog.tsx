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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updateTripAction } from "@/actions/trips";
import type { ActionResult } from "@/types/actions";

interface EditTripDialogProps {
  trip: {
    id: string;
    name: string;
    destination: string | null;
    startDate: Date | null;
    endDate: Date | null;
  };
  trigger?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
}

export function EditTripDialog({
  trip,
  trigger,
  className,
  onSuccess,
}: EditTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ slug: string }> | null>(null);

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (formData: FormData) => {
    formData.append("tripId", trip.id);
    
    startTransition(async () => {
      const result = await updateTripAction(state, formData);
      setState(result);

      if (result.success && result.data) {
        toast.success("Viaje actualizado", {
          description: "Los cambios han sido guardados correctamente.",
        });
        setOpen(false);
        setState(null);
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        toast.error("Error al actualizar viaje", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Resetear el estado cuando se cierra el diálogo
      setState(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 ${className || ""}`}
          >
            <Pencil className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Viaje</DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu viaje.
          </DialogDescription>
        </DialogHeader>
        <form key={open ? "open" : "closed"} action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nombre del Viaje <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="ej: Vacaciones de Verano"
                required
                disabled={isPending}
                defaultValue={trip.name}
              />
              {state && !state.success && state.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destination">Destino</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="ej: París, Francia"
                disabled={isPending}
                defaultValue={trip.destination || ""}
              />
              {state && !state.success && state.fieldErrors?.destination && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.destination[0]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  disabled={isPending}
                  defaultValue={formatDateForInput(trip.startDate)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  disabled={isPending}
                  defaultValue={formatDateForInput(trip.endDate)}
                />
              </div>
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
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

