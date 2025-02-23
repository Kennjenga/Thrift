"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product } from "@/types/market";

// Types
type PaymentType = "ETH" | "TOKEN" | "EXCHANGE";

export interface CartItem extends Omit<Product, "paymentType"> {
  quantity: bigint;
  paymentType: PaymentType;
  exchangeProductId?: bigint;
  tokenTopUp?: bigint;
}

export interface CartState {
  items: CartItem[];
  total: {
    eth: bigint;
    tokens: bigint;
  };
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: bigint } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: bigint; quantity: bigint };
    }
  | {
      type: "UPDATE_PAYMENT_TYPE";
      payload: { productId: bigint; paymentType: PaymentType };
    }
  | {
      type: "UPDATE_EXCHANGE_DETAILS";
      payload: {
        productId: bigint;
        exchangeProductId: bigint;
        tokenTopUp: bigint;
      };
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART_OPEN"; payload: boolean };

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: bigint) => void;
  updatePaymentType: (productId: bigint, paymentType: PaymentType) => void;
  updateExchangeDetails: (
    productId: bigint,
    exchangeProductId: bigint,
    tokenTopUp: bigint
  ) => void;
  clearCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
}

// Constants
const CART_STORAGE_KEY = "marketplace-cart";

// Initial state
const initialState: CartState = {
  items: [],
  total: {
    eth: BigInt(0),
    tokens: BigInt(0),
  },
  isOpen: false,
};

// Helper functions
const serializeCart = (state: CartState): string => {
  return JSON.stringify(state, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString() + "n";
    }
    return value;
  });
};

interface SerializedCartItem
  extends Omit<
    CartItem,
    | "quantity"
    | "ethPrice"
    | "tokenPrice"
    | "exchangeProductId"
    | "tokenTopUp"
    | "id"
  > {
  quantity: string;
  ethPrice: string;
  tokenPrice: string;
  id: string;
  exchangeProductId?: string;
  tokenTopUp?: string;
}

interface SerializedCartState {
  items: SerializedCartItem[];
  total: {
    eth: string;
    tokens: string;
  };
  isOpen: boolean;
}

const deserializeCart = (jsonString: string): CartState => {
  const parsedCart = JSON.parse(jsonString) as SerializedCartState;

  return {
    ...parsedCart,
    total: {
      eth: toBigInt(parsedCart.total.eth),
      tokens: toBigInt(parsedCart.total.tokens),
    },
    items: parsedCart.items.map(
      (item): CartItem => ({
        ...item,
        id: toBigInt(item.id),
        quantity: toBigInt(item.quantity),
        ethPrice: toBigInt(item.ethPrice),
        tokenPrice: toBigInt(item.tokenPrice),
        exchangeProductId: item.exchangeProductId
          ? toBigInt(item.exchangeProductId)
          : undefined,
        tokenTopUp: item.tokenTopUp ? toBigInt(item.tokenTopUp) : undefined,
        paymentType: item.paymentType as PaymentType,
      })
    ),
  };
};

const toBigInt = (value: string | number | bigint): bigint => {
  if (typeof value === "bigint") return value;
  if (typeof value === "string") {
    const cleanValue = value.endsWith("n") ? value.slice(0, -1) : value;
    return BigInt(cleanValue);
  }
  if (typeof value === "number") return BigInt(value);
  return BigInt(0);
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      switch (item.paymentType) {
        case "ETH":
          return {
            ...acc,
            eth: acc.eth + item.ethPrice * item.quantity,
          };
        case "TOKEN":
          return {
            ...acc,
            tokens: acc.tokens + item.tokenPrice * item.quantity,
          };
        case "EXCHANGE":
          if (item.tokenTopUp) {
            return {
              ...acc,
              tokens: acc.tokens + item.tokenTopUp,
            };
          }
          return acc;
        default:
          return acc;
      }
    },
    { eth: BigInt(0), tokens: BigInt(0) }
  );
};

const loadInitialState = (): CartState => {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return initialState;

    return deserializeCart(savedCart);
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return initialState;
  }
};

// Create context
export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...action.payload,
          quantity:
            state.items[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        newItems = [...state.items, action.payload];
      }

      newState = {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
      break;
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.productId
      );
      newState = {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
      break;
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      newState = {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
      break;
    }

    case "UPDATE_PAYMENT_TYPE": {
      const newItems = state.items.map(
        (item): CartItem =>
          item.id === action.payload.productId
            ? {
                ...item,
                paymentType: action.payload.paymentType,
                ...(action.payload.paymentType !== "EXCHANGE" && {
                  exchangeProductId: undefined,
                  tokenTopUp: undefined,
                }),
              }
            : item
      );
      newState = {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
      break;
    }

    case "UPDATE_EXCHANGE_DETAILS": {
      const newItems = state.items.map(
        (item): CartItem =>
          item.id === action.payload.productId
            ? {
                ...item,
                paymentType: "EXCHANGE" as const,
                exchangeProductId: action.payload.exchangeProductId,
                tokenTopUp: action.payload.tokenTopUp,
              }
            : item
      );
      newState = {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
      break;
    }

    case "CLEAR_CART":
      newState = initialState;
      break;

    case "SET_CART_OPEN":
      newState = {
        ...state,
        isOpen: action.payload,
      };
      break;

    default:
      return state;
  }

  // Save to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, serializeCart(newState));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }

  return newState;
};

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, null, loadInitialState);

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (productId: bigint) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  };

  const updateQuantity = (productId: bigint, quantity: bigint) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const updatePaymentType = (productId: bigint, paymentType: PaymentType) => {
    dispatch({
      type: "UPDATE_PAYMENT_TYPE",
      payload: { productId, paymentType },
    });
  };

  const updateExchangeDetails = (
    productId: bigint,
    exchangeProductId: bigint,
    tokenTopUp: bigint
  ) => {
    dispatch({
      type: "UPDATE_EXCHANGE_DETAILS",
      payload: { productId, exchangeProductId, tokenTopUp },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const setCartOpen = (isOpen: boolean) => {
    dispatch({ type: "SET_CART_OPEN", payload: isOpen });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updatePaymentType,
        updateExchangeDetails,
        clearCart,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
