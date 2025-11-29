"use client";

import { ReactNode } from "react";
import { OneSignalRegistration } from "@/components/onesignal-registration";
import { AppBadgeUpdater } from "@/components/app-badge-updater";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <OneSignalRegistration />
      <AppBadgeUpdater />
      {children}
    </>
  );
}
