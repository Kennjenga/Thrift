"use client";

// CartDrawer.tsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import { Coins, ShoppingBag, X, RefreshCw, Trash2 } from "lucide-react";

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
      // const totalTokenAmount = state.total.tokens;

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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black z-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl z-50">
        <div className="h-full flex flex-col bg-[#1A0B3B] text-white shadow-xl">
          {/* Header */}
          <div className="px-6 py-6 border-b border-[rgba(123,66,255,0.25)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                Shopping Cart ({state.items.length})
              </h2>
              <button onClick={onClose} className="hover:text-white">
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-52">
            {state.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-16 h-16 mx-auto text-white/40" />
                <p className="mt-4 text-lg text-white/60">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.id.toString()}
                    className="flex gap-6 p-6 bg-[rgba(123,66,255,0.1)] rounded-xl"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-medium text-lg truncate pr-4">
                            {item.name}
                          </h3>
                          <p className="text-white/60">{item.brand}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-white/60">Qty:</label>
                          <select
                            value={item.quantity.toString()}
                            onChange={(e) =>
                              updateQuantity(item.id, BigInt(e.target.value))
                            }
                            className="bg-[rgba(123,66,255,0.2)] border border-[rgba(123,66,255,0.3)] 
                              rounded-lg text-sm text-white p-2 min-w-[64px]"
                          >
                            {[...Array(Number(item.quantity))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5" />
                          <span className="text-lg font-medium">
                            {formatEther(item.ethPrice)} ETH
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-[rgba(123,66,255,0.25)] p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-white/60">Total (ETH)</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    <span className="font-medium">
                      {formatEther(state.total.eth)} ETH
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-white/60">Total (Tokens)</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    <span className="font-medium">
                      {formatEther(state.total.tokens)} Tokens
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBulkPurchaseWithEth}
                  disabled={loading === "eth"}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 
                    bg-purple-500 text-white rounded-xl hover:bg-purple-600 
                    disabled:opacity-50 disabled:hover:bg-purple-500 text-lg font-medium"
                >
                  {loading === "eth" ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Coins className="w-6 h-6" />
                  )}
                  Buy All with ETH
                </button>

                <button
                  onClick={handleBulkPurchaseWithTokens}
                  disabled={loading === "tokens"}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 
                    bg-green-500 text-white rounded-xl hover:bg-green-600 
                    disabled:opacity-50 disabled:hover:bg-green-500 text-lg font-medium"
                >
                  {loading === "tokens" ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Coins className="w-6 h-6" />
                  )}
                  Buy All with Tokens
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
