// types/cart.ts
import { Product } from "./market";

export interface CartItem extends Product {
  quantity: bigint;
}

export interface CartState {
  items: CartItem[];
  total: {
    eth: bigint;
    tokens: bigint;
  };
}