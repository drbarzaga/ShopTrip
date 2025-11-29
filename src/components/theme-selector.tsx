"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  { value: "slate", label: "Slate", color: "bg-slate-500" },
  { value: "gray", label: "Gray", color: "bg-gray-500" },
  { value: "zinc", label: "Zinc", color: "bg-zinc-500" },
  { value: "neutral", label: "Neutral", color: "bg-neutral-500" },
  { value: "stone", label: "Stone", color: "bg-stone-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500" },
  { value: "violet", label: "Violet", color: "bg-violet-500" },
] as const;

export function ThemeSelector() {
  const [mounted, setMounted] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<string>("slate");

  // Evitar hidration mismatch
  React.useEffect(() => {
    setMounted(true);
    // Obtener tema guardado o usar slate por defecto
    const savedTheme = localStorage.getItem("color-theme") || "slate";
    setCurrentTheme(savedTheme);
    // Aplicar el tema al documento
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    localStorage.setItem("color-theme", value);
    document.documentElement.setAttribute("data-theme", value);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9">
        <Palette className="h-5 w-5 md:h-4 md:w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-9 md:w-9"
          aria-label="Seleccionar tema de color"
        >
          <Palette className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tema de Color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentTheme}
          onValueChange={handleThemeChange}
        >
          {themes.map((theme) => (
            <DropdownMenuRadioItem
              key={theme.value}
              value={theme.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className={`h-4 w-4 rounded-full ${theme.color} border border-border`}
                />
                <span className="flex-1">{theme.label}</span>
                {currentTheme === theme.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

