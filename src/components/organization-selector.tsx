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

  // Si no hay organizaciones, mostrar solo el botón para crear
  if (!organizations || organizations.length === 0) {
    return (
      <>
        <CreateOrganizationDialog
          trigger={
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Building2 className="mr-2 h-4 w-4" />
              Crear Organización
            </Button>
          }
        />
        <CreateOrganizationDialog
          trigger={
            <Button variant="outline" size="sm" className="w-full md:hidden">
              <Building2 className="mr-2 h-4 w-4" />
              Crear Organización
            </Button>
          }
        />
      </>
    );
  }

  // Si hay organizaciones, mostrar selector y botón de crear (en móvil separados)
  return (
    <>
      {/* Versión desktop del selector */}
      <div className="hidden md:flex items-center gap-2">
        <Select
          value={selectedOrgId && selectedOrgId !== "create" ? selectedOrgId : undefined}
          onValueChange={handleChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[180px]">
            <Building2 className="mr-2 h-4 w-4 shrink-0" />
            <SelectValue placeholder="Selecciona organización" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
            <SelectItem value="create" className="text-primary font-medium">
              <Plus className="mr-2 h-4 w-4 inline" />
              Crear Nueva Organización
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Versión mobile: selector y botón separados con gap */}
      <div className="flex md:hidden items-center gap-2 w-full">
        <Select
          value={selectedOrgId && selectedOrgId !== "create" ? selectedOrgId : undefined}
          onValueChange={handleChange}
          disabled={isPending}
        >
          <SelectTrigger className="h-9 text-sm flex-1 min-w-0">
            <Building2 className="h-4 w-4 mr-1.5 shrink-0" />
            <SelectValue placeholder="Selecciona organización" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CreateOrganizationDialog
          trigger={
            <Button variant="outline" size="sm" className="h-9 shrink-0 px-2.5">
              <Plus className="h-4 w-4" />
            </Button>
          }
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setSelectedOrgId(activeOrganizationId || "");
            }
          }}
          onSuccess={() => {
            setCreateDialogOpen(false);
          }}
        />
      </div>
    </>
  );
}

