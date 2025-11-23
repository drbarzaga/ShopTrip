"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotificationsContext } from "@/components/notifications-provider";

export function NotificationPermissionButton() {
  const { requestPermission } = useNotificationsContext();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  if (!("Notification" in window)) {
    return null; // No soportado en este navegador
  }

  if (permission === "granted") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        disabled
        title="Notificaciones activadas"
      >
        <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      onClick={handleRequestPermission}
      disabled={isRequesting}
      title="Activar notificaciones"
    >
      <BellOff className="h-5 w-5" />
    </Button>
  );
}

