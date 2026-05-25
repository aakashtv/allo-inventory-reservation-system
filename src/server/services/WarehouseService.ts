import { prisma } from "@/lib/prisma";

export class WarehouseService {
  async getWarehouses() {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    return await prisma.warehouse.findMany({
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export const warehouseService = new WarehouseService();
