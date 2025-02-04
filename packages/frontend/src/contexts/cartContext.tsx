import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product } from "@/types/market";
import { CartItem, CartState } from "@/types/cart";

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: bigint } }
  | { type: "REMOVE_ITEM"; payload: { productId: bigint } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: bigint; quantity: bigint };
    }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product, quantity?: bigint) => void;
  removeFromCart: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: bigint) => void;
  clearCart: () => void;
}

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
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantity) return state;

        const updatedItems = state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      }

      const newItems = [...state.items, { ...product, quantity }];
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(
        (item) => BigInt(item.id) !== action.payload.productId
      );
      return {
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };
    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      const updatedItems = state.items.map((item) =>
        BigInt(item.id) === productId ? { ...item, quantity } : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    case "CLEAR_CART":
      return {
        items: [],
        total: { eth: BigInt(0), tokens: BigInt(0) },
      };
    default:
      return state;
  }
};

export const CartContext = createContext({} as CartContextType);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: { eth: BigInt(0), tokens: BigInt(0) },
  });

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
