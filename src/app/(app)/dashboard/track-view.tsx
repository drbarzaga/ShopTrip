"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export function TrackDashboardView() {
  useEffect(() => {
    analytics.viewDashboard();
  }, []);

  return null;
}

