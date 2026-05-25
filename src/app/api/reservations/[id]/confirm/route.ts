import { NextRequest } from "next/server";
import { reservationService } from "@/server/services/ReservationService";
import { apiResponse, handleApiError } from "@/server/utils/ApiResponse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const reservation = await reservationService.confirmReservation(
      resolvedParams.id
    );
    return apiResponse(reservation, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
