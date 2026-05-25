import { prisma } from "@/lib/prisma";

export class ProductService {
  async getProducts() {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return products.map((product) => {
      const totalUnits = product.inventories.reduce(
        (acc, inv) => acc + inv.totalUnits,
        0
      );
      const reservedUnits = product.inventories.reduce(
        (acc, inv) => acc + inv.reservedUnits,
        0
      );
      const availableUnits = totalUnits - reservedUnits;

      return {
        ...product,
        totalUnits,
        reservedUnits,
        availableUnits,
      };
    });
  }
}

export const productService = new ProductService();
