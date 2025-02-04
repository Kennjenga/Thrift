import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cartContext";
import { CartDrawer } from "@/components/cartDrawer";

export const CartButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useCart();

  const toggleCart = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleCart}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <ShoppingCart className="h-6 w-6" />
        {state.items.length > 0 && (
          <span
            className="absolute top-0 right-0 bg-red-500 text-white 
            rounded-full text-xs w-4 h-4 flex items-center justify-center"
          >
            {state.items.length}
          </span>
        )}
      </button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
