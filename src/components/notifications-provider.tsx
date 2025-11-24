"use client";

import { ReactNode } from "react";
import { OneSignalRegistration } from "@/components/onesignal-registration";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <OneSignalRegistration />
      {children}
    </>
  );
}
