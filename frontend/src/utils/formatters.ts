/**
 * Formats a currency number using Indian Numbering System (Lakhs & Crores)
 * e.g., 1850000 -> ₹18.50 Lakh | 12500000 -> ₹1.25 Crore
 */
export function formatIndianCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return '₹0';
  }
  
  const absVal = Math.abs(amount);
  
  if (absVal >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Crore`;
  } else if (absVal >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats raw numbers using Indian digit grouping (e.g. 79,068)
 */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(num);
}
