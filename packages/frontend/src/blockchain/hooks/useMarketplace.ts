import { useReadContract, useWriteContract, useAccount } from 'wagmi'
// import { Address } from 'viem'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/blockchain/abis/thrift'


export function useMarketplace() {
  useAccount()
  const { writeContract } = useWriteContract()

  // Read all products
  const { data: products, refetch: refetchProducts } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    functionName: 'products',
    abi: MARKETPLACE_ABI, 
  })

  // Read product count
  const { data: productCount } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    functionName: 'productCount',
    abi: MARKETPLACE_ABI, 
  })

  // Individual product details
  const useProductDetails = (productId: bigint) => {
    return useReadContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'products',
      args: [productId],
      abi: MARKETPLACE_ABI, 
    })
  }

  // Write functions
  const listProduct = async (
    name: string, 
    description: string, 
    tokenPrice: bigint,
    ethPrice: bigint,
    quantity: bigint,
    image: string
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'listProduct',
      abi: MARKETPLACE_ABI, 
      args: [
        name, description, 'size', 'condition', 'brand', 
        'categories', 'gender', image, tokenPrice, ethPrice, 
        quantity, true, 'any'
      ]
    })
  }

  const buyWithEth = async (productId: bigint, quantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'buyWithEth',
      abi: MARKETPLACE_ABI, 
      args: [productId, quantity]
    })
  }

  const buyWithTokens = async (productId: bigint, quantity: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'buyWithTokens',
      abi: MARKETPLACE_ABI, 
      args: [productId, quantity]
    })
  }

  const createEnhancedExchange = async (
    offeredProductId: bigint,
    wantedProductId: bigint,
    offeredQuantity: bigint,
    tokenTopUp: bigint
  ) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'createEnhancedExchangeOffer',
      abi: MARKETPLACE_ABI, 
      args: [offeredProductId, wantedProductId, offeredQuantity, tokenTopUp]
    })
  }
  const deleteListing = async (productId: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'deleteListing',
      abi: MARKETPLACE_ABI, 
      args: [productId]
    })
  }

  const buyWithEthBulk = async (productIds: bigint[], quantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'buyWithEthBulk',
      abi: MARKETPLACE_ABI, 
      args: [productIds, quantities]
    })
  }

  const buyWithTokensBulk = async (productIds: bigint[], quantities: bigint[]) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'buyWithTokensBulk',
      abi: MARKETPLACE_ABI, 
      args: [productIds, quantities]
    })
  }

  const acceptEnhancedExchangeOffer = async (productId: bigint, offerIndex: bigint) => {
    return writeContract({
      address: MARKETPLACE_ADDRESS,
      functionName: 'acceptEnhancedExchangeOffer',
      abi: MARKETPLACE_ABI, 
      args: [productId, offerIndex]
    })
  }

  return {
    products,
    productCount,
    useProductDetails,
    listProduct,
    buyWithEth,
    buyWithTokens,
    createEnhancedExchange,
    refetchProducts,
    deleteListing,
    buyWithEthBulk,
    buyWithTokensBulk,
    acceptEnhancedExchangeOffer
  }
}