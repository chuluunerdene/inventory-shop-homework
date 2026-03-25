import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeAppError } from "@/lib/app-errors";
import { ERROR_LABELS } from "@/lib/constants";
import { createOrder } from "@/lib/repository";
import { validateCheckout } from "@/lib/validation";

function normalizeItems(items: { productId: string; quantity: number }[]) {
  const accumulator = new Map<string, number>();

  for (const item of items) {
    accumulator.set(item.productId, (accumulator.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(accumulator.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = validateCheckout(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "invalidCartPayload",
          message: ERROR_LABELS.invalidCartPayload,
        },
        { status: 400 },
      );
    }

    const normalizedItems = normalizeItems(parsed.data.items);
    const order = await createOrder(normalizedItems);

    revalidatePath("/");
    revalidatePath("/inventory");

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const appError = normalizeAppError(error);

    if (appError.code === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        {
          code: "insufficientStock",
          message: ERROR_LABELS.insufficientStock,
        },
        { status: 409 },
      );
    }

    if (appError.code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        {
          code: "productNotFound",
          message: ERROR_LABELS.productNotFound,
        },
        { status: 404 },
      );
    }

    if (appError.code === "DB_UNAVAILABLE") {
      return NextResponse.json(
        {
          code: "databaseUnavailable",
          message: ERROR_LABELS.databaseUnavailable,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        code: "orderCreateFailed",
        message: ERROR_LABELS.orderCreateFailed,
      },
      { status: 500 },
    );
  }
}
