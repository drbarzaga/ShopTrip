import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';
import { getInvitationById, acceptInvitationAction } from "@/actions/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Check, AlertCircle, Mail } from "lucide-react";
import { AcceptInvitationForm } from "@/components/accept-invitation-form";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface InvitationPageProps {
  params: Promise<{ invitationId: string }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { invitationId } = await params;
  const session = await getSession();
  const invitation = await getInvitationById(invitationId);

  // Si la invitación no existe o expiró
  if (!invitation) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
          <Breadcrumbs items={[{ label: "Invitación" }]} />
          
          <Card className="border-2 border-destructive/50">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 text-destructive p-4 rounded-full w-fit mx-auto mb-4">
                <AlertCircle className="h-10 w-10" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">
                Invitación no válida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Esta invitación no existe, ya fue procesada o ha expirado.
              </p>
              <Button asChild>
                <Link href="/">Volver al inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userEmail = session?.user?.email?.toLowerCase().trim();
  const invitationEmail = invitation.email.toLowerCase().trim();
  const emailMatches = userEmail === invitationEmail;

  // Si el usuario está logueado y el email coincide, puede aceptar directamente
  if (session && emailMatches) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
          <Breadcrumbs items={[{ label: "Aceptar Invitación" }]} />
          
          <Card className="border">
            <CardHeader className="pb-3 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl">
                    {invitation.organizationName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Has sido invitado como{" "}
                    <strong>
                      {invitation.role === "owner"
                        ? "Propietario"
                        : invitation.role === "admin"
                        ? "Administrador"
                        : "Miembro"}
                    </strong>
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Acepta esta invitación para unirte a la organización y comenzar
                  a colaborar en viajes y listas de compras compartidas.
                </p>
                <AcceptInvitationForm invitationId={invitationId} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si el usuario está logueado pero el email no coincide
  if (session && !emailMatches) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
          <Breadcrumbs items={[{ label: "Invitación" }]} />
          
          <Card className="border-2 border-warning/50">
            <CardHeader className="text-center">
              <div className="bg-warning/10 text-warning p-4 rounded-full w-fit mx-auto mb-4">
                <Mail className="h-10 w-10" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">
                Email no coincide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Esta invitación fue enviada a{" "}
                <strong className="text-foreground">{invitation.email}</strong>,
                pero estás logueado con{" "}
                <strong className="text-foreground">{userEmail}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, cierra sesión e inicia sesión con el email correcto
                para aceptar esta invitación.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild variant="outline">
                  <Link href="/organizations">Ver mis organizaciones</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si el usuario no está logueado, mostrar opciones de login/registro
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        <Breadcrumbs items={[{ label: "Aceptar Invitación" }]} />
        
        <Card className="border">
          <CardHeader className="pb-3 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl">
                  {invitation.organizationName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Has sido invitado como{" "}
                  <strong>
                    {invitation.role === "owner"
                      ? "Propietario"
                      : invitation.role === "admin"
                      ? "Administrador"
                      : "Miembro"}
                  </strong>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para aceptar esta invitación, necesitas iniciar sesión o crear una
                cuenta con el email{" "}
                <strong className="text-foreground">{invitation.email}</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/login?redirect=/invitations/${invitationId}`}>
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/register?redirect=/invitations/${invitationId}`}>
                    Crear Cuenta
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

