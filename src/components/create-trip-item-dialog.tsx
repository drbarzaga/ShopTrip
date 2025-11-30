"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { analytics } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, FileText } from "lucide-react";
import { createTripItemAction } from "@/actions/trip-items";
import { createItemFromAIPromptAction } from "@/actions/ai/create-item";
import { AIPromptInput } from "@/components/ai-prompt-input";
import type { ActionResult } from "@/types/actions";

interface CreateTripItemDialogProps {
  tripId: string;
  trigger?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
}

export function CreateTripItemDialog({
  tripId,
  trigger,
  className,
  onSuccess,
}: CreateTripItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ id: string }> | null>(null);

  const handleSubmit = async (formData: FormData) => {
    formData.append("tripId", tripId);
    
    startTransition(async () => {
      const result = await createTripItemAction(state, formData);
      setState(result);

      if (result.success && result.data) {
        // Trackear creación de artículo
        analytics.createItem(tripId);
        
        toast.success("Artículo agregado", {
          description: "El artículo ha sido agregado a tu lista.",
        });
        setOpen(false);
        setState(null);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        toast.error("Error al agregar artículo", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  const handleAIPrompt = async (prompt: string) => {
    startTransition(async () => {
      const result = await createItemFromAIPromptAction(prompt, tripId);
      setState(result);

      if (result.success && result.data) {
        // Trackear creación de artículo con IA
        analytics.useAICreateItem();
        analytics.createItem(tripId);
        
        toast.success("Artículo agregado", {
          description: "El artículo ha sido creado con IA y agregado a tu lista.",
        });
        setOpen(false);
        setState(null);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        toast.error("Error al agregar artículo", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            className={`h-8 text-sm ${className || "w-full sm:w-auto"}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Artículo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Artículo</DialogTitle>
          <DialogDescription>
            Agrega un nuevo artículo a tu lista de compras para este viaje.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Con IA
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4">
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
                defaultValue={
                  state && !state.success
                    ? (state.formData?.name as string)
                    : ""
                }
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
                defaultValue={
                  state && !state.success
                    ? (state.formData?.description as string)
                    : ""
                }
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
                  defaultValue={
                    state && !state.success
                      ? (state.formData?.price as string)
                      : ""
                  }
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
                  defaultValue={
                    state && !state.success
                      ? (state.formData?.quantity as string)
                      : "1"
                  }
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
                  {isPending ? "Agregando..." : "Agregar Artículo"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="ai" className="mt-4">
            <div className="space-y-4">
              <AIPromptInput
                onPromptSubmit={handleAIPrompt}
                placeholder="Ej: Protector solar factor 50, resistente al agua, precio 15 dólares, cantidad 2"
                disabled={isPending}
              />
              {state && !state.success && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
              {state && state.success && (
                <p className="text-sm text-green-600">
                  ¡Artículo agregado exitosamente!
                </p>
              )}
              <DialogFooter>
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
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

