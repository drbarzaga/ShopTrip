import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';
import { getTrips } from "@/actions/trips";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TripsList } from "@/components/trips-list";

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
        <TripsList
          trips={trips.map((trip) => ({
            id: trip.id,
            name: trip.name,
            slug: trip.slug,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
          }))}
          emptyState={{
            icon: <MapPin className="h-12 w-12 text-muted-foreground mb-4" />,
            title: "Aún no hay viajes",
            description: "Crea tu primer viaje para comenzar a planificar tu aventura",
            action: <CreateTripDialog />,
          }}
          storageKey="trips-page"
        />
      </div>
    </div>
  );
}
