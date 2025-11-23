"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { rejectInvitationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface RejectInvitationButtonProps {
  invitationId: string;
}

export function RejectInvitationButton({ invitationId }: RejectInvitationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectInvitationAction(invitationId);
      setState(result);

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleReject}
        disabled={isPending}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto text-xs sm:text-sm"
      >
        <X className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {isPending ? "Rechazando..." : "Rechazar"}
      </Button>
      {state && !state.success && (
        <p className="text-sm text-destructive mt-2">{state.message}</p>
      )}
    </>
  );
}

