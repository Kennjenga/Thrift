import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { type Address } from 'viem'
import { 
  MARKETPLACE_ABI, 
  MARKETPLACE_ADDRESS,
  MARKETPLACE_STORAGE_ABI,
  MARKETPLACE_STORAGE_ADDRESS
} from '@/blockchain/abis/thrift'

// Constants
const SEPOLIA_CHAIN_ID = 11155111

/**
 * Basic product management hooks
 */
export function useProductsData(address?: Address) {
  // Get all active products
  const activeProducts = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getAllActiveProducts',
    chainId: SEPOLIA_CHAIN_ID,
  })
  
  // Get user's products
  const userProducts = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserProducts',
    args: address ? [address] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!address,
  })
  
  return {
    activeProducts: {
      data: activeProducts.data || [],
      isLoading: activeProducts.isLoading,
      isError: activeProducts.isError,
      error: activeProducts.error,
      refetch: activeProducts.refetch
    },
    userProducts: {
      data: userProducts.data || [],
      isLoading: userProducts.isLoading,
      isError: userProducts.isError,
      error: userProducts.error,
      refetch: userProducts.refetch
    }
  }
}

/**
 * Hook for product operations (create, update, etc.)
 */
export function useProductOperations() {
  const { writeContract } = useWriteContract()
  
  // Create product
  const createProduct = (params: {
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
  }) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createProduct',
      args: [
        params.name,
        params.description,
        params.size,
        params.condition,
        params.brand,
        params.categories,
        params.gender,
        params.image,
        params.tokenPrice,
        params.ethPrice,
        params.quantity,
        params.isAvailableForExchange,
        params.exchangePreference
      ],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Update product
  const updateProduct = (params: {
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
  }) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateProduct',
      args: [
        params.productId,
        params.name,
        params.description,
        params.size,
        params.condition,
        params.brand,
        params.categories,
        params.gender,
        params.image,
        params.tokenPrice,
        params.ethPrice,
        params.isAvailableForExchange,
        params.exchangePreference
      ],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Update product quantity
  const updateQuantity = (productId: bigint, newQuantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateProductQuantity',
      args: [productId, newQuantity],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Batch update quantities
  const batchUpdateQuantities = (productIds: bigint[], newQuantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'batchUpdateQuantities',
      args: [productIds, newQuantities],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  return {
    createProduct,
    updateProduct,
    updateQuantity,
    batchUpdateQuantities
  }
}

/**
 * Hook for getting product details
 */
export function useProductDetails(productId?: bigint) {
  const result = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getProductsById',
    args: productId ? [[productId]] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!productId
  })
  
  // Get exchange offers for this product
  const exchangeOffers = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getExchangeOffers',
    args: productId ? [productId] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!productId
  })
  
  return {
    // Extract first product from array if available
    product: Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : undefined,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    // Exchange offers
    exchangeOffers: {
      data: exchangeOffers.data || [],
      isLoading: exchangeOffers.isLoading,
      isError: exchangeOffers.isError,
      error: exchangeOffers.error,
      refetch: exchangeOffers.refetch
    }
  }
}

/**
 * Hook for getting multiple products by IDs
 */
export function useProductsById(productIds?: bigint[]) {
  const result = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getProductsById',
    args: productIds && productIds.length > 0 ? [productIds] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!(productIds && productIds.length > 0)
  })
  
  return {
    products: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}

/**
 * Hook for searching products
 */
export function useProductSearch(params?: {
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
}) {
  const result = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'searchProducts',
    args: params ? [params] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!params
  })
  
  return {
    results: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}

/**
 * Hook for getting products by user aesthetics
 */
export function useProductsByAesthetics(user?: Address, page = 1n, pageSize = 10n) {
  const result = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getProductsByUserAesthetics',
    args: user ? [user, page, pageSize] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!user
  })
  
  return {
    results: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}

/**
 * Hook for escrow management - reading escrow data
 */
export function useEscrowData(address?: Address) {
  // Get active escrows where user is buyer
  const buyerEscrows = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserActiveEscrowsAsBuyer',
    args: address ? [address] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!address
  })
  
  // Get active escrows where user is seller
  const sellerEscrows = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserActiveEscrowsAsSeller',
    args: address ? [address] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!address
  })
  
  // Get completed escrows
  const completedEscrows = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getUserCompletedEscrows',
    args: address ? [address] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    // enabled: !!address
  })
  
  return {
    buyerEscrows: {
      data: buyerEscrows.data || [],
      isLoading: buyerEscrows.isLoading,
      isError: buyerEscrows.isError,
      error: buyerEscrows.error,
      refetch: buyerEscrows.refetch
    },
    sellerEscrows: {
      data: sellerEscrows.data || [],
      isLoading: sellerEscrows.isLoading,
      isError: sellerEscrows.isError,
      error: sellerEscrows.error,
      refetch: sellerEscrows.refetch
    },
    completedEscrows: {
      data: completedEscrows.data || [],
      isLoading: completedEscrows.isLoading,
      isError: completedEscrows.isError,
      error: completedEscrows.error,
      refetch: completedEscrows.refetch
    },
    allEscrowIds: [
      ...(Array.isArray(buyerEscrows.data) ? buyerEscrows.data : []),
      ...(Array.isArray(sellerEscrows.data) ? sellerEscrows.data : []),
      ...(Array.isArray(completedEscrows.data) ? completedEscrows.data : [])
    ]
  }
}

/**
 * Hook for getting details of a specific escrow
 */
export function useEscrowDetails(escrowId?: bigint) {
  const result = useReadContract({
    address: MARKETPLACE_STORAGE_ADDRESS,
    abi: MARKETPLACE_STORAGE_ABI,
    functionName: 'getEscrow',
    args: escrowId ? [escrowId] : undefined,
    chainId: SEPOLIA_CHAIN_ID
  })
  
  return {
    escrow: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}

/**
 * Hook for escrow operations
 */
export function useEscrowOperations() {
  const { writeContract } = useWriteContract()
  
  // Create escrow with ETH
  const createEscrowWithEth = (productId: bigint, quantity: bigint, value: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createEscrowWithEth',
      args: [productId, quantity],
      value,
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Create escrow with tokens
  const createEscrowWithTokens = (productId: bigint, quantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createEscrowWithTokens',
      args: [productId, quantity],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Create bulk escrow with ETH
  const createBulkEscrowWithEth = (productIds: bigint[], quantities: bigint[], totalValue: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createBulkEscrowWithEth',
      args: [productIds, quantities],
      value: totalValue,
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Create bulk escrow with tokens
  const createBulkEscrowWithTokens = (productIds: bigint[], quantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createBulkEscrowWithTokens',
      args: [productIds, quantities],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Confirm escrow
  const confirmEscrow = (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'confirmEscrow',
      args: [escrowId],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Reject escrow
  const rejectEscrow = (escrowId: bigint, reason: string) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'rejectEscrow',
      args: [escrowId, reason],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Cancel escrow
  const cancelEscrow = (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'cancelEscrow',
      args: [escrowId],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Bulk confirm escrows as buyer
  const bulkConfirmEscrowsAsBuyer = (escrowIds: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'bulkConfirmEscrowsAsBuyer',
      args: [escrowIds],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Bulk confirm escrows as seller
  const bulkConfirmEscrowsAsSeller = (escrowIds: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'bulkConfirmEscrowsForSeller',
      args: [escrowIds],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Create exchange offer
  const createExchangeOffer = (
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
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  return {
    createEscrowWithEth,
    createEscrowWithTokens,
    createBulkEscrowWithEth,
    createBulkEscrowWithTokens,
    confirmEscrow,
    rejectEscrow,
    cancelEscrow,
    bulkConfirmEscrowsAsBuyer,
    bulkConfirmEscrowsAsSeller,
    createExchangeOffer
  }
}

/**
 * Hook for admin operations
 */
export function useAdminOperations() {
  const { writeContract } = useWriteContract()
  
  // Toggle marketplace pause state
  const togglePause = () => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'togglePause',
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Update platform fees
  const updatePlatformFees = (newTokenFee: bigint, newEthFee: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updatePlatformFees',
      args: [newTokenFee, newEthFee],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Update treasury wallet
  const updateTreasuryWallet = (newTreasury: Address) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateTreasuryWallet',
      args: [newTreasury],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  // Update user aesthetics contract
  const updateUserAesthetics = (newUserAesthetics: Address) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'updateUserAesthetics',
      args: [newUserAesthetics],
      chainId: SEPOLIA_CHAIN_ID
    })
  }
  
  return {
    togglePause,
    updatePlatformFees,
    updateTreasuryWallet,
    updateUserAesthetics
  }
}

/**
 * Main marketplace hook that combines all functionality
 */
export function useMarketplace() {
  const { address } = useAccount()
  
  // Get all product data
  const productsData = useProductsData(address)
  
  // Get user escrow data
  const escrowData = useEscrowData(address)
  
  // Get operations
  const productOperations = useProductOperations()
  const escrowOperations = useEscrowOperations()
  const adminOperations = useAdminOperations()
  
  return {
    // User address
    userAddress: address,
    
    // Product data
    activeProducts: productsData.activeProducts.data,
    userProducts: productsData.userProducts.data,
    isLoadingProducts: productsData.activeProducts.isLoading || productsData.userProducts.isLoading,
    refetchProducts: () => {
      productsData.activeProducts.refetch()
      productsData.userProducts.refetch()
    },
    
    // Escrow data
    buyerEscrows: escrowData.buyerEscrows.data,
    sellerEscrows: escrowData.sellerEscrows.data,
    completedEscrows: escrowData.completedEscrows.data,
    allEscrowIds: escrowData.allEscrowIds,
    isLoadingEscrows: escrowData.buyerEscrows.isLoading || 
                      escrowData.sellerEscrows.isLoading || 
                      escrowData.completedEscrows.isLoading,
    refetchEscrows: () => {
      escrowData.buyerEscrows.refetch()
      escrowData.sellerEscrows.refetch()
      escrowData.completedEscrows.refetch()
    },
    
    // Product operations
    ...productOperations,
    
    // Escrow operations
    ...escrowOperations,
    
    // Admin operations
    ...adminOperations,
    
    // Functions to get detailed data
    useProductDetails,
    useProductsById,
    useProductSearch,
    useProductsByAesthetics,
    useEscrowDetails
  }
}