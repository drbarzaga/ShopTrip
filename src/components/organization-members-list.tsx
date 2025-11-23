"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { removeMemberAction } from "@/actions/organizations";
import type { ActionResult } from "@/types/actions";

function getRoleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Propietario";
    case "admin":
      return "Administrador";
    case "member":
      return "Miembro";
    default:
      return role;
  }
}

function getRoleVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    case "member":
      return "outline";
    default:
      return "outline";
  }
}

interface OrganizationMember {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
}

interface OrganizationMembersListProps {
  members: OrganizationMember[];
  organizationId: string;
  currentUserId: string;
}

export function OrganizationMembersList({
  members,
  organizationId,
  currentUserId,
}: OrganizationMembersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [state, setState] = useState<ActionResult<void> | null>(null);

  const handleRemoveMember = (memberId: string) => {
    setRemovingMemberId(memberId);
    startTransition(async () => {
      const result = await removeMemberAction(memberId, organizationId);
      setState(result);
      if (result.success) {
        setOpenDialogId(null);
        router.refresh();
      }
      setRemovingMemberId(null);
    });
  };

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="pt-2 sm:pt-3 border-t">
      <p className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Miembros ({members.length})
      </p>
      <div className="space-y-1.5 sm:space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.role === "owner";

          return (
            <div
              key={member.id}
              className="flex items-center justify-between text-xs sm:text-sm p-2 bg-muted rounded"
            >
              <div className="min-w-0 flex-1 flex items-center gap-2">
                {member.userImage ? (
                  <img
                    src={member.userImage}
                    alt={member.userName || ""}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">
                      {member.userName || member.userEmail || "Usuario"}
                      {isCurrentUser && (
                        <span className="text-muted-foreground ml-1">(Tú)</span>
                      )}
                    </p>
                    <Badge 
                      variant={getRoleVariant(member.role)} 
                      className="text-xs shrink-0"
                    >
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {member.userEmail}
                  </p>
                </div>
              </div>
              {!isCurrentUser && !isOwner && (
                <Dialog open={openDialogId === member.id} onOpenChange={(open) => setOpenDialogId(open ? member.id : null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      disabled={isPending && removingMemberId === member.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>¿Eliminar miembro?</DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro de que deseas eliminar a{" "}
                        <strong>{member.userName || member.userEmail}</strong> de
                        esta organización? Esta acción no se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    {state && !state.success && openDialogId === member.id && (
                      <p className="text-sm text-destructive">{state.message}</p>
                    )}
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setOpenDialogId(null)}
                        disabled={isPending && removingMemberId === member.id}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isPending && removingMemberId === member.id}
                      >
                        {isPending && removingMemberId === member.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          );
        })}
      </div>
      {state && !state.success && (
        <p className="text-xs text-destructive mt-2">{state.message}</p>
      )}
    </div>
  );
}

