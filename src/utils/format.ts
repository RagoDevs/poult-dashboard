/**
 * Utility functions for formatting values in the application
 */

/**
 * Format a number as Tanzanian Shillings using the format 'Tshs. 2500 /='
 * @param amount The amount to format
 * @param compact Whether to use compact notation for mobile displays
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, compact: boolean = false): string => {
  // Format the number with thousand separators but no decimal places
  const formattedNumber = new Intl.NumberFormat('en-TZ', {
    useGrouping: true,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
  
  // For compact notation (mobile), use shorter format
  if (compact && amount >= 1000) {
    const compactNumber = new Intl.NumberFormat('en-TZ', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
    return `Tshs. ${compactNumber} /=`;
  }
  
  // Return in the requested format: Tshs. 2500 /=
  return `Tshs. ${formattedNumber} /=`;
};

/**
 * Format a date string
 * @param dateStr The date string to format
 * @param compact Whether to use compact notation for mobile displays
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string, compact: boolean = false): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-TZ', {
    year: 'numeric',
    month: compact ? 'numeric' : 'short',
    day: 'numeric'
  }).format(date);
};
