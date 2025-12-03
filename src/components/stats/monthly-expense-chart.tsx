"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Plane } from "lucide-react";

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

  // Calcular estadísticas
  const total = chartData.reduce((sum, item) => sum + item.total, 0);
  const avg = chartData.length > 0 ? total / chartData.length : 0;
  const lastValue = chartData[chartData.length - 1]?.total || 0;
  const prevValue = chartData[chartData.length - 2]?.total || 0;
  const trend = lastValue > prevValue ? "up" : lastValue < prevValue ? "down" : "stable";
  const trendPercent = prevValue > 0 ? Math.abs(((lastValue - prevValue) / prevValue) * 100).toFixed(1) : "0";
  
  // Encontrar mes con más y menos gastos
  const maxMonth = chartData.reduce((max, item) => 
    item.total > max.total ? item : max, chartData[0] || { total: 0, monthLabel: "" }
  );
  const minMonth = chartData.reduce((min, item) => 
    item.total < min.total && item.total > 0 ? item : min, chartData[0] || { total: 0, monthLabel: "" }
  );
  
  // Total de viajes en el período
  const totalTrips = chartData.reduce((sum, item) => sum + item.tripCount, 0);
  const avgTripsPerMonth = chartData.length > 0 ? totalTrips / chartData.length : 0;

  interface CustomTooltipProps extends TooltipProps<number, string> {
    currency: Currency;
  }

  function CustomTooltip({ active, payload, currency }: CustomTooltipProps) {
    if (active && payload?.length && payload[0]?.payload) {
      const data = payload[0].payload;
      const monthLabel = data.monthLabel || "";
      const total = data.total || 0;
      const tripCount = data.tripCount || 0;
      const avgPerTrip = tripCount > 0 ? total / tripCount : 0;
      
      return (
        <div className="bg-background/98 backdrop-blur-md border border-border/50 rounded-md shadow-lg px-3 py-2 min-w-[170px] ring-1 ring-border/50">
          <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border/50">
            <Calendar className="h-3 w-3 text-primary" />
            <p className="text-xs font-semibold text-foreground">
              {monthLabel}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-2.5 w-2.5" />
                Gastos totales
              </span>
              <span className="text-xs font-bold text-foreground">
                {formatCurrency(total, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Plane className="h-2.5 w-2.5" />
                Viajes
              </span>
              <span className="text-xs font-semibold text-foreground">
                {tripCount}
              </span>
            </div>
            {tripCount > 0 && (
              <div className="flex justify-between items-center pt-1.5 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Promedio por viaje</span>
                <span className="text-xs font-semibold text-primary">
                  {formatCurrency(avgPerTrip, currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="space-y-2.5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight text-foreground">Gastos Mensuales</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span>Promedio:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(avg, currency)}</span>
                  </p>
                </div>
              </div>
              {trend !== "stable" && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  trend === "up" 
                    ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}>
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <div>
                    <div className="text-xs font-bold leading-tight">{trendPercent}%</div>
                    <div className="text-[9px] opacity-75 leading-tight">vs anterior</div>
                  </div>
                </div>
              )}
              {trend === "stable" && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="text-xs font-bold text-muted-foreground leading-tight">0%</div>
                    <div className="text-[9px] text-muted-foreground opacity-75 leading-tight">sin cambio</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50">
              <div className="p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">
                  Total período
                </p>
                <p className="text-xs font-bold text-foreground">
                  {formatCurrency(total, currency)}
                </p>
              </div>
              <div className="p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1 font-medium flex items-center gap-1">
                  <Plane className="h-2 w-2" />
                  Viajes totales
                </p>
                <p className="text-xs font-bold text-foreground">
                  {totalTrips}
                  <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                    ({avgTripsPerMonth.toFixed(1)}/mes)
                  </span>
                </p>
              </div>
              {maxMonth.total > 0 && (
                <div className="p-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">
                    Mes máximo
                  </p>
                  <p className="text-[10px] font-semibold text-foreground">
                    {maxMonth.monthLabel}
                  </p>
                  <p className="text-xs font-bold text-primary">
                    {formatCurrency(maxMonth.total, currency)}
                  </p>
                </div>
              )}
              {minMonth.total > 0 && minMonth.total !== maxMonth.total && (
                <div className="p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">
                    Mes mínimo
                  </p>
                  <p className="text-[10px] font-semibold text-foreground">
                    {minMonth.monthLabel}
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {formatCurrency(minMonth.total, currency)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[160px] -mx-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -8, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="50%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="monthLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 10, 
                    fill: "var(--foreground)", 
                    fontWeight: 500
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 10, 
                    fill: "var(--foreground)",
                    fontWeight: 500
                  }}
                  width={45}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}k`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <ReferenceLine
                  y={avg}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  label={{
                    value: "Promedio",
                    position: "right",
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 8,
                    fontWeight: 500,
                    offset: 5,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorExpense)"
                  dot={false}
                  activeDot={{ 
                    r: 5, 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 2, 
                    stroke: "hsl(var(--background))",
                    className: "drop-shadow-md"
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

