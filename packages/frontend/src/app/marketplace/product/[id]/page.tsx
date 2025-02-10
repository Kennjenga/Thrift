"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatEther } from "viem";
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

// Context and Hook Imports
import { useCart } from "@/contexts/cartContext";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";

// Type Imports
import { Product, ExchangeOffer } from "@/types/market";

// Utility Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
    <div className="glass-card p-8 rounded-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#5E6C58]" />
    </div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="glass-card p-4 border-l-4 border-red-500 flex items-center gap-3">
    <AlertTriangle className="h-5 w-5 text-red-500" />
    <p className="text-[#162A2C]">{message}</p>
  </div>
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

  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "/" },
    { name: "Shop", icon: <ShoppingBag className="w-5 h-5" />, path: "/marketplace" },
    { name: "Thrift", icon: <ShoppingBag className="w-5 h-5" />, path: "/thrift" },
    { name: "Donate", icon: <Heart className="w-5 h-5" />, path: "/donate" },
    { name: "Contact", icon: <Mail className="w-5 h-5" />, path: "#" },
  ];

  // Exchange Specific State
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<
    bigint | null
  >(null);
  const [exchangeQuantity, setExchangeQuantity] = useState(1);
  const [tokenTopUp, setTokenTopUp] = useState(0);

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
  const { data: exchangeOffersData = [] } = useGetExchangeOffers(productId) as { data: ExchangeOffer[] };

  // Type Safety and Derived Data
  const product = productData as Product | undefined;
  const availableUserProducts = useMemo(
    () => userProducts.filter((p) => p.quantity > 0n && p.id !== productId),
    [userProducts, productId]
  );

  // Error Handling Wrapper
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

  // Action Handlers
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
        BigInt(tokenTopUp)
      );

      // Reset modal state
      setShowExchangeModal(false);
      setSelectedExchangeProduct(null);
      setExchangeQuantity(1);
      setTokenTopUp(0);
    });

  const handleAcceptExchangeOffer = (offerIndex: bigint) =>
    handleAsyncAction(async () => {
      await acceptEnhancedExchangeOffer(productId, offerIndex);
    });

  // Render Loading State
  if (productLoading || !product) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-[#5E6C58]/10 shadow-soft">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="flex items-center group hover-lift">
              <div className="relative">
                <Image
                  src="/my-business-name-high-resolution-logo-transparent.png"
                  alt="Ace Logo"
                  width={45}
                  height={45}
                  className="mr-2 rounded-lg shine-effect"
                  priority
                />
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#C0B283] to-[#DCD0C0] opacity-30 blur group-hover:opacity-40 transition duration-300"></div>
              </div>
              <h1 className="text-2xl font-bold text-[#162A2C] ml-2 gold-gradient">
                Ace
              </h1>
            </div>
          </div>

          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="nav-link group flex items-center space-x-2 text-[#162A2C]"
              >
                <span className="text-lg group-hover:text-[#C0B283] transition-colors duration-300">
                  {link.icon}
                </span>
                <span className="relative">
                  {link.name}
                  <span className="nav-link-underline"></span>
                </span>
              </a>
            ))}
          </div>

          <CartButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="glass-card p-4 rounded-3xl overflow-hidden">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Info */}
            <div className="glass-card p-8 rounded-3xl">
              <h1 className="text-3xl font-bold text-[#162A2C] mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-[#686867]">{product.brand}</p>
            </div>

            {/* Product Specs */}
            <div className="glass-card p-8 rounded-3xl">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { 
                    label: "Condition", 
                    value: product.condition,
                    icon: <Tag className="w-5 h-5 text-[#5E6C58]" />
                  },
                  { 
                    label: "Size", 
                    value: product.size,
                    icon: <Package className="w-5 h-5 text-[#5E6C58]" />
                  },
                  { 
                    label: "Gender", 
                    value: product.gender,
                    icon: <Info className="w-5 h-5 text-[#5E6C58]" />
                  },
                  { 
                    label: "Available", 
                    value: `${product.quantity.toString()} items`,
                    icon: <ShoppingBag className="w-5 h-5 text-[#5E6C58]" />
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
            </div>

            {/* Pricing and Purchase Options */}
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6 text-[#5E6C58]" />
                  <div>
                    <span className="block text-sm font-medium text-[#686867]">
                      ETH Price
                    </span>
                    <p className="text-2xl font-bold text-[#162A2C]">
                      {formatEther(product.ethPrice)} ETH
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
                      {formatEther(product.tokenPrice)} Tokens
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
                  <input
                    type="number"
                    id="quantity"
                    min={1}
                    max={Number(product.quantity)}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-32 px-4 py-2 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="btn-glass w-full"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleBuyWithEth}
                      disabled={loading}
                      className="btn-primary"
                    >
                      Buy with ETH
                    </button>
                    <button
                      onClick={handleBuyWithTokens}
                      disabled={loading}
                      className="btn-secondary"
                    >
                      Buy with Tokens
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Section */}
            {product.isAvailableForExchange && (
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <House className="w-6 h-6 text-[#5E6C58]" />
                  <h3 className="text-xl font-semibold text-[#162A2C]">
                    Exchange Options
                  </h3>
                </div>
                <p className="text-[#686867] mb-6">
                  {String(product.exchangePreference)}
                </p>

                <button
                  onClick={() => setShowExchangeModal(true)}
                  className="btn-glass w-full"
                >
                  Create Exchange Offer
                </button>

                {/* Exchange Offers */}
                {exchangeOffersData.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold text-[#162A2C]">
                      Current Offers
                    </h4>
                    {exchangeOffersData.map((offer, index) => (
                      <div
                        key={index}
                        className="glass-card p-6 rounded-2xl flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-[#162A2C]">
                            Offered Product ID: {offer.offeredProductId?.toString() || "N/A"}
                          </p>
                          <p className="text-sm text-[#686867]">
                            Quantity: {offer.quantity?.toString() || "N/A"}
                          </p>
                          <p className="text-sm text-[#686867]">
                            Token Top-up: {offer.tokenTopUp ? formatEther(offer.tokenTopUp) : "0"} Tokens
                          </p>
                        </div>
                        {product.seller === userAddress && (
                          <button
                            onClick={() => handleAcceptExchangeOffer(BigInt(index))}
                            disabled={loading}
                            className="btn-glass"
                          >
                            Accept Offer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exchange Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <House className="w-6 h-6 text-[#5E6C58]" />
                <h3 className="text-xl font-semibold text-[#162A2C]">
                  Create Exchange Offer
                </h3>
              </div>
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
                <select
                  value={selectedExchangeProduct?.toString() || ""}
                  onChange={(e) => setSelectedExchangeProduct(BigInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
                >
                  <option value="">Choose a product to exchange</option>
                  {availableUserProducts.map((p) => (
                    <option key={p.id.toString()} value={p.id.toString()}>
                      {p.name} (Qty: {p.quantity.toString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#686867] mb-2">
                  Exchange Quantity
                </label>
                <input
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
                  className="w-full px-4 py-2 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#686867] mb-2">
                  Token Top-up (Optional)
                </label>
                <input
                  type="number"
                  min={0}
                  value={tokenTopUp}
                  onChange={(e) => setTokenTopUp(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
                />
              </div>

              <button
                onClick={handleCreateExchangeOffer}
                disabled={!selectedExchangeProduct || loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-5 h-5" />
                ) : (
                  "Create Exchange Offer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}