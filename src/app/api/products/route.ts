import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeAppError } from "@/lib/app-errors";
import { ERROR_LABELS, PAGE_SIZE } from "@/lib/constants";
import { createProduct, listProductsPage } from "@/lib/repository";
import { extractProductInput, validateProductForm } from "@/lib/validation";

function readPage(value: string | null) {
  const page = Number(value || "1");

  return Number.isNaN(page) ? 1 : page;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = readPage(searchParams.get("page"));
  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("category") ?? "";

  const productPage = await listProductsPage({
    page,
    pageSize: PAGE_SIZE,
    query,
    categoryId,
  });

  return NextResponse.json(productPage);
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = validateProductForm(
      extractProductInput(
        typeof json === "object" && json !== null
          ? (json as Record<string, unknown>)
          : {},
      ),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "invalidProductForm",
          message: ERROR_LABELS.invalidProductForm,
          fieldErrors: parsed.fieldErrors,
        },
        { status: 400 },
      );
    }

    const product = await createProduct({
      name: parsed.data.name,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      priceInCents: parsed.data.price,
      imageUrl: parsed.data.imageUrl || null,
      lowStockThreshold: parsed.data.lowStockThreshold,
      stock: parsed.data.stock,
    });

    revalidatePath("/");
    revalidatePath("/inventory");

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const appError = normalizeAppError(error);

    if (appError.code === "CATEGORY_NOT_FOUND") {
      return NextResponse.json(
        {
          code: "categoryNotFound",
          message: ERROR_LABELS.categoryNotFound,
          fieldErrors: {
            categoryId: [ERROR_LABELS.categoryNotFound],
          },
        },
        { status: 404 },
      );
    }

    if (appError.code === "CONFLICT") {
      return NextResponse.json(
        {
          code: "conflict",
          message: ERROR_LABELS.conflict,
        },
        { status: 409 },
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
        code: "productCreateFailed",
        message: ERROR_LABELS.productCreateFailed,
      },
      { status: 500 },
    );
  }
}
