import { prisma } from "@/lib/prisma";

export class WarehouseService {
  async getWarehouses() {
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
