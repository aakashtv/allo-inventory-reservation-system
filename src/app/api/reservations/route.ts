import { NextRequest } from "next/server";
import { reservationService } from "@/server/services/ReservationService";
import { apiResponse, handleApiError } from "@/server/utils/ApiResponse";
import { CreateReservationSchema } from "@/server/validators/ReservationValidators";
import { checkIdempotency, saveIdempotencyKey } from "@/lib/idempotency";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");

    // Simplistic in-memory simulation if real redis isn't present
    if (idempotencyKey) {
      const isDuplicate = await checkIdempotency(idempotencyKey);
      if (isDuplicate) {
        // In a real system, we'd cache the previous response, but we can return 409 or similar
        // to block duplicate POSTs.
        throw new Error("Duplicate request detected via Idempotency-Key");
      }
    }

    const body = await req.json();
    const data = CreateReservationSchema.parse(body);

    const reservation = await reservationService.createReservation(
      data.productId,
      data.warehouseId,
      data.quantity
    );

    if (idempotencyKey) {
      await saveIdempotencyKey(idempotencyKey);
    }

    return apiResponse(reservation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
