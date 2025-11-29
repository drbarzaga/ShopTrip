"use client";

import * as React from "react";
import { Check, Type } from "lucide-react";
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

const fonts = [
  { value: "geist", label: "Geist", className: "font-geist" },
  { value: "inter", label: "Inter", className: "font-inter" },
  { value: "roboto", label: "Roboto", className: "font-roboto" },
  { value: "open-sans", label: "Open Sans", className: "font-open-sans" },
  { value: "lato", label: "Lato", className: "font-lato" },
  { value: "montserrat", label: "Montserrat", className: "font-montserrat" },
  { value: "poppins", label: "Poppins", className: "font-poppins" },
  { value: "raleway", label: "Raleway", className: "font-raleway" },
  { value: "nunito", label: "Nunito", className: "font-nunito" },
  { value: "source-sans", label: "Source Sans Pro", className: "font-source-sans" },
] as const;

export function FontSelector() {
  const [mounted, setMounted] = React.useState(false);
  const [currentFont, setCurrentFont] = React.useState<string>("geist");

  // Evitar hidration mismatch
  React.useEffect(() => {
    setMounted(true);
    // Obtener fuente guardada o usar geist por defecto
    const savedFont = localStorage.getItem("font-family") || "geist";
    setCurrentFont(savedFont);
    // Aplicar la fuente al documento
    document.documentElement.setAttribute("data-font", savedFont);
    // Cargar la fuente si no es geist
    if (savedFont !== "geist") {
      loadFont(savedFont);
    }
  }, []);

  const loadFont = (fontName: string) => {
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

    const fontFamily = fontMap[fontName];
    if (fontFamily && !document.getElementById(`font-${fontName}`)) {
      const link = document.createElement("link");
      link.id = `font-${fontName}`;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap`;
      document.head.appendChild(link);
    }
  };

  const handleFontChange = (value: string) => {
    setCurrentFont(value);
    localStorage.setItem("font-family", value);
    document.documentElement.setAttribute("data-font", value);
    if (value !== "geist") {
      loadFont(value);
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9">
        <Type className="h-5 w-5 md:h-4 md:w-4" />
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
          aria-label="Seleccionar fuente"
        >
          <Type className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Fuente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentFont}
          onValueChange={handleFontChange}
        >
          {fonts.map((font) => (
            <DropdownMenuRadioItem
              key={font.value}
              value={font.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`flex-1 ${font.className}`} style={{ fontFamily: getFontFamily(font.value) }}>
                  {font.label}
                </span>
                {currentFont === font.value && (
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

