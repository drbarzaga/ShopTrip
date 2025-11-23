"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { setActiveOrganization } from "@/actions/organizations";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string | null;
}

interface OrganizationSelectorProps {
  organizations: Organization[];
  activeOrganizationId: string | null;
}

export function OrganizationSelector({
  organizations,
  activeOrganizationId,
}: OrganizationSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    activeOrganizationId || ""
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedOrgId(activeOrganizationId || "");
  }, [activeOrganizationId]);

  const handleChange = (value: string) => {
    if (value === "create") {
      setCreateDialogOpen(true);
      // No cambiar el valor seleccionado cuando se elige "create"
      return;
    }

    setSelectedOrgId(value);
    startTransition(async () => {
      const result = await setActiveOrganization(value);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh();
  };

  if (organizations.length === 0) {
    return (
      <CreateOrganizationDialog
        trigger={
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Building2 className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Select
        value={selectedOrgId && selectedOrgId !== "create" ? selectedOrgId : undefined}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px] hidden sm:flex">
          <Building2 className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
          <SelectItem value="create" className="text-primary font-medium">
            <Plus className="mr-2 h-4 w-4 inline" />
            Create New Organization
          </SelectItem>
        </SelectContent>
      </Select>
      <CreateOrganizationDialog
        trigger={
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden">
            <Building2 className="h-4 w-4" />
          </Button>
        }
      />
      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            // Resetear el select cuando se cierra el diálogo
            setSelectedOrgId(activeOrganizationId || "");
          }
        }}
        onSuccess={() => {
          setCreateDialogOpen(false);
          // La página se refrescará y mostrará la nueva organización
        }}
      />
    </>
  );
}

