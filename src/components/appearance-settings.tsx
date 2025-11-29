"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeSelector } from "@/components/theme-selector";
import { FontSelector } from "@/components/font-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Palette, Type, Moon } from "lucide-react";

export function AppearanceSettings() {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Apariencia
        </CardTitle>
        <CardDescription>
          Personaliza el tema de color, la fuente y el modo oscuro/claro de la
          aplicación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tema de Color */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Tema de Color</label>
              <p className="text-xs text-muted-foreground">
                Elige el esquema de colores de la aplicación
              </p>
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* Fuente */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Fuente
              </label>
              <p className="text-xs text-muted-foreground">
                Selecciona la fuente que prefieres para la aplicación
              </p>
            </div>
            <FontSelector />
          </div>
        </div>

        {/* Modo Oscuro/Claro */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Modo Oscuro/Claro
              </label>
              <p className="text-xs text-muted-foreground">
                Alterna entre modo claro y oscuro
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

