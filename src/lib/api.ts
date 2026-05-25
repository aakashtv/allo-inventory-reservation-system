import { NextResponse } from "next/server";
import { handleError } from "./errors";

export const apiSuccess = (data: unknown, statusCode: number = 200) => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
};

export const apiError = (error: unknown) => {
  const { message, statusCode, code } = handleError(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status: statusCode }
  );
};
