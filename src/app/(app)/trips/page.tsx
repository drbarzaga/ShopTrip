import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';
import { getTrips } from "@/actions/trips";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TripCard } from "@/components/trip-card";

export default async function TripsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const trips = await getTrips(session.user.id);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 px-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl sm:py-6 sm:px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Mis Viajes" }]} />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis Viajes</h1>
            <CreateTripDialog />
          </div>
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aún no hay viajes</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Crea tu primer viaje para comenzar a planificar tu aventura
              </p>
              <CreateTripDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
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
  );
}
