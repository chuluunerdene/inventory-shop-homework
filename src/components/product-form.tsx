"use client";

import { type FormEvent, startTransition, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { FeedbackToast } from "@/components/feedback-toast";
import { ERROR_LABELS } from "@/lib/constants";
import type { CategoryOption, ProductFormItem } from "@/lib/data";

type ProductFormProps = {
  categories: CategoryOption[];
  submitLabel: string;
  product?: ProductFormItem | null;
};

type ProductFormState = {
  formError?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: ProductFormState = {};

export function ProductForm({
  categories,
  submitLabel,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const [state, setState] = useState<ProductFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");

  useEffect(() => {
    setImageUrl(product?.imageUrl ?? "");
  }, [product?.id, product?.imageUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setState(initialState);

    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      const isEditing = Boolean(product?.id);
      const endpoint = isEditing && product?.id
        ? `/api/products/${product.id}`
        : "/api/products";
      const response = await fetch(
        endpoint,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as {
        id?: string;
        message?: string;
        fieldErrors?: Record<string, string[] | undefined>;
      };

      if (!response.ok) {
        setState({
          formError:
            result.message ??
            (product ? ERROR_LABELS.productUpdateFailed : ERROR_LABELS.productCreateFailed),
          fieldErrors: result.fieldErrors,
        });
        return;
      }

      const nextProductId = product?.id ?? result.id;

      if (!nextProductId) {
        setState({
          formError: product
            ? ERROR_LABELS.productUpdateFailed
            : ERROR_LABELS.productCreateFailed,
        });
        return;
      }

      startTransition(() => {
        router.push(`/products/${nextProductId}/edit?message=productSaved`);
      });
    } catch {
      setState({
        formError: ERROR_LABELS.connectionFailed,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card product-form">
      <FeedbackToast tone={state.formError ? "error" : null} text={state.formError} />

      <div className="form-grid">
        <label className="form-field">
          <span>Нэр</span>
          <input
            className="form-control"
            name="name"
            type="text"
            defaultValue={product?.name ?? ""}
            placeholder="Жишээ: Утасгүй чихэвч"
            required
          />
          {state.fieldErrors?.name ? (
            <small className="field-error">{state.fieldErrors.name[0]}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Ангилал</span>
          <select
            className="form-control form-control--select"
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            required
          >
            <option value="">Сонгох</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.categoryId ? (
            <small className="field-error">
              {state.fieldErrors.categoryId[0]}
            </small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Үнэ (MNT)</span>
          <input
            className="form-control"
            name="price"
            type="number"
            min="1"
            step="1"
            defaultValue={product?.priceInCents ?? ""}
            placeholder="289900"
            required
          />
          {state.fieldErrors?.price ? (
            <small className="field-error">{state.fieldErrors.price[0]}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Эхний / одоогийн нөөц</span>
          <input
            className="form-control"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.inventory?.quantity ?? 0}
            required
          />
          {state.fieldErrors?.stock ? (
            <small className="field-error">{state.fieldErrors.stock[0]}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Анхааруулах лимит</span>
          <input
            className="form-control"
            name="lowStockThreshold"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.lowStockThreshold ?? 5}
            required
          />
          {state.fieldErrors?.lowStockThreshold ? (
            <small className="field-error">
              {state.fieldErrors.lowStockThreshold[0]}
            </small>
          ) : null}
        </label>

        <label className="form-field form-field--full">
          <span>Зураг URL</span>
          <input
            className="form-control"
            name="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://example.com/product.jpg"
          />
          <small className="field-help">Хэрэв зурагтай бол бүтэн холбоос оруулна уу.</small>
          {state.fieldErrors?.imageUrl ? (
            <small className="field-error">
              {state.fieldErrors.imageUrl[0]}
            </small>
          ) : null}
        </label>

        {imageUrl.trim() ? (
          <div className="image-preview form-field--full">
            <div className="image-preview__frame">
              <Image
                src={imageUrl}
                alt={`${product?.name ?? "Бүтээгдэхүүн"} зураг`}
                className="image-preview__image"
                fill
                sizes="(max-width: 760px) 100vw, 20rem"
              />
            </div>
          </div>
        ) : null}

        <label className="form-field form-field--full">
          <span>Тайлбар</span>
          <textarea
            className="form-control form-control--textarea"
            name="description"
            rows={5}
            defaultValue={product?.description ?? ""}
            placeholder="Бүтээгдэхүүний товч тайлбар"
            required
          />
          {state.fieldErrors?.description ? (
            <small className="field-error">
              {state.fieldErrors.description[0]}
            </small>
          ) : null}
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? "Хадгалж байна..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
