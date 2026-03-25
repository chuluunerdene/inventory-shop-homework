import Link from "next/link";

import { ProductForm } from "@/components/product-form";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="stack-page">
      <section className="page-header">
        <div>
          <p className="eyebrow"></p>
          <h1>Бүртгэл</h1>
        </div>
        <Link href="/" className="ghost-link">
          Буцах
        </Link>
      </section>

      <ProductForm
        categories={categories}
        submitLabel="Бүртгэх"
      />
    </div>
  );
}
