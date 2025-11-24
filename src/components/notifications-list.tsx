"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  CheckCheck, 
  Loader2, 
  Bell, 
  Plane, 
  Package, 
  ShoppingCart,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Notification, useNotifications } from "@/hooks/use-notifications";

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { refresh } = useNotifications();
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            )
          );
          refresh();
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });

        if (response.ok) {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          refresh();
        }
      } catch (error) {
        console.error("Error marking all as read:", error);
      }
    });
  };

  const handleDelete = async (notificationId: string) => {
    startTransition(async () => {
      try {
        const notification = notifications.find((n) => n.id === notificationId);
        const response = await fetch(`/api/notifications?id=${notificationId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Actualizar estado local inmediatamente
          setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
          // Refrescar para sincronizar con el servidor
          refresh();
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    });
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.tripId) {
      try {
        const response = await fetch(`/api/trips/${notification.tripId}/slug`);
        if (response.ok) {
          const data = await response.json();
          if (data.slug) {
            router.push(`/trips/${data.slug}`);
            return;
          }
        }
      } catch (error) {
        console.error("Error getting trip slug:", error);
      }
      router.push("/trips");
    } else {
      router.push("/dashboard");
    }
  };

  // Renderizar el icono según el tipo
  const renderIcon = (type: string) => {
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
        return <Bell className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <Card className="border">
        <CardContent className="p-8 sm:p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No hay notificaciones</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`group relative cursor-pointer transition-all hover:shadow-lg border-2 ${
              !notification.read
                ? "border-blue-300/60 bg-blue-50/50 dark:border-blue-700/60 dark:bg-blue-950/30 shadow-sm"
                : "border-border/50 hover:border-border"
            }`}
            onClick={() => handleClick(notification)}
          >
            <CardContent className="p-5 pr-16">
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div
                  className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                    !notification.read
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {renderIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className={`font-semibold text-base ${
                        !notification.read ? "text-foreground" : "text-foreground/90"
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs shrink-0">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Botones de acción - Siempre visibles */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 opacity-70 hover:opacity-100 transition-all hover:bg-green-100 dark:hover:bg-green-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                  disabled={isPending}
                  aria-label="Marcar como leída"
                  title="Marcar como leída"
                >
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 opacity-70 hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
                disabled={isPending}
                aria-label="Eliminar notificación"
                title="Eliminar notificación"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

