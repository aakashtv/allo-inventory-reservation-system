import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: ApiClient.getProducts,
    refetchInterval: 5000, // Refresh every 5 seconds for live UI
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ["reservation", id],
    queryFn: () => ApiClient.getReservation(id),
    refetchInterval: (data: unknown) => {
      const q = data as { state?: { data?: { status?: string } } };
      return q?.state?.data?.status === "PENDING" ? 1000 : false;
    },
  });
}

export function useReserve() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      warehouseId: string;
      quantity: number;
    }) => ApiClient.reserve(data.productId, data.warehouseId, data.quantity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Reservation created safely!");
      router.push(`/reservations/${data.id}`);
    },
    onError: (error: Error & { code?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (error.code === "INVENTORY_CONFLICT") {
        toast.error("Another customer reserved the last available inventory.");
      } else {
        toast.error(error.message || "Failed to create reservation");
      }
    },
  });
}

export function useConfirmReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiClient.confirmReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Purchase confirmed successfully!");
    },
    onError: (error: Error & { code?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (error.code === "RESERVATION_EXPIRED") {
        toast.error("Reservation expired. Inventory was released.");
      } else {
        toast.error(error.message || "Failed to confirm purchase");
      }
    },
  });
}

export function useReleaseReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiClient.releaseReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.info("Reservation cancelled. Inventory restored.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel reservation");
    },
  });
}
