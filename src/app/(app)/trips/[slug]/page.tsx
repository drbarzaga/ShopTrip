import React from "react";

interface TripPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { slug } = await params;

  return <div>TripPage: {slug}</div>;
}
