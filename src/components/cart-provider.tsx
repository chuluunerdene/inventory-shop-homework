"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalInCents: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "inventory-shop-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value: CartContextValue = {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    totalInCents: items.reduce(
      (total, item) => total + item.priceInCents * item.quantity,
      0,
    ),
    addItem(item) {
      setItems((currentItems) => {
        const existing = currentItems.find(
          (currentItem) => currentItem.productId === item.productId,
        );

        if (existing) {
          return currentItems.map((currentItem) =>
            currentItem.productId === item.productId
              ? {
                  ...currentItem,
                  quantity: Math.min(
                    currentItem.quantity + 1,
                    currentItem.availableQuantity,
                  ),
                }
              : currentItem,
          );
        }

        return [...currentItems, { ...item, quantity: 1 }];
      });
    },
    updateQuantity(productId, quantity) {
      setItems((currentItems) =>
        currentItems.flatMap((item) => {
          if (item.productId !== productId) {
            return [item];
          }

          const nextQuantity = Math.min(quantity, item.availableQuantity);

          if (nextQuantity <= 0) {
            return [];
          }

          return [
            {
              ...item,
              quantity: nextQuantity,
            },
          ];
        }),
      );
    },
    removeItem(productId) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.productId !== productId),
      );
    },
    clear() {
      setItems([]);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart нь CartProvider дотор ашиглагдах ёстой.");
  }

  return context;
}
