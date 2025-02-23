// utils/format.ts
export const formatBigInt = (value: bigint, decimals: number = 18): string => {
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;
    const paddedFractional = fractionalPart.toString().padStart(decimals, '0');
    const significantDecimals = 4; // Adjust as needed
    const truncatedFractional = paddedFractional.slice(0, significantDecimals);
    return `${integerPart}.${truncatedFractional}`;
  };