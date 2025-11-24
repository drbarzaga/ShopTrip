"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  tripId: string | null;
  itemId: string | null;
  read: boolean;
  createdAt: Date;
}

export function useNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
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
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Marcar como leída
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Navegar según el tipo de notificación
      // Si hay tripId, intentar obtener el slug del viaje
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
        // Fallback: redirigir a la lista de viajes
        router.push("/trips");
      } else {
        router.push("/dashboard");
      }
    },
    [markAsRead, router]
  );

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Refrescar cada 30 segundos
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    // Escuchar mensajes del Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "NOTIFICATION_CLICK") {
          // Refrescar notificaciones cuando se hace click desde una notificación push
          fetchNotifications();
          fetchUnreadCount();
        }
      });
    }

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar estado local inmediatamente
        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId);
          // Actualizar contador si la notificación no estaba leída
          if (notification && !notification.read) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev.filter((n) => n.id !== notificationId);
        });
        // Refrescar para asegurar sincronización
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    deleteNotification,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
}

