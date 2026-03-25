"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { FeedbackToast } from "@/components/feedback-toast";
import { ERROR_LABELS } from "@/lib/constants";

type DeleteProductButtonProps = {
  productId: string;
};

type StatusState =
  | {
      tone: "success" | "error";
      text: string;
    }
  | null;

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    const isConfirmed = window.confirm("Энэ бүтээгдэхүүнийг устгах уу?");

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as {
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        setStatus({
          tone: "error",
          text: payload.message ?? ERROR_LABELS.productDeleteFailed,
        });
        return;
      }

      startTransition(() => {
        router.push("/?message=productDeleted");
      });
    } catch {
      setStatus({
        tone: "error",
        text: ERROR_LABELS.connectionFailed,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <FeedbackToast tone={status?.tone} text={status?.text} />

      <button
        type="button"
        className="button button--danger"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        {isDeleting ? "Устгаж байна..." : "Бүтээгдэхүүн устгах"}
      </button>
    </>
  );
}
