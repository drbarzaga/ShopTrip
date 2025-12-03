"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";
import { TrendingUp } from "lucide-react";

interface MonthlyExpenseData {
  month: string;
  total: number;
  tripCount: number;
}

interface MonthlyExpenseChartProps {
  data: MonthlyExpenseData[];
  currency: Currency;
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("es-ES", { month: "short" });
}

export function MonthlyExpenseChart({
  data,
  currency,
}: MonthlyExpenseChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  // Calcular tendencia
  const total = chartData.reduce((sum, item) => sum + item.total, 0);
  const avg = total / chartData.length;
  const lastValue = chartData[chartData.length - 1]?.total || 0;
  const prevValue = chartData[chartData.length - 2]?.total || 0;
  const trend = lastValue > prevValue ? "up" : lastValue < prevValue ? "down" : "stable";
  const trendPercent = prevValue > 0 ? Math.abs(((lastValue - prevValue) / prevValue) * 100).toFixed(1) : "0";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]) {
      const value = payload[0].value || 0;
      const monthLabel = payload[0].payload?.monthLabel || "";
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-lg px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {monthLabel}
          </p>
          <p className="text-sm font-semibold">
            {formatCurrency(value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-none">Gastos Mensuales</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Promedio: {formatCurrency(avg, currency)}
                </p>
              </div>
            </div>
            {trend !== "stable" && (
              <div className={`text-right ${trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                <div className="text-xs font-medium">
                  {trend === "up" ? "↑" : "↓"} {trendPercent}%
                </div>
                <div className="text-xs text-muted-foreground">vs anterior</div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="h-[160px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -10, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
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
                <XAxis
                  dataKey="monthLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={45}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}k`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#colorExpense)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

