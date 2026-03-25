"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CategoryOption } from "@/lib/data";
import { buildQueryString } from "@/lib/utils";

type ProductFiltersProps = {
  categories: CategoryOption[];
  defaultQuery: string;
  defaultCategoryId: string;
};

export function ProductFilters({
  categories,
  defaultQuery,
  defaultCategoryId,
}: ProductFiltersProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const deferredQuery = useDeferredValue(query);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const currentQuery = searchParams.get("q") ?? "";
  const currentCategoryId = searchParams.get("category") ?? "";

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    setCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  useEffect(() => {
    const normalizedQuery = deferredQuery.trim();
    const normalizedCurrentQuery = currentQuery.trim();

    if (normalizedQuery === normalizedCurrentQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextQuery = buildQueryString(new URLSearchParams(searchParamsString), {
        q: normalizedQuery || null,
        page: null,
      });
      const currentHref = searchParamsString ? `${pathname}?${searchParamsString}` : pathname;
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;

      if (nextHref === currentHref) {
        return;
      }

      startTransition(() => {
        router.replace(nextHref, {
          scroll: false,
        });
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentQuery, deferredQuery, pathname, router, searchParamsString]);

  return (
    <div className="filter-bar">
      <label className="form-field">
        <span>Хайх</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="....."
        />
      </label>

      <label className="form-field">
        <span>Ангилал</span>
        <select
          value={categoryId}
          onChange={(event) => {
            const nextCategoryId = event.target.value;
            setCategoryId(nextCategoryId);

            if (nextCategoryId === currentCategoryId) {
              return;
            }

            const nextQuery = buildQueryString(new URLSearchParams(searchParamsString), {
              q: query.trim() || null,
              category: nextCategoryId || null,
              page: null,
            });
            const currentHref = searchParamsString ? `${pathname}?${searchParamsString}` : pathname;
            const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;

            if (nextHref === currentHref) {
              return;
            }

            startTransition(() => {
              router.replace(nextHref, {
                scroll: false,
              });
            });
          }}
        >
          <option value="">Бүх ангилал</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
