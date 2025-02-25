// CartButton.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cartContext";
import { CartDrawer } from "@/components/cartDrawer";

export const CartButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { state } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCart = () => setIsOpen(!isOpen);

  // Render a loading state on the server and during initial client render
  if (!mounted) {
    return (
      <button
        className="relative p-3 hover:bg-[rgba(123,66,255,0.15)] rounded-full transition-colors duration-300"
        aria-label="Loading cart"
      >
        <ShoppingCart className="h-6 w-6 text-white" />
      </button>
    );
  }

  const itemCount = state?.items?.length || 0;

  return (
    <>
      <button
        onClick={toggleCart}
        className="relative p-3 hover:bg-[rgba(123,66,255,0.15)] rounded-full transition-colors duration-300"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-6 w-6 text-white" />
        {itemCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white 
            rounded-full text-xs min-w-[20px] h-[20px] flex items-center justify-center
            shadow-lg shadow-red-500/30 px-1"
            aria-hidden="true"
          >
            {itemCount}
          </span>
        )}
      </button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
