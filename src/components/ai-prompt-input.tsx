"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos para Speech Recognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  onstart: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface AIPromptInputProps {
  readonly onPromptSubmit: (prompt: string) => Promise<void>;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function AIPromptInput({
  onPromptSubmit,
  placeholder = "Describe lo que quieres crear...",
  disabled = false,
  className,
}: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const createRecognition = (): SpeechRecognition | null => {
    if (typeof globalThis.window === "undefined") {
      return null;
    }

    const SpeechRecognition =
      globalThis.window.SpeechRecognition ||
      globalThis.window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "es-ES";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          setPrompt((prev) => prev + (prev ? " " : "") + transcript.trim());
        }
        setIsListening(false);
        setError(null);
      } catch (e) {
        console.error("Error processing speech result:", e);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: Event) => {
      setIsListening(false);
      const errorEvent = event as any;
      const errorMessage = errorEvent.error;
      
      console.error("Speech recognition error:", errorMessage);
      
      if (errorMessage === "not-allowed") {
        setError("Permiso de micrófono denegado. Permite el acceso al micrófono en la configuración del navegador.");
      } else if (errorMessage === "no-speech") {
        setError("No se detectó voz. Intenta hablar más cerca del micrófono.");
      } else if (errorMessage === "audio-capture") {
        setError("No se pudo acceder al micrófono. Verifica que esté conectado y funcionando.");
      } else if (errorMessage === "network") {
        setError("Error de conexión con el servicio de reconocimiento de voz. El reconocimiento de voz requiere conexión a internet y acceso a los servidores de Google. Verifica tu conexión, firewall o VPN.");
      } else if (errorMessage === "aborted") {
        // Ignorar errores de aborto (cuando se detiene manualmente)
        setError(null);
      } else {
        setError(`Error: ${errorMessage}. Intenta de nuevo.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setError(null);
    };

    return recognition;
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorar errores al detener
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onPromptSubmit(prompt.trim());
      setPrompt("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el prompt"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const checkNetworkConnection = async (): Promise<boolean> => {
    if (typeof globalThis.navigator === "undefined") {
      return false;
    }
    
    // Verificar si hay conexión usando la API de Network Information si está disponible
    if ("connection" in globalThis.navigator) {
      const connection = (globalThis.navigator as any).connection;
      if (connection && connection.effectiveType) {
        return connection.effectiveType !== "offline";
      }
    }
    
    // Fallback: intentar hacer una petición simple
    try {
      const response = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleVoiceInput = async () => {
    // Verificar soporte del navegador
    if (typeof globalThis.window === "undefined") {
      setError("El reconocimiento de voz no está disponible.");
      return;
    }

    const SpeechRecognition =
      globalThis.window.SpeechRecognition ||
      globalThis.window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.");
      return;
    }

    // Verificar conexión a internet antes de iniciar
    const hasConnection = await checkNetworkConnection();
    if (!hasConnection) {
      setError("No hay conexión a internet. El reconocimiento de voz requiere conexión a internet.");
      return;
    }

    if (isListening) {
      // Detener el reconocimiento
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorar errores
        }
      }
      setIsListening(false);
      return;
    }

    // Crear o reutilizar la instancia de reconocimiento
    if (!recognitionRef.current) {
      const recognition = createRecognition();
      if (!recognition) {
        setError("No se pudo inicializar el reconocimiento de voz.");
        return;
      }
      recognitionRef.current = recognition;
    }

    // Iniciar el reconocimiento
    try {
      setIsListening(true);
      setError(null);
      recognitionRef.current.start();
    } catch (e: any) {
      console.error("Error starting recognition:", e);
      setIsListening(false);
      
      // Si el error es que ya está iniciado, crear una nueva instancia
      if (e?.message?.includes("started") || e?.message?.includes("already") || e?.message?.includes("abort")) {
        try {
          // Detener y crear nueva instancia
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (stopError) {
              // Ignorar
            }
          }
          recognitionRef.current = createRecognition();
          if (recognitionRef.current) {
            setIsListening(true);
            setError(null);
            recognitionRef.current.start();
          } else {
            setError("Error al reinicializar el reconocimiento de voz.");
          }
        } catch (retryError) {
          console.error("Error retrying recognition:", retryError);
          setError("Error al iniciar el reconocimiento. Intenta recargar la página.");
        }
      } else {
        setError("Error al iniciar el reconocimiento. Asegúrate de permitir el acceso al micrófono.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isProcessing || isListening}
          rows={3}
          className="pr-20 resize-none"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          {prompt && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => {
                setPrompt("");
                setError(null);
              }}
              disabled={isProcessing || isListening}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              isListening && "bg-primary text-primary-foreground"
            )}
            onClick={handleVoiceInput}
            disabled={disabled || isProcessing}
            title="Entrada de voz"
          >
            <Mic className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isListening
            ? "Escuchando..."
            : "Presiona Cmd/Ctrl + Enter para enviar"}
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!prompt.trim() || isProcessing || isListening}
          size="sm"
          className="h-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Crear con IA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
