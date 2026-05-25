import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, handleApiError } from "@/server/utils/ApiResponse";
import { ReservationNotFoundError } from "@/server/errors/AppErrors";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    return apiResponse(reservation);
  } catch (error) {
    return handleApiError(error);
  }
}
