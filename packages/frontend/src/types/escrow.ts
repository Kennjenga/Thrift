import { Product } from "./market";

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

export interface Escrow {
  id: bigint;
  buyer: `0x${string}`; // Address
  seller: `0x${string}`; // Address
  product: Product;
  exchangeProduct?: Product;
  quantity: bigint;
  escrowType: EscrowType;
  status: EscrowStatus;
  paymentType?: PaymentType;
  ethValue?: bigint;
  tokenValue?: bigint;
  tokenTopUp: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  reason?: string; // For rejection reason
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