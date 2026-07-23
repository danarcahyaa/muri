"use client";

import { useCallback, useMemo, useState } from "react";

interface UseMaterialOrderOptions {
  slug: string;
  pricePerKg: number;
  availableKg: number;
  minimumOrderKg: number;
  orderStepKg: number;
}

function toNonNegativeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function useMaterialOrder({
  slug,
  pricePerKg,
  availableKg,
  minimumOrderKg,
  orderStepKg,
}: UseMaterialOrderOptions) {
  const normalizedAvailableKg = toNonNegativeNumber(availableKg);
  const normalizedMinimumOrderKg = toNonNegativeNumber(minimumOrderKg);
  const normalizedOrderStepKg =
    Number.isFinite(orderStepKg) && orderStepKg > 0 ? orderStepKg : 1;
  const normalizedPricePerKg = toNonNegativeNumber(pricePerKg);

  const canOrder =
    normalizedAvailableKg > 0 &&
    normalizedAvailableKg >= normalizedMinimumOrderKg;

  const initialQuantity = canOrder ? normalizedMinimumOrderKg : 0;
  const [quantity, setQuantity] = useState(initialQuantity);

  const clampQuantity = useCallback(
    (value: number) => {
      if (!canOrder || !Number.isFinite(value)) {
        return initialQuantity;
      }

      const clamped = Math.min(
        normalizedAvailableKg,
        Math.max(normalizedMinimumOrderKg, value),
      );

      const stepCount = Math.round(
        (clamped - normalizedMinimumOrderKg) /
          normalizedOrderStepKg,
      );

      return Math.min(
        normalizedAvailableKg,
        normalizedMinimumOrderKg +
          stepCount * normalizedOrderStepKg,
      );
    },
    [
      canOrder,
      initialQuantity,
      normalizedAvailableKg,
      normalizedMinimumOrderKg,
      normalizedOrderStepKg,
    ],
  );

  function updateQuantity(value: number) {
    setQuantity(clampQuantity(value));
  }

  function handleQuantityInput(value: string) {
    if (value.trim() === "") {
      return;
    }

    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      setQuantity(parsedValue);
    }
  }

  const total = useMemo(
    () => clampQuantity(quantity) * normalizedPricePerKg,
    [clampQuantity, normalizedPricePerKg, quantity],
  );

  const normalizedQuantity = clampQuantity(quantity);
  const redirectTarget = `/material/${encodeURIComponent(
    slug,
  )}?quantity=${normalizedQuantity}`;

  return {
    quantity,
    normalizedQuantity,
    total,
    canOrder,
    minimumOrderKg: normalizedMinimumOrderKg,
    availableKg: normalizedAvailableKg,
    orderStepKg: normalizedOrderStepKg,
    canDecrease:
      canOrder && quantity > normalizedMinimumOrderKg,
    canIncrease:
      canOrder && quantity < normalizedAvailableKg,
    loginHref: `/auth/login?redirect=${encodeURIComponent(
      redirectTarget,
    )}`,
    handleQuantityInput,
    updateQuantity,
    commitQuantity: () => updateQuantity(quantity),
  };
}
