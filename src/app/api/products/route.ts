import { productService } from "@/server/services/ProductService";
import { apiResponse, handleApiError } from "@/server/utils/ApiResponse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await productService.getProducts();
    return apiResponse(products);
  } catch (error) {
    return handleApiError(error);
  }
}
