export function formatCurrency(lakhs: number, precise = false): string {
  if (isNaN(lakhs)) return '₹0 L';
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(precise ? 2 : 1)} Cr`;
  }
  return `₹${lakhs.toFixed(precise ? 2 : 1)} L`;
}

export function formatRupees(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianNumber(num: number): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}
