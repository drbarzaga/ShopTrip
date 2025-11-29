import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';
import { getTripBySlug, canUserDeleteTrip } from "@/actions/trips";
import { getTripItems } from "@/lib/trip-items";
import { getUserRoleInTripOrganization } from "@/actions/trip-items";
import { formatCurrency } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { ItemsList } from "@/components/items-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EditTripDialog } from "@/components/edit-trip-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { RefreshButton } from "@/components/refresh-button";

function formatDate(date: Date | null): string {
  if (!date) return "No establecida";
  // Usar los componentes de fecha directamente para evitar problemas de zona horaria
  const dateObj = new Date(date);
  // Extraer año, mes y día usando métodos locales para mantener la fecha original
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();
  // Crear una nueva fecha con los componentes locales para formatear
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month, day));
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
  const canDelete = await canUserDeleteTrip(session.user.id, tripData.id);

  const purchasedItems = items.filter((item) => item.purchased).length;
  const totalSpent = items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  
  // Formatear todos los precios de una vez en el servidor
  const { formatMultipleCurrencies } = await import("@/lib/format-currency");
  const itemPrices = items.map((item) => {
    const totalPrice = item.price !== null && item.quantity
      ? item.price * item.quantity
      : (item.price ?? 0);
    return totalPrice;
  });
  const itemUnitPrices = items.map((item) => item.price ?? 0);
  
  const [formattedPrices, formattedUnitPrices, formattedTotalSpent] = await Promise.all([
    formatMultipleCurrencies(itemPrices),
    formatMultipleCurrencies(itemUnitPrices),
    formatCurrency(totalSpent),
  ]);

  // Agregar los precios formateados a los items
  const itemsWithFormattedPrices = items.map((item, index) => ({
    ...item,
    formattedPrice: formattedPrices[index],
    formattedUnitPrice: formattedUnitPrices[index],
  }));

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 px-4 max-w-2xl sm:py-6 sm:px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: "Mis Viajes", href: "/trips" },
            { label: tripData.name }
          ]} 
        />
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Viajes
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex-1 min-w-0">
              {tripData.name}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <RefreshButton />
              {canEdit && (
                <EditTripDialog
                  trip={{
                    id: tripData.id,
                    name: tripData.name,
                    destination: tripData.destination,
                    startDate: tripData.startDate,
                    endDate: tripData.endDate,
                  }}
                />
              )}
              {canDelete && (
                <DeleteTripDialog
                  tripId={tripData.id}
                  tripName={tripData.name}
                />
              )}
            </div>
          </div>
          {tripData.destination && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{tripData.destination}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
            {tripData.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDate(tripData.startDate)}</span>
              </div>
            )}
            {tripData.endDate && tripData.startDate && (
              <span className="hidden sm:inline">→</span>
            )}
            {tripData.endDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDate(tripData.endDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 sm:gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Comprados</CardTitle>
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{purchasedItems} / {items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Gastado</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{formattedTotalSpent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Artículos</h2>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Aún no hay artículos. Usa el botón de abajo para agregar tu primer artículo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ItemsList items={itemsWithFormattedPrices} canEdit={canEdit} />
          )}
        </div>
      </div>
    </div>
  );
}
