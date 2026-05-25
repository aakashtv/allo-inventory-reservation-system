import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  InventoryConflictError,
  ReservationExpiredError,
  ReservationNotFoundError,
  ValidationError,
  DuplicateConfirmationError,
} from "../errors/AppErrors";

export const handleApiError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request payload",
          details: error.issues,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 400 }
    );
  }

  if (error instanceof ReservationNotFoundError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 404 }
    );
  }

  if (
    error instanceof InventoryConflictError ||
    error instanceof DuplicateConfirmationError
  ) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 409 }
    );
  }

  if (error instanceof ReservationExpiredError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 410 }
    );
  }

  console.error("Unhandled Server Error:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
};

export const apiResponse = (data: unknown, status: number = 200) => {
  return NextResponse.json({ success: true, data }, { status });
};
