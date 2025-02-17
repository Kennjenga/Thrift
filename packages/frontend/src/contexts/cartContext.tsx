// contexts/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Product } from "@/types/market";
import { CartItem, CartState } from "@/types/cart";

// Storage key for localStorage
const CART_STORAGE_KEY = "ace-marketplace-cart";

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: bigint } }
  | { type: "REMOVE_ITEM"; payload: { productId: bigint } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: bigint; quantity: bigint };
    }
  | { type: "CLEAR_CART" }
  | { type: "INIT_CART"; payload: CartState };

// Helper function to serialize bigint for storage
const serializeCart = (state: CartState): string => {
  return JSON.stringify(state, (_, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value
  );
};

// Helper function to deserialize bigint from storage
const deserializeCart = (jsonString: string): CartState => {
  return JSON.parse(jsonString, (_, value) => {
    if (typeof value === "string" && value.endsWith("n")) {
      return BigInt(value.slice(0, -1));
    }
    return value;
  });
};

// Load cart state from localStorage with client-side check
const loadCartState = (): CartState => {
  const initialState = {
    items: [],
    total: { eth: BigInt(0), tokens: BigInt(0) },
  };

  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return deserializeCart(savedCart);
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return initialState;
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => ({
      eth: acc.eth + item.ethPrice * item.quantity,
      tokens: acc.tokens + item.tokenPrice * item.quantity,
    }),
    { eth: BigInt(0), tokens: BigInt(0) }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case "INIT_CART":
      return action.payload;

    case "ADD_ITEM": {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantity) return state;

        const updatedItems = state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
        newState = {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      } else {
        const newItems = [...state.items, { ...product, quantity }];
        newState = {
          items: newItems,
          total: calculateTotal(newItems),
        };
      }
      break;
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(
        (item) => BigInt(item.id) !== action.payload.productId
      );
      newState = {
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };
      break;
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      const updatedItems = state.items.map((item) =>
        BigInt(item.id) === productId ? { ...item, quantity } : item
      );
      newState = {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
      break;
    }

    case "CLEAR_CART":
      newState = {
        items: [],
        total: { eth: BigInt(0), tokens: BigInt(0) },
      };
      break;

    default:
      return state;
  }

  // Save to localStorage only on client-side
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, serializeCart(newState));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }

  return newState;
};

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product, quantity: bigint) => void;
  removeFromCart: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: bigint) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType>(
  {} as CartContextType
);

// Client-side only CartProvider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, null, loadCartState);

  useEffect(() => {
    const savedState = loadCartState();
    dispatch({ type: "INIT_CART", payload: savedState });
  }, []);

  const addToCart = (product: Product, quantity: bigint = BigInt(1)) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
  };

  const removeFromCart = (productId: bigint) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  };

  const updateQuantity = (productId: bigint, quantity: bigint) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
