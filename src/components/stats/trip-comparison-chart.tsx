"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

interface TripExpenseData {
  tripName: string;
  totalSpent: number;
  itemCount: number;
  purchasedCount: number;
}

interface TripComparisonChartProps {
  data: TripExpenseData[];
  currency: Currency;
}

function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + "...";
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  currency: Currency;
}

function CustomTooltip({
  active,
  payload,
  currency,
}: Readonly<CustomTooltipProps>) {
  if (active && payload?.length) {
    // Buscar el payload que tenga todos los datos (puede venir de cualquier barra)
    const dataPayload = payload.find((p) => p.payload?.tripName) || payload[0];
    if (!dataPayload?.payload) return null;

    const data = dataPayload.payload;
    const avgPricePerItem =
      data.purchasedCount > 0 ? data.totalSpent / data.purchasedCount : 0;
    const purchaseRate =
      data.itemCount > 0 ? (data.purchasedCount / data.itemCount) * 100 : 0;

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="text-sm font-semibold mb-3 text-foreground">
          {data.tripName}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Gastos totales:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(data.totalSpent, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Artículos:</span>
            <span className="text-sm font-medium text-foreground">
              {data.itemCount} total ({data.purchasedCount} comprados)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Tasa de compra:
            </span>
            <span className="text-sm font-medium text-foreground">
              {purchaseRate.toFixed(1)}%
            </span>
          </div>
          {data.purchasedCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Promedio por artículo:
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(avgPricePerItem, currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function TripComparisonChart({
  data,
  currency,
}: Readonly<TripComparisonChartProps>) {
  // Datos de prueba cuando no hay datos reales
  const mockData: TripExpenseData[] = [
    {
      tripName: "Viaje a París - Vacaciones de Verano",
      totalSpent: currency === "USD" ? 125 : 12500,
      itemCount: 45,
      purchasedCount: 38,
    },
    {
      tripName: "Compras de Supermercado Semanal",
      totalSpent: currency === "USD" ? 85 : 8500,
      itemCount: 32,
      purchasedCount: 32,
    },
    {
      tripName: "Viaje a Nueva York - Negocios",
      totalSpent: currency === "USD" ? 189 : 18900,
      itemCount: 28,
      purchasedCount: 22,
    },
    {
      tripName: "Compras Navideñas 2024",
      totalSpent: currency === "USD" ? 152 : 15200,
      itemCount: 67,
      purchasedCount: 54,
    },
    {
      tripName: "Viaje a Tokio - Aventura",
      totalSpent: currency === "USD" ? 223 : 22300,
      itemCount: 41,
      purchasedCount: 35,
    },
    {
      tripName: "Compras para Fiesta de Cumpleaños",
      totalSpent: currency === "USD" ? 68 : 6800,
      itemCount: 24,
      purchasedCount: 24,
    },
    {
      tripName: "Viaje a Barcelona - Fin de Semana",
      totalSpent: currency === "USD" ? 112 : 11200,
      itemCount: 19,
      purchasedCount: 15,
    },
    {
      tripName: "Compras de Electrodomésticos",
      totalSpent: currency === "USD" ? 345 : 34500,
      itemCount: 12,
      purchasedCount: 10,
    },
  ];

  // Usar datos de prueba si no hay datos reales
  const displayData = data.length > 0 ? data : mockData;

  const chartData = displayData.map((item) => ({
    ...item,
    tripNameShort: truncateName(item.tripName),
  }));

  // Calcular estadísticas resumidas
  const totalSpent = chartData.reduce((sum, item) => sum + item.totalSpent, 0);
  const totalItems = chartData.reduce((sum, item) => sum + item.itemCount, 0);
  const totalPurchased = chartData.reduce(
    (sum, item) => sum + item.purchasedCount,
    0
  );
  const avgSpentPerTrip =
    chartData.length > 0 ? totalSpent / chartData.length : 0;
  const overallPurchaseRate =
    totalItems > 0 ? (totalPurchased / totalItems) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación de Viajes</CardTitle>
        <CardDescription>
          {data.length > 0
            ? `Top ${chartData.length} viajes por gastos totales`
            : "Datos de ejemplo - Comparación de viajes"}
        </CardDescription>
        {chartData.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Gastos totales
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(totalSpent, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Promedio por viaje
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(avgSpentPerTrip, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Artículos totales
              </p>
              <p className="text-sm font-semibold text-foreground">
                {totalItems} ({totalPurchased} comprados)
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Tasa de compra
              </p>
              <p className="text-sm font-semibold text-foreground">
                {overallPurchaseRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="tripNameShort"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <YAxis
                yAxisId="left"
                className="text-xs"
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value.toString();
                }}
                label={{
                  value: "Gastos",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "var(--foreground)",
                    fontSize: 12,
                  },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                label={{
                  value: "Artículos",
                  angle: 90,
                  position: "insideRight",
                  style: {
                    textAnchor: "middle",
                    fill: "var(--foreground)",
                    fontSize: 12,
                  },
                }}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend
                wrapperStyle={{
                  color: "var(--foreground)",
                  fontSize: "12px",
                }}
                iconType="square"
              />
              <Bar
                yAxisId="left"
                dataKey="totalSpent"
                fill="hsl(var(--primary))"
                name="Gastos Totales"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="itemCount"
                fill="hsl(var(--chart-2))"
                name="Total Artículos"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
