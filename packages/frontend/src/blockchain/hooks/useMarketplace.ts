import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { type Address } from 'viem'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/blockchain/abis/thrift'
import { Product } from '@/types/market'

export function useMarketplace() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Read functions
  const productCount = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'productCount',
  })

  const totalActiveProducts = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getTotalActiveProducts',
  })

  const totalProducts = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getTotalProducts',
  })

  const useGetProduct = (productId: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getProduct',
      args: [productId],
    })
  }

  const useGetExchangeOffers = (productId: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getAllExchangeOffersForProduct',
      args: [productId],
    })
  }

  const useGetAllProducts = () => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getAllProducts',
    })
  }

  const useGetProductsByOwner = (owner: Address) => {
    const allProducts = useGetAllProducts()
    return {
      ...allProducts,
      data: Array.isArray(allProducts.data) 
        ? allProducts.data.filter((product: Product) => product.seller === owner && !product.isDeleted)
        : []
    }
  }

  // Write functions
  const listProduct = async (
    name: string,
    description: string,
    size: string,
    condition: string,
    brand: string,
    categories: string,
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
      functionName: 'listProduct',
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

  const buyWithEth = async (productId: bigint, quantity: bigint, ethAmount: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'buyWithEth',
      args: [productId, quantity],
      value: ethAmount,
    })
  }

  const buyWithTokens = async (productId: bigint, quantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'buyWithTokens',
      args: [productId, quantity],
    })
  }

  const createEnhancedExchangeOffer = async (
    offeredProductId: bigint,
    wantedProductId: bigint,
    offeredQuantity: bigint,
    tokenTopUp: bigint
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'createEnhancedExchangeOffer',
      args: [offeredProductId, wantedProductId, offeredQuantity, tokenTopUp],
    })
  }

  const acceptEnhancedExchangeOffer = async (productId: bigint, offerIndex: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'acceptEnhancedExchangeOffer',
      args: [productId, offerIndex],
    })
  }

  const deleteListing = async (productId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'deleteListing',
      args: [productId],
    })
  }

  const buyWithEthBulk = async (
    productIds: bigint[],
    quantities: bigint[],
    totalEthAmount: bigint
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'buyWithEthBulk',
      args: [productIds, quantities],
      value: totalEthAmount,
    })
  }

  const buyWithTokensBulk = async (productIds: bigint[], quantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'buyWithTokensBulk',
      args: [productIds, quantities],
    })
  }

  return {
    productCount,
    totalActiveProducts,
    totalProducts,
    userAddress: address,
    useGetProduct,
    useGetAllProducts,
    useGetProductsByOwner,
    useGetExchangeOffers,
    listProduct,
    buyWithEth,
    buyWithTokens,
    createEnhancedExchangeOffer,
    acceptEnhancedExchangeOffer,
    deleteListing,
    buyWithEthBulk,
    buyWithTokensBulk,
  }
}