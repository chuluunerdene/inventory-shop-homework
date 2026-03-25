import { ERROR_LABELS, MESSAGE_LABELS } from "@/lib/constants";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "MNT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildQueryString(
  current: URLSearchParams | ReadonlyURLSearchParams,
  updates: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
      continue;
    }

    params.set(key, value);
  }

  return params.toString();
}

export function getBannerMessage(message?: string | null, error?: string | null) {
  if (error && ERROR_LABELS[error]) {
    return {
      tone: "error" as const,
      text: ERROR_LABELS[error],
    };
  }

  if (message && MESSAGE_LABELS[message]) {
    return {
      tone: "success" as const,
      text: MESSAGE_LABELS[message],
    };
  }

  return null;
}

type ReadonlyURLSearchParams = {
  toString(): string;
};
