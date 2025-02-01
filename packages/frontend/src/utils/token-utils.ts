export const TOKEN_DECIMALS = 18;

// Convert raw amount to token amount (e.g., 1 -> 1000000000000000000)
export function parseTokenAmount(amount: string | number): bigint {
  try {
    // Remove any commas from the input
    const cleanAmount = amount.toString().replace(/,/g, '');
    // Convert to number and check if valid
    const numAmount = Number(cleanAmount);
    if (isNaN(numAmount)) throw new Error('Invalid amount');
    
    // Convert to BigInt with decimals
    return BigInt(Math.floor(numAmount * 10 ** TOKEN_DECIMALS));
  } catch {
    throw new Error('Invalid token amount');
  }
}

// Convert token amount to display amount (e.g., 1000000000000000000 -> 1.00)
export function formatTokenAmount(amount: bigint): string {
  try {
    const divisor = BigInt(10 ** TOKEN_DECIMALS);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    // Convert to string with proper decimal places
    const formattedFractional = fractionalPart.toString().padStart(TOKEN_DECIMALS, '0');
    const significantDecimals = 3; // Show 2 decimal places
    
    return `${wholePart.toString()}.${formattedFractional.slice(0, significantDecimals)}`;
  } catch {
    return '0.00';
  }
}

// Format raw number to display with commas (e.g., 1000000 -> 1,000,000)
export function formatNumber(num: number | string): string {
  return new Intl.NumberFormat().format(Number(num));
}