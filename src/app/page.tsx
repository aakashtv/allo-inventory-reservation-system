import { DashboardShell } from "@/components/layout/DashboardShell";
import { ArrowRight, Box, Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of inventory and system health.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">
                Total Products
              </h3>
              <Box className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                +0 from last month
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">
                Active Reservations
              </h3>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                0 pending fulfillment
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
