import { prisma } from "@/lib/prisma";
import {
  InventoryConflictError,
  ReservationExpiredError,
  ReservationNotFoundError,
  DuplicateConfirmationError,
} from "../errors/AppErrors";

export class ReservationService {
  /**
   * CREATE RESERVATION (POST /api/reservations)
   */
  async createReservation(
    productId: string,
    warehouseId: string,
    quantity: number
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch the inventory record first to get the ID
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId },
        },
      });

      if (!inventory) {
        throw new InventoryConflictError("Inventory record not found");
      }

      // 2. Lock the row using SELECT ... FOR UPDATE
      await tx.$queryRaw`SELECT * FROM "Inventory" WHERE id = ${inventory.id} FOR UPDATE`;

      // 3. Fetch latest inventory state safely (it is now locked)
      const lockedInventory = await tx.inventory.findUniqueOrThrow({
        where: { id: inventory.id },
      });

      // 4. Calculate available units
      const availableUnits =
        lockedInventory.totalUnits - lockedInventory.reservedUnits;

      // 5. Validate availability
      if (availableUnits < quantity) {
        throw new InventoryConflictError(
          "Another customer reserved the last available inventory."
        );
      }

      // 6. Atomically increment reservedUnits
      await tx.inventory.update({
        where: { id: lockedInventory.id },
        data: {
          reservedUnits: { increment: quantity },
        },
      });

      // 7. Create reservation
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt,
        },
      });

      // 8. Commit transaction (automatic upon return)
      return reservation;
    });
  }

  /**
   * CONFIRM RESERVATION (POST /api/reservations/:id/confirm)
   */
  async confirmReservation(reservationId: string) {
    return await prisma.$transaction(async (tx) => {
      // Lock reservation
      await tx.$queryRaw`SELECT * FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE`;

      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new ReservationNotFoundError();
      }

      if (reservation.status === "CONFIRMED") {
        throw new DuplicateConfirmationError();
      }

      if (reservation.status !== "PENDING") {
        throw new InventoryConflictError(
          `Reservation cannot be confirmed because it is ${reservation.status}`
        );
      }

      if (new Date() > reservation.expiresAt) {
        throw new ReservationExpiredError();
      }

      // Lock inventory
      const inventory = await tx.inventory.findUniqueOrThrow({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
      });
      await tx.$queryRaw`SELECT * FROM "Inventory" WHERE id = ${inventory.id} FOR UPDATE`;

      // Decrement both reservedUnits and totalUnits
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          reservedUnits: { decrement: reservation.quantity },
          totalUnits: { decrement: reservation.quantity },
        },
      });

      // Confirm reservation
      const confirmedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      return confirmedReservation;
    });
  }

  /**
   * RELEASE RESERVATION (POST /api/reservations/:id/release)
   */
  async releaseReservation(
    reservationId: string,
    status: "CANCELLED" | "EXPIRED" = "CANCELLED"
  ) {
    return await prisma.$transaction(async (tx) => {
      // Lock reservation
      await tx.$queryRaw`SELECT * FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE`;

      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new ReservationNotFoundError();
      }

      if (reservation.status !== "PENDING") {
        throw new InventoryConflictError(
          `Reservation cannot be released because it is ${reservation.status}`
        );
      }

      // Lock inventory
      const inventory = await tx.inventory.findUniqueOrThrow({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
      });
      await tx.$queryRaw`SELECT * FROM "Inventory" WHERE id = ${inventory.id} FOR UPDATE`;

      // Decrement reservedUnits safely (return back to available pool)
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          reservedUnits: { decrement: reservation.quantity },
        },
      });

      // Mark RELEASED (CANCELLED or EXPIRED)
      const releasedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status,
          releasedAt: new Date(),
        },
      });

      return releasedReservation;
    });
  }
}

export const reservationService = new ReservationService();
