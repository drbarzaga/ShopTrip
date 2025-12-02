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
import { Plus, Sparkles, FileText } from "lucide-react";
import { createTripAction } from "@/actions/trips";
import { createTripFromAIPromptAction } from "@/actions/ai/create-trip";
import { AIPromptInput } from "@/components/ai-prompt-input";
import type { ActionResult } from "@/types/actions";

interface CreateTripDialogProps {
  trigger?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export function CreateTripDialog({
  trigger,
  className,
  onSuccess,
  redirectOnSuccess = true,
}: CreateTripDialogProps = {} as CreateTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{
    id: string;
    slug: string;
  }> | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Usar wrapper offline que detecta automáticamente si estamos offline
      const { createTripOfflineWrapper } = await import("@/lib/offline/wrappers");
      const result = await createTripOfflineWrapper(state, formData);
      setState(result);

      if (result.success && result.data) {
        // Trackear creación de viaje
        const formDataObj = Object.fromEntries(formData.entries());
        analytics.createTrip(formDataObj.name as string);
        
        const isOffline = result.message?.includes("offline") || false;
        toast.success("Viaje creado exitosamente", {
          description: isOffline
            ? "Guardado offline. Se sincronizará cuando recuperes la conexión."
            : "Tu nuevo viaje ha sido agregado.",
        });
        setOpen(false);
        setState(null);
        
        if (onSuccess) {
          onSuccess();
        } else if (redirectOnSuccess && !isOffline) {
          // Solo redirigir si está online (los datos offline se mostrarán en la lista)
          router.push(`/trips/${result.data.slug}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error("Error al crear viaje", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  const handleAIPrompt = async (prompt: string) => {
    startTransition(async () => {
      const result = await createTripFromAIPromptAction(prompt);
      setState(result);

      if (result.success && result.data) {
        // Trackear creación de viaje con IA
        analytics.useAICreateTrip();
        analytics.createTrip();
        
        toast.success("Viaje creado exitosamente", {
          description: "Tu nuevo viaje ha sido creado con IA.",
        });
        setOpen(false);
        setState(null);
        
        if (onSuccess) {
          onSuccess();
        } else if (redirectOnSuccess) {
          router.push(`/trips/${result.data.slug}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error("Error al crear viaje", {
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
            Nuevo Viaje
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Agrega un nuevo viaje para organizar tu lista de compras.
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
                Nombre del Viaje <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="ej: Vacaciones de Verano"
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
              <Label htmlFor="destination">Destino</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="ej: París, Francia"
                disabled={isPending}
                defaultValue={
                  state && !state.success
                    ? (state.formData?.destination as string)
                    : ""
                }
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
                  defaultValue={
                    state && !state.success
                      ? (state.formData?.startDate as string)
                      : ""
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  disabled={isPending}
                  defaultValue={
                    state && !state.success
                      ? (state.formData?.endDate as string)
                      : ""
                  }
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
                  {isPending ? "Creando..." : "Crear Viaje"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="ai" className="mt-4">
            <div className="space-y-4">
              <AIPromptInput
                onPromptSubmit={handleAIPrompt}
                placeholder="Ej: Crear un viaje a París del 15 al 20 de marzo de 2024"
                disabled={isPending}
              />
              {state && !state.success && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
              {state && state.success && (
                <p className="text-sm text-green-600">
                  ¡Viaje creado exitosamente!
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
