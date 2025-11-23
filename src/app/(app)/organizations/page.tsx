import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUserOrganizations } from "@/actions/organizations";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, UserPlus } from "lucide-react";

export default async function OrganizationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(session.user.id);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <CreateOrganizationDialog />
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <Card className="border-2 border-dashed hover:border-solid transition-colors p-12 text-center">
            <div className="bg-primary/10 text-primary p-4 rounded-full w-fit mx-auto mb-6 shadow-lg shadow-primary/20">
              <Building2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create an organization to start collaborating on trips with others.
            </p>
            <CreateOrganizationDialog />
          </Card>
        ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <Card key={org.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Role: {org.role || "member"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <InviteMemberDialog
                      organizationId={org.id}
                      organizationName={org.name}
                      trigger={
                        <Button variant="outline" size="sm">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite Member
                        </Button>
                      }
                    />
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

