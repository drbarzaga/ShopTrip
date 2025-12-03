"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/settings";

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

export function TripComparisonChart({
  data,
  currency,
}: TripComparisonChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    tripNameShort: truncateName(item.tripName),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-2">{data.tripName}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Gastos:</span>{" "}
            {formatCurrency(data.totalSpent, currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Artículos:</span> {data.itemCount} (
            {data.purchasedCount} comprados)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación de Viajes</CardTitle>
        <CardDescription>
          Top {data.length} viajes por gastos totales
        </CardDescription>
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
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="totalSpent"
                fill="hsl(var(--primary))"
                name="Gastos Totales"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

