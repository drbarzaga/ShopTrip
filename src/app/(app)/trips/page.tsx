import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getTrips } from "@/actions/trips";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, Calendar, Plane } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date | null): string {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function TripsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const trips = await getTrips(session.user.id);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">My Trips</h1>
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
              <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first trip to start planning your adventure
              </p>
              <CreateTripDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.slug}`}
                className="block group"
              >
                <Card className="border hover:border-primary/50 transition-all hover:shadow-md touch-manipulation active:scale-[0.98]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icono decorativo */}
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm group-hover:bg-primary/20 transition-colors"></div>
                        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                            {trip.name}
                          </h3>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        {trip.destination && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </div>
                        )}
                        
                        {(trip.startDate || trip.endDate) && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                            {trip.startDate && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="whitespace-nowrap">{formatDate(trip.startDate)}</span>
                              </div>
                            )}
                            {trip.endDate && trip.startDate && (
                              <span className="hidden sm:inline">→</span>
                            )}
                            {trip.endDate && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="whitespace-nowrap">{formatDate(trip.endDate)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
