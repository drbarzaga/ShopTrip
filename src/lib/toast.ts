"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Detecta si estamos en un dispositivo móvil
 */
function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

/**
 * Wrapper para toast que solo funciona en web (no móvil)
 */
export const toast = {
  success: (
    message: string,
    options?: Parameters<typeof sonnerToast.success>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.success(message, options);
    }
  },
  error: (
    message: string,
    options?: Parameters<typeof sonnerToast.error>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.error(message, options);
    }
  },
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    if (!isMobile()) {
      return sonnerToast.info(message, options);
    }
  },
  warning: (
    message: string,
    options?: Parameters<typeof sonnerToast.warning>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.warning(message, options);
    }
  },
  message: (
    message: string,
    options?: Parameters<typeof sonnerToast.message>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.message(message, options);
    }
  },
  promise: <T>(
    promise: Promise<T>,
    options: Parameters<typeof sonnerToast.promise>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.promise(promise, options);
    }
  },
  custom: (
    jsx: Parameters<typeof sonnerToast.custom>[0],
    options?: Parameters<typeof sonnerToast.custom>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.custom(jsx, options);
    }
  },
  dismiss: (toastId?: string | number) => {
    if (!isMobile()) {
      return sonnerToast.dismiss(toastId);
    }
  },
  loading: (
    message: string,
    options?: Parameters<typeof sonnerToast.loading>[1]
  ) => {
    if (!isMobile()) {
      return sonnerToast.loading(message, options);
    }
  },
};
