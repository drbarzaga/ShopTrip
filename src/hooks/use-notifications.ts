"use client";

import { useEffect, useState, useCallback } from "react";

export interface Notification {
  type: string;
  title: string;
  message: string;
  tripId?: string;
  itemId?: string;
  timestamp: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource("/api/notifications/stream");

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === "connected") {
              console.log("Connected to notifications stream");
              return;
            }

            // Agregar nueva notificación
            const notification: Notification = {
              type: data.type,
              title: data.title,
              message: data.message,
              tripId: data.tripId,
              itemId: data.itemId,
              timestamp: new Date(),
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Mantener solo las últimas 50

            // Mostrar notificación del navegador si está permitido
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(data.title, {
                body: data.message,
                icon: "/icon.svg",
                badge: "/icon.svg",
                tag: data.tripId || data.itemId || "notification",
              });
            }
          } catch (err) {
            console.error("Error parsing notification:", err);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          
          // Reconectar después de 3 segundos
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (err) {
        setError("Error connecting to notifications");
        console.error("Error setting up notifications:", err);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    notifications,
    isConnected,
    error,
    requestPermission,
    clearNotifications,
    removeNotification,
  };
}



