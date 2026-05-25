import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReservationClient } from "./ReservationClient";

export const dynamic = "force-dynamic";

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <DashboardShell>
      <ReservationClient id={resolvedParams.id} />
    </DashboardShell>
  );
}
