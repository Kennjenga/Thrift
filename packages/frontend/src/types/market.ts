// types/market.ts
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

import { type Address } from 'viem'

export interface Product {
  id: bigint
  seller: Address
  tokenPrice: bigint
  ethPrice: bigint
  quantity: bigint
  name: string
  description: string
  size: string
  condition: string
  brand: string
  categories: string[]
  gender: string
  image: string
  isAvailableForExchange: boolean
  exchangePreference: string
  isSold: boolean
  isDeleted: boolean
  inEscrowQuantity: bigint
}

export interface ExchangeOffer {
  offeredProductId: bigint
  wantedProductId: bigint
  offerer: Address
  isActive: boolean
  tokenTopUp: bigint
  escrowId: bigint
}

export interface Escrow {
  escrowId: bigint
  productId: bigint
  buyer: Address
  seller: Address
  amount: bigint
  deadline: bigint
  quantity: bigint
  buyerConfirmed: boolean
  sellerConfirmed: boolean
  completed: boolean
  refunded: boolean
  isToken: boolean
  isExchange: boolean
  exchangeProductId: bigint
  tokenTopUp: bigint
}

export interface MarketplaceStats {
  totalProducts: bigint
  activeListings: bigint
  totalCompletedEscrows: bigint
  totalVolume: bigint
}

export interface AestheticStat {
  productCount: bigint
  purchaseCount: bigint
  lastUpdated: bigint
}

export type Aesthetics =
  | 'Minimalist'
  | 'Old Money (Preppy/Classic Chic)'
  | 'Vintage'
  | 'Academia (Dark, Light, Romantic)'
  | 'Bohemian (Boho)'
  | 'Cottagecore'
  | 'Fairycore'
  | 'Goblincore'
  | 'Witchy'
  | 'Grunge'
  | 'Soft Grunge'
  | 'Punk'
  | 'Gothic (Traditional, Nu-Goth, Pastel Goth)'
  | 'Cyberpunk'
  | 'Y2K'
  | 'E-Girl / E-Boy'
  | 'Baddie'
  | 'Streetwear'
  | 'Athleisure'
  | 'Techwear'
  | 'Art Hoe'
  | 'Indie'
  | 'Retro Futurism'
  | 'Mod'
  | 'Barbiecore'
  | 'Kawaii'
  | 'Lolita (Classic, Sweet, Gothic)'
  | 'Decora'
  | 'Kidcore'
  | 'Harajuku'
  | 'Scene'
  | 'Emo'
  | 'Hippie'
  | 'Mermaidcore'
  | 'Dark Fantasy'
  | 'Pastelcore'
  | 'Soft Girl'
  | 'Camp'
  | 'Coastal Grandmother'
  | 'Balletcore'
  | 'Angelcore'
  | 'Gyaru'
  | 'Cowboycore (Western)'
  | 'Rocker Chic'
  | 'Mafia Chic'
  | 'Royalcore'
  | 'Regencore'
  | 'Steampunk'
  | 'Dieselpunk'
  | 'Light Academia';
