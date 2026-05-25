"use client";

import { useProducts, useReserve } from "@/hooks/useInventoryQueries";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ProductsClient() {
  const { data: products, isLoading } = useProducts();
  const reserve = useReserve();
  const [reservingId, setReservingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleReserve = (productId: string, warehouseId: string) => {
    setReservingId(`${productId}-${warehouseId}`);
    reserve.mutate(
      { productId, warehouseId, quantity: 1 },
      {
        onSettled: () => setReservingId(null),
      }
    );
  };

  return (
    <div className="rounded-md border bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground text-xs uppercase border-b">
          <tr>
            <th className="px-6 py-3 font-medium">Product</th>
            <th className="px-6 py-3 font-medium">SKU</th>
            <th className="px-6 py-3 font-medium">Price</th>
            <th className="px-6 py-3 font-medium">Warehouse</th>
            <th className="px-6 py-3 font-medium">Availability</th>
            <th className="px-6 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {products?.map(
            (product: {
              id: string;
              name: string;
              sku: string;
              price: number;
              inventories: Array<{
                warehouse: { id: string; name: string };
                totalUnits: number;
                reservedUnits: number;
              }>;
            }) => {
              return product.inventories.map(
                (inv: {
                  warehouse: { id: string; name: string };
                  totalUnits: number;
                  reservedUnits: number;
                }) => {
                  const availableUnits = inv.totalUnits - inv.reservedUnits;
                  const isOutOfStock = availableUnits <= 0;
                  const isLowStock = availableUnits > 0 && availableUnits <= 5;
                  const statusColor = isOutOfStock
                    ? "text-red-500"
                    : isLowStock
                      ? "text-yellow-500"
                      : "text-green-500";

                  const isReservingThis =
                    reservingId === `${product.id}-${inv.warehouse.id}`;

                  return (
                    <tr
                      key={`${product.id}-${inv.warehouse.id}`}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">{product.sku}</td>
                      <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">{inv.warehouse.name}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${statusColor}`}>
                          {availableUnits} units available
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {inv.reservedUnits} currently reserved
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleReserve(product.id, inv.warehouse.id)
                          }
                          disabled={isOutOfStock || reserve.isPending}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                        >
                          {isReservingThis ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {isOutOfStock ? "Out of Stock" : "Reserve 1 Unit"}
                        </button>
                      </td>
                    </tr>
                  );
                }
              );
            }
          )}
          {products?.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-8 text-center text-muted-foreground"
              >
                No products found. Seed the database to view items.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
