export type CartItem = {
  productId: string;
  name: string;
  priceInCents: number;
  quantity: number;
  availableQuantity: number;
  categoryName: string;
  imageUrl?: string | null;
};

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type ProductCardItem = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string | null;
  lowStockThreshold: number;
  category: CategoryOption;
  inventory: {
    quantity: number;
  } | null;
};

export type ProductFormItem = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string | null;
  lowStockThreshold: number;
  categoryId: string;
  inventory: {
    quantity: number;
  } | null;
};

export type InventoryRow = {
  id: string;
  name: string;
  lowStockThreshold: number;
  category: CategoryOption;
  inventory: {
    id: string;
    quantity: number;
  } | null;
};

export type ProductFormValues = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  imageUrl: string;
};

export type ProductInput = {
  name: string;
  description: string;
  categoryId: string;
  priceInCents: number;
  imageUrl: string | null;
  lowStockThreshold: number;
  stock: number;
};

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};
