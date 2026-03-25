import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteProductButton } from "@/components/delete-product-button";
import { FeedbackToast } from "@/components/feedback-toast";
import { ProductForm } from "@/components/product-form";
import { getCategories, getProductById } from "@/lib/data";
import { getBannerMessage } from "@/lib/utils";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    message?: string | string[];
    error?: string | string[];
  }>;
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const [categories, product] = await Promise.all([
    getCategories(),
    getProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  const banner = getBannerMessage(
    readParam(resolvedSearchParams.message),
    readParam(resolvedSearchParams.error),
  );

  return (
    <div className="stack-page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Засах</p>
          <h1>{product.name}</h1>
          <p>Бүтээгдэхүүний форм болон устгах үйлдлийг эндээс туршиж болно.</p>
        </div>
        <Link href="/" className="ghost-link">
          Буцах
        </Link>
      </section>

      <FeedbackToast
        tone={banner?.tone}
        text={banner?.text}
        clearQueryParams
      />

      <ProductForm
        categories={categories}
        submitLabel="Өөрчлөлт хадгалах"
        product={product}
      />

      <div className="form-actions">
        <DeleteProductButton productId={product.id} />
      </div>
    </div>
  );
}
