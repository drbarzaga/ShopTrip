"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
      aria-label="Recargar página"
    >
      <RefreshCw className={`h-4 w-4 sm:mr-2 ${isPending ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">Recargar</span>
    </Button>
  );
}




