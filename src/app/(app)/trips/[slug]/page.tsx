import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getTripBySlug } from "@/actions/trips";
import { getTripItems } from "@/lib/trip-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Plus, CheckCircle2, ShoppingCart } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date | null): string {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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

  const purchasedItems = items.filter((item) => item.purchased).length;
  const totalSpent = items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trips
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-2">{tripData.name}</h1>
          {tripData.destination && (
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{tripData.destination}</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {tripData.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(tripData.startDate)}</span>
              </div>
            )}
            {tripData.endDate && tripData.startDate && <span>→</span>}
            {tripData.endDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(tripData.endDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Purchased
              </CardTitle>
              <p className="text-2xl font-bold text-primary">
                {purchasedItems} / {items.length}
              </p>
            </CardHeader>
          </Card>
          <Card className="border">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSpent)}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <Card className="border">
              <CardContent className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm mb-4">
                  No items yet
                </p>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`border ${
                    item.purchased
                      ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.purchased && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                          )}
                          <h3
                            className={`font-medium ${
                              item.purchased ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.name}
                          </h3>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {item.price && (
                            <span>
                              {formatCurrency(item.price)}
                              {item.quantity && item.quantity > 1 && (
                                <span> × {item.quantity}</span>
                              )}
                            </span>
                          )}
                          {item.price && item.quantity && (
                            <span className="font-semibold">
                              Total:{" "}
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

