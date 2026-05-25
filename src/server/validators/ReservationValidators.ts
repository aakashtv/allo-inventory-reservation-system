import { z } from "zod";

export const CreateReservationSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  warehouseId: z.string().cuid("Invalid warehouse ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export type CreateReservationDTO = z.infer<typeof CreateReservationSchema>;

export const ConfirmReservationSchema = z.object({
  id: z.string().cuid("Invalid reservation ID"),
});

export const ReleaseReservationSchema = z.object({
  id: z.string().cuid("Invalid reservation ID"),
});
