import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { type Address } from 'viem'
import { 
  MARKETPLACE_ABI, 
  MARKETPLACE_ADDRESS,
  // MARKETPLACE_STORAGE_ABI,
  // MARKETPLACE_STORAGE_ADDRESS,
  // MARKETPLACE_PRODUCT_ABI,
  // MARKETPLACE_PRODUCT_ADDRESS,
  // MARKETPLACE_ESCROW_ABI,
  // MARKETPLACE_ESCROW_ADDRESS,
  // MARKETPLACE_QUERY_ABI,
  // MARKETPLACE_QUERY_ADDRESS
} from '@/blockchain/abis/thrift'
import { Product } from '@/types/market'

// Define return type for search results
interface SearchResult {
  success: boolean;
  data?: {
    products: Product[];
  };
  error?: unknown;
}

/**
 * Hook to get a single product by ID
 */
export function useGetProductById(productId: bigint | undefined) {
  const result = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getProductsById',
    args: productId ? [[productId]] : undefined,
    chainId: 11155111, // Add this to specify Sepolia testnet
  });
  
  // Create a properly typed derived value
  const singleProduct = Array.isArray(result.data) && result.data.length > 0 
    ? result.data[0] 
    : undefined;
  
  // Return the result with the modified data
  return {
    ...result,
    data: singleProduct
  };
}

/**
 * Hook to get multiple products by their IDs
 */
export function useGetProductsByIds(productIds: bigint[] | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getProductsById',
    args: productIds && productIds.length > 0 ? [productIds] : undefined,
    chainId: 11155111,
  });
}

/**
 * Hook to get all products owned by a user
 */
export function useGetUserProducts(userAddress: Address | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserProducts',
    args: userAddress ? [userAddress] : undefined,
  });
}

/**
 * Hook to get all exchange offers for a product
 */
export function useGetExchangeOffers(productId: bigint | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getExchangeOffers',
    args: productId ? [productId] : undefined,
  });
}

/**
 * Hook to get all active products in the marketplace
 */
export function useGetAllActiveProducts() {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getAllActiveProducts',
    chainId: 11155111,
  });
}

/**
 * Hook to get active escrows where the user is the buyer
 */
export function useGetUserActiveEscrowsAsBuyer(userAddress: Address | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserActiveEscrowsAsBuyer',
    args: userAddress ? [userAddress] : undefined,
  });
}

/**
 * Hook to get active escrows where the user is the seller
 */
export function useGetUserActiveEscrowsAsSeller(userAddress: Address | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserActiveEscrowsAsSeller',
    args: userAddress ? [userAddress] : undefined,
  });
}

/**
 * Hook to get escrow details by ID
 */
export function useGetEscrowById(escrowId: bigint | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getEscrow',
    args: escrowId ? [escrowId] : undefined,
    chainId: 11155111,
  });
}

/**
 * Hook to get completed escrows for a user
 */
export function useGetUserCompletedEscrows(userAddress: Address | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserCompletedEscrows',
    args: userAddress ? [userAddress] : undefined,
  });
}

/**
 * Functions to interact with escrows
 */
export function useEscrowActions() {
  const { writeContract } = useWriteContract();

  // Confirm an escrow
  const confirmEscrow = async (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'confirmEscrow',
      args: [escrowId],
    });
  };

  // Reject an escrow
  const rejectEscrow = async (escrowId: bigint, reason: string) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'rejectEscrow',
      args: [escrowId, reason],
    });
  };

  // Cancel an escrow
  const cancelEscrow = async (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'cancelEscrow',
      args: [escrowId],
    });
  };

  return {
    confirmEscrow,
    rejectEscrow,
    cancelEscrow,
  };
}

// Main marketplace hook
export function useMarketplace() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  
  // Read functions
  const { data: allActiveProducts, refetch: refetchActiveProducts } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getAllActiveProducts',
    chainId: 11155111,
  })

  // Product creation and management
  const createProduct = async (
    name: string,
    description: string,
    size: string,
    condition: string,
    brand: string,
    categories: string[],
    gender: string,
    image: string,
    tokenPrice: bigint,
    ethPrice: bigint,
    quantity: bigint,
    isAvailableForExchange: boolean,
    exchangePreference: string
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createProduct',
      args: [
        name,
        description,
        size,
        condition,
        brand,
        categories,
        gender,
        image,
        tokenPrice,
        ethPrice,
        quantity,
        isAvailableForExchange,
        exchangePreference
      ],
    })
  }

  const updateProduct = async (
    productId: bigint,
    name: string,
    description: string,
    size: string,
    condition: string,
    brand: string,
    categories: string[],
    gender: string,
    image: string,
    tokenPrice: bigint,
    ethPrice: bigint,
    isAvailableForExchange: boolean,
    exchangePreference: string
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateProduct',
      args: [
        productId,
        name,
        description,
        size,
        condition,
        brand,
        categories,
        gender,
        image,
        tokenPrice,
        ethPrice,
        isAvailableForExchange,
        exchangePreference
      ],
    })
  }

  const updateProductQuantity = async (productId: bigint, newQuantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateProductQuantity',
      args: [productId, newQuantity],
    })
  }

  const batchUpdateQuantities = async (productIds: bigint[], newQuantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'batchUpdateQuantities',
      args: [productIds, newQuantities],
    })
  }

  // Escrow management
  const createEscrowWithEth = async (productId: bigint, quantity: bigint, value: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createEscrowWithEth',
      args: [productId, quantity],
      value: value,
    })
  }

  const createEscrowWithTokens = async (productId: bigint, quantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createEscrowWithTokens',
      args: [productId, quantity],
    })
  }

  const createBulkEscrowWithEth = async (productIds: bigint[], quantities: bigint[], totalValue: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createBulkEscrowWithEth',
      args: [productIds, quantities],
      value: totalValue,
    })
  }

  const createBulkEscrowWithTokens = async (productIds: bigint[], quantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createBulkEscrowWithTokens',
      args: [productIds, quantities],
    })
  }

  const confirmEscrow = async (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'confirmEscrow',
      args: [escrowId],
    })
  }

  const cancelEscrow = async (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'cancelEscrow',
      args: [escrowId],
    })
  }

  const rejectEscrow = async (escrowId: bigint, reason: string) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'rejectEscrow',
      args: [escrowId, reason],
    })
  }

  const bulkConfirmEscrowsAsBuyer = async (escrowIds: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'bulkConfirmEscrowsAsBuyer',
      args: [escrowIds],
    })
  }

  const bulkConfirmEscrowsForSeller = async (escrowIds: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'bulkConfirmEscrowsForSeller',
      args: [escrowIds],
    })
  }

  // Exchange functionality
  const createExchangeOffer = async (
    offeredProductId: bigint,
    wantedProductId: bigint,
    quantity: bigint,
    tokenTopUp: bigint
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createExchangeOffer',
      args: [offeredProductId, wantedProductId, quantity, tokenTopUp],
    })
  }

  // Fixed search functionality with proper typing
  const searchProducts = async (
    nameQuery: string,
    categories: string[],
    brand: string,
    condition: string,
    gender: string,
    size: string,
    minPrice: bigint,
    maxPrice: bigint,
    onlyAvailable: boolean,
    exchangeOnly: boolean,
    page: bigint,
    pageSize: bigint
  ): Promise<SearchResult> => {
    // Fix: Construct search params object correctly
    const searchParams = {
      nameQuery,
      categories,
      brand,
      condition,
      gender,
      size,
      minPrice,
      maxPrice,
      onlyAvailable,
      exchangeOnly,
      page,
      pageSize
    };

    try {
      // Use a direct call pattern instead of a hook
      const result = await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'searchProducts',
        args: [searchParams],
        chainId: 11155111,
      });
      
      return { 
        success: true, 
        data: { 
          products: Array.isArray(result) ? result : [] 
        } 
      };
    } catch (error) {
      console.error("Error performing search:", error);
      return { success: false, error };
    }
  };

  // Fixed to use proper async pattern
  const getProductsByUserAesthetics = async (
    user: Address, 
    page: bigint, 
    pageSize: bigint
  ): Promise<SearchResult> => {
    try {
      // Direct contract call instead of hook
      const result = await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'getProductsByUserAesthetics',
        args: [user, page, pageSize],
      });
      
      return { 
        success: true, 
        data: { 
          products: Array.isArray(result) ? result : [] 
        } 
      };
    } catch (error) {
      console.error("Error getting products by user aesthetics:", error);
      return { success: false, error };
    }
  };

  // Admin functions
  const togglePause = async () => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'togglePause',
    })
  }

  const updatePlatformFees = async (newTokenFee: bigint, newEthFee: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updatePlatformFees',
      args: [newTokenFee, newEthFee],
    })
  }

  const updateTreasuryWallet = async (newTreasury: Address) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateTreasuryWallet',
      args: [newTreasury],
    })
  }

  const updateUserAesthetics = async (newUserAesthetics: Address) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateUserAesthetics',
      args: [newUserAesthetics],
    })
  }

  return {
    // User data
    userAddress: address,
    
    // Products data
    allActiveProducts,
    refetchActiveProducts,
    
    // Product management
    createProduct,
    updateProduct,
    updateProductQuantity,
    batchUpdateQuantities,
    
    // Escrow management
    createEscrowWithEth,
    createEscrowWithTokens,
    createBulkEscrowWithEth,
    createBulkEscrowWithTokens,
    confirmEscrow,
    cancelEscrow,
    rejectEscrow,
    bulkConfirmEscrowsAsBuyer,
    bulkConfirmEscrowsForSeller,
    
    // Exchange functionality
    createExchangeOffer,
    
    // Search functionality with fixed implementation
    searchProducts,
    getProductsByUserAesthetics,
    
    // Admin functions
    togglePause,
    updatePlatformFees,
    updateTreasuryWallet,
    updateUserAesthetics,
  }
}