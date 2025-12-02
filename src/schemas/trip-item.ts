import { z } from "zod";

export const createTripItemSchema = z.object({
  name: z.string().min(1, "El nombre del artículo es requerido").max(200, "El nombre es demasiado largo"),
  description: z.string().max(500, "La descripción es demasiado larga").optional(),
  price: z.string().optional().transform((val) => {
    if (!val || val === "") return null;
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? null : num;
  }),
  quantity: z.string().optional().transform((val) => {
    if (!val || val === "") return 1;
    const num = parseInt(val, 10);
    return isNaN(num) || num < 1 ? 1 : num;
  }),
});

export type CreateTripItemInput = z.infer<typeof createTripItemSchema>;







