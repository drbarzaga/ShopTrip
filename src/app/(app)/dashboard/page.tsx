import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getRecentTrips } from "@/lib/trips";
import { getUserPreferredCurrency } from "@/actions/settings";
import { convertCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { DashboardProgress } from "@/components/dashboard-progress";
import { DashboardStatsCards } from "@/components/dashboard-stats-cards";
import {
  ArrowRight,
  Plane,
} from "lucide-react";
import { DashboardTripDialog } from "@/components/dashboard-trip-dialog";
import { TripsList } from "@/components/trips-list";
import Link from "next/link";
import { TrackDashboardView } from "./track-view";
import { getMonthlyExpenseHistory } from "@/lib/stats/expense-history";
import { MonthlyExpenseChart } from "@/components/stats/monthly-expense-chart";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);
  const recentTrips = await getRecentTrips(session.user.id, 5);
  const preferredCurrency = await getUserPreferredCurrency();
  
  // Obtener datos para gráfico
  const monthlyExpenses = await getMonthlyExpenseHistory(session.user.id, 6);
  
  // Convertir monedas si es necesario
  let convertedMonthlyExpenses = monthlyExpenses;
  if (preferredCurrency === "USD") {
    convertedMonthlyExpenses = await Promise.all(
      monthlyExpenses.map(async (expense) => {
        try {
          const converted = await convertCurrency(expense.total, "UYU", "USD");
          return { ...expense, total: converted };
        } catch (error) {
          console.error("Error converting currency:", error);
          return expense;
        }
      })
    );
  }
  
  // Convertir totalSpent si es necesario
  let convertedTotalSpent = stats.totalSpent;
  if (preferredCurrency === "USD") {
    try {
      convertedTotalSpent = await convertCurrency(stats.totalSpent, "UYU", "USD");
    } catch (error) {
      console.error("Error converting currency:", error);
      // Si falla la conversión, usar el valor original
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <TrackDashboardView />
      <div className="container mx-auto py-4 px-4 max-w-4xl lg:max-w-6xl xl:max-w-7xl sm:py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Resumen de tus viajes y compras
          </p>
        </div>

        {/* Key Stats */}
        <DashboardStatsCards 
          stats={{
            ...stats,
            totalSpent: convertedTotalSpent,
          }}
          currency={preferredCurrency}
        />

        {/* Progress Bar */}
        <DashboardProgress
          purchasedItems={stats.purchasedItems}
          totalItems={stats.totalItems}
        />

        {/* Compact Chart */}
        {convertedMonthlyExpenses.length > 0 && (
          <div className="mb-8">
            <MonthlyExpenseChart
              data={convertedMonthlyExpenses}
              currency={preferredCurrency}
            />
          </div>
        )}

        {/* Recent Trips Section */}
        <div className="space-y-6 mt-8 pt-8 border-t border-border">
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

          <TripsList
            trips={recentTrips.map((trip) => ({
              id: trip.id,
              name: trip.name,
              slug: trip.slug,
              destination: trip.destination,
              startDate: trip.startDate,
              endDate: trip.endDate,
            }))}
            emptyState={{
              icon: <Plane className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />,
              title: "Aún no hay viajes",
              description: "Comienza a organizar tus listas de compras creando tu primer viaje. Agrega artículos, rastrea compras y mantente organizado!",
              action: <DashboardTripDialog />,
            }}
            storageKey="dashboard"
          />
        </div>
      </div>
    </div>
  );
}
