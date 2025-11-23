import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getTrips } from "@/actions/trips";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
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
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Trips</h1>
          <CreateTripDialog />
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <Card className="border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm mb-4">
                No trips yet
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
                className="block"
              >
                <Card className="border hover:bg-accent transition-colors touch-manipulation">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate mb-1">
                          {trip.name}
                        </h3>
                        {trip.destination && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {trip.startDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(trip.startDate)}</span>
                            </div>
                          )}
                          {trip.endDate && trip.startDate && (
                            <span>→</span>
                          )}
                          {trip.endDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(trip.endDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 ml-3" />
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
