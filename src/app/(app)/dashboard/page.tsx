import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getRecentTrips } from "@/lib/trips";
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
import { CreateTripDialog } from "@/components/create-trip-dialog";
import Link from "next/link";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);
  const recentTrips = await getRecentTrips(session.user.id, 5);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3 w-3" />
                Total Spent
              </CardTitle>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSpent)}
              </p>
            </CardHeader>
          </Card>

          <Card className="border">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Purchased
              </CardTitle>
              <p className="text-2xl font-bold text-primary">
                {stats.purchasedItems}
              </p>
            </CardHeader>
          </Card>

          <Card className="border">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Total Trips
              </CardTitle>
              <p className="text-2xl font-bold">{stats.totalTrips}</p>
            </CardHeader>
          </Card>

          <Card className="border">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                Active Trips
              </CardTitle>
              <p className="text-2xl font-bold text-blue-600">
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Trips</h2>
            <Link href="/trips">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                {recentTrips.length > 0 ? "View All" : "My Trips"}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="relative bg-primary/5 rounded-full p-6">
                      <Plane className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  Start organizing your shopping lists by creating your first
                  trip. Add items, track purchases, and stay organized!
                </p>
                <CreateTripDialog />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
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
                    className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors touch-manipulation"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base truncate">
                          {trip.name}
                        </p>
                        {trip.destination && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {trip.destination}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 ml-3" />
                    </div>
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
