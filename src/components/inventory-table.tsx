"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FeedbackToast } from "@/components/feedback-toast";
import { ERROR_LABELS, MESSAGE_LABELS } from "@/lib/constants";
import type { InventoryRow } from "@/lib/data";

export function InventoryTable({
  items,
  totalItems,
}: {
  items: InventoryRow[];
  totalItems: number;
}) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  async function handleAdjust(
    form: HTMLFormElement,
    productId: string,
    mode: "add" | "subtract",
  ) {
    if (pendingKey) {
      return;
    }

    const formData = new FormData(form);
    const amount = Number(formData.get("amount") ?? "0");
    const actionKey = `${productId}:${mode}`;

    setPendingKey(actionKey);
    setStatus(null);

    try {
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          mode,
          amount,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setStatus({
          tone: "error",
          text: payload.message ?? ERROR_LABELS.inventoryUpdateFailed,
        });
        return;
      }

      setStatus({
        tone: "success",
        text: payload.message ?? MESSAGE_LABELS.inventoryUpdated,
      });

      router.refresh();
    } catch {
      setStatus({
        tone: "error",
        text: ERROR_LABELS.connectionFailed,
      });
    } finally {
      setPendingKey(null);
    }
  }

  if (items.length === 0) {
    return (
      <section className="table-card inventory-card">
        <div className="section-heading inventory-card__heading">
          <div>
            <h2>Агуулахын жагсаалт</h2>
            <p>Одоогоор бүртгэлтэй Бүтээгдэхүүн алга байна.</p>
          </div>
        </div>

        <div className="empty-state empty-state--compact">
          <h3>Бүтээгдэхүүн бүртгэл алга</h3>
          <p>Шинэ Бүтээгдэхүүн бүртгэсний дараа агуулахын үлдэгдэл энд харагдана.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="table-card inventory-card">
      <FeedbackToast tone={status?.tone} text={status?.text} />

      <div className="section-heading inventory-card__heading">
        <div>
          <h2>Агуулахын жагсаалт</h2>
          <p>{totalItems} төрлийн бараа байна.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table inventory-table">
          <thead>
            <tr>
              <th>Бүтээгдэхүүн</th>
              <th>Ангилал</th>
              <th>Үлдэгдэл</th>
              <th>Лимит</th>
              <th>Төлөв</th>
              <th>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const quantity = item.inventory?.quantity ?? 0;
              const isLowStock = quantity <= item.lowStockThreshold;
              const isOutOfStock = quantity === 0;
              const statusClass = isOutOfStock
                ? "pill--danger"
                : isLowStock
                  ? "pill--warn"
                  : "pill--success";
              const statusLabel = isOutOfStock
                ? "Дууссан"
                : isLowStock
                  ? "Анхаарах"
                  : "Хэвийн";

              return (
                <tr key={item.id}>
                  <td>
                    <div className="table-primary">
                      <Link
                        href={`/products/${item.id}`}
                        className="table-primary__link"
                        data-tooltip="Дэлгэрэнгүй"
                      >
                        {item.name}
                      </Link>
                    </div>
                  </td>
                  <td>{item.category.name}</td>
                  <td>
                    <span className="inventory-count inventory-count--inline">{quantity} ш</span>
                  </td>
                  <td>
                    <span className="inventory-count inventory-count--inline inventory-count--soft">
                      {item.lowStockThreshold} ш
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${statusClass}`}>{statusLabel}</span>
                  </td>
                  <td>
                    <form className="inventory-form inventory-form--table">
                      <input
                        type="number"
                        name="amount"
                        min="1"
                        step="1"
                        defaultValue="1"
                        className="inventory-form__input inventory-form__input--compact"
                      />
                      <button
                        type="button"
                        className="button button--secondary button--compact"
                        disabled={pendingKey !== null}
                        onClick={(event) => {
                          const form = event.currentTarget.form;

                          if (!form) {
                            return;
                          }

                          void handleAdjust(form, item.id, "add");
                        }}
                      >
                        {pendingKey === `${item.id}:add` ? "..." : "Нэмэх"}
                      </button>
                      <button
                        type="button"
                        className="button button--secondary button--compact"
                        disabled={pendingKey !== null}
                        onClick={(event) => {
                          const form = event.currentTarget.form;

                          if (!form) {
                            return;
                          }

                          void handleAdjust(form, item.id, "subtract");
                        }}
                      >
                        {pendingKey === `${item.id}:subtract` ? "..." : "Хасах"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
