"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import { Coins, ShoppingBag, X, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { createBulkEscrowWithEth, createBulkEscrowWithTokens } =
    useMarketplace();
  const [loading, setLoading] = useState<"eth" | "tokens" | null>(null);

  const handleBulkPurchaseWithEth = async () => {
    try {
      setLoading("eth");
      const productIds = state.items.map((item) => item.id);
      const quantities = state.items.map((item) => item.quantity);
      const totalEthAmount = state.total.eth;

      await createBulkEscrowWithEth(productIds, quantities, totalEthAmount);
      clearCart();
      onClose();
      router.push("/escrow");
    } catch (error) {
      console.error("Bulk ETH Purchase Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleBulkPurchaseWithTokens = async () => {
    try {
      setLoading("tokens");
      const productIds = state.items.map((item) => item.id);
      const quantities = state.items.map((item) => item.quantity);

      await createBulkEscrowWithTokens(productIds, quantities);
      clearCart();
      onClose();
      router.push("/escrow");
    } catch (error) {
      console.error("Bulk Token Purchase Error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-50"
          >
            <div className="h-full flex flex-col bg-[#1A0B3B] text-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 border-b border-[rgba(123,66,255,0.25)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Shopping Cart ({state.items.length})
                  </h2>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6 text-white/70 hover:text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {state.items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto text-white/40" />
                    <p className="mt-4 text-white/60">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <motion.div
                        key={item.id.toString()}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex gap-4 p-4 bg-[rgba(123,66,255,0.1)] rounded-xl"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-white/60">
                                {item.brand}
                              </p>
                            </div>
                            <motion.button
                              onClick={() => removeItem(item.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                            </motion.button>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-white/60">
                                Qty:
                              </label>
                              <select
                                value={item.quantity.toString()}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.id,
                                    BigInt(e.target.value)
                                  )
                                }
                                className="ml-2 bg-[rgba(123,66,255,0.2)] border border-[rgba(123,66,255,0.3)] 
                                  rounded-md text-sm text-white p-1"
                              >
                                {[...Array(Number(item.quantity))].map(
                                  (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {formatEther(item.ethPrice)} ETH
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {state.items.length > 0 && (
                <div className="border-t border-[rgba(123,66,255,0.25)] p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total (ETH)</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">
                          {formatEther(state.total.eth)} ETH
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Total (Tokens)</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">
                          {formatEther(state.total.tokens)} Tokens
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      onClick={handleBulkPurchaseWithEth}
                      disabled={loading === "eth"}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 
                        bg-purple-500 text-white rounded-xl hover:bg-purple-600 
                        disabled:opacity-50 disabled:hover:bg-purple-500"
                    >
                      {loading === "eth" ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Coins className="w-5 h-5" />
                      )}
                      Buy All with ETH
                    </motion.button>

                    <motion.button
                      onClick={handleBulkPurchaseWithTokens}
                      disabled={loading === "tokens"}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 
                        bg-green-500 text-white rounded-xl hover:bg-green-600 
                        disabled:opacity-50 disabled:hover:bg-green-500"
                    >
                      {loading === "tokens" ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Coins className="w-5 h-5" />
                      )}
                      Buy All with Tokens
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
