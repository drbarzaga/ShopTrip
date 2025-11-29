import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUserPreferredCurrency } from "@/actions/settings";
import { CurrencySelector } from "@/components/currency-selector";
import { ProfileSection } from "@/components/profile-section";
import { DeleteAccountSection } from "@/components/delete-account-section";
import { AppearanceSettings } from "@/components/appearance-settings";
import { NotificationSettings } from "@/components/notification-settings";
import { getNotificationPreferences } from "@/actions/notification-preferences";
import { Settings } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const preferredCurrency = await getUserPreferredCurrency();
  const notificationPrefs = await getNotificationPreferences();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 max-w-5xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Configuración" }]} />

        {/* Header minimalista y elegante */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-primary/30 dark:via-primary/20 dark:to-primary/10 border border-primary/20">
              <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Configuración
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
                Personaliza tu experiencia y gestiona tu cuenta
              </p>
            </div>
          </div>
        </div>

        {/* Layout principal con mejor espaciado */}
        <div className="space-y-8 sm:space-y-10">
          {/* Profile Section */}
          <ProfileSection
            userName={session.user.name}
            userEmail={session.user.email || null}
            userImage={session.user.image || null}
          />

          {/* Preferencias - Diseño más limpio */}
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1.5">Preferencias</h2>
              <p className="text-sm text-muted-foreground">
                Personaliza cómo se ve y se comporta la aplicación
              </p>
            </div>
            
            <div className="space-y-5">
              <AppearanceSettings />
              <NotificationSettings initialPreferences={notificationPrefs} />
              
              {/* Currency - Diseño simplificado */}
              <div className="rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold mb-1">Moneda</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecciona la moneda para mostrar los precios
                    </p>
                    <CurrencySelector initialCurrency={preferredCurrency} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cuenta - Diseño más limpio */}
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1.5">Cuenta</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona tu cuenta y datos personales
              </p>
            </div>
            
            <DeleteAccountSection userEmail={session.user.email || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
