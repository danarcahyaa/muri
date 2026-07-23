"use client";

import { useMemo, useState } from "react";

import type { ProductCatalogItem } from "@/types/product";

export type ProductSortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-az";

const ALL_FILTER = "Semua";

export function useProductCatalogFilters(products: ProductCatalogItem[]) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(ALL_FILTER);
  const [category, setCategory] = useState(ALL_FILTER);
  const [sort, setSort] = useState<ProductSortOption>("default");

  const brands = useMemo(
    () => [ALL_FILTER, ...getUniqueSortedValues(products, "brandName")],
    [products],
  );

  const categories = useMemo(
    () => [ALL_FILTER, ...getUniqueSortedValues(products, "categoryName")],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

    const result = products.filter((product) => {
      const searchableContent = [
        product.name,
        product.brandName,
        product.categoryName,
        product.description,
        product.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id-ID");

      const matchesSearch =
        normalizedQuery.length === 0 ||
        searchableContent.includes(normalizedQuery);

      const matchesBrand =
        brand === ALL_FILTER || product.brandName === brand;

      const matchesCategory =
        category === ALL_FILTER || product.categoryName === category;

      return matchesSearch && matchesBrand && matchesCategory;
    });

    return [...result].sort((first, second) => {
      switch (sort) {
        case "price-low":
          return first.priceIdr - second.priceIdr;
        case "price-high":
          return second.priceIdr - first.priceIdr;
        case "name-az":
          return first.name.localeCompare(second.name, "id");
        default:
          return compareNewest(first, second);
      }
    });
  }, [brand, category, products, query, sort]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    brand !== ALL_FILTER ||
    category !== ALL_FILTER ||
    sort !== "default";

  function resetFilters() {
    setQuery("");
    setBrand(ALL_FILTER);
    setCategory(ALL_FILTER);
    setSort("default");
  }

  return {
    query,
    setQuery,
    brand,
    setBrand,
    brands,
    category,
    setCategory,
    categories,
    sort,
    setSort,
    filteredProducts,
    hasActiveFilters,
    resetFilters,
  };
}

function getUniqueSortedValues(
  products: ProductCatalogItem[],
  key: "brandName" | "categoryName",
): string[] {
  return Array.from(
    new Set(
      products
        .map((product) => product[key].trim())
        .filter(Boolean),
    ),
  ).sort((first, second) => first.localeCompare(second, "id"));
}

function compareNewest(
  first: ProductCatalogItem,
  second: ProductCatalogItem,
): number {
  return toTimestamp(second.createdAt) - toTimestamp(first.createdAt);
}

function toTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}
