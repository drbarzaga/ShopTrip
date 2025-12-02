import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
import {
  getUserInvitations,
  acceptInvitationAction,
  rejectInvitationAction,
} from "@/actions/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Check, X, Building2 } from "lucide-react";
import { AcceptInvitationButton } from "@/components/accept-invitation-button";
import { RejectInvitationButton } from "@/components/reject-invitation-button";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function InvitationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userEmail = session.user.email;
  if (!userEmail) {
    console.error("User email is not available in session");
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
          <Breadcrumbs items={[{ label: "Invitaciones" }]} />
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Invitaciones</h1>
          </div>
          <Card className="border-2 border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                No se pudo obtener tu email. Por favor, cierra sesión e inicia
                sesión nuevamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Normalizar el email antes de buscar invitaciones
  const normalizedEmail = userEmail.toLowerCase().trim();
  console.log("Looking for invitations for email:", normalizedEmail);

  const invitations = await getUserInvitations(normalizedEmail);
  console.log("Found invitations:", invitations.length);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Invitaciones" }]} />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Invitaciones</h1>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-muted-foreground mt-2">
              Email: {normalizedEmail} | Invitaciones encontradas:{" "}
              {invitations.length}
            </p>
          )}
        </div>

        {/* Invitations List */}
        {invitations.length === 0 ? (
          <Card className="border-2 border-dashed hover:border-solid transition-colors p-6 sm:p-12 text-center">
            <div className="bg-primary/10 text-primary p-3 sm:p-4 rounded-full w-fit mx-auto mb-4 sm:mb-6 shadow-lg shadow-primary/20">
              <Mail className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No hay invitaciones pendientes
            </h3>
            <p className="text-muted-foreground text-sm px-2">
              No tienes invitaciones pendientes en este momento.
            </p>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {invitations.map((inv) => (
              <Card key={inv.id} className="border">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-primary/10 text-primary p-1.5 sm:p-2 rounded-lg shrink-0">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">
                        {inv.organizationName}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Rol: {inv.role === "owner" ? "Propietario" : "Miembro"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <AcceptInvitationButton invitationId={inv.id} />
                    <RejectInvitationButton invitationId={inv.id} />
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
