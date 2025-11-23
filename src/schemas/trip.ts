import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(1, "El nombre del viaje es requerido").max(100, "El nombre del viaje es demasiado largo"),
  destination: z.string().max(200, "El destino es demasiado largo").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;


