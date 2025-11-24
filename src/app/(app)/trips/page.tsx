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
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Mis Viajes" }]} />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Mis Viajes</h1>
            <div className="w-full sm:w-auto">
              <CreateTripDialog />
            </div>
          </div>
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mx-auto mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aún no hay viajes</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Crea tu primer viaje para comenzar a planificar tu aventura
              </p>
              <CreateTripDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
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
