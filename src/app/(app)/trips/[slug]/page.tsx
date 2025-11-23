import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';
import { getTripBySlug } from "@/actions/trips";
import { getTripItems } from "@/lib/trip-items";
import { getUserRoleInTripOrganization } from "@/actions/trip-items";
import { formatCurrency } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Plus,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { TripItemCard } from "@/components/trip-item-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CreateTripItemDialog } from "@/components/create-trip-item-dialog";

function formatDate(date: Date | null): string {
  if (!date) return "No establecida";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const tripData = await getTripBySlug(slug, session.user.id);

  if (!tripData) {
    redirect("/trips");
  }

  const items = await getTripItems(tripData.id);
  
  // Obtener el rol del usuario en la organización del viaje
  const userRole = await getUserRoleInTripOrganization(session.user.id, tripData.id);
  const canEdit = userRole === "owner" || userRole === "admin";

  const purchasedItems = items.filter((item) => item.purchased).length;
  const totalSpent = items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  
  const formattedTotalSpent = await formatCurrency(totalSpent);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: "Mis Viajes", href: "/trips" },
            { label: tripData.name }
          ]} 
        />
        
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="mb-3 sm:mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Viajes
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            {tripData.name}
          </h1>
          {tripData.destination && (
            <div className="flex items-center gap-1.5 text-sm sm:text-base text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">{tripData.destination}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {tripData.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{formatDate(tripData.startDate)}</span>
              </div>
            )}
            {tripData.endDate && tripData.startDate && (
              <span className="hidden sm:inline">→</span>
            )}
            {tripData.endDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{formatDate(tripData.endDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Card className="border">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Comprados
              </CardTitle>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {purchasedItems} / {items.length}
              </p>
            </CardHeader>
          </Card>
          <Card className="border">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Gastado
              </CardTitle>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {formattedTotalSpent}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold">Artículos</h2>
            {canEdit && <CreateTripItemDialog tripId={tripData.id} />}
          </div>

          {items.length === 0 ? (
            <Card className="border">
              <CardContent className="p-6 sm:p-8 text-center">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm mb-4">
                  Aún no hay artículos
                </p>
                {canEdit && (
                  <CreateTripItemDialog 
                    tripId={tripData.id}
                    trigger={
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Primer Artículo
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <TripItemCard key={item.id} item={item} canEdit={canEdit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
