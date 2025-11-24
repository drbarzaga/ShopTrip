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
import { TripCard } from "@/components/trip-card";
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
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Resumen de tus viajes y compras
          </p>
        </div>

        {/* Key Stats - Elegant Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-5 mb-4 sm:mb-8">
          {/* Total Gastado */}
          <Card className="border border-green-200/50 dark:border-green-800/30 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Gastado
                </CardTitle>
                <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                {formattedTotalSpent}
              </p>
              {stats.totalItems > 0 && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  {stats.purchasedItems} artículos comprados
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Comprados */}
          <Card className="border border-primary/20 dark:border-primary/30 bg-gradient-to-br from-primary/5 to-purple-50/30 dark:from-primary/10 dark:to-purple-950/10 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Comprados
                </CardTitle>
                <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary">
                {stats.purchasedItems}
              </p>
              {stats.totalItems > 0 && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  de {stats.totalItems} totales
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Total Viajes */}
          <Card className="border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Viajes
                </CardTitle>
                <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalTrips}
              </p>
              {stats.totalTrips > 0 && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  {stats.completedTrips} completados
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Viajes Activos */}
          <Card className="border border-orange-200/50 dark:border-orange-800/30 bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Viajes Activos
                </CardTitle>
                <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.activeTrips}
              </p>
              {stats.activeTrips > 0 && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  En progreso
                </p>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Progress Bar */}
        <DashboardProgress
          purchasedItems={stats.purchasedItems}
          totalItems={stats.totalItems}
        />

        {/* Recent Trips - Main Focus */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Viajes Recientes</h2>
              <p className="text-sm text-muted-foreground">
                Tus viajes más recientes y actualizados
              </p>
            </div>
            <Link href="/trips" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 text-sm"
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
              {recentTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={{
                    id: trip.id,
                    name: trip.name,
                    slug: trip.slug,
                    destination: trip.destination,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
