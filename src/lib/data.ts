import "server-only";

import { PAGE_SIZE } from "@/lib/constants";
import {
  findProductById,
  listCategories,
  listInventoryPage,
  listInventoryRows,
  listProductsPage,
} from "@/lib/repository";
import type {
  CategoryOption,
  InventoryRow,
  ProductCardItem,
  ProductFormItem,
} from "@/lib/types";

export type { CategoryOption, InventoryRow, ProductCardItem, ProductFormItem };

export async function getCategories() {
  return listCategories();
}

export async function getProductsPage(input: {
  query?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) {
  return listProductsPage({
    ...input,
    pageSize: input.pageSize ?? PAGE_SIZE,
  });
}

export async function getProductById(id: string) {
  return findProductById(id);
}

export async function getInventoryRows() {
  return listInventoryRows();
}

export async function getInventoryPage(input: { page?: number; pageSize?: number }) {
  return listInventoryPage({
    ...input,
    pageSize: input.pageSize ?? PAGE_SIZE,
  });
}
