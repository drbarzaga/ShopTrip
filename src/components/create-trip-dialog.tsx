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
import { createTripAction } from "@/actions/trips";
import type { ActionResult } from "@/types/actions";

interface CreateTripDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function CreateTripDialog({
  trigger,
  className,
}: CreateTripDialogProps = {} as CreateTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ id: string; slug: string }> | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createTripAction(state, formData);
      setState(result);

      if (result.success && result.data) {
        setOpen(false);
        router.push(`/trips/${result.data.slug}`);
        router.refresh();
        setState(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className={className || "w-full sm:w-auto"}>
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>
              Add a new trip to organize your shopping list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Trip Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Summer Vacation"
                required
                disabled={isPending}
                defaultValue={state?.formData?.name as string}
              />
              {state?.fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="e.g., Paris, France"
                disabled={isPending}
                defaultValue={state?.formData?.destination as string}
              />
              {state?.fieldErrors?.destination && (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.destination[0]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  disabled={isPending}
                  defaultValue={state?.formData?.startDate as string}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  disabled={isPending}
                  defaultValue={state?.formData?.endDate as string}
                />
              </div>
            </div>
            {state && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

