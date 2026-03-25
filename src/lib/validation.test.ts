import { describe, expect, it } from "vitest";

import {
  extractProductInput,
  validateCheckout,
  validateInventoryAdjustment,
  validateProductForm,
} from "@/lib/validation";

describe("validateProductForm", () => {
  it("returns normalized data for a valid product form", () => {
    const result = validateProductForm({
      name: "Утасгүй чихэвч",
      description: "Дуу чимээ тусгаарлалттай, өдөр тутамд тохиромжтой чихэвч.",
      categoryId: "category-1",
      price: "289900",
      stock: "12",
      lowStockThreshold: "4",
      imageUrl: "https://example.com/image.jpg",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      name: "Утасгүй чихэвч",
      description: "Дуу чимээ тусгаарлалттай, өдөр тутамд тохиромжтой чихэвч.",
      categoryId: "category-1",
      price: 289900,
      stock: 12,
      lowStockThreshold: 4,
      imageUrl: "https://example.com/image.jpg",
    });
  });

  it("returns field errors for an invalid product form", () => {
    const result = validateProductForm({
      name: "",
      description: "товч",
      categoryId: "",
      price: "0",
      stock: "-1",
      lowStockThreshold: "-2",
      imageUrl: "invalid-url",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.fieldErrors.name?.[0]).toContain("Нэр");
    expect(result.fieldErrors.description?.[0]).toContain("Тайлбар");
    expect(result.fieldErrors.categoryId?.[0]).toContain("Ангилал");
    expect(result.fieldErrors.price?.[0]).toContain("Үнэ");
    expect(result.fieldErrors.stock?.[0]).toContain("Нөөц");
    expect(result.fieldErrors.lowStockThreshold?.[0]).toContain("Анхааруулах лимит");
    expect(result.fieldErrors.imageUrl?.[0]).toContain("Зураг URL");
  });
});

describe("validateInventoryAdjustment", () => {
  it("accepts a valid inventory adjustment", () => {
    const result = validateInventoryAdjustment({
      productId: "product-1",
      mode: "add",
      amount: "3",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      productId: "product-1",
      mode: "add",
      amount: 3,
    });
  });

  it("rejects an invalid inventory adjustment", () => {
    const result = validateInventoryAdjustment({
      productId: "",
      mode: "wrong",
      amount: "0",
    });

    expect(result.success).toBe(false);
  });
});

describe("validateCheckout", () => {
  it("rejects an empty cart payload", () => {
    const result = validateCheckout({
      items: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid checkout payload", () => {
    const result = validateCheckout({
      items: [
        {
          productId: "product-1",
          quantity: 2,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe("extractProductInput", () => {
  it("extracts product data from a plain object", () => {
    const result = extractProductInput({
      name: "Тест бараа",
      description: "Дэлгэрэнгүй тайлбар нь 10-аас олон тэмдэгттэй.",
      categoryId: "category-1",
      price: 1000,
      stock: 5,
      lowStockThreshold: 1,
      imageUrl: "https://example.com/demo.jpg",
    });

    expect(result).toEqual({
      name: "Тест бараа",
      description: "Дэлгэрэнгүй тайлбар нь 10-аас олон тэмдэгттэй.",
      categoryId: "category-1",
      price: "1000",
      stock: "5",
      lowStockThreshold: "1",
      imageUrl: "https://example.com/demo.jpg",
    });
  });
});
