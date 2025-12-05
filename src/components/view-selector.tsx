"use client";

import { Package, LayoutList, Grid3x3, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid" | "compact" | "cards";

interface ViewSelectorProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewSelector({
  view,
  onViewChange,
  className,
}: ViewSelectorProps) {
  const views: { mode: ViewMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    {
      mode: "list",
      icon: LayoutList,
      label: "Lista",
    },
    {
      mode: "grid",
      icon: Grid3x3,
      label: "Grid",
    },
    {
      mode: "cards",
      icon: Package,
      label: "Cards",
    },
    {
      mode: "compact",
      icon: ListChecks,
      label: "Compacta",
    },
  ];

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-muted p-1 border border-border w-full sm:w-auto", className)}>
      {views.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant={view === mode ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(mode)}
          className={cn(
            "h-8 flex-1 sm:flex-initial px-2 sm:px-4 min-w-0 sm:min-w-[40px]",
            view === mode
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
          aria-label={`Cambiar a vista ${label}`}
          title={label}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-xs ml-1.5 font-medium">{label}</span>
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  );
}

