/**
 * Utilidades de formateo para la aplicación
 */

/**
 * Formateador de moneda (instancia única para rendimiento)
 * Evita crear una nueva instancia en cada render
 */
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/**
 * Formatea un valor numérico como moneda EUR
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: "29,99 €")
 */
export const formatCurrency = (value: number): string => currencyFormatter.format(value);
