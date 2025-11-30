"use client";

import { Badge } from "@/components/ui/badge";

interface TripDaysRemainingBadgeProps {
  startDate: Date | null;
}

function getDaysUntilTrip(startDate: Date | null): number | null {
  if (!startDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tripDate = new Date(startDate);
  tripDate.setHours(0, 0, 0, 0);
  
  const diffTime = tripDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

function formatDaysRemaining(days: number): string {
  if (days < 0) {
    return `Hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
  }
  if (days === 0) {
    return "Hoy";
  }
  if (days === 1) {
    return "Mañana";
  }
  return `${days} días restantes`;
}

export function TripDaysRemainingBadge({ startDate }: TripDaysRemainingBadgeProps) {
  const daysRemaining = getDaysUntilTrip(startDate);
  
  if (daysRemaining === null) {
    return null;
  }
  
  return (
    <Badge
      variant="outline"
      className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
        daysRemaining < 0
          ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
          : daysRemaining === 0
            ? "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
            : daysRemaining <= 7
              ? "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
              : "border-primary/30 bg-primary/10 text-primary"
      }`}
    >
      {formatDaysRemaining(daysRemaining)}
    </Badge>
  );
}

