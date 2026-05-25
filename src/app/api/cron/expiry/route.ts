import { NextRequest } from "next/server";
import { expiryService } from "@/server/services/ExpiryService";
import { apiResponse, handleApiError } from "@/server/utils/ApiResponse";

export async function POST() {
  try {
    const result = await expiryService.cleanupExpiredReservations();
    return apiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
