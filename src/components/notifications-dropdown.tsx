"use client";

import { useState } from "react";
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
        return <Plane className="h-5 w-5" />;
      case "item_created":
      case "item_updated":
        return <Package className="h-5 w-5" />;
      case "item_purchased":
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`group relative p-4 border-b last:border-b-0 hover:bg-accent/50 transition-all ${
        !notification.read 
          ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30" 
          : "bg-background"
      }`}
    >
      <div
        className="flex items-start gap-3 cursor-pointer pr-12"
        onClick={onClick}
      >
        {/* Icono */}
        <div
          className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            !notification.read
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {renderIcon()}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h4 className={`text-sm font-semibold truncate ${
                !notification.read ? "text-foreground" : "text-foreground/90"
              }`}>
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 animate-pulse" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
      </div>

      {/* Botón de eliminar - Siempre visible */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-8 w-8 opacity-70 hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
        onClick={onDelete}
        aria-label="Eliminar notificación"
      >
        <Trash2 className="h-4 w-4" />
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
    deleteNotification,
  } = useNotifications();

  const handleClick = (notification: Notification) => {
    handleNotificationClick(notification);
    setOpen(false);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };


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
        className="w-screen md:w-80 lg:w-96 p-0 rounded-none md:rounded-md border-x-0 md:border-x border-t-0 md:border-t mt-0 md:mt-1 notifications-dropdown-content max-h-[calc(100vh-100px)] md:max-h-[500px]"
        align="end"
        sideOffset={4}
        side="bottom"
      >
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">Notificaciones</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {unreadCount} nueva{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Marcar todas
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
            <Link href="/notifications" onClick={() => setOpen(false)}>
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
