// types/market.ts
import { type Address } from 'viem'
import { type Aesthetic } from '@/constants/aesthetics'

export type Aesthetics = Aesthetic; // Maintain backward compatibility

export type ProductCondition = 'New' | 'Like New' | 'Good' | 'Fair'
export type ProductGender = 'Men' | 'Women' | 'Unisex' | 'Kids'
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ProductCategory = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Accessories' | 'Shoes'

export interface Product {
  id: bigint;
  name: string;
  description: string;
  image: string;
  brand: string;
  condition: string;
  size: string;
  ethPrice: bigint;
  tokenPrice: bigint;
  quantity: bigint;
  seller: string;
  isAvailableForExchange: boolean;
  exchangePreference: string;
  categories: string[];
  gender: string;
  isSold: boolean;
  isDeleted: boolean;
  inEscrowQuantity: bigint;
}

export type PaymentMethod = "ETH" | "TOKEN";

export interface CartItem {
  product: Product;
  quantity: bigint;
  paymentMethod: PaymentMethod;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface ExchangeOffer {
  offeredProductId: bigint;
  wantedProductId: bigint;
  offerer: Address;
  isActive: boolean;
  tokenTopUp: bigint;
  escrowId: bigint;
  offeredQuantity: bigint;
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

export interface CreateProductFormData {
  name: string
  description: string
  size: string
  condition: ProductCondition
  brand: string
  categories: string[]
  gender: ProductGender
  image: string
  tokenPrice: string
  ethPrice: string
  quantity: string
  isAvailableForExchange: boolean
  exchangePreference: string
}