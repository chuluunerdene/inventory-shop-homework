import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeAppError } from "@/lib/app-errors";
import { ERROR_LABELS, MESSAGE_LABELS } from "@/lib/constants";
import { findProductById, removeProduct, updateProduct } from "@/lib/repository";
import { extractProductInput, validateProductForm } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const product = await findProductById(id);

  if (!product) {
    return NextResponse.json(
      {
        code: "productNotFound",
        message: ERROR_LABELS.productNotFound,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(product);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

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

    await updateProduct(id, {
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
    revalidatePath(`/products/${id}`);
    revalidatePath(`/products/${id}/edit`);

    return NextResponse.json({ id, message: MESSAGE_LABELS.productSaved });
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

    if (appError.code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        {
          code: "productNotFound",
          message: ERROR_LABELS.productNotFound,
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
        code: "productUpdateFailed",
        message: ERROR_LABELS.productUpdateFailed,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await removeProduct(id);

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/products/${id}`);
    revalidatePath(`/products/${id}/edit`);

    return NextResponse.json({
      id,
      message: MESSAGE_LABELS.productDeleted,
    });
  } catch (error) {
    const appError = normalizeAppError(error);

    if (appError.code === "PRODUCT_DELETE_BLOCKED") {
      return NextResponse.json(
        {
          code: "productDeleteBlocked",
          message: ERROR_LABELS.productDeleteBlocked,
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
        code: "productDeleteFailed",
        message: ERROR_LABELS.productDeleteFailed,
      },
      { status: 500 },
    );
  }
}
