import { Prisma } from "@prisma/client";

export type AppErrorCode =
  | "CATEGORY_NOT_FOUND"
  | "CONFLICT"
  | "DB_UNAVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "INVALID_INPUT"
  | "PRODUCT_DELETE_BLOCKED"
  | "PRODUCT_NOT_FOUND"
  | "UNKNOWN";

export class AppError extends Error {
  code: AppErrorCode;

  constructor(code: AppErrorCode) {
    super(code);
    this.code = code;
  }
}

export function normalizeAppError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError("DB_UNAVAILABLE");
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError("INVALID_INPUT");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new AppError("CONFLICT");
      case "P2025":
        return new AppError("PRODUCT_NOT_FOUND");
      default:
        return new AppError("UNKNOWN");
    }
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "CATEGORY_NOT_FOUND":
        return new AppError("CATEGORY_NOT_FOUND");
      case "INSUFFICIENT_STOCK":
        return new AppError("INSUFFICIENT_STOCK");
      case "PRODUCT_DELETE_BLOCKED":
        return new AppError("PRODUCT_DELETE_BLOCKED");
      case "PRODUCT_NOT_FOUND":
        return new AppError("PRODUCT_NOT_FOUND");
      default:
        return new AppError("UNKNOWN");
    }
  }

  return new AppError("UNKNOWN");
}
