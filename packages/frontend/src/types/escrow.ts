// types/escrow.ts
import { type Address } from 'viem';

export interface Product {
  id: bigint;
  name: string;
  description: string;
  image: string;
  brand: string;
  condition: string;
  size: string;
  gender: string;
  ethPrice: bigint;
  tokenPrice: bigint;
  quantity: bigint;
  seller: string;
  isAvailableForExchange: boolean;
  exchangePreference: string;
  categories: string[];
  isSold: boolean;
  isDeleted: boolean;
  inEscrowQuantity: bigint;
}

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
}

export interface EscrowWithProduct extends Escrow {
  product: Product;
  exchangeProduct?: Product;
}

export type EscrowStatus = 
  | 'Pending'
  | 'Buyer Confirmed'
  | 'Seller Confirmed'
  | 'Both Confirmed'
  | 'Completed'
  | 'Refunded';

export type UserRole = 'buyer' | 'seller' | null;

export interface EscrowCardProps {
  escrow: EscrowWithProduct;
  status: EscrowStatus;
  role: UserRole;
  canConfirm: boolean;
  canRefund: boolean;
  isLoading: boolean;
  onConfirm: (escrowId: bigint) => Promise<void>;
  onRefund: (escrowId: bigint) => Promise<void>;
}