import Link from "next/link";

import { FeedbackToast } from "@/components/feedback-toast";
import { PaginationNav } from "@/components/pagination-nav";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { getCategories, getProductsPage } from "@/lib/data";
import { buildQueryString, getBannerMessage } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
    message?: string | string[];
    error?: string | string[];
  }>;
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const query = readParam(resolvedParams.q);
  const categoryId = readParam(resolvedParams.category);
  const page = Number(readParam(resolvedParams.page) || "1");
  const banner = getBannerMessage(
    readParam(resolvedParams.message),
    readParam(resolvedParams.error),
  );

  const [categories, productPage] = await Promise.all([
    getCategories(),
    getProductsPage({
      query,
      categoryId,
      page: Number.isNaN(page) ? 1 : page,
    }),
  ]);

  function getPageHref(nextPage: number) {
    const params = new URLSearchParams(
      buildQueryString(new URLSearchParams(), {
        q: query || null,
        category: categoryId || null,
        page: String(nextPage),
      }),
    );

    return params.toString() ? `/?${params.toString()}` : "/";
  }

  return (
    <div className="stack-page">
      <section className="hero-card">
        <div className="hero-card__content">
          <p className="eyebrow">Даалгавар</p>
          <h1>Нөөц сагс удирдлага</h1>
          <p className="hero-copy">
            Даалгаврын шаардлагад нийцүүлээд бүтээгдэхүүний бүртгэл, нөөцийн
            өөрчлөлт, локал сагс болон гүйлгээтэй захиалгын урсгалыг
            нэгтгэсэн.
          </p>

          <div className="hero-card__metrics">
            <div className="metric-tile">
              <span>Бүтээгдэхүүн</span>
              <strong>{productPage.totalItems}</strong>
            </div>
            <div className="metric-tile">
              <span>Ангилал</span>
              <strong>{categories.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Горим</span>
              <strong>PostgreSQL</strong>
            </div>
          </div>

          <div className="hero-card__actions">
            <Link href="/products/new" className="button">
              Бүтээгдэхүүн бүртгэл
            </Link>
            <Link href="/inventory" className="button button--secondary">
              Агуулах харах
            </Link>
          </div>
        </div>
      </section>

      <FeedbackToast
        tone={banner?.tone}
        text={banner?.text}
        clearQueryParams
      />

      <section className="stack-card">
        <div className="section-heading">
          <div>
            <h2>Бүтээгдэхүүний жагсаалт</h2>
            <p>{productPage.totalItems} бүтээгдэхүүн бүртгэлтэй байна.</p>
          </div>
        </div>

        <ProductFilters
          categories={categories}
          defaultQuery={query}
          defaultCategoryId={categoryId}
        />

        {productPage.products.length > 0 ? (
          <div className="product-grid">
            {productPage.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <h3>Илэрц олдсонгүй</h3>
            <p>Хайлтын үг эсвэл ангиллаа өөрчлөөд дахин оролдоно уу.</p>
          </div>
        )}

        <PaginationNav
          ariaLabel="Бүтээгдэхүүний хуудас"
          currentPage={productPage.page}
          totalPages={productPage.totalPages}
          getPageHref={getPageHref}
        />
      </section>
    </div>
  );
}
