"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download, Share2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PROMPT_DISMISSED_KEY = "pwa-install-prompt-dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window === "undefined") {
      return;
    }

    setMounted(true);

    // Verificar si el usuario ya descartó el prompt
    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (wasDismissed) {
      console.log("[PWA Install] Prompt was previously dismissed");
      return;
    }

    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalado como PWA
    const standalone = 
      (window.matchMedia("(display-mode: standalone)").matches) ||
      ((window.navigator as any).standalone === true);
    setIsStandalone(standalone);

    console.log("[PWA Install] Standalone mode:", standalone);
    console.log("[PWA Install] iOS:", iOS);
    console.log("[PWA Install] User agent:", navigator.userAgent);

    // Si ya está instalado, no mostrar el prompt
    if (standalone) {
      console.log("[PWA Install] Already installed, skipping prompt");
      return;
    }

    // Para iOS y otros navegadores que no soportan beforeinstallprompt,
    // mostrar el prompt después de un delay
    let timer: NodeJS.Timeout | null = null;

    // Escuchar el evento beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA Install] beforeinstallprompt event received");
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      // Mostrar inmediatamente cuando recibimos el evento
      setShowPrompt(true);
      // Cancelar cualquier timer pendiente ya que tenemos el evento nativo
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    // Detectar Edge/Chrome para mejor timing
    const isEdge = /Edg/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent) && !isEdge;
    
    // Mostrar para iOS después de 3 segundos
    if (iOS && !standalone) {
      timer = setTimeout(() => {
        console.log("[PWA Install] Showing iOS prompt after delay");
        setShowPrompt(true);
      }, 3000);
    } 
    // Para Edge/Chrome, mostrar después de 2 segundos si no se recibió el evento
    // (el evento debería dispararse antes, pero por si acaso)
    else if ((isEdge || isChrome) && !standalone) {
      timer = setTimeout(() => {
        console.log("[PWA Install] Edge/Chrome delay - showing prompt");
        setShowPrompt(true);
      }, 2000);
    }
    // Para otros navegadores, mostrar después de 5 segundos
    else if (!standalone) {
      timer = setTimeout(() => {
        console.log("[PWA Install] Showing generic prompt after delay");
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };

  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome/Edge - usar el prompt nativo
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("[PWA Install] User choice:", outcome);
        if (outcome === "accepted") {
          setShowPrompt(false);
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error("[PWA Install] Error showing install prompt:", error);
        // Si falla, mostrar instrucciones manuales
        setShowPrompt(true);
      }
    } else {
      // Si no hay deferredPrompt, mostrar instrucciones manuales
      console.log("[PWA Install] No deferred prompt, showing manual instructions");
    }
  };

  // No renderizar hasta que esté montado en el cliente
  if (!mounted || !showPrompt || isStandalone) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Instalar App
            </CardTitle>
            <CardDescription className="mt-1">
              {isIOS
                ? "Instala Shop Trip en tu iPhone para una mejor experiencia y notificaciones push."
                : "Instala Shop Trip en tu dispositivo para acceso rápido y notificaciones offline."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setShowPrompt(false);
              localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Pasos para instalar:</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>
                  <span>Toca el botón </span>
                  <Share2 className="h-3 w-3 inline" />
                  <span> Compartir</span>
                </li>
                <li>Selecciona &quot;Agregar a pantalla de inicio&quot;</li>
                <li>Toca &quot;Agregar&quot;</li>
              </ol>
            </div>
            <Button
              onClick={() => {
                setShowPrompt(false);
                localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
              }}
              className="w-full"
              variant="outline"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {deferredPrompt ? (
              <Button onClick={handleInstallClick} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Instalar Ahora
              </Button>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Instalación manual:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-xs">
                    <li>Chrome/Edge: Menú (⋮) → &quot;Instalar Shop Trip&quot;</li>
                    <li>Safari: Menú → &quot;Agregar a pantalla de inicio&quot;</li>
                    <li>Firefox: Menú → &quot;Instalar&quot;</li>
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setShowPrompt(false);
                    localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Entendido
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

