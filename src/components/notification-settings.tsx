"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Loader2,
  Plane,
  Package,
  UserPlus,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { updateNotificationPreferencesAction } from "@/actions/notification-preferences";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  tripCreated: boolean;
  tripUpdated: boolean;
  tripDeleted: boolean;
  itemCreated: boolean;
  itemUpdated: boolean;
  itemDeleted: boolean;
  itemPurchased: boolean;
  invitationReceived: boolean;
  invitationAccepted: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
}

interface NotificationSettingsProps {
  initialPreferences: NotificationPreferences;
}

interface NotificationItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

function NotificationItem({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  icon,
}: NotificationItemProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200",
        checked
          ? "bg-primary/5 border-primary/30 dark:bg-primary/10 dark:border-primary/40 shadow-sm"
          : "bg-card/50 border-border/50 hover:bg-card hover:border-border",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "shrink-0 p-2 rounded-md transition-all duration-200",
          checked
            ? "bg-primary/15 text-primary shadow-sm"
            : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
        )}
      >
        {icon || <Bell className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-sm font-medium mb-0.5",
                checked ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </label>
  );
}

export function NotificationSettings({
  initialPreferences,
}: NotificationSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(newPrefs) !== JSON.stringify(initialPreferences));
      return newPrefs;
    });
  };

  const handleDaysChange = (days: number) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, reminderDaysBefore: days };
      setHasChanges(JSON.stringify(newPrefs) !== JSON.stringify(initialPreferences));
      return newPrefs;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateNotificationPreferencesAction(preferences);
      if (result.success) {
        setHasChanges(false);
        router.refresh();
      } else {
        console.error(result.message || "Error al actualizar preferencias");
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold">Notificaciones</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          Controla qué notificaciones recibes y cuándo
        </p>
      </div>

      <div className="space-y-6">
        {/* Viajes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
              <Plane className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Viajes</h4>
          </div>
          <div className="space-y-2 ml-7">
            <NotificationItem
              id="tripCreated"
              label="Nuevo viaje creado"
              description="Cuando alguien crea un nuevo viaje"
              checked={preferences.tripCreated}
              onCheckedChange={(checked) => handleToggle("tripCreated", checked)}
              disabled={isPending}
              icon={<Plus className="h-4 w-4" />}
            />
            <NotificationItem
              id="tripUpdated"
              label="Viaje actualizado"
              description="Cuando se modifica un viaje existente"
              checked={preferences.tripUpdated}
              onCheckedChange={(checked) => handleToggle("tripUpdated", checked)}
              disabled={isPending}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <NotificationItem
              id="tripDeleted"
              label="Viaje eliminado"
              description="Cuando se elimina un viaje"
              checked={preferences.tripDeleted}
              onCheckedChange={(checked) => handleToggle("tripDeleted", checked)}
              disabled={isPending}
              icon={<XCircle className="h-4 w-4" />}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Artículos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-md bg-green-500/10 dark:bg-green-500/20">
              <Package className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Artículos</h4>
          </div>
          <div className="space-y-2 ml-7">
            <NotificationItem
              id="itemCreated"
              label="Nuevo artículo agregado"
              description="Cuando se agrega un artículo a un viaje"
              checked={preferences.itemCreated}
              onCheckedChange={(checked) => handleToggle("itemCreated", checked)}
              disabled={isPending}
              icon={<Plus className="h-4 w-4" />}
            />
            <NotificationItem
              id="itemUpdated"
              label="Artículo actualizado"
              description="Cuando se modifica un artículo"
              checked={preferences.itemUpdated}
              onCheckedChange={(checked) => handleToggle("itemUpdated", checked)}
              disabled={isPending}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <NotificationItem
              id="itemDeleted"
              label="Artículo eliminado"
              description="Cuando se elimina un artículo"
              checked={preferences.itemDeleted}
              onCheckedChange={(checked) => handleToggle("itemDeleted", checked)}
              disabled={isPending}
              icon={<XCircle className="h-4 w-4" />}
            />
            <NotificationItem
              id="itemPurchased"
              label="Artículo comprado"
              description="Cuando alguien marca un artículo como comprado"
              checked={preferences.itemPurchased}
              onCheckedChange={(checked) => handleToggle("itemPurchased", checked)}
              disabled={isPending}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Invitaciones */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-md bg-purple-500/10 dark:bg-purple-500/20">
              <UserPlus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Invitaciones</h4>
          </div>
          <div className="space-y-2 ml-7">
            <NotificationItem
              id="invitationReceived"
              label="Invitación recibida"
              description="Cuando recibes una invitación a una organización"
              checked={preferences.invitationReceived}
              onCheckedChange={(checked) => handleToggle("invitationReceived", checked)}
              disabled={isPending}
              icon={<Bell className="h-4 w-4" />}
            />
            <NotificationItem
              id="invitationAccepted"
              label="Invitación aceptada"
              description="Cuando alguien acepta tu invitación"
              checked={preferences.invitationAccepted}
              onCheckedChange={(checked) => handleToggle("invitationAccepted", checked)}
              disabled={isPending}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Recordatorios - Temporalmente oculto
        <Separator className="my-6" />

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-md bg-orange-500/10 dark:bg-orange-500/20">
              <Clock className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Recordatorios</h4>
          </div>
          <div className="ml-7">
            <div className="p-4 rounded-lg border border-muted/50 bg-muted/30 dark:bg-muted/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-md bg-muted/50 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <Label className="text-sm font-medium text-muted-foreground block">
                      Recordatorios de viajes
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Temporalmente desactivado. Los recordatorios requieren procesamiento frecuente 
                      que no está disponible en el plan actual de Vercel (solo permite 1 cron job por día).
                    </p>
                  </div>
                  <div className="mt-3 p-3 rounded-md bg-background/50 border border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Nota:</strong> Esta funcionalidad estará disponible 
                      cuando se migre a un plan que permita múltiples cron jobs o se implemente un servicio externo.
                    </p>
                  </div>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={false}
                  disabled={true}
                  className="shrink-0 mt-1"
                />
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Botón Guardar */}
        {hasChanges && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full sm:w-auto min-w-[140px]"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
