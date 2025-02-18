import { Dialog, Transition } from "@headlessui/react";
import { X, ShoppingBag, Trash2, Coins, RefreshCw } from "lucide-react";
import Image from "next/image";
import { formatEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import React, { useState } from "react";
import styled from 'styled-components';

// Styled Components
const StyledPanel = styled(Dialog.Panel)`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,800');
  
  width: 100%;
  max-width: 32rem;
  background: linear-gradient(135deg, #0c1f2c 0%, #1a2f3c 100%);
  font-family: 'Open Sans', sans-serif;
  color: #fff;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.2);
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 23px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 12px 24px;
  border-radius: 90px;
  font-weight: 300;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #CB2140;
    color: #fff;
    &:hover {
      background: #d62747;
    }
  ` : `
    background: transparent;
    color: #fff;
    border: 1px solid #CB2140;
    &:hover {
      background: rgba(203, 33, 64, 0.1);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CartItem = styled(GlassCard)`
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  padding: 4px 12px;
  appearance: none;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #CB2140;
  }
`;

const IconButton = styled.button`
  color: #CB2140;
  transition: color 0.3s ease;
  
  &:hover {
    color: #d62747;
  }
`;

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
            <StyledPanel>
              <div className="flex h-full flex-col">
                {/* Header */}
                <GlassCard className="p-4 rounded-b-3xl">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="flex items-center gap-3 text-xl font-semibold">
                      <ShoppingBag className="w-6 h-6" />
                      Shopping Cart ({state.items.length})
                    </Dialog.Title>
                    <IconButton onClick={onClose}>
                      <X className="h-6 w-6" />
                    </IconButton>
                  </div>
                </GlassCard>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  {state.items.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                      <p>Your cart is empty</p>
                    </GlassCard>
                  ) : (
                    state.items.map((item) => (
                      <CartItem key={item.id.toString()}>
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
                              <h3 className="font-semibold">{item.name}</h3>
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4" />
                                <p>{formatEther(item.ethPrice * item.quantity)} ETH</p>
                              </div>
                            </div>
                            <p className="text-sm opacity-70 mt-1">{item.brand}</p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <label htmlFor={`quantity-${item.id}`}>Qty</label>
                                <Select
                                  id={`quantity-${item.id}`}
                                  value={item.quantity.toString()}
                                  onChange={(e) =>
                                    updateQuantity(
                                      BigInt(item.id),
                                      BigInt(e.target.value)
                                    )
                                  }
                                >
                                  {[...Array(Number(item.quantity))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                              <IconButton onClick={() => removeFromCart(BigInt(item.id))}>
                                <Trash2 className="w-5 h-5" />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </CartItem>
                    ))
                  )}
                </div>

                {/* Footer */}
                {state.items.length > 0 && (
                  <GlassCard className="p-6 rounded-t-3xl">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Total ETH</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5" />
                          <p className="font-bold">
                            {formatEther(state.total.eth)} ETH
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Total Tokens</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5" />
                          <p className="font-bold">
                            {formatEther(state.total.tokens)} Tokens
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        onClick={handleBuyWithEth}
                        disabled={loading === 'eth'}
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
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleBuyWithTokens}
                        disabled={loading === 'tokens'}
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
                      </Button>
                    </div>
                  </GlassCard>
                )}
              </div>
            </StyledPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};