import { CartPageClient } from "@/components/cart-page-client";

export default function CartPage() {
  return (
    <div className="stack-page">
      <section className="page-header">
        <div className="page-header__copy">
          <p className="eyebrow">Сагс</p>
          <h1>Захиалга хийх</h1>
        </div>
      </section>

      <CartPageClient />
    </div>
  );
}
