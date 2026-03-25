"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart-provider";
import { FeedbackToast } from "@/components/feedback-toast";
import { ERROR_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type StatusState =
  | {
      tone: "success" | "error";
      text: string;
    }
  | null;

export function CartPageClient() {
  const { items, totalInCents, updateQuantity, removeItem, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  async function handleCheckout() {
    if (items.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json()) as {
        code?: string;
        message?: string;
        orderNumber?: string;
      };

      if (!response.ok) {
        setStatus({
          tone: "error",
          text: payload.message ?? ERROR_LABELS.orderCreateFailed,
        });
        return;
      }

      clear();
      setStatus({
        tone: "success",
        text: `${payload.orderNumber} захиалга амжилттай үүслээ.`,
      });
    } catch {
      setStatus({
        tone: "error",
        text: ERROR_LABELS.connectionFailed,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="empty-state empty-state--cart">
        <div className="empty-state__copy">
          <h2>Сагс хоосон байна</h2>
          <p>Жагсаалтаас бүтээгдэхүүн сонгоод захиалгын урсгалыг туршиж болно.</p>
        </div>
        <Link href="/" className="button">
          Бүтээгдэхүүн үзэх
        </Link>
      </section>
    );
  }

  return (
    <div className="cart-layout">
      <FeedbackToast tone={status?.tone} text={status?.text} />

      <section className="stack-card">
        <div className="section-heading">
          <h2>Сагс</h2>
          <p>{items.length} төрлийн бүтээгдэхүүн байна.</p>
        </div>

        <div className="cart-list">
          {items.map((item) => (
            <article key={item.productId} className="cart-item">
              <div className="cart-item__body">
                <div>
                  <p className="eyebrow">{item.categoryName}</p>
                  <h3>{item.name}</h3>
                </div>
                <strong>{formatCurrency(item.priceInCents)}</strong>
              </div>

              <div className="cart-item__actions">
                <label className="cart-stepper">
                  <span>Тоо</span>
                  <input
                    type="number"
                    min="1"
                    max={item.availableQuantity}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.productId, Number(event.target.value))
                    }
                  />
                </label>

                <button
                  type="button"
                  className="ghost-link ghost-link--danger"
                  onClick={() => removeItem(item.productId)}
                >
                  Устгах
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="summary-card">
        <h2>Захиалгын дүн</h2>
        <div className="summary-row">
          <span>Нийт</span>
          <strong>{formatCurrency(totalInCents)}</strong>
        </div>
        <div className="summary-row">
          <span>Төлөв</span>
          <strong>Төлөхөд бэлэн</strong>
        </div>
        <button type="button" className="button" onClick={handleCheckout} disabled={isSubmitting}>
          {isSubmitting ? "Захиалж байна..." : "Захиалах"}
        </button>
      </aside>
    </div>
  );
}
