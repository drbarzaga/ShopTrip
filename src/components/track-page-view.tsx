"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/lib/analytics";

interface TrackPageViewProps {
  pageName: string;
  eventName?: string;
}

export function TrackPageView({ pageName, eventName }: TrackPageViewProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (eventName) {
      analytics.trackEvent(eventName, { page_name: pageName, path: pathname });
    }
  }, [pageName, eventName, pathname]);

  return null;
}

