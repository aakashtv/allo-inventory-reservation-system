export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_SERVER_ERROR"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: "UNKNOWN_ERROR",
    };
  }

  return {
    message: "An unknown error occurred",
    statusCode: 500,
    code: "UNKNOWN_ERROR",
  };
};
