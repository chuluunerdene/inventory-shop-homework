import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteProductButton } from "@/components/delete-product-button";
import { getCategories, getProductById } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const categoryName =
    categories.find((category) => category.id === product.categoryId)?.name ??
    "Тодорхойгүй";
  const quantity = product.inventory?.quantity ?? 0;
  const isLowStock = quantity > 0 && quantity <= product.lowStockThreshold;
  const stockTone =
    quantity === 0
      ? "pill pill--danger"
      : isLowStock
        ? "pill pill--warn"
        : "pill pill--success";
  const stockLabel =
    quantity === 0 ? "Агуулах хоосон" : isLowStock ? "Цөөн үлдсэн" : "Хэвийн";

  return (
    <div className="stack-page">
      <section className="product-showcase">
        <div className="product-showcase__media">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={`${product.name} зураг`}
              className="product-showcase__image"
              fill
              sizes="(max-width: 980px) 100vw, 42vw"
            />
          ) : (
            <div className="product-showcase__placeholder">
              <span>{categoryName}</span>
              <strong>{product.name}</strong>
            </div>
          )}

          <div className="product-showcase__media-badge">
            <span>{categoryName}</span>
            <strong>{stockLabel}</strong>
          </div>
        </div>

        <div className="product-showcase__content">
          <p className="eyebrow">Даалгавар</p>
          <h1>{product.name}</h1>
          <p className="product-showcase__lead">
            Барааны үнэ, агуулах дахь үлдэгдэл, төлөвийг харуулна.
          </p>

          <div className="product-showcase__price-panel">
            <span>Үнэ</span>
            <strong>{formatCurrency(product.priceInCents)}</strong>
          </div>

          <div className="pill-row">
            <span className="pill pill--neutral">{categoryName}</span>
            <span className={stockTone}>{stockLabel}</span>
          </div>

          <div className="product-showcase__stats">
            <article className="showcase-stat">
              <span>Агуулах дахь үлдэгдэл</span>
              <strong>{quantity} ш</strong>
            </article>
            <article className="showcase-stat">
              <span>Анхааруулах лимит</span>
              <strong>{product.lowStockThreshold} ш</strong>
            </article>
            <article className="showcase-stat">
              <span>Ангилал</span>
              <strong>{categoryName}</strong>
            </article>
          </div>

          <div className="product-showcase__actions">
            <Link href="/inventory" className="ghost-link">
              Агуулах руу буцах
            </Link>
            <Link href="/" className="ghost-link">
              Жагсаалт руу буцах
            </Link>
            <Link href={`/products/${product.id}/edit`} className="button">
              Барааг засах
            </Link>
            <DeleteProductButton productId={product.id} />
          </div>
        </div>
      </section>

      <section className="stack-card product-story">
        <div className="section-heading">
          <div>
            <h2>Барааны тайлбар</h2>
            <p>Доорх хэсэгт барааны бүрэн мэдээлэл харагдана.</p>
          </div>
        </div>
        <p className="product-story__copy">{product.description}</p>
      </section>
    </div>
  );
}
