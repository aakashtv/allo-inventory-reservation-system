import { warehouseService } from "@/server/services/WarehouseService";
import { apiResponse, handleApiError } from "@/server/utils/ApiResponse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const warehouses = await warehouseService.getWarehouses();
    return apiResponse(warehouses);
  } catch (error) {
    return handleApiError(error);
  }
}
