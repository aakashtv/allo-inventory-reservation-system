import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product inventory and reservations.
          </p>
        </div>

        <ProductsClient />
      </div>
    </DashboardShell>
  );
}
