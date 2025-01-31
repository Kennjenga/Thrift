// types/market.ts
export interface Product {
  id: number
  name: string
  description: string
  size: string
  condition: string
  brand: string
  categories: string
  gender: string
  image: string
  tokenPrice: bigint
  ethPrice: bigint
  quantity: bigint
  seller: string
  isAvailableForExchange: boolean
  exchangePreference: string
  isDeleted: boolean
}

export interface ExchangeOffer {
  offeredProductId: bigint
  wantedProductId: bigint
  offerer: `0x${string}`
  isActive: boolean
  offeredQuantity: bigint
  tokenTopUp: bigint
}

export interface CartItem {
  product: Product
  quantity: number
  paymentMethod: 'ETH' | 'TOKEN'
}