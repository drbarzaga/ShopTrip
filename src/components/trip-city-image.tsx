"use client";

import Image from "next/image";
import { useCityImage } from "@/hooks/use-city-image";
import { cn } from "@/lib/utils";

interface TripCityImageProps {
  destination: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function TripCityImage({
  destination,
  size = "md",
  className,
}: TripCityImageProps) {
  const { imageUrl, isLoading } = useCityImage(destination);

  if (!destination || (!imageUrl && !isLoading)) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full overflow-hidden border-2 border-border bg-muted",
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt={destination}
          fill
          className="object-cover"
          sizes={`${size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}`}
        />
      ) : null}
    </div>
  );
}

