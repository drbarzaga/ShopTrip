import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUserPreferredCurrency } from "@/actions/settings";
import { CurrencySelector } from "@/components/currency-selector";
import { ProfileSection } from "@/components/profile-section";
import { DeleteAccountSection } from "@/components/delete-account-section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const preferredCurrency = await getUserPreferredCurrency();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Configuración" }]} />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 sm:h-7 sm:w-7" />
            Configuración
          </h1>
        </div>

        {/* Settings Cards */}
        <div className="space-y-4">
          {/* Profile Section */}
          <ProfileSection
            userName={session.user.name}
            userEmail={session.user.email || null}
            userImage={session.user.image || null}
          />

          {/* Currency Preferences */}
          <Card className="border">
            <CardHeader>
              <CardTitle>Preferencias de Moneda</CardTitle>
              <CardDescription>
                Selecciona la moneda en la que deseas ver los precios. Los
                valores se convertirán automáticamente según el tipo de cambio
                vigente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencySelector initialCurrency={preferredCurrency} />
            </CardContent>
          </Card>

          {/* Delete Account */}
          <DeleteAccountSection userEmail={session.user.email || ""} />
        </div>
      </div>
    </div>
  );
}
