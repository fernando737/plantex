/**
 * Colombian Peso (COP) currency formatting utilities
 */

export const formatCOP = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '$0';
  }

  // Format without currency symbol first, then add custom $ prefix
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
  
  return `$${formatted}`;
};

export const formatCOPWithDecimals = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '$0.00';
  }

  // Format without currency symbol first, then add custom $ prefix
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
  
  return `$${formatted}`;
};

export const parseCOP = (formattedAmount: string): number => {
  // Remove currency symbols, spaces, and dots (thousands separator)
  // Replace comma with dot for decimal separator if needed
  const cleanAmount = formattedAmount
    .replace(/[COP\s$\.]/g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanAmount);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCOPInput = (value: string): string => {
  // For input fields - remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Handle Colombian decimal format (comma as decimal separator)
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length === 2) {
      return `${parts[0]}.${parts[1].slice(0, 2)}`; // Limit to 2 decimals
    }
  }
  
  return cleaned;
};

export const isValidCOPAmount = (amount: string): boolean => {
  const numericAmount = parseFloat(amount);
  return !isNaN(numericAmount) && numericAmount >= 0;
};