import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import Image from "next/image";
import { formatEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import React from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const { buyWithEthBulk, buyWithTokensBulk } = useMarketplace();

  const handleBuyWithEth = async () => {
    try {
      const productIds = state.items.map((item) => BigInt(item.id));
      const quantities = state.items.map((item) => item.quantity);
      await buyWithEthBulk(productIds, quantities, state.total.eth);
      clearCart();
      onClose();
    } catch (error) {
      console.error("ETH Purchase Error:", error);
    }
  };

  const handleBuyWithTokens = async () => {
    try {
      const productIds = state.items.map((item) => BigInt(item.id));
      const quantities = state.items.map((item) => item.quantity);
      await buyWithTokensBulk(productIds, quantities);
      clearCart();
      onClose();
    } catch (error) {
      console.error("Token Purchase Error:", error);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <Dialog.Panel className="w-screen max-w-md transform bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-6">
                <Dialog.Title className="text-lg font-semibold">
                  Shopping Cart ({state.items.length})
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                {state.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">
                    Your cart is empty
                  </div>
                ) : (
                  state.items.map((item) => (
                    <div
                      key={item.id.toString()}
                      className="flex py-6 border-b"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium">
                            <h3>{item.name}</h3>
                            <p className="ml-4">
                              {formatEther(item.ethPrice * item.quantity)} ETH
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.brand}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center">
                            <label
                              htmlFor={`quantity-${item.id}`}
                              className="mr-2"
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
                              className="rounded border-gray-300"
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
                            className="text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {state.items.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6">
                  <div className="flex justify-between text-base font-medium">
                    <p>Total ETH</p>
                    <p>{formatEther(state.total.eth)} ETH</p>
                  </div>
                  <div className="flex justify-between text-base font-medium mt-2">
                    <p>Total Tokens</p>
                    <p>{formatEther(state.total.tokens)} Tokens</p>
                  </div>
                  <div className="mt-6 space-y-4">
                    <button
                      onClick={handleBuyWithEth}
                      className="w-full rounded-md bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700"
                    >
                      Buy with ETH
                    </button>
                    <button
                      onClick={handleBuyWithTokens}
                      className="w-full rounded-md bg-green-600 px-6 py-3 text-white shadow-sm hover:bg-green-700"
                    >
                      Buy with Tokens
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};
