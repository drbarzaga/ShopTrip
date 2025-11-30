"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Bell,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { TripSuggestion } from "@/lib/ai/suggestions";
import { cn } from "@/lib/utils";

interface AISuggestionsProps {
  suggestions: TripSuggestion[];
  isLoading?: boolean;
  className?: string;
}

const typeConfig = {
  tip: {
    icon: Lightbulb,
    label: "Consejo",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  reminder: {
    icon: Bell,
    label: "Recordatorio",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  info: {
    icon: Info,
    label: "Información",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  recommendation: {
    icon: Sparkles,
    label: "Recomendación",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

const priorityConfig = {
  high: "border-l-4 border-l-red-500",
  medium: "border-l-4 border-l-yellow-500",
  low: "border-l-4 border-l-blue-500",
};

export function AISuggestions({
  suggestions,
  isLoading = false,
  className,
}: AISuggestionsProps) {
  const [expanded, setExpanded] = useState(true);
  const [visibleSuggestions, setVisibleSuggestions] = useState(3);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Generando sugerencias inteligentes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const displaySuggestions = expanded
    ? sortedSuggestions.slice(0, visibleSuggestions)
    : sortedSuggestions.slice(0, 3);

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Sugerencias Inteligentes
            </CardTitle>
          </div>
          {suggestions.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displaySuggestions.map((suggestion) => {
          const config = typeConfig[suggestion.type];
          const Icon = config.icon;

          return (
            <div
              key={suggestion.id}
              className={cn(
                "rounded-lg border bg-card p-4 transition-all hover:shadow-sm",
                priorityConfig[suggestion.priority]
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm leading-tight">
                      {suggestion.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-xs", config.color)}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {expanded && suggestions.length > visibleSuggestions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleSuggestions(suggestions.length)}
            className="w-full text-sm"
          >
            Ver todas las sugerencias ({suggestions.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
