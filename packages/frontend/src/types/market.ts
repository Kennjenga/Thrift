import { type Address } from 'viem'
import { type Aesthetic } from '@/constants/aesthetics'

export type Aesthetics = Aesthetic; // Maintain backward compatibility

export type ProductCondition = 'New' | 'Like New' | 'Good' | 'Fair'
export type ProductGender = 'Men' | 'Women' | 'Unisex' | 'Kids'
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ProductCategory = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Accessories' | 'Shoes'

// Basic Product interface
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
  seller: Address;
  isAvailableForExchange: boolean;
  exchangePreference: string;
  categories: string[];
  gender: string;
  isSold: boolean;
  isDeleted: boolean;
  inEscrowQuantity: bigint;
}

// Extended product interface from smart contract that includes availability
export interface ProductWithAvailability extends Omit<Product, 'quantity'> {
  totalQuantity: bigint;
  availableQuantity: bigint;
}

// Search results interface matching the contract's return structure
export interface SearchResult {
  products: ProductWithAvailability[];
  totalResults: bigint;
  totalPages: bigint;
  currentPage: bigint;
}

// Search params interface matching expected contract inputs
export interface SearchParams {
  nameQuery: string;
  categories: string[];
  brand: string;
  condition: ProductCondition | "";
  gender: ProductGender | "";
  size: string;
  minPrice: bigint;
  maxPrice: bigint;
  onlyAvailable: boolean;
  exchangeOnly: boolean;
  page: bigint;
  pageSize: bigint;
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
  offeredQuantity?: bigint; // Added for compatibility
}

export enum EscrowType {
  PURCHASE = "PURCHASE",
  EXCHANGE = "EXCHANGE"
}

export enum EscrowStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export type PaymentType = "ETH" | "TOKEN";

// Consolidated Escrow interface combining both definitions
export interface Escrow {
  escrowId: bigint;
  productId: bigint;
  buyer: Address;
  seller: Address;
  amount: bigint;
  deadline: bigint;
  quantity: bigint;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  completed: boolean;
  refunded: boolean;
  isToken: boolean;
  isExchange: boolean;
  exchangeProductId: bigint;
  tokenTopUp: bigint;
  // Additional properties from the second definition
  status?: EscrowStatus;
  product?: Product | null;
  exchangeProduct?: Product | null;
  paymentType?: PaymentType;
  createdAt?: bigint;
  updatedAt?: bigint;
  reason?: string;
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

export interface EscrowCreationParams {
  productId: bigint;
  quantity: bigint;
  value?: bigint; // For ETH payments
}

export interface ExchangeOfferParams {
  offeredProductId: bigint;
  requestedProductId: bigint;
  quantity: bigint;
  tokenTopUp: bigint;
}

export interface CartProduct {
  id: bigint;
  quantity: bigint;
  paymentType: PaymentMethod;
  name: string;
  description: string;
  size: string;
  brand: string;
  condition: string;
  gender: string;
  image: string;
  ethPrice: bigint;
  tokenPrice: bigint;
  isAvailableForExchange: boolean;
  seller: Address;
  categories: string[];
  exchangePreference: string;
  availableQuantity: bigint;
}