"use client";

import { useMemo, useState } from "react";

import type { MaterialCatalogItem } from "@/types/material";

export type MaterialSortOption = "default" | "price-low" | "price-high";

const ALL_LOCATIONS = "Semua";

export function useMaterialCatalogFilters(
  materials: MaterialCatalogItem[],
) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(ALL_LOCATIONS);
  const [sort, setSort] = useState<MaterialSortOption>("default");

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set(
        materials
          .map((material) => material.originCity.trim())
          .filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second, "id"));

    return [ALL_LOCATIONS, ...uniqueLocations];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

    const result = materials.filter((material) => {
      const searchableValues = [
        material.title,
        material.categoryName,
        material.providerName,
        material.batchCode,
        material.originCity,
      ];

      const matchesSearch =
        normalizedQuery.length === 0 ||
        searchableValues.some((value) =>
          value.toLocaleLowerCase("id-ID").includes(normalizedQuery),
        );

      const matchesLocation =
        location === ALL_LOCATIONS ||
        material.originCity.trim() === location;

      return matchesSearch && matchesLocation;
    });

    return [...result].sort((first, second) => {
      switch (sort) {
        case "price-low":
          return first.pricePerKg - second.pricePerKg;
        case "price-high":
          return second.pricePerKg - first.pricePerKg;
        default:
          return 0;
      }
    });
  }, [location, materials, query, sort]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    location !== ALL_LOCATIONS ||
    sort !== "default";

  function resetFilters() {
    setQuery("");
    setLocation(ALL_LOCATIONS);
    setSort("default");
  }

  return {
    query,
    setQuery,
    location,
    setLocation,
    sort,
    setSort,
    locations,
    filteredMaterials,
    hasActiveFilters,
    resetFilters,
  };
}
