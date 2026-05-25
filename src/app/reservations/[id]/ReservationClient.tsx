"use client";

import { useState, useEffect } from "react";
import {
  useReservation,
  useConfirmReservation,
  useReleaseReservation,
} from "@/hooks/useInventoryQueries";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ReservationClient({ id }: { id: string }) {
  const { data: reservation, isLoading } = useReservation(id);
  const confirm = useConfirmReservation();
  const release = useReleaseReservation();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!reservation || reservation.status !== "PENDING") return;

    const expiresAt = new Date(reservation.expiresAt).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, expiresAt - now);
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Reservation Not Found</h2>
        <Link href="/products" className="text-primary hover:underline">
          Return to Products
        </Link>
      </div>
    );
  }

  const isPending = reservation.status === "PENDING";
  const isExpired =
    reservation.status === "EXPIRED" || (isPending && timeLeft === 0);

  const secondsLeft = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isNearExpiry = secondsLeft <= 60 && secondsLeft > 0;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground mt-2">
          Review and confirm your reservation.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Order Summary</h3>
            <StatusBadge
              status={isExpired && isPending ? "EXPIRED" : reservation.status}
            />
          </div>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Product
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {reservation.product.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Quantity
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {reservation.quantity} Unit(s)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Warehouse
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {reservation.warehouse.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Total Price
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                ${(reservation.product.price * reservation.quantity).toFixed(2)}
              </dd>
            </div>
          </dl>

          {isPending && !isExpired && (
            <div
              className={`mt-8 p-4 rounded-lg flex items-center gap-3 ${isNearExpiry ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-primary/10 text-primary"}`}
            >
              <Clock className="h-6 w-6" />
              <div>
                <p className="font-semibold">Time remaining to confirm</p>
                <p className="text-2xl font-mono">
                  {minutes.toString().padStart(2, "0")}:
                  {seconds.toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t bg-muted/20 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              release.mutate(reservation.id, {
                onSuccess: () => router.push("/products"),
              });
            }}
            disabled={
              !isPending || isExpired || release.isPending || confirm.isPending
            }
            className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
          >
            {release.isPending ? "Cancelling..." : "Cancel Reservation"}
          </button>
          <button
            onClick={() => confirm.mutate(reservation.id)}
            disabled={
              !isPending || isExpired || confirm.isPending || release.isPending
            }
            className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 shadow"
          >
            {confirm.isPending ? "Confirming..." : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
          <Clock className="h-3.5 w-3.5" /> Pending
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
          <XCircle className="h-3.5 w-3.5" /> Cancelled
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
          <AlertCircle className="h-3.5 w-3.5" /> Expired
        </span>
      );
    default:
      return null;
  }
}
