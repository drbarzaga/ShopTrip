"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { acceptInvitationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface AcceptInvitationButtonProps {
  invitationId: string;
}

export function AcceptInvitationButton({ invitationId }: AcceptInvitationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptInvitationAction(invitationId);
      setState(result);

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleAccept}
        disabled={isPending}
        size="sm"
        className="w-full sm:w-auto text-xs sm:text-sm"
      >
        <Check className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {isPending ? "Accepting..." : "Accept"}
      </Button>
      {state && !state.success && (
        <p className="text-sm text-destructive mt-2">{state.message}</p>
      )}
    </>
  );
}

