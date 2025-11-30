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
import { Plus } from "lucide-react";
import { createOrganizationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface CreateOrganizationDialogProps {
  trigger?: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateOrganizationDialog({
  trigger,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onValueChange,
  onSuccess,
}: CreateOrganizationDialogProps = {} as CreateOrganizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || onValueChange || setInternalOpen;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ id: string; slug: string }> | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createOrganizationAction(state, formData);
      setState(result);

      if (result.success && result.data) {
        // Trackear creación de organización
        const { analytics } = require("@/lib/analytics");
        analytics.createOrganization();
        
        toast.success("Organización creada", {
          description: "Tu nueva organización ha sido creada exitosamente.",
        });
        setOpen(false);
        setState(null);
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      } else {
        toast.error("Error al crear organización", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && (
        <DialogTrigger asChild>
          <Button size="sm" className={`h-8 text-sm w-full sm:w-auto ${className || ""}`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Organización
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Organización</DialogTitle>
            <DialogDescription>
              Crea una nueva organización para colaborar en viajes con otros.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nombre de la Organización <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="ej: Viajes Familiares"
                required
                disabled={isPending}
                defaultValue={state && !state.success ? (state.formData?.name as string) : ""}
              />
              {state && !state.success && state.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
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
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto h-10">
              {isPending ? "Creando..." : "Crear Organización"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

