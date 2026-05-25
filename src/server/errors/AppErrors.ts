export class InventoryConflictError extends Error {
  public code = "INVENTORY_CONFLICT";
  constructor(message: string = "Not enough available inventory") {
    super(message);
    this.name = "InventoryConflictError";
  }
}

export class ReservationExpiredError extends Error {
  public code = "RESERVATION_EXPIRED";
  constructor(message: string = "Reservation has expired") {
    super(message);
    this.name = "ReservationExpiredError";
  }
}

export class ReservationNotFoundError extends Error {
  public code = "RESERVATION_NOT_FOUND";
  constructor(message: string = "Reservation not found") {
    super(message);
    this.name = "ReservationNotFoundError";
  }
}

export class ValidationError extends Error {
  public code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DuplicateConfirmationError extends Error {
  public code = "DUPLICATE_CONFIRMATION";
  constructor(message: string = "Reservation is already confirmed") {
    super(message);
    this.name = "DuplicateConfirmationError";
  }
}
