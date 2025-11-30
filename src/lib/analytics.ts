"use client";

/**
 * Google Analytics 4 helper functions
 * Solo se ejecuta en el cliente
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Inicializa Google Analytics
 */
export function initGA(measurementId: string) {
  if (typeof window === "undefined" || !measurementId) {
    return;
  }

  // Cargar el script de Google Analytics
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Inicializar dataLayer y gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag as typeof window.gtag;

  gtag("js", new Date());
  gtag("config", measurementId, {
    page_path: window.location.pathname,
  });
}

/**
 * Trackea un evento personalizado
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, eventParams);
}

/**
 * Trackea la navegación de página
 */
export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
    page_path: path,
  });
}

/**
 * Eventos específicos de la aplicación
 */
export const analytics = {
  // Autenticación
  signUp: (method: "email" | "google" = "email") => {
    trackEvent("sign_up", { method });
  },
  login: (method: "email" | "google" = "email") => {
    trackEvent("login", { method });
  },
  logout: () => {
    trackEvent("logout");
  },

  // Viajes
  createTrip: (tripName?: string) => {
    trackEvent("create_trip", { trip_name: tripName });
  },
  viewTrip: (tripId: string, tripName?: string) => {
    trackEvent("view_trip", { trip_id: tripId, trip_name: tripName });
  },
  deleteTrip: () => {
    trackEvent("delete_trip");
  },

  // Artículos
  createItem: (tripId: string) => {
    trackEvent("create_item", { trip_id: tripId });
  },
  purchaseItem: (tripId: string, itemName?: string) => {
    trackEvent("purchase_item", { trip_id: tripId, item_name: itemName });
  },
  deleteItem: () => {
    trackEvent("delete_item");
  },

  // Organizaciones
  createOrganization: () => {
    trackEvent("create_organization");
  },
  joinOrganization: () => {
    trackEvent("join_organization");
  },
  inviteMember: () => {
    trackEvent("invite_member");
  },

  // IA
  useAICreateTrip: () => {
    trackEvent("ai_create_trip");
  },
  useAICreateItem: () => {
    trackEvent("ai_create_item");
  },

  // Otros
  viewDashboard: () => {
    trackEvent("view_dashboard");
  },
  viewSettings: () => {
    trackEvent("view_settings");
  },
  changeCurrency: (currency: string) => {
    trackEvent("change_currency", { currency });
  },
  enableNotifications: () => {
    trackEvent("enable_notifications");
  },
  
  // Función genérica para eventos personalizados
  trackEvent: (eventName: string, eventParams?: Record<string, unknown>) => {
    if (typeof window === "undefined" || !window.gtag) {
      return;
    }
    window.gtag("event", eventName, eventParams);
  },
};

