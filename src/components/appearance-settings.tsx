"use client";

import * as React from "react";
import { ThemeSelector } from "@/components/theme-selector";
import { FontSelector } from "@/components/font-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Palette, Type, Moon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

const fonts = [
  { value: "geist", label: "Geist" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "montserrat", label: "Montserrat" },
  { value: "poppins", label: "Poppins" },
  { value: "raleway", label: "Raleway" },
  { value: "nunito", label: "Nunito" },
  { value: "source-sans", label: "Source Sans Pro" },
] as const;

function getFontFamily(fontValue: string): string {
  const fontMap: Record<string, string> = {
    geist: "var(--font-geist-sans), sans-serif",
    inter: '"Inter", sans-serif',
    roboto: '"Roboto", sans-serif',
    "open-sans": '"Open Sans", sans-serif',
    lato: '"Lato", sans-serif',
    montserrat: '"Montserrat", sans-serif',
    poppins: '"Poppins", sans-serif',
    raleway: '"Raleway", sans-serif',
    nunito: '"Nunito", sans-serif',
    "source-sans": '"Source Sans Pro", sans-serif',
  };
  return fontMap[fontValue] || "var(--font-geist-sans), sans-serif";
}

export function AppearanceSettings() {
  const [mounted, setMounted] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<string>("slate");
  const [currentFont, setCurrentFont] = React.useState<string>("geist");
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("color-theme") || "slate";
    const savedFont = localStorage.getItem("font-family") || "geist";
    const savedDarkMode = document.documentElement.classList.contains("dark");
    
    setCurrentTheme(savedTheme);
    setCurrentFont(savedFont);
    setIsDark(savedDarkMode);

    // Sincronizar estado cuando cambien los selectores externos
    const syncTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("color-theme") || "slate";
      setCurrentTheme(theme);
    };

    const syncFont = () => {
      const font = document.documentElement.getAttribute("data-font") || localStorage.getItem("font-family") || "geist";
      setCurrentFont(font);
    };

    const syncDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Observar cambios en el documento
    const observer = new MutationObserver(() => {
      syncTheme();
      syncFont();
      syncDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-font", "class"],
    });

    // También escuchar cambios en localStorage (por si cambian desde otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "color-theme") {
        syncTheme();
      }
      if (e.key === "font-family") {
        syncFont();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Sincronizar periódicamente (fallback)
    const interval = setInterval(() => {
      syncTheme();
      syncFont();
      syncDarkMode();
    }, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    localStorage.setItem("color-theme", value);
    document.documentElement.setAttribute("data-theme", value);
  };

  const handleFontChange = (value: string) => {
    setCurrentFont(value);
    localStorage.setItem("font-family", value);
    document.documentElement.setAttribute("data-font", value);
    
    // Cargar fuente si no es geist
    if (value !== "geist") {
      const fontMap: Record<string, string> = {
        inter: "Inter:wght@300;400;500;600;700",
        roboto: "Roboto:wght@300;400;500;700",
        "open-sans": "Open+Sans:wght@300;400;500;600;700",
        lato: "Lato:wght@300;400;700",
        montserrat: "Montserrat:wght@300;400;500;600;700",
        poppins: "Poppins:wght@300;400;500;600;700",
        raleway: "Raleway:wght@300;400;500;600;700",
        nunito: "Nunito:wght@300;400;500;600;700",
        "source-sans": "Source+Sans+Pro:wght@300;400;600;700",
      };

      const fontFamily = fontMap[value];
      if (fontFamily && !document.getElementById(`font-${value}`)) {
        const link = document.createElement("link");
        link.id = `font-${value}`;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap`;
        document.head.appendChild(link);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-1">Apariencia</h3>
          <p className="text-sm text-muted-foreground">
            Personaliza el tema, fuente y modo de visualización
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-1">Apariencia</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza el tema, fuente y modo de visualización. Los cambios se aplican en tiempo real.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Tema de Color con Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Palette className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium block">Tema de Color</label>
                <p className="text-xs text-muted-foreground">Elige el esquema de colores</p>
              </div>
            </div>
            <ThemeSelector />
          </div>
          
          {/* Preview del Tema */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Preview - Haz clic para cambiar</span>
            </div>
            <Card className="p-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Temas disponibles:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value)}
                      className={cn(
                        "relative h-10 w-10 rounded-full border-2 transition-all group",
                        theme.color,
                        currentTheme === theme.value
                          ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg"
                          : "hover:scale-105 opacity-70 hover:opacity-100 hover:shadow-md"
                      )}
                      aria-label={`Cambiar a tema ${theme.label}`}
                      title={theme.label}
                    >
                      {currentTheme === theme.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                        </div>
                      )}
                      <span className="sr-only">{theme.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tema actual: <span className="font-medium text-foreground">
                    {themes.find((t) => t.value === currentTheme)?.label}
                  </span>
                </p>
              </div>
              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary shadow-sm" />
                  <span className="text-xs text-muted-foreground">Color primario del tema</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="text-xs">
                    Botón primario
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Botón secundario
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <span className="text-muted-foreground">Fondo</span>
                  <div className="h-2 w-2 rounded-full bg-border ml-2" />
                  <span className="text-muted-foreground">Borde</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Fuente con Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Type className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium block">Fuente</label>
                <p className="text-xs text-muted-foreground">Selecciona la tipografía</p>
              </div>
            </div>
            <FontSelector />
          </div>
          
          {/* Preview de la Fuente */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Preview</span>
            </div>
            <Card className="p-4">
              <div
                style={{ fontFamily: getFontFamily(currentFont) }}
                className="space-y-2"
              >
                <h4 className="text-base font-semibold">
                  {fonts.find((f) => f.value === currentFont)?.label || "Geist"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-sm text-muted-foreground">
                  El veloz murciélago hindú comía feliz cardillo y kiwi
                </p>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-xs font-medium">ABCDEFG</span>
                  <span className="text-xs">1234567890</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modo Oscuro */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium block">Modo Oscuro</label>
              <p className="text-xs text-muted-foreground">Alterna entre claro y oscuro</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
