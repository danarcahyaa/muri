"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any value by specified delay (in milliseconds).
 * Useful for text inputs to delay API calls / URL parameter sync.
 *
 * @param value The value to be debounced
 * @param delay The delay in milliseconds (default: 400ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
