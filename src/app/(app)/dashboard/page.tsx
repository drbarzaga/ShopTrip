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
      <div className="container mx-auto py-4 px-4 max-w-4xl sm:py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Resumen de tus viajes y compras
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Gastado */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Gastado</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{formattedTotalSpent}</div>
              {stats.totalItems > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.purchasedItems} artículos comprados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Comprados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Comprados</CardTitle>
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.purchasedItems}</div>
              {stats.totalItems > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  de {stats.totalItems} totales
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Viajes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Viajes</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalTrips}</div>
              {stats.totalTrips > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedTrips} completados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Viajes Activos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Viajes Activos</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.activeTrips}</div>
              {stats.activeTrips > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  En progreso
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <DashboardProgress
          purchasedItems={stats.purchasedItems}
          totalItems={stats.totalItems}
        />

        {/* Recent Trips */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Viajes Recientes</h2>
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
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <Plane className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Aún no hay viajes</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md">
                  Comienza a organizar tus listas de compras creando tu primer
                  viaje. Agrega artículos, rastrea compras y mantente organizado!
                </p>
                <DashboardTripDialog />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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
