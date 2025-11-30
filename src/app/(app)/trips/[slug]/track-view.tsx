"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

interface TrackTripViewProps {
  tripId: string;
  tripName: string;
}

export function TrackTripView({ tripId, tripName }: TrackTripViewProps) {
  useEffect(() => {
    analytics.viewTrip(tripId, tripName);
  }, [tripId, tripName]);

  return null;
}

