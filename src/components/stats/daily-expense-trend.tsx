"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/settings";

interface DailyExpenseData {
  date: string;
  total: number;
  itemCount: number;
}

interface DailyExpenseTrendProps {
  data: DailyExpenseData[];
  currency: Currency;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function DailyExpenseTrend({
  data,
  currency,
}: DailyExpenseTrendProps) {
  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-2">{data.dateLabel}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Gastos:</span>{" "}
            {formatCurrency(data.total, currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Artículos:</span> {data.itemCount}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia Diaria</CardTitle>
        <CardDescription>
          Gastos diarios en los últimos {data.length} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="dateLabel"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
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
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

