"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cartContext";
import { CartDrawer } from "@/components/cartDrawer";
import { motion } from "framer-motion";

export const CartButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useCart();

  const toggleCart = () => setIsOpen(!isOpen);

  // Early return with loading state if cart state isn't initialized
  if (!state) {
    return (
      <motion.button
        className="relative p-2 hover:bg-[rgba(123,66,255,0.15)] rounded-full transition-colors duration-300"
        aria-label="Shopping cart"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingCart className="h-6 w-6 text-white" />
      </motion.button>
    );
  }

  const itemCount = state.items?.length || 0;

  return (
    <>
      <motion.button
        onClick={toggleCart}
        className="relative p-2 hover:bg-[rgba(123,66,255,0.15)] rounded-full transition-colors duration-300"
        aria-label={`Shopping cart ${
          itemCount > 0 ? `with ${itemCount} items` : "empty"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingCart className="h-6 w-6 text-white" />
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white 
            rounded-full text-xs min-w-[18px] h-[18px] flex items-center justify-center
            shadow-lg shadow-red-500/30"
            aria-hidden="true"
          >
            {itemCount}
          </motion.span>
        )}
      </motion.button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
