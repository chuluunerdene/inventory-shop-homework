import { describe, expect, it } from "vitest";

import { AppError, normalizeAppError } from "@/lib/app-errors";

describe("normalizeAppError", () => {
  it("returns the same app error instance", () => {
    const error = new AppError("PRODUCT_NOT_FOUND");
    const result = normalizeAppError(error);

    expect(result).toBe(error);
    expect(result.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("maps known plain errors to app error codes", () => {
    const result = normalizeAppError(new Error("INSUFFICIENT_STOCK"));

    expect(result.code).toBe("INSUFFICIENT_STOCK");
  });

  it("maps unknown errors to UNKNOWN", () => {
    const result = normalizeAppError(new Error("something-unexpected"));

    expect(result.code).toBe("UNKNOWN");
  });

  it("maps unknown non-error values to UNKNOWN", () => {
    const result = normalizeAppError("plain-string-error");

    expect(result.code).toBe("UNKNOWN");
  });
});
