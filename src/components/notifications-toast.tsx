"use client";

import { useEffect } from "react";
import { useNotificationsContext } from "@/components/notifications-provider";
import { X, CheckCircle2, Plane, Package, ShoppingCart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationsToast() {
  const { notifications, removeNotification } = useNotificationsContext();

  const getIcon = (type: string) => {
    switch (type) {
      case "trip_created":
      case "trip_updated":
        return <Plane className="h-4 w-4" />;
      case "item_created":
      case "item_updated":
        return <Package className="h-4 w-4" />;
      case "item_purchased":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "trip_created":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "trip_updated":
        return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800";
      case "item_created":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "item_updated":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
      case "item_purchased":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-muted border-border";
    }
  };

  // Auto-remover notificaciones después de 5 segundos
  useEffect(() => {
    notifications.forEach((_, index) => {
      const timer = setTimeout(() => {
        removeNotification(index);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  // Vibración en dispositivos móviles cuando llega una nueva notificación
  useEffect(() => {
    if (notifications.length > 0 && "vibrate" in navigator) {
      // Vibración corta para notificaciones
      navigator.vibrate(200);
    }
  }, [notifications.length]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full sm:w-auto pointer-events-none">
      {notifications.slice(0, 5).map((notification, index) => (
        <div
          key={`${notification.timestamp.getTime()}-${index}`}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border shadow-2xl animate-in slide-in-from-right pointer-events-auto",
            "ring-2 ring-primary/20",
            getColor(notification.type)
          )}
        >
          <div className="mt-0.5 shrink-0 text-primary">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {notification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => removeNotification(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}



