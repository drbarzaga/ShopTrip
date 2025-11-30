"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, trackPageView } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    // Inicializar GA solo si tenemos el measurement ID
    if (measurementId) {
      initGA(measurementId);
    }
  }, [measurementId]);

  useEffect(() => {
    // Trackear cambios de página
    if (measurementId && pathname) {
      trackPageView(pathname);
    }
  }, [pathname, measurementId]);

  return null;
}

