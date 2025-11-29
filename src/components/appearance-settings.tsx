"use client";

import { ThemeSelector } from "@/components/theme-selector";
import { FontSelector } from "@/components/font-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Palette, Type, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: React.ReactNode;
}

function SettingRow({ icon, label, description, action }: SettingRowProps) {
  return (
    <div className="group flex items-center justify-between gap-6 p-4 rounded-lg border bg-card/50 hover:bg-card transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium block mb-0.5">{label}</label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">
        {action}
      </div>
    </div>
  );
}

export function AppearanceSettings() {
  return (
    <div className="rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-1">Apariencia</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza el tema, fuente y modo de visualización
        </p>
      </div>
      
      <div className="space-y-3">
        <SettingRow
          icon={<Palette className="h-4 w-4 text-muted-foreground" />}
          label="Tema de Color"
          description="Elige el esquema de colores"
          action={<ThemeSelector />}
        />
        
        <SettingRow
          icon={<Type className="h-4 w-4 text-muted-foreground" />}
          label="Fuente"
          description="Selecciona la tipografía"
          action={<FontSelector />}
        />
        
        <SettingRow
          icon={<Moon className="h-4 w-4 text-muted-foreground" />}
          label="Modo Oscuro"
          description="Alterna entre claro y oscuro"
          action={<ThemeToggle />}
        />
      </div>
    </div>
  );
}
