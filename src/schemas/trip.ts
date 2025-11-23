import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100, "Trip name is too long"),
  destination: z.string().max(200, "Destination is too long").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

