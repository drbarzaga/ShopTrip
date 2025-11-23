"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updatePreferredCurrencyAction } from "@/actions/settings";
import type { Currency } from "@/lib/currency";
import { Loader2 } from "lucide-react";

interface CurrencySelectorProps {
  initialCurrency: Currency;
}

export function CurrencySelector({ initialCurrency }: CurrencySelectorProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setMessage(null);
    
    startTransition(async () => {
      const result = await updatePreferredCurrencyAction(newCurrency);
      if (result.success) {
        setMessage("Moneda actualizada exitosamente");
        router.refresh();
      } else {
        setMessage(result.message || "Error al actualizar la moneda");
        // Revertir el cambio si falla
        setCurrency(initialCurrency);
      }
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="currency">Moneda Preferida</Label>
      <Select
        value={currency}
        onValueChange={handleCurrencyChange}
        disabled={isPending}
      >
        <SelectTrigger id="currency" className="w-full sm:w-[300px]">
          <SelectValue placeholder="Selecciona una moneda">
            {currency === "UYU" ? "Pesos Uruguayos (UYU)" : "Dólares Americanos (USD)"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="UYU">
            <div className="flex items-center gap-2">
              <span>Pesos Uruguayos</span>
              <span className="text-muted-foreground">(UYU)</span>
            </div>
          </SelectItem>
          <SelectItem value="USD">
            <div className="flex items-center gap-2">
              <span>Dólares Americanos</span>
              <span className="text-muted-foreground">(USD)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Actualizando moneda...</span>
        </div>
      )}
      {message && (
        <p className={`text-sm ${message.includes("exitosamente") ? "text-green-600" : "text-destructive"}`}>
          {message}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Los precios se convertirán automáticamente usando el tipo de cambio actual obtenido mediante IA.
      </p>
    </div>
  );
}

