"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, Loader2, Bell } from "lucide-react";
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

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.tripId) {
      router.push("/trips");
    } else {
      router.push("/dashboard");
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

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              !notification.read
                ? "border-blue-300/50 bg-blue-50/30 dark:border-blue-700/50 dark:bg-blue-950/20"
                : ""
            }`}
            onClick={() => handleClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{notification.title}</h3>
                    {!notification.read && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    disabled={isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

