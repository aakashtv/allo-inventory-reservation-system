import { prisma } from "@/lib/prisma";
import { reservationService } from "./ReservationService";

export class ExpiryService {
  async cleanupExpiredReservations() {
    // 1. Find all PENDING reservations that have expired
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (expiredReservations.length === 0) {
      return { count: 0 };
    }

    let processedCount = 0;
    let failedCount = 0;

    // 2. Safely release them one by one through the transactional service
    for (const res of expiredReservations) {
      try {
        await reservationService.releaseReservation(res.id, "EXPIRED");
        processedCount++;
      } catch (error) {
        console.error(`Failed to expire reservation ${res.id}`, error);
        failedCount++;
      }
    }

    return { count: processedCount, failedCount };
  }
}

export const expiryService = new ExpiryService();
