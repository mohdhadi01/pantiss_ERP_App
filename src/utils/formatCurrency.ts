/**
 * Format lakhs into standard Indian Crores / Lakhs representation
 * e.g., 280 -> "₹2.8 Cr", 45 -> "₹45.0 L"
 */
export function formatCurrency(lakhs: number, precise = false): string {
  if (isNaN(lakhs)) return '₹0 L';
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(precise ? 2 : 1)} Cr`;
  }
  return `₹${lakhs.toFixed(precise ? 2 : 1)} L`;
}

/**
 * Format raw rupees number to Indian currency format
 * e.g., 1250000 -> "₹12,50,000"
 */
export function formatRupees(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format plain number with Indian comma separators
 * e.g., 1250000 -> "12,50,000"
 */
export function formatIndianNumber(num: number): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}
