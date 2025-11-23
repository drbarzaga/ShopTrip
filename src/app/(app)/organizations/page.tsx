import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUserOrganizations, getOrganizationInvitations } from "@/actions/organizations";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, UserPlus, Mail, Trash2 } from "lucide-react";
import { DeleteOrganizationDialog } from "@/components/delete-organization-dialog";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function OrganizationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(session.user.id);
  
  // Obtener invitaciones pendientes para cada organización
  const organizationsWithInvitations = await Promise.all(
    organizations.map(async (org) => {
      const invitations = await getOrganizationInvitations(org.id);
      return { ...org, invitations };
    })
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Organizaciones" }]} />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Organizaciones</h1>
            <div className="w-full sm:w-auto">
              <CreateOrganizationDialog />
            </div>
          </div>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <Card className="border-2 border-dashed hover:border-solid transition-colors p-6 sm:p-12 text-center">
            <div className="bg-primary/10 text-primary p-3 sm:p-4 rounded-full w-fit mx-auto mb-4 sm:mb-6 shadow-lg shadow-primary/20">
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Aún no hay organizaciones</h3>
            <p className="text-muted-foreground text-sm mb-4 sm:mb-6 px-2">
              Crea una organización para comenzar a colaborar en viajes con otros.
            </p>
            <CreateOrganizationDialog />
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {organizationsWithInvitations.map((org) => (
              <Card key={org.id} className="border">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="bg-primary/10 text-primary p-1.5 sm:p-2 rounded-lg shrink-0">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg truncate">{org.name}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Rol: {org.role === "owner" ? "Propietario" : "Miembro"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <InviteMemberDialog
                        organizationId={org.id}
                        organizationName={org.name}
                        trigger={
                          <Button variant="outline" size="sm" className="w-full h-10 text-sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invitar Miembro
                          </Button>
                        }
                      />
                      {org.role === "owner" && (
                        <DeleteOrganizationDialog
                          organizationId={org.id}
                          organizationName={org.name}
                          trigger={
                            <Button variant="destructive" size="sm" className="w-full h-10 text-sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar Organización
                            </Button>
                          }
                        />
                      )}
                    </div>
                    {org.invitations && org.invitations.length > 0 && (
                      <div className="pt-2 sm:pt-3 border-t">
                        <p className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Invitaciones Pendientes ({org.invitations.length})
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          {org.invitations.map((inv) => (
                            <div
                              key={inv.id}
                              className="flex items-center justify-between text-xs sm:text-sm p-2 bg-muted rounded"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{inv.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Rol: {inv.role === "owner" ? "Propietario" : "Miembro"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

