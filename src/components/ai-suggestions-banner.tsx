"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Bell,
  Info,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import type { TripSuggestion } from "@/lib/ai/suggestions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AISuggestionsBannerProps {
  suggestions: TripSuggestion[];
  isLoading?: boolean;
}

const typeConfig = {
  tip: {
    icon: Lightbulb,
    label: "Consejo",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  reminder: {
    icon: Bell,
    label: "Recordatorio",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  info: {
    icon: Info,
    label: "Info",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  recommendation: {
    icon: Sparkles,
    label: "Recomendación",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
};

export function AISuggestionsBanner({
  suggestions,
  isLoading = false,
}: AISuggestionsBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || suggestions.length === 0 || isDismissed) {
    return null;
  }

  // Obtener la sugerencia de mayor prioridad
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const topSuggestion = sortedSuggestions[0];
  const config = typeConfig[topSuggestion.type];
  const Icon = config.icon;

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
        <div
          className={cn(
            "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg",
            config.bgColor
          )}
        >
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", config.color)} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Sugerencias para tu Viaje
            </span>
            <Badge
              variant="outline"
              className={cn("h-5 text-xs px-1.5 shrink-0", config.color)}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-sm font-medium leading-tight line-clamp-2 sm:line-clamp-1">
            {topSuggestion.title}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 shrink-0">
          {suggestions.length > 1 && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 sm:h-8 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <span className="hidden sm:inline">+{suggestions.length - 1} más</span>
                  <span className="sm:hidden">+{suggestions.length - 1}</span>
                  <ChevronRight className="ml-0.5 sm:ml-1 h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-lg font-semibold">
                        Sugerencias para tu Viaje
                      </DialogTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestions.length} recomendaciones personalizadas
                      </p>
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="space-y-3">
                    {sortedSuggestions.map((suggestion) => {
                      const sugConfig = typeConfig[suggestion.type];
                      const SugIcon = sugConfig.icon;
                      
                      return (
                        <div
                          key={suggestion.id}
                          className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                              sugConfig.bgColor
                            )}>
                              <SugIcon className={cn("h-4 w-4", sugConfig.color)} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm leading-snug">
                                  {suggestion.title}
                                </h4>
                                {suggestion.priority === "high" && (
                                  <Badge variant="destructive" className="h-5 text-xs px-1.5 shrink-0">
                                    Urgente
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {suggestion.description}
                              </p>
                              <div className="pt-1">
                                <Badge
                                  variant="outline"
                                  className={cn("h-5 text-xs px-2", sugConfig.color)}
                                >
                                  {sugConfig.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => setIsDismissed(true)}
            aria-label="Cerrar sugerencia"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

