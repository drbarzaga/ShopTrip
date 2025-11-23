"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteOrganizationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface DeleteOrganizationDialogProps {
  organizationId: string;
  organizationName: string;
  trigger?: React.ReactNode;
}

export function DeleteOrganizationDialog({
  organizationId,
  organizationName,
  trigger,
}: DeleteOrganizationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrganizationAction(organizationId);
      setState(result);

      if (result.success) {
        setOpen(false);
        router.refresh();
        setState(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{organizationName}</strong>? This action
            cannot be undone. All members, invitations, and trips associated with this
            organization will be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {state && !state.success && (
            <p className="text-sm text-destructive mb-4">{state.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              setState(null);
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

