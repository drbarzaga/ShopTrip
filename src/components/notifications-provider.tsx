"use client";

import { createContext, useContext, ReactNode } from "react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { OneSignalRegistration } from "@/components/onesignal-registration";

interface NotificationsContextType {
  notifications: Notification[];
  isConnected: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  clearNotifications: () => void;
  removeNotification: (index: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications();

  return (
    <NotificationsContext.Provider value={notifications}>
      <OneSignalRegistration />
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider"
    );
  }
  return context;
}

