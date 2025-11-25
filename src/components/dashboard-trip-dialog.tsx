"use client";

import { useRouter } from "next/navigation";
import { CreateTripDialog } from "./create-trip-dialog";

export function DashboardTripDialog() {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return <CreateTripDialog onSuccess={handleSuccess} redirectOnSuccess={false} />;
}




