// types/index.ts
export interface Product {
    id: string;
    name: string;
    description: string;
    tokenPrice: string;
    ethPrice: string;
    image: string;
    seller: string;
    quantity: number;
    size?: string;
    condition?: string;
    brand?: string;
    categories?: string;
    gender?: string;
    isAvailableForExchange?: boolean;
    exchangePreference?: string;
    isSold?: boolean;
}
  
  export interface CartItem extends Product {
    quantity: number;
  }
  
  export interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    tokenBalance: string;
  }