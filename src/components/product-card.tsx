"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import type { ProductCardItem } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductCardItem }) {
  const { addItem } = useCart();
  const quantity = product.inventory?.quantity ?? 0;
  const isLowStock = quantity > 0 && quantity <= product.lowStockThreshold;
  const stockLabel =
    quantity === 0 ? "Дууссан" : isLowStock ? "Цөөн үлдсэн" : "Бэлэн";

  return (
    <article className="product-card">
      <div
        className={`product-card__visual ${product.imageUrl ? "product-card__visual--with-image" : ""}`}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.name} зураг`}
            className="product-card__image"
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 980px) 50vw, 33vw"
          />
        ) : null}
        <div className="product-card__glow" aria-hidden="true" />
        <div className="product-card__visual-top">
          <span className="product-card__category">{product.category.name}</span>
          <span
            className={`pill ${
              quantity === 0
                ? "pill--danger"
                : isLowStock
                  ? "pill--warn"
                  : "pill--neutral"
            }`}
          >
            {stockLabel}
          </span>
        </div>
        <div className="product-card__visual-bottom">
          <strong>{formatCurrency(product.priceInCents)}</strong>
          <span>{quantity} ш үлдсэн</span>
        </div>
      </div>

      <div className="product-card__header">
        <div>
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
        </div>

        <Link href={`/products/${product.id}`} className="ghost-link">
          Дэлгэрэнгүй
        </Link>
      </div>

      <div className="product-card__meta">
        <div className="pill-row">
          <span className={`pill ${quantity === 0 ? "pill--danger" : "pill--neutral"}`}>
            Үлдэгдэл: {quantity}
          </span>
          {isLowStock ? <span className="pill pill--warn">Цөөн үлдсэн</span> : null}
        </div>
        <span className="price">{formatCurrency(product.priceInCents)}</span>
      </div>

      <button
        type="button"
        className="button"
        disabled={quantity === 0}
        onClick={() =>
          addItem({
            productId: product.id,
            name: product.name,
            priceInCents: product.priceInCents,
            availableQuantity: quantity,
            categoryName: product.category.name,
            imageUrl: product.imageUrl,
          })
        }
      >
        {quantity === 0 ? "Нөөц дууссан" : "Сагсанд нэмэх"}
      </button>
    </article>
  );
}
