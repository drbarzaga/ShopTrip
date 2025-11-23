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

  useEffect(() => {
    // Verificar si el navegador soporta reconocimiento de voz
    if (typeof globalThis.window !== "undefined") {
      const SpeechRecognition =
        globalThis.window.SpeechRecognition ||
        globalThis.window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "es-ES";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setError("Error al reconocer la voz. Intenta de nuevo.");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setError(null);
      recognitionRef.current.start();
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
