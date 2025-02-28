"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  RefreshCw,
  Trash2,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  const handleBulkPurchaseWithEth = async () => {
    setError(null);
    try {
      setLoading("eth");
      // Extract product IDs directly from cart items (which are flattened Products + quantity)
      const productIds = state.items.map((item) => item.id);
      const quantities = state.items.map((item) => item.quantity);
      const totalEthAmount = state.total.eth;

      await createBulkEscrowWithEth(productIds, quantities, totalEthAmount);
      clearCart();
      onClose();
      router.push("/marketplace/escrow");
    } catch (err) {
      console.error("Bulk ETH Purchase Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete ETH purchase"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleBulkPurchaseWithTokens = async () => {
    setError(null);
    try {
      setLoading("tokens");
      // Extract product IDs directly from cart items (which are flattened Products + quantity)
      const productIds = state.items.map((item) => item.id);
      const quantities = state.items.map((item) => item.quantity);

      await createBulkEscrowWithTokens(productIds, quantities);
      clearCart();
      onClose();
      router.push("/marketplace/escrow");
    } catch (err) {
      console.error("Bulk Token Purchase Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete THRIFT purchase"
      );
    } finally {
      setLoading(null);
    }
  };

  // Drawer animation variants
  const drawerVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "100%",
      transition: {
        ease: "easeInOut",
        duration: 0.3,
      },
    },
  };

  // Overlay animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.5,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
          />

          <motion.div
            className="fixed inset-y-0 right-0 w-full max-w-2xl z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={drawerVariants}
          >
            <div className="h-full flex flex-col bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B] text-white shadow-xl relative overflow-hidden">
              {/* Background Glow Effects */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF00FF] rounded-full filter blur-[120px] opacity-[0.15]"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#7B42FF] rounded-full filter blur-[150px] opacity-[0.12]"></div>

              {/* Header */}
              <div className="px-6 py-6 border-b border-purple-500/20 backdrop-blur-sm relative z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium flex items-center gap-3 bg-gradient-to-r from-[#00FFD1] via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    <ShoppingBag className="w-6 h-6 text-[#00FFD1]" />
                    Shopping Cart ({state.items.length})
                  </h2>
                  <motion.button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 min-h-52 relative z-10">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg"
                  >
                    <p>{error}</p>
                  </motion.div>
                )}

                {state.items.length === 0 ? (
                  <motion.div
                    className="text-center py-12 backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ShoppingBag className="w-16 h-16 mx-auto text-white/40" />
                    <p className="mt-4 text-lg text-white/60">
                      Your cart is empty
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onClose();
                        router.push("/marketplace");
                      }}
                      className="mt-6 px-4 py-2 bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] text-[#1A0B3B] rounded-lg font-medium text-sm hover:shadow-[0_0_15px_rgba(0,255,209,0.4)] transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      Continue Shopping
                      <ChevronRight size={16} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {state.items.map((item, index) => (
                        <motion.div
                          key={item.id.toString()}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="relative group"
                        >
                          {/* Glow Effect on Hover */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] rounded-xl opacity-0 group-hover:opacity-50 blur-md group-hover:blur-lg transition-all duration-300" />

                          <div className="relative backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-4 overflow-hidden z-10">
                            <div className="flex gap-4">
                              <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1 min-w-0">
                                    <h3 className="font-medium text-lg truncate pr-4 text-white">
                                      {item.name}
                                    </h3>
                                    <p className="text-white/60">
                                      {item.brand}
                                    </p>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeItem(item.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </motion.button>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <label className="text-white/60">
                                      Qty:
                                    </label>
                                    <div className="flex items-center">
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity > 1n
                                              ? item.quantity - 1n
                                              : 1n
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-l-lg border border-white/20"
                                      >
                                        <ChevronDown size={16} />
                                      </motion.button>
                                      <div className="w-10 h-8 bg-white/10 border-y border-white/20 text-white flex items-center justify-center">
                                        {item.quantity.toString()}
                                      </div>
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity + 1n
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-r-lg border border-white/20"
                                      >
                                        <ChevronUp size={16} />
                                      </motion.button>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    {item.ethPrice > 0n && (
                                      <div className="flex items-center gap-2 justify-end">
                                        <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <span className="text-white">
                                          {formatEther(item.ethPrice)} ETH
                                        </span>
                                      </div>
                                    )}

                                    {item.tokenPrice > 0n && (
                                      <div className="flex items-center gap-2 justify-end">
                                        <div className="w-4 h-4 rounded-full bg-[#00FFD1]/30 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-full bg-[#00FFD1]"></div>
                                        </div>
                                        <span className="text-[#00FFD1]">
                                          {formatEther(item.tokenPrice)} THRIFT
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Animated Progress Bar - Decorative */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {state.items.length > 0 && (
                <div className="border-t border-purple-500/20 p-6 space-y-6 backdrop-blur-sm relative z-10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Total (ETH)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="font-medium text-white">
                          {formatEther(state.total.eth)} ETH
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Total (THRIFT)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#00FFD1]/30 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#00FFD1]"></div>
                        </div>
                        <span className="font-medium text-[#00FFD1]">
                          {formatEther(state.total.tokens)} THRIFT
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 20px rgba(123,66,255,0.5)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkPurchaseWithEth}
                      disabled={loading !== null || state.total.eth === 0n}
                      className={`
                        w-full flex items-center justify-center gap-3 px-6 py-4 
                        rounded-xl text-lg font-medium
                        ${
                          loading !== null || state.total.eth === 0n
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                        bg-gradient-to-r from-[#7B42FF] to-[#8A2BE2]
                        text-white
                        shadow-[0_0_10px_rgba(123,66,255,0.3)]
                        transition-all duration-300
                        relative overflow-hidden
                      `}
                    >
                      {loading === "eth" ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          </div>
                          Buy All with ETH
                          <ArrowRight className="w-5 h-5 ml-1" />
                        </>
                      )}

                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#7B42FF]/0 via-white/10 to-[#7B42FF]/0 -translate-x-full animate-shimmer"></div>
                    </motion.button>

                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 20px rgba(0,255,209,0.5)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkPurchaseWithTokens}
                      disabled={loading !== null || state.total.tokens === 0n}
                      className={`
                        w-full flex items-center justify-center gap-3 px-6 py-4 
                        rounded-xl text-lg font-medium
                        ${
                          loading !== null || state.total.tokens === 0n
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                        bg-gradient-to-r from-[#00FFD1] to-[#00FFFF]
                        text-[#1A0B3B]
                        shadow-[0_0_10px_rgba(0,255,209,0.3)]
                        transition-all duration-300
                        relative overflow-hidden
                      `}
                    >
                      {loading === "tokens" ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-[#00FFD1]/30 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#00FFD1]"></div>
                          </div>
                          Buy All with THRIFT
                          <ArrowRight className="w-5 h-5 ml-1" />
                        </>
                      )}

                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/0 via-white/10 to-[#00FFD1]/0 -translate-x-full animate-shimmer"></div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearCart}
                      disabled={loading !== null}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 
                        border border-white/20 text-white/70 rounded-lg hover:bg-white/10 
                        transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Cart
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
