"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download, Share2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalado como PWA
    const standalone = 
      (window.matchMedia("(display-mode: standalone)").matches) ||
      ((window.navigator as any).standalone === true);
    setIsStandalone(standalone);

    // Si ya está instalado, no mostrar el prompt
    if (standalone) {
      return;
    }

    // Escuchar el evento beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Para iOS, mostrar el prompt después de un delay
    let timer: NodeJS.Timeout | null = null;
    if (iOS && !standalone) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Mostrar después de 3 segundos
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
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  if (!showPrompt || isStandalone) {
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
            onClick={() => setShowPrompt(false)}
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
                <li>Toca el botón <Share2 className="h-3 w-3 inline" /> Compartir</li>
                <li>Selecciona &quot;Agregar a pantalla de inicio&quot;</li>
                <li>Toca &quot;Agregar&quot;</li>
              </ol>
            </div>
            <Button
              onClick={() => setShowPrompt(false)}
              className="w-full"
              variant="outline"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <Button onClick={handleInstallClick} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Instalar Ahora
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

