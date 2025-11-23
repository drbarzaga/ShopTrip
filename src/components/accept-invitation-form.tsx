"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { acceptInvitationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface AcceptInvitationFormProps {
  invitationId: string;
}

export function AcceptInvitationForm({ invitationId }: AcceptInvitationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptInvitationAction(invitationId);
      setState(result);

      if (result.success) {
        // Redirigir a organizaciones después de aceptar exitosamente
        router.push("/organizations");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAccept}
        disabled={isPending}
        className="w-full"
        size="lg"
      >
        <Check className="mr-2 h-4 w-4" />
        {isPending ? "Aceptando..." : "Aceptar Invitación"}
      </Button>
      {state && !state.success && (
        <p className="text-sm text-destructive text-center">{state.message}</p>
      )}
    </div>
  );
}

