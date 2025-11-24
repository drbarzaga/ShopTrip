"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Loader2,
  Plane,
  Package,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

function NotificationItem({
  notification,
  onClick,
  onDelete,
}: {
  notification: Notification;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  // Renderizar el icono según el tipo
  const renderIcon = () => {
    switch (notification.type) {
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

  return (
    <div
      className={`group relative p-3 border-b last:border-b-0 hover:bg-accent transition-colors ${
        !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
    >
      <div
        className="flex items-start gap-3 cursor-pointer pr-8"
        onClick={onClick}
      >
        {/* Icono */}
        <div
          className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${
            !notification.read
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {renderIcon()}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
      </div>

      {/* Botón de eliminar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive z-10"
        onClick={onDelete}
        aria-label="Eliminar notificación"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    handleNotificationClick,
    refresh,
  } = useNotifications();

  const handleClick = (notification: Notification) => {
    handleNotificationClick(notification);
    setOpen(false);
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Ajustar posicionamiento en móvil usando CSS y JS como fallback
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Ajustar posicionamiento después de que Radix UI posicione el elemento
        const adjustPosition = () => {
          const wrapper = document.querySelector(
            "[data-radix-popper-content-wrapper]"
          ) as HTMLElement;
          if (wrapper) {
            wrapper.style.left = "0";
            wrapper.style.right = "0";
            wrapper.style.width = "100vw";
            wrapper.style.maxWidth = "100vw";
            wrapper.style.transform = "none";
          }
        };

        // Esperar a que Radix UI monte el elemento
        setTimeout(adjustPosition, 0);
        setTimeout(adjustPosition, 10);
      }
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-screen md:w-80 lg:w-96 p-0 rounded-none md:rounded-md border-x-0 md:border-x border-t-0 md:border-t mt-0 md:mt-1 notifications-dropdown-content max-h-[calc(100vh-80px)] md:max-h-[500px]"
        align="end"
        sideOffset={0}
        side="bottom"
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[calc(100vh-180px)] md:max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No hay notificaciones
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleClick(notification)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver todas las notificaciones
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
