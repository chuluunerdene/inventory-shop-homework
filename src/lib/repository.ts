import "server-only";

import { prisma } from "@/lib/prisma";
import { AppError, normalizeAppError } from "@/lib/app-errors";
import type {
  CheckoutItemInput,
  InventoryRow,
  ProductCardItem,
  ProductFormItem,
  ProductInput,
} from "@/lib/types";

function makeOrderNumber() {
  return `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

async function ensureCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError("CATEGORY_NOT_FOUND");
  }
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function listProductsPage(input: {
  query?: string;
  categoryId?: string;
  page?: number;
  pageSize: number;
}) {
  const filters = [];

  if (input.query) {
    filters.push({
      name: {
        contains: input.query,
        mode: "insensitive" as const,
      },
    });
  }

  if (input.categoryId) {
    filters.push({
      categoryId: input.categoryId,
    });
  }

  const where = filters.length > 0 ? { AND: filters } : undefined;
  const totalItems = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / input.pageSize));
  const page = Math.min(Math.max(input.page ?? 1, 1), totalPages);

  const products = await prisma.product.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * input.pageSize,
    take: input.pageSize,
    select: {
      id: true,
      name: true,
      description: true,
      priceInCents: true,
      imageUrl: true,
      lowStockThreshold: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      inventory: {
        select: {
          quantity: true,
        },
      },
    },
  });

  return {
    products: products as ProductCardItem[],
    page,
    totalPages,
    totalItems,
  };
}

export async function findProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      priceInCents: true,
      imageUrl: true,
      lowStockThreshold: true,
      categoryId: true,
      inventory: {
        select: {
          quantity: true,
        },
      },
    },
  }) as Promise<ProductFormItem | null>;
}

export async function listInventoryRows() {
  return prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      lowStockThreshold: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      inventory: {
        select: {
          id: true,
          quantity: true,
        },
      },
    },
  }) as Promise<InventoryRow[]>;
}

export async function listInventoryPage(input: { page?: number; pageSize: number }) {
  const totalItems = await prisma.product.count();
  const totalPages = Math.max(1, Math.ceil(totalItems / input.pageSize));
  const page = Math.min(Math.max(input.page ?? 1, 1), totalPages);

  const items = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    skip: (page - 1) * input.pageSize,
    take: input.pageSize,
    select: {
      id: true,
      name: true,
      lowStockThreshold: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      inventory: {
        select: {
          id: true,
          quantity: true,
        },
      },
    },
  });

  return {
    items: items as InventoryRow[],
    page,
    totalPages,
    totalItems,
  };
}

export async function createProduct(input: ProductInput) {
  try {
    await ensureCategoryExists(input.categoryId);

    return await prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        priceInCents: input.priceInCents,
        imageUrl: input.imageUrl,
        lowStockThreshold: input.lowStockThreshold,
        inventory: {
          create: {
            quantity: input.stock,
          },
        },
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    throw normalizeAppError(error);
  }
}

export async function updateProduct(productId: string, input: ProductInput) {
  try {
    const [product] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      }),
      ensureCategoryExists(input.categoryId),
    ]);

    if (!product) {
      throw new AppError("PRODUCT_NOT_FOUND");
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        priceInCents: input.priceInCents,
        imageUrl: input.imageUrl,
        lowStockThreshold: input.lowStockThreshold,
        inventory: {
          upsert: {
            update: {
              quantity: input.stock,
            },
            create: {
              quantity: input.stock,
            },
          },
        },
      },
    });
  } catch (error) {
    throw normalizeAppError(error);
  }
}

export async function removeProduct(productId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      });

      if (!product) {
        throw new AppError("PRODUCT_NOT_FOUND");
      }

      if (product._count.orderItems > 0) {
        throw new AppError("PRODUCT_DELETE_BLOCKED");
      }

      await tx.inventory.deleteMany({
        where: { productId },
      });

      await tx.product.delete({
        where: { id: productId },
      });
    });
  } catch (error) {
    throw normalizeAppError(error);
  }
}

export async function adjustInventory(
  productId: string,
  mode: "add" | "subtract",
  amount: number,
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppError("PRODUCT_NOT_FOUND");
    }

    if (mode === "add") {
      await prisma.inventory.upsert({
        where: {
          productId,
        },
        update: {
          quantity: {
            increment: amount,
          },
        },
        create: {
          productId,
          quantity: amount,
        },
      });

      return;
    }

    const result = await prisma.inventory.updateMany({
      where: {
        productId,
        quantity: {
          gte: amount,
        },
      },
      data: {
        quantity: {
          decrement: amount,
        },
      },
    });

    if (result.count === 0) {
      throw new AppError("INSUFFICIENT_STOCK");
    }
  } catch (error) {
    throw normalizeAppError(error);
  }
}

export async function createOrder(items: CheckoutItemInput[]) {
  try {
    return await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: items.map((item) => item.productId),
          },
        },
        select: {
          id: true,
          priceInCents: true,
          inventory: {
            select: {
              quantity: true,
            },
          },
        },
      });

      const productMap = new Map(products.map((product) => [product.id, product]));
      let totalInCents = 0;

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new AppError("PRODUCT_NOT_FOUND");
        }

        const available = product.inventory?.quantity ?? 0;

        if (available < item.quantity) {
          throw new AppError("INSUFFICIENT_STOCK");
        }

        totalInCents += product.priceInCents * item.quantity;
      }

      for (const item of items) {
        const updatedInventory = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedInventory.count === 0) {
          throw new AppError("INSUFFICIENT_STOCK");
        }
      }

      return tx.order.create({
        data: {
          orderNumber: makeOrderNumber(),
          totalInCents,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceInCents: productMap.get(item.productId)?.priceInCents ?? 0,
            })),
          },
        },
        select: {
          orderNumber: true,
        },
      });
    });
  } catch (error) {
    throw normalizeAppError(error);
  }
}
