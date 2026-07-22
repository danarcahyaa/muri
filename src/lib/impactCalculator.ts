/**
 * Environmental impact conversion factors for textile waste circularity.
 * Based on life-cycle assessment (LCA) data for textile waste diversion.
 */
export const IMPACT_CONVERSION_FACTORS = {
  /**
   * Kilograms of CO2e avoided per 1 Kg of fabric waste saved.
   * Standard textile industry diversion factor (~3.6 kg CO2e / kg waste).
   */
  CARBON_KG_PER_WASTE_KG: 3.6,

  /**
   * Liters of clean water saved per 1 Kg of fabric waste saved.
   * Average virtual water footprint saved by reusing textile waste (~5,000 L / kg).
   */
  WATER_LITERS_PER_WASTE_KG: 5000,
} as const;

/**
 * Calculates total carbon offset (in Kg CO2e avoided) based on saved fabric waste weight.
 *
 * @param wasteKg - Total saved fabric weight in kilograms.
 * @returns Calculated CO2 emission reduction in Kg.
 */
export function calculateCarbonSaved(wasteKg: number): number {
  if (wasteKg <= 0) return 0;
  return Number((wasteKg * IMPACT_CONVERSION_FACTORS.CARBON_KG_PER_WASTE_KG).toFixed(2));
}

/**
 * Calculates total water saved (in Liters) based on saved fabric waste weight.
 *
 * @param wasteKg - Total saved fabric weight in kilograms.
 * @returns Calculated clean water saved in Liters.
 */
export function calculateWaterSaved(wasteKg: number): number {
  if (wasteKg <= 0) return 0;
  return Math.round(wasteKg * IMPACT_CONVERSION_FACTORS.WATER_LITERS_PER_WASTE_KG);
}
