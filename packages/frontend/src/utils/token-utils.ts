import { formatEther } from "ethers";

  export const TOKEN_DECIMALS = 18;
  

  // Format raw number to display with commas (e.g., 1000000 -> 1,000,000)
  export function formatNumber(num: number | string): string {
    return new Intl.NumberFormat().format(Number(num));
  }

  // formating ethereum
  export const formatETHPrice = (ethPrice: bigint | null | undefined): string => {
    if (!ethPrice) return '0.00'; // Return default value if ethPrice is null or undefined
    
    try {
      const formatted = formatEther(ethPrice);
      // Convert to number for easier manipulation
      const num = parseFloat(formatted);
      
      if (num < 0.0001) {
        // Use scientific notation for very small numbers
        return num.toExponential(4);
      } else if (num < 1) {
        // Show up to 4 decimal places for small numbers
        return num.toFixed(4);
      } else {
        // Show up to 2 decimal places for numbers >= 1
        return num.toFixed(2);
      }
    } catch (error) {
      console.error('Error formatting ETH price:', error);
      return '0.00';
    }
  };

  // utils/token-utils.ts
    // Convert token amount to display amount (e.g., 1000000000000000000 -> 1.00)

export const formatTokenAmount = (value: bigint, decimals: number = 18): string => {
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  const paddedFractional = fractionalPart.toString().padStart(decimals, '0');
  const significantDecimals = 4;
  const truncatedFractional = paddedFractional.slice(0, significantDecimals);
  return `${integerPart}.${truncatedFractional}`;
};


export const parseTokenAmount = (value: string, decimals: number = 18): bigint => {
  const [integerPart, fractionalPart = ''] = value.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integerPart + paddedFractional);
};