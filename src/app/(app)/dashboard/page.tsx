import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getRecentTrips } from "@/lib/trips";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardProgress } from "@/components/dashboard-progress";
import {
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Calendar,
  MapPin,
  TrendingUp,
  Plane,
  Sparkles,
} from "lucide-react";
import { DashboardTripDialog } from "@/components/dashboard-trip-dialog";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);
  const recentTrips = await getRecentTrips(session.user.id, 5);
  const formattedTotalSpent = await formatCurrency(stats.totalSpent);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Card className="border">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3 w-3" />
                Total Gastado
              </CardTitle>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {formattedTotalSpent}
              </p>
            </CardHeader>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Comprados
              </CardTitle>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {stats.purchasedItems}
              </p>
            </CardHeader>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Total Viajes
              </CardTitle>
              <p className="text-xl sm:text-2xl font-bold">
                {stats.totalTrips}
              </p>
            </CardHeader>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                Viajes Activos
              </CardTitle>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.activeTrips}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Progress Bar */}
        <DashboardProgress
          purchasedItems={stats.purchasedItems}
          totalItems={stats.totalItems}
        />

        {/* Recent Trips - Main Focus */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold">Viajes Recientes</h2>
            <Link href="/trips" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-10 text-sm"
              >
                {recentTrips.length > 0 ? "Ver Todos" : "Mis Viajes"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-6 sm:p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="relative bg-primary/5 rounded-full p-4 sm:p-6">
                      <Plane className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Aún no hay viajes
                </h3>
                <p className="text-muted-foreground text-sm mb-4 sm:mb-6 max-w-sm mx-auto px-2">
                  Comienza a organizar tus listas de compras creando tu primer
                  viaje. Agrega artículos, rastrea compras y mantente organizado!
                </p>
                <DashboardTripDialog />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentTrips.map(
                (trip: {
                  id: string;
                  name: string;
                  slug: string;
                  destination: string | null;
                }) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.slug}`}
                    className="block group"
                  >
                    <Card className="border hover:border-primary/50 transition-all hover:shadow-md touch-manipulation active:scale-[0.98]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Icono con fondo decorativo */}
                          <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm group-hover:bg-primary/20 transition-colors"></div>
                            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg">
                              <Plane className="h-5 w-5 text-primary" />
                            </div>
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                                {trip.name}
                              </h3>
                              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            {trip.destination && (
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                  {trip.destination}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
