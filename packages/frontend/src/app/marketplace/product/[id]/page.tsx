"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatTokenAmount, formatETHPrice } from "@/utils/token-utils";
import { CartButton } from "@/components/cartButton";
import {
  ShoppingCart,
  X,
  AlertTriangle,
  RefreshCw,
  House,
  ShoppingBag,
  Heart,
  Mail,
  Tag,
  Package,
  Coins,
  Info,
} from "lucide-react";
import styled from "styled-components";

// Context and Hook Imports
import { useCart } from "@/contexts/cartContext";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product, ExchangeOffer } from "@/types/market";

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fefcf6 0%, #f4efe6 100%);
`;

const NavigationBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(94, 108, 88, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #162a2c;
  background: linear-gradient(to right, #c0b283, #dcd0c0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #162a2c;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background: #c0b283;
    transition: width 0.3s ease;
  }

  &:hover:after {
    width: 100%;
  }

  &:hover svg {
    color: #c0b283;
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "glass" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: #CB2140;
          color: white;
          &:hover:not(:disabled) {
            background: #d62747;
          }
        `;
      case "secondary":
        return `
          background: transparent;
          border: 1px solid #CB2140;
          color: #CB2140;
          &:hover:not(:disabled) {
            background: rgba(203, 33, 64, 0.1);
          }
        `;
      case "glass":
      default:
        return `
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #162A2C;
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid #dbe0e2;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #5e6c58;
    box-shadow: 0 0 0 2px rgba(94, 108, 88, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid #dbe0e2;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #5e6c58;
    box-shadow: 0 0 0 2px rgba(94, 108, 88, 0.1);
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`;

const ModalContent = styled(GlassCard)`
  max-width: 28rem;
  width: 100%;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  color: #162a2c;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fefcf6 0%, #f4efe6 100%);
`;

const SpinnerWrapper = styled(GlassCard)`
  padding: 2rem;
  border-radius: 9999px;

  .spinner {
    width: 4rem;
    height: 4rem;
    border: 4px solid #5e6c58;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
// Utility Components
const LoadingSpinner = () => (
  <LoadingContainer>
    <SpinnerWrapper>
      <div className="spinner" />
    </SpinnerWrapper>
  </LoadingContainer>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <ErrorContainer>
    <AlertTriangle className="h-5 w-5 text-red-500" />
    <p>{message}</p>
  </ErrorContainer>
);

interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export default function ProductPage() {
  // URL and State Management
  const params = useParams();
  const productId = BigInt(params.id as string);

  // State Hooks
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<
    bigint | null
  >(null);
  const [exchangeQuantity, setExchangeQuantity] = useState(1);
  const [tokenTopUp, setTokenTopUp] = useState<bigint>(BigInt(0));

  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "/" },
    {
      name: "Shop",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "/marketplace",
    },
    { name: "Donate", icon: <Heart className="w-5 h-5" />, path: "/donate" },
    { name: "Contact", icon: <Mail className="w-5 h-5" />, path: "#" },
  ];

  // Context and Hook Integrations
  const { addToCart } = useCart();
  const {
    useGetProduct,
    useGetExchangeOffers,
    useGetProductsByOwner,
    userAddress,
    buyWithEth,
    buyWithTokens,
    createEnhancedExchangeOffer,
    acceptEnhancedExchangeOffer,
  } = useMarketplace();

  // Data Fetching
  const { data: productData, isLoading: productLoading } =
    useGetProduct(productId);
  const { data: userProducts = [] } = useGetProductsByOwner(userAddress!);
  const { data: exchangeOffersData = [] } = useGetExchangeOffers(productId) as {
    data: ExchangeOffer[];
  };

  const product = productData as Product | undefined;
  const availableUserProducts = useMemo(
    () => userProducts.filter((p) => p.quantity > 0n && p.id !== productId),
    [userProducts, productId]
  );

  // Action Handlers
  const handleAsyncAction = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, BigInt(quantity));
  };

  const handleBuyWithEth = () =>
    handleAsyncAction(async () => {
      if (!product) return;
      await buyWithEth(
        productId,
        BigInt(quantity),
        product.ethPrice * BigInt(quantity)
      );
    });

  const handleBuyWithTokens = () =>
    handleAsyncAction(async () => {
      if (!product) return;
      await buyWithTokens(productId, BigInt(quantity));
    });

  const handleCreateExchangeOffer = () =>
    handleAsyncAction(async () => {
      if (!selectedExchangeProduct) {
        throw new Error("Please select a product to exchange");
      }
      await createEnhancedExchangeOffer(
        selectedExchangeProduct,
        productId,
        BigInt(exchangeQuantity),
        tokenTopUp
      );
      setShowExchangeModal(false);
      setSelectedExchangeProduct(null);
      setExchangeQuantity(1);
      setTokenTopUp(BigInt(0));
    });

  const handleAcceptExchangeOffer = (offerIndex: bigint) =>
    handleAsyncAction(async () => {
      await acceptEnhancedExchangeOffer(productId, offerIndex);
    });

  if (productLoading || !product) return <LoadingSpinner />;

  return (
    <PageContainer>
      <NavigationBar>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Logo>
            <Image
              src="/my-business-name-high-resolution-logo-transparent.png"
              alt="Ace Logo"
              width={45}
              height={45}
              priority
            />
            <LogoText>Ace</LogoText>
          </Logo>

          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.name} href={link.path}>
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          <CartButton />
        </div>
      </NavigationBar>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <GlassCard>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </GlassCard>

          {/* Product Details */}
          <div className="space-y-8">
            <GlassCard>
              <h1 className="text-3xl font-bold text-[#162A2C] mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-[#686867]">{product.brand}</p>
            </GlassCard>

            {/* Product Specifications */}
            <GlassCard>
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    label: "Condition",
                    value: product.condition,
                    icon: <Tag className="w-5 h-5" />,
                  },
                  {
                    label: "Size",
                    value: product.size,
                    icon: <Package className="w-5 h-5" />,
                  },
                  {
                    label: "Gender",
                    value: product.gender,
                    icon: <Info className="w-5 h-5" />,
                  },
                  {
                    label: "Available",
                    value: `${product.quantity.toString()} items`,
                    icon: <ShoppingBag className="w-5 h-5" />,
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    {icon}
                    <div>
                      <span className="block text-sm font-medium text-[#686867]">
                        {label}
                      </span>
                      <p className="text-[#162A2C] font-semibold">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Pricing and Purchase Options */}
            <GlassCard>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6 text-[#5E6C58]" />
                  <div>
                    <span className="block text-sm font-medium text-[#686867]">
                      ETH Price
                    </span>
                    <p className="text-2xl font-bold text-[#162A2C]">
                      {formatETHPrice(product.ethPrice)} ETH
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6 text-[#5E6C58]" />
                  <div>
                    <span className="block text-sm font-medium text-[#686867]">
                      Token Price
                    </span>
                    <p className="text-2xl font-bold text-[#162A2C]">
                      {formatTokenAmount(product.tokenPrice)} Thrifts
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-[#686867] mb-2"
                  >
                    Quantity
                  </label>
                  <Input
                    type="number"
                    id="quantity"
                    min={1}
                    max={Number(product.quantity)}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-4">
                  <Button onClick={handleAddToCart} variant="glass">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleBuyWithEth}
                      disabled={loading}
                      variant="primary"
                    >
                      Buy with ETH
                    </Button>
                    <Button
                      onClick={handleBuyWithTokens}
                      disabled={loading}
                      variant="secondary"
                    >
                      Buy with Tokens
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Exchange Section */}
            {product.isAvailableForExchange && (
              <GlassCard>
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className="w-6 h-6 text-[#5E6C58]" />
                  <h3 className="text-xl font-semibold text-[#162A2C]">
                    Exchange Options
                  </h3>
                </div>
                <p className="text-[#686867] mb-6">
                  {String(product.exchangePreference)}
                </p>

                <Button
                  onClick={() => setShowExchangeModal(true)}
                  variant="glass"
                >
                  Create Exchange Offer
                </Button>

                {/* Exchange Offers List */}
                {exchangeOffersData.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold text-[#162A2C]">
                      Current Offers
                    </h4>
                    {exchangeOffersData.map((offer, index) => (
                      <GlassCard key={index}>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="font-medium text-[#162A2C]">
                              Offered Product ID:{" "}
                              {offer.offeredProductId?.toString() || "N/A"}
                            </p>
                            <p className="text-sm text-[#686867]">
                              Quantity:{" "}
                              {offer.offeredQuantity.toString() || "N/A"}
                            </p>
                            <p className="text-sm text-[#686867]">
                              Token Top-up:{" "}
                              {formatTokenAmount(offer.tokenTopUp)} Tokens
                            </p>
                          </div>
                          {product.seller === userAddress && (
                            <Button
                              onClick={() =>
                                handleAcceptExchangeOffer(BigInt(index))
                              }
                              disabled={loading}
                              variant="glass"
                            >
                              Accept Offer
                            </Button>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Exchange Modal */}
      {showExchangeModal && (
        <Modal>
          <ModalContent>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#162A2C]">
                Create Exchange Offer
              </h3>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="text-[#686867] hover:text-[#162A2C] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && <ErrorMessage message={error} />}

            <div className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-[#686867] mb-2">
                  Select Your Product
                </label>
                <Select
                  value={selectedExchangeProduct?.toString() || ""}
                  onChange={(e) =>
                    setSelectedExchangeProduct(BigInt(e.target.value))
                  }
                >
                  <option value="">Choose a product to exchange</option>
                  {availableUserProducts.map((p) => (
                    <option key={p.id.toString()} value={p.id.toString()}>
                      {p.name} (Qty: {p.quantity.toString()})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#686867] mb-2">
                  Exchange Quantity
                </label>
                <Input
                  type="number"
                  min={1}
                  max={Number(
                    selectedExchangeProduct
                      ? availableUserProducts.find(
                          (p) => p.id === selectedExchangeProduct
                        )?.quantity
                      : 1
                  )}
                  value={exchangeQuantity}
                  onChange={(e) => setExchangeQuantity(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#686867] mb-2">
                  Token Top-up (Optional)
                </label>
                <Input
                  type="text"
                  value={tokenTopUp.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setTokenTopUp(BigInt(value || 0));
                    }
                  }}
                  placeholder="0"
                />
              </div>

              <Button
                onClick={handleCreateExchangeOffer}
                disabled={!selectedExchangeProduct || loading}
                variant="primary"
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-5 h-5" />
                ) : (
                  "Create Exchange Offer"
                )}
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}
