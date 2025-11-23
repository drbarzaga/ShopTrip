"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { updateTripItemAction } from "@/actions/trip-items";
import type { ActionResult } from "@/types/actions";

interface EditTripItemDialogProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    quantity: number | null;
  };
  trigger?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
}

export function EditTripItemDialog({
  item,
  trigger,
  className,
  onSuccess,
}: EditTripItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ id: string }> | null>(null);

  const handleSubmit = async (formData: FormData) => {
    formData.append("itemId", item.id);
    
    startTransition(async () => {
      const result = await updateTripItemAction(state, formData);
      setState(result);

      if (result.success && result.data) {
        setOpen(false);
        setState(null);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className={`h-10 text-sm ${className || "w-full sm:w-auto"}`}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar Artículo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Artículo</DialogTitle>
          <DialogDescription>
            Modifica los detalles del artículo.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nombre del Artículo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="ej: Protector solar"
                required
                disabled={isPending}
                defaultValue={item.name}
              />
              {state && !state.success && state.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="ej: Factor 50, resistente al agua"
                disabled={isPending}
                rows={3}
                defaultValue={item.description || ""}
              />
              {state && !state.success && state.fieldErrors?.description && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.description[0]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  disabled={isPending}
                  defaultValue={item.price?.toString() || ""}
                />
                {state && !state.success && state.fieldErrors?.price && (
                  <p className="text-sm text-destructive">
                    {state.fieldErrors.price[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  disabled={isPending}
                  defaultValue={item.quantity?.toString() || "1"}
                />
                {state && !state.success && state.fieldErrors?.quantity && (
                  <p className="text-sm text-destructive">
                    {state.fieldErrors.quantity[0]}
                  </p>
                )}
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

