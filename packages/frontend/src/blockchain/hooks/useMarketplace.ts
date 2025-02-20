import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { type Address } from 'viem'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/blockchain/abis/thrift'
// import { Product, ExchangeOffer, Escrow, MarketplaceStats } from '@/types/market'
import { sepolia } from 'wagmi/chains'

export function useMarketplaceEnhanced() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Core Read Functions
  const productCount = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'productCount',
    chainId: sepolia.id,
  })

  const totalActiveProducts = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getTotalActiveProducts',
    chainId: sepolia.id,
  })

  const totalProducts = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getTotalProducts',
    chainId: sepolia.id,
  })

  // Marketplace Statistics
  const useGetMarketplaceStats = () => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getMarketplaceStats',
      chainId: sepolia.id,
    })
  }

  // Product Read Functions
  const useGetProduct = (productId: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'products',
      args: [productId],
      chainId: sepolia.id,
    })
  }

  const useGetProductsBatch = (productIds: bigint[]) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getProductsBatch',
      args: [productIds],
      chainId: sepolia.id,
    })
  }

  const useGetUserProducts = (userAddress: Address) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getUserProducts',
      args: [userAddress],
      chainId: sepolia.id,
    })
  }

  const useGetProductsByCategory = (category: string, limit: bigint, offset: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getProductsByCategory',
      args: [category, limit, offset],
      chainId: sepolia.id,
    })
  }

  const useGetProductsByAestheticPreference = (userAddress: Address, limit: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getProductsByAestheticPreference',
      args: [userAddress, limit],
      chainId: sepolia.id,
    })
  }

  const useSearchProducts = (
    searchTerm: string,
    categories: string[],
    gender: string,
    brand: string,
    minPrice: bigint,
    maxPrice: bigint,
    useTokenPrice: boolean,
    limit: bigint,
    offset: bigint
  ) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'searchProducts',
      args: [searchTerm, categories, gender, brand, minPrice, maxPrice, useTokenPrice, limit, offset],
      chainId: sepolia.id,
    })
  }

  // Exchange Offers Functions
  const useGetExchangeOffers = (productId: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getExchangeOffersForProduct',
      args: [productId],
      chainId: sepolia.id,
    })
  }

  // Escrow Functions
  const useGetUserEscrows = (userAddress: Address) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getUserEscrows',
      args: [userAddress],
      chainId: sepolia.id,
    })
  }

  const useGetEscrowsBatch = (escrowIds: bigint[]) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getEscrowsBatch',
      args: [escrowIds],
      chainId: sepolia.id,
    })
  }

  // Aesthetic Functions
  const useGetTopAesthetics = () => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getTopAesthetics',
      chainId: sepolia.id,
    })
  }

  // Platform Fee Functions
  const useGetTokenPlatformFee = () => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'tokenPlatformFee',
      chainId: sepolia.id,
    })
  }

  const useGetEthPlatformFee = () => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'ethPlatformFee',
      chainId: sepolia.id,
    })
  }

  // Write Functions - Product Management
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
        exchangePreference,
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
        exchangePreference,
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

  const deleteProduct = async (productId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'deleteProduct',
      args: [productId],
    })
  }

  // Write Functions - Purchase Flow
  const createEscrowWithEth = async (productId: bigint, quantity: bigint, ethAmount: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createEscrowWithEth',
      args: [productId, quantity],
      value: ethAmount,
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

  const confirmEscrow = async (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'confirmEscrow',
      args: [escrowId],
    })
  }

  const refundEscrow = async (escrowId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'refundEscrow',
      args: [escrowId],
    })
  }

  // Write Functions - Bulk Purchase
  const createBulkEscrowWithEth = async (
    productIds: bigint[],
    quantities: bigint[],
    totalEthAmount: bigint
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createBulkEscrowWithEth',
      args: [productIds, quantities],
      value: totalEthAmount,
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

  // Write Functions - Exchange Flow
  const createExchangeOffer = async (
    offeredProductId: bigint,
    wantedProductId: bigint,
    tokenTopUp: bigint
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createExchangeOffer',
      args: [offeredProductId, wantedProductId, tokenTopUp],
    })
  }

  const acceptExchangeOffer = async (wantedProductId: bigint, offerIndex: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'acceptExchangeOffer',
      args: [wantedProductId, offerIndex],
    })
  }

  return {
    // Core reads
    productCount,
    totalActiveProducts,
    totalProducts,
    userAddress: address,
    
    // Hooks
    useGetMarketplaceStats,
    useGetProduct,
    useGetProductsBatch,
    useGetUserProducts,
    useGetProductsByCategory,
    useGetProductsByAestheticPreference,
    useGetExchangeOffers,
    useGetUserEscrows,
    useGetEscrowsBatch,
    useGetTopAesthetics,
    useGetTokenPlatformFee,
    useGetEthPlatformFee,
    useSearchProducts,
    
    // Product Management
    createProduct,
    updateProduct,
    updateProductQuantity,
    deleteProduct,
    
    // Purchase Flow
    createEscrowWithEth,
    createEscrowWithTokens,
    confirmEscrow,
    refundEscrow,
    
    // Bulk Purchase
    createBulkEscrowWithEth,
    createBulkEscrowWithTokens,
    
    // Exchange Flow
    createExchangeOffer,
    acceptExchangeOffer,
  }
}