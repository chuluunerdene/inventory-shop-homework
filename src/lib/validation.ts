import Joi from "joi";

import type { ProductFormValues } from "@/lib/types";

type FieldErrors = Record<string, string[] | undefined>;

type ValidationFailure = {
  success: false;
  fieldErrors: FieldErrors;
};

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ProductFormData = {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string;
};

type InventoryAdjustmentData = {
  productId: string;
  mode: "add" | "subtract";
  amount: number;
};

type CheckoutData = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

const productFormSchema = Joi.object<ProductFormData>({
  name: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "Нэр оруулна уу.",
      "string.min": "Нэр хамгийн багадаа 2 тэмдэгт байна.",
      "any.required": "Нэр оруулна уу.",
    }),
  description: Joi.string()
    .trim()
    .min(10)
    .required()
    .messages({
      "string.empty": "Тайлбар оруулна уу.",
      "string.min": "Тайлбар хамгийн багадаа 10 тэмдэгт байна.",
      "any.required": "Тайлбар оруулна уу.",
    }),
  categoryId: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Ангилал сонгоно уу.",
      "any.required": "Ангилал сонгоно уу.",
    }),
  price: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Үнэ тоон утга байна.",
      "number.integer": "Үнэ бүхэл тоо байна.",
      "number.positive": "Үнэ 0-ээс их байна.",
      "any.required": "Үнэ оруулна уу.",
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Нөөц тоон утга байна.",
      "number.integer": "Нөөц бүхэл тоо байна.",
      "number.min": "Нөөц 0-ээс багагүй байна.",
      "any.required": "Нөөц оруулна уу.",
    }),
  lowStockThreshold: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Анхааруулах лимит тоон утга байна.",
      "number.integer": "Анхааруулах лимит бүхэл тоо байна.",
      "number.min": "Анхааруулах лимит 0-ээс багагүй байна.",
      "any.required": "Анхааруулах лимит оруулна уу.",
    }),
  imageUrl: Joi.string()
    .trim()
    .allow("")
    .uri({
      scheme: ["http", "https"],
    })
    .messages({
      "string.uri": "Зураг URL бол хүчинтэй холбоос байна.",
      "string.uriCustomScheme": "Зураг URL бол хүчинтэй холбоос байна.",
    }),
});

const inventoryAdjustmentSchema = Joi.object<InventoryAdjustmentData>({
  productId: Joi.string().trim().required(),
  mode: Joi.string()
    .valid("add", "subtract")
    .required(),
  amount: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Өөрчлөх тоо тоон утга байна.",
      "number.integer": "Өөрчлөх тоо бүхэл тоо байна.",
      "number.positive": "Өөрчлөх тоо 0-ээс их байна.",
    }),
});

const checkoutSchema = Joi.object<CheckoutData>({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().trim().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required(),
});

function toFieldErrors(error: Joi.ValidationError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const detail of error.details) {
    const key = String(detail.path[0] ?? "form");

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key]?.push(detail.message);
  }

  return fieldErrors;
}

export function validateProductForm(
  value: ProductFormValues,
): ValidationSuccess<ProductFormData> | ValidationFailure {
  const result = productFormSchema.validate(value, {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (result.error) {
    return {
      success: false,
      fieldErrors: toFieldErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.value as ProductFormData,
  };
}

export function validateInventoryAdjustment(
  value: Record<string, unknown>,
): ValidationSuccess<InventoryAdjustmentData> | ValidationFailure {
  const result = inventoryAdjustmentSchema.validate(value, {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (result.error) {
    return {
      success: false,
      fieldErrors: toFieldErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.value as InventoryAdjustmentData,
  };
}

export function validateCheckout(
  value: unknown,
): ValidationSuccess<CheckoutData> | ValidationFailure {
  const result = checkoutSchema.validate(value, {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (result.error) {
    return {
      success: false,
      fieldErrors: toFieldErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.value as CheckoutData,
  };
}

export function extractProductInput(
  source: FormData | Record<string, unknown>,
): ProductFormValues {
  if (!(source instanceof FormData)) {
    return {
      name: String(source.name ?? ""),
      description: String(source.description ?? ""),
      categoryId: String(source.categoryId ?? ""),
      price: String(source.price ?? ""),
      stock: String(source.stock ?? ""),
      lowStockThreshold: String(source.lowStockThreshold ?? ""),
      imageUrl: String(source.imageUrl ?? ""),
    };
  }

  return {
    name: String(source.get("name") ?? ""),
    description: String(source.get("description") ?? ""),
    categoryId: String(source.get("categoryId") ?? ""),
    price: String(source.get("price") ?? ""),
    stock: String(source.get("stock") ?? ""),
    lowStockThreshold: String(source.get("lowStockThreshold") ?? ""),
    imageUrl: String(source.get("imageUrl") ?? ""),
  };
}
