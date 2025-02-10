import { Dialog, Transition } from "@headlessui/react";
import { X, ShoppingBag, Trash2, Coins, RefreshCw } from "lucide-react";
import Image from "next/image";
import { formatEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import React, { useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const { buyWithEthBulk, buyWithTokensBulk } = useMarketplace();
  const [loading, setLoading] = useState<'eth' | 'tokens' | null>(null);

  const handleBuyWithEth = async () => {
    try {
      setLoading('eth');
      const productIds = state.items.map((item) => BigInt(item.id));
      const quantities = state.items.map((item) => item.quantity);
      await buyWithEthBulk(productIds, quantities, state.total.eth);
      clearCart();
      onClose();
    } catch (error) {
      console.error("ETH Purchase Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyWithTokens = async () => {
    try {
      setLoading('tokens');
      const productIds = state.items.map((item) => BigInt(item.id));
      const quantities = state.items.map((item) => item.quantity);
      await buyWithTokensBulk(productIds, quantities);
      clearCart();
      onClose();
    } catch (error) {
      console.error("Token Purchase Error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog 
        onClose={onClose} 
        className="fixed inset-0 z-50 overflow-hidden"
      >
        <Transition.Child
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <Transition.Child
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="w-screen max-w-md transform bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6] shadow-xl">
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="glass-card rounded-b-3xl px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="flex items-center gap-3 text-xl font-semibold text-[#162A2C]">
                      <ShoppingBag className="w-6 h-6 text-[#5E6C58]" />
                      Shopping Cart ({state.items.length})
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-[#686867] hover:text-[#162A2C] transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {state.items.length === 0 ? (
                    <div className="glass-card p-8 rounded-3xl text-center">
                      <ShoppingBag className="w-12 h-12 text-[#5E6C58] mx-auto mb-4" />
                      <p className="text-[#686867]">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {state.items.map((item) => (
                        <div
                          key={item.id.toString()}
                          className="glass-card p-4 rounded-2xl"
                        >
                          <div className="flex gap-4">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="object-cover h-full w-full"
                              />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div className="flex justify-between">
                                <h3 className="text-[#162A2C] font-semibold">
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-[#5E6C58]" />
                                  <p className="text-[#162A2C]">
                                    {formatEther(item.ethPrice * item.quantity)} ETH
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-[#686867] mt-1">
                                {item.brand}
                              </p>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                  <label
                                    htmlFor={`quantity-${item.id}`}
                                    className="text-sm text-[#686867]"
                                  >
                                    Qty
                                  </label>
                                  <select
                                    id={`quantity-${item.id}`}
                                    value={item.quantity.toString()}
                                    onChange={(e) =>
                                      updateQuantity(
                                        BigInt(item.id),
                                        BigInt(e.target.value)
                                      )
                                    }
                                    className="input-primary py-1 px-3"
                                  >
                                    {[...Array(Number(item.quantity))].map((_, i) => (
                                      <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={() => removeFromCart(BigInt(item.id))}
                                  className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
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
                  <div className="glass-card rounded-t-3xl px-6 py-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <p className="text-[#162A2C] font-semibold">Total ETH</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-[#5E6C58]" />
                          <p className="text-[#162A2C] font-bold">
                            {formatEther(state.total.eth)} ETH
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#162A2C] font-semibold">Total Tokens</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-[#5E6C58]" />
                          <p className="text-[#162A2C] font-bold">
                            {formatEther(state.total.tokens)} Tokens
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={handleBuyWithEth}
                        disabled={loading === 'eth'}
                        className="btn-primary w-full"
                      >
                        {loading === 'eth' ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Coins className="w-5 h-5" />
                            Buy with ETH
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleBuyWithTokens}
                        disabled={loading === 'tokens'}
                        className="btn-secondary w-full"
                      >
                        {loading === 'tokens' ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Coins className="w-5 h-5" />
                            Buy with Tokens
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};