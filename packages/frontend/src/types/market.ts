// types/market.ts
import { type Address } from 'viem'

export type Aesthetics =
  | 'Minimalist'
  | 'Old Money'
  | 'Vintage'
  | 'Dark Academia'
  | 'Light Academia'
  | 'Romantic Academia'
  | 'Bohemian'
  | 'Cottagecore'
  | 'Fairycore'
  | 'Goblincore'
  | 'Witchy'
  | 'Grunge'
  | 'Soft Grunge'
  | 'Punk'
  | 'Gothic'
  | 'Nu-Goth'
  | 'Pastel Goth'
  | 'Cyberpunk'
  | 'Y2K'
  | 'E-Girl'
  | 'E-Boy'
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
  | 'Classic Lolita'
  | 'Sweet Lolita'
  | 'Gothic Lolita'
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
  | 'Cowboycore'
  | 'Rocker Chic'
  | 'Mafia Chic'
  | 'Royalcore'
  | 'Regencore'
  | 'Steampunk'
  | 'Dieselpunk';

export type ProductCondition = 'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
export type ProductGender = 'Men' | 'Women' | 'Unisex' | 'Kids';
export type PaymentMethod = 'ETH' | 'TOKEN';

export interface Product {
  id: bigint
  seller: Address
  tokenPrice: bigint
  ethPrice: bigint
  quantity: bigint
  name: string
  description: string
  size: string
  condition: ProductCondition
  brand: string
  categories: string[]
  gender: ProductGender
  image: string
  isAvailableForExchange: boolean
  exchangePreference: string
  isSold: boolean
  isDeleted: boolean
  inEscrowQuantity: bigint
  aesthetics: Aesthetics[]
}

export interface ExchangeOffer {
  offeredProductId: bigint
  wantedProductId: bigint
  offerer: Address
  isActive: boolean
  tokenTopUp: bigint
  escrowId: bigint
  offeredQuantity: bigint
}

export interface CartItem {
  product: Product
  quantity: bigint
  paymentMethod: PaymentMethod
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