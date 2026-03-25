import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeAppError } from "@/lib/app-errors";
import { ERROR_LABELS, MESSAGE_LABELS, PAGE_SIZE } from "@/lib/constants";
import { adjustInventory, listInventoryPage } from "@/lib/repository";
import { validateInventoryAdjustment } from "@/lib/validation";

function readPage(value: string | null) {
  const page = Number(value || "1");

  return Number.isNaN(page) ? 1 : page;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = readPage(searchParams.get("page"));
  const inventoryPage = await listInventoryPage({
    page,
    pageSize: PAGE_SIZE,
  });

  return NextResponse.json(inventoryPage);
}

export async function PATCH(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = validateInventoryAdjustment(
      typeof json === "object" && json !== null
        ? (json as Record<string, unknown>)
        : {},
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "invalidAdjustment",
          message: ERROR_LABELS.invalidAdjustment,
          fieldErrors: parsed.fieldErrors,
        },
        { status: 400 },
      );
    }

    await adjustInventory(
      parsed.data.productId,
      parsed.data.mode,
      parsed.data.amount,
    );

    revalidatePath("/");
    revalidatePath("/inventory");

    return NextResponse.json({
      message: MESSAGE_LABELS.inventoryUpdated,
    });
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
        code: "inventoryUpdateFailed",
        message: ERROR_LABELS.inventoryUpdateFailed,
      },
      { status: 500 },
    );
  }
}
