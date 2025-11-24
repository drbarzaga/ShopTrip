"use client";

import { useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
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
}: {
  notification: Notification;
  onClick: () => void;
}) {
  return (
    <div
      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-accent transition-colors ${
        !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
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
  } = useNotifications();

  const handleClick = (notification: Notification) => {
    handleNotificationClick(notification);
    setOpen(false);
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
      <DropdownMenuContent className="w-80 sm:w-96 p-0" align="end">
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
        <div className="max-h-[400px] overflow-y-auto">
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

