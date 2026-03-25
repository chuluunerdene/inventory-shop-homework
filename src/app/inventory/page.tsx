import Link from "next/link";

import { FeedbackToast } from "@/components/feedback-toast";
import { InventoryTable } from "@/components/inventory-table";
import { PaginationNav } from "@/components/pagination-nav";
import { getInventoryPage } from "@/lib/data";
import { buildQueryString, getBannerMessage } from "@/lib/utils";

export const dynamic = "force-dynamic";

type InventoryPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    message?: string | string[];
    error?: string | string[];
  }>;
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(readParam(resolvedSearchParams.page) || "1");
  const inventoryPage = await getInventoryPage({
    page: Number.isNaN(page) ? 1 : page,
  });

  const banner = getBannerMessage(
    readParam(resolvedSearchParams.message),
    readParam(resolvedSearchParams.error),
  );

  function getPageHref(nextPage: number) {
    const params = new URLSearchParams(
      buildQueryString(new URLSearchParams(), {
        page: String(nextPage),
      }),
    );

    return params.toString() ? `/inventory?${params.toString()}` : "/inventory";
  }

  return (
    <div className="stack-page">
      <section className="page-header">
        <div className="page-header__copy">
          <p className="eyebrow">Агуулах</p>
          <h1>Агуулах</h1>
        </div>
        <div className="page-header__actions">
          <Link href="/products/new" className="button">
            Бүтээгдэхүүн бүртгэх
          </Link>
          <Link href="/" className="ghost-link">
            Жагсаалт руу буцах
          </Link>
        </div>
      </section>

      <FeedbackToast
        tone={banner?.tone}
        text={banner?.text}
        clearQueryParams
      />

      <InventoryTable
        items={inventoryPage.items}
        totalItems={inventoryPage.totalItems}
      />

      <PaginationNav
        ariaLabel="Агуулахын хуудас"
        currentPage={inventoryPage.page}
        totalPages={inventoryPage.totalPages}
        getPageHref={getPageHref}
      />
    </div>
  );
}
