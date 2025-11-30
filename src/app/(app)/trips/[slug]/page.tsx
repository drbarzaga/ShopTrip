import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSession();

  if (!session) {
    return {
      title: "Shop Trip",
    };
  }

  try {
    const tripData = await getTripBySlug(slug, session.user.id);

    if (!tripData) {
      return {
        title: "Shop Trip",
      };
    }

    const title = `${tripData.name} | Shop Trip`;
    const description = tripData.destination
      ? `Viaje a ${tripData.destination} - Organiza tus compras con Shop Trip`
      : `Organiza las compras para tu viaje ${tripData.name}`;

    const ogImageUrl = `/api/og?title=${encodeURIComponent(tripData.name)}&description=${encodeURIComponent(description)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/trips/${slug}`,
        siteName: "Shop Trip",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: tripData.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Shop Trip",
    };
  }
}
import { getTripBySlug, canUserDeleteTrip } from "@/actions/trips";
import { getTripItems } from "@/lib/trip-items";
import { getUserRoleInTripOrganization } from "@/actions/trip-items";
import { formatCurrency } from "@/lib/format-currency";
import { getUserPreferredCurrency } from "@/actions/settings";
import { convertCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { ItemsList } from "@/components/items-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EditTripDialog } from "@/components/edit-trip-dialog";
import { DeleteTripDialog } from "@/components/delete-trip-dialog";
import { RefreshButton } from "@/components/refresh-button";
import { TripStatsCards } from "@/components/trip-stats-cards";
import { CreateTripItemDialog } from "@/components/create-trip-item-dialog";
import { TripDaysRemainingBadge } from "@/components/trip-days-remaining-badge";
import { TrackTripView } from "./track-view";
import { AISuggestionsBanner } from "@/components/ai-suggestions-banner";
import { getTripSuggestionsBySlug } from "@/actions/ai/suggestions";

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
  const userRole = await getUserRoleInTripOrganization(
    session.user.id,
    tripData.id
  );
  const canEdit = userRole === "owner" || userRole === "admin";
  const canDelete = await canUserDeleteTrip(session.user.id, tripData.id);

  // Obtener sugerencias de IA para este viaje
  const suggestions = await getTripSuggestionsBySlug(slug);

  const purchasedItems = items.filter((item) => item.purchased).length;
  const totalSpent = items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  // Obtener moneda preferida y convertir si es necesario
  const preferredCurrency = await getUserPreferredCurrency();
  let convertedTotalSpent = totalSpent;
  if (preferredCurrency === "USD") {
    try {
      convertedTotalSpent = await convertCurrency(totalSpent, "UYU", "USD");
    } catch (error) {
      console.error("Error converting currency:", error);
    }
  }

  // Formatear todos los precios de una vez en el servidor
  const { formatMultipleCurrencies } = await import("@/lib/format-currency");
  const itemPrices = items.map((item) => {
    const totalPrice =
      item.price !== null && item.quantity
        ? item.price * item.quantity
        : (item.price ?? 0);
    return totalPrice;
  });
  const itemUnitPrices = items.map((item) => item.price ?? 0);

  const [formattedPrices, formattedUnitPrices] = await Promise.all([
    formatMultipleCurrencies(itemPrices),
    formatMultipleCurrencies(itemUnitPrices),
  ]);

  // Agregar los precios formateados a los items
  const itemsWithFormattedPrices = items.map((item, index) => ({
    ...item,
    formattedPrice: formattedPrices[index],
    formattedUnitPrice: formattedUnitPrices[index],
  }));

  return (
    <div className="min-h-screen bg-background pb-16">
      <TrackTripView tripId={tripData.id} tripName={tripData.name} />
      <div className="container mx-auto py-4 px-4 max-w-2xl sm:py-6 sm:px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Mis Viajes", href: "/trips" },
            { label: tripData.name },
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
          {/* Primera línea: Ubicación y Días restantes */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {tripData.destination ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{tripData.destination}</span>
              </div>
            ) : (
              <div />
            )}
            {/* Días restantes - derecha en móvil */}
            <div className="sm:hidden">
              <TripDaysRemainingBadge startDate={tripData.startDate} />
            </div>
          </div>
          {/* Segunda línea: Fechas y Días restantes (web) */}
          <div className="flex items-center justify-between sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-muted-foreground">
            {/* Fechas - en móvil: inicio izquierda, fin derecha */}
            <div className="flex items-center justify-between sm:flex-row sm:items-center sm:gap-4 sm:justify-start flex-1">
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
            {/* Días restantes - alineado a la derecha en web */}
            <div className="hidden sm:block">
              <TripDaysRemainingBadge startDate={tripData.startDate} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <TripStatsCards
          purchasedItems={purchasedItems}
          totalItems={items.length}
          totalSpent={convertedTotalSpent}
          currency={preferredCurrency}
        />

        {/* AI Suggestions Banner - Solo se muestra si hay destino y fecha definidos */}
        {suggestions.length > 0 &&
          tripData.destination &&
          tripData.startDate && (
            <AISuggestionsBanner suggestions={suggestions} />
          )}

        {/* Items List */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Artículos
            </h2>
            {canEdit && (
              <CreateTripItemDialog
                tripId={tripData.id}
                className="hidden md:inline-flex"
              />
            )}
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Aún no hay artículos. Agrega tu primer artículo para comenzar.
                </p>
                {canEdit && (
                  <CreateTripItemDialog
                    tripId={tripData.id}
                    className="hidden md:inline-flex"
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <ItemsList
              items={itemsWithFormattedPrices}
              tripId={tripData.id}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
