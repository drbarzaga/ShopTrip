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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createOrganizationAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

interface CreateOrganizationDialogProps {
  trigger?: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateOrganizationDialog({
  trigger,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onValueChange,
  onSuccess,
}: CreateOrganizationDialogProps = {} as CreateOrganizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || onValueChange || setInternalOpen;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ id: string; slug: string }> | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createOrganizationAction(state, formData);
      setState(result);

      if (result.success && result.data) {
        setOpen(false);
        setState(null);
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && (
        <DialogTrigger asChild>
          <Button size="sm" className={`h-10 text-sm w-full sm:w-auto ${className || ""}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate on trips with others.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Family Trips"
                required
                disabled={isPending}
                defaultValue={state && !state.success ? (state.formData?.name as string) : ""}
              />
              {state && !state.success && state.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setState(null);
              }}
              disabled={isPending}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto h-10">
              {isPending ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

