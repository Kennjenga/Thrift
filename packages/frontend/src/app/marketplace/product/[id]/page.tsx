"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatEther, parseEther } from "viem";
import {
  useMarketplace,
  useProductsData,
} from "@/blockchain/hooks/useMarketplace";
import { useCart, CartItem as ContextCartItem } from "@/contexts/cartContext";
import {
  ShoppingCart,
  ArrowRightLeft,
  Check,
  AlertCircle,
  Heart,
  ArrowLeft,
  Package,
  Clock,
} from "lucide-react";
import { ProductWithAvailability, PaymentMethod } from "@/types/market";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

// Background Elements Component
const BackgroundElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]" />

      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF00FF] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7B42FF] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#00FFFF] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF1B6B] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-[#4A00E0] rounded-full filter blur-[90px] opacity-[0.07] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-[280px] h-[280px] bg-[#8A2BE2] rounded-full filter blur-[110px] opacity-[0.09] animate-pulse" />
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="w-16 h-16 relative">
      <div className="absolute inset-0 rounded-full border-4 border-[#00FFD1]/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-[#00FFD1] border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-white/70">Loading product details...</p>
  </div>
);

// Error Display Component
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl p-8 max-w-md text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">
        Error Loading Product
      </h3>
      <p className="text-white/70">{message}</p>
      <Link href="/marketplace">
        <button className="mt-6 px-6 py-3 bg-[#7B42FF] text-white rounded-full hover:bg-[#8A2BE2] transition-colors flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} />
          Back to Marketplace
        </button>
      </Link>
    </div>
  </div>
);

// Product Not Found Component
const ProductNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="bg-purple-900/20 backdrop-blur-md border border-purple-500/10 rounded-xl p-8 max-w-md text-center">
      <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Product Not Found</h3>
      <p className="text-white/70">
        The product you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Link href="/marketplace">
        <button className="mt-6 px-6 py-3 bg-[#7B42FF] text-white rounded-full hover:bg-[#8A2BE2] transition-colors flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} />
          Back to Marketplace
        </button>
      </Link>
    </div>
  </div>
);

const ProductPage: React.FC = () => {
  const params = useParams();
  const productId = params?.id as string;

  const { address } = useAccount();
  const { addItem } = useCart();

  // Get marketplace hooks
  const {
    useProductDetails,
    createExchangeOffer,
    createEscrowWithEth,
    createEscrowWithTokens,
  } = useMarketplace();

  // Product data loading using the new hook
  const {
    product: productData,
    isLoading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useProductDetails(productId ? BigInt(productId) : undefined);

  // State for user products
  const [userProductsData, setUserProductsData] = useState<
    ProductWithAvailability[]
  >([]);
  const [loadingUserProducts, setLoadingUserProducts] = useState(false);

  // State for product and UI
  const [quantity, setQuantity] = useState<bigint>(1n);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ETH");
  const [exchangeMode, setExchangeMode] = useState(false);
  const [tokenTopUp, setTokenTopUp] = useState("");
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<
    bigint | null
  >(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);
  const [liked, setLiked] = useState(false);

  // Fetch user products when needed
  const { userProducts } = useProductsData(address);

  useEffect(() => {
    if (userProducts && userProducts.data && Array.isArray(userProducts.data)) {
      setUserProductsData(userProducts.data);
      setLoadingUserProducts(userProducts.isLoading);
    }
  }, [userProducts]);

  // Clear messages when parameters change
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [
    productId,
    quantity,
    paymentMethod,
    exchangeMode,
    selectedExchangeProduct,
  ]);

  const handleAddToCart = () => {
    if (!productData) return;

    // Create a cart item that matches what the context expects
    const cartItem: ContextCartItem = {
      // Directly include Product properties
      id: productData.id,
      name: productData.name,
      description: productData.description,
      size: productData.size,
      brand: productData.brand,
      condition: productData.condition,
      gender: productData.gender,
      image: productData.image,
      ethPrice: productData.ethPrice,
      tokenPrice: productData.tokenPrice,
      isAvailableForExchange: productData.isAvailableForExchange,
      seller: productData.seller,
      categories: productData.categories || [],
      exchangePreference: productData.exchangePreference || "",
      isSold: false,
      isDeleted: false,
      inEscrowQuantity: 0n,

      // CartItem specific properties
      quantity: quantity,
      paymentType: paymentMethod === "ETH" ? "ETH" : "TOKEN", // Match the enum in the context
    };

    addItem(cartItem);
    setSuccess("Item added to cart!");
  };

  const handlePurchase = async () => {
    if (!productData || !address) return;
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      if (paymentMethod === "ETH") {
        if (!productData.ethPrice) {
          throw new Error("ETH price not set for this product");
        }
        const totalCost = productData.ethPrice * quantity;
        await createEscrowWithEth(productData.id, quantity, totalCost);
      } else {
        if (!productData.tokenPrice) {
          throw new Error("THRIFT price not set for this product");
        }
        await createEscrowWithTokens(productData.id, quantity);
      }
      setSuccess("Purchase initiated! Check your escrow status.");
      refetchProduct();
    } catch (err) {
      console.error("Purchase error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create purchase escrow"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleExchange = async () => {
    if (!productData || !selectedExchangeProduct || !address) return;
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      await createExchangeOffer(
        selectedExchangeProduct,
        productData.id,
        1n, // Quantity for exchange is typically 1
        tokenTopUp ? parseEther(tokenTopUp) : 0n
      );
      setSuccess("Exchange offer created! Check your escrow status.");
      refetchProduct();
    } catch (err) {
      console.error("Exchange error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create exchange offer"
      );
    } finally {
      setProcessing(false);
    }
  };

  const toggleExchangeMode = () => {
    setExchangeMode(!exchangeMode);
    setSelectedExchangeProduct(null);
    setTokenTopUp("");
  };

  // Loading state
  if (productLoading) {
    return (
      <div className="min-h-screen bg-[#1A0B3B] relative">
        <BackgroundElements />
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (productError) {
    return (
      <div className="min-h-screen bg-[#1A0B3B] relative">
        <BackgroundElements />
        <ErrorDisplay message={productError.message} />
      </div>
    );
  }

  // No product found state
  if (!productLoading && !productData) {
    return (
      <div className="min-h-screen bg-[#1A0B3B] relative">
        <BackgroundElements />
        <ProductNotFound />
      </div>
    );
  }

  // At this point, we know product is not null
  const product = productData as ProductWithAvailability;

  return (
    <div className="min-h-screen bg-[#1A0B3B] relative">
      <BackgroundElements />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Back Button */}
        <Link href="/marketplace">
          <button className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span>Back to Marketplace</span>
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Section */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

              {/* Like Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setLiked(!liked)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center z-30 border border-white/10"
              >
                <Heart
                  size={20}
                  className={`${
                    liked ? "text-[#FF1B6B] fill-[#FF1B6B]" : "text-white"
                  } transition-colors`}
                />
              </motion.button>
            </div>

            {/* Product Details Card */}
            <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Product Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-white/50 text-sm">Brand</p>
                  <p className="text-white">{product.brand}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-white/50 text-sm">Condition</p>
                  <p className="text-white">{product.condition}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-white/50 text-sm">Size</p>
                  <p className="text-white">{product.size}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-white/50 text-sm">Gender</p>
                  <p className="text-white">{product.gender}</p>
                </div>

                <div className="space-y-1 col-span-2">
                  <p className="text-white/50 text-sm">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {product.categories && product.categories.length > 0 ? (
                      product.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-white/80 border border-purple-500/30"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/70">No categories</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7B42FF] to-[#00FFD1] flex items-center justify-center">
                  <span className="text-white font-bold">
                    {product.seller.slice(2, 4).toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-white/50 text-sm">Seller</p>
                  <p className="text-white font-medium">
                    {`${product.seller.slice(0, 6)}...${product.seller.slice(
                      -4
                    )}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info and Purchase Section */}
          <div className="space-y-8">
            {/* Product Title and Description */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-[#00FFD1] via-white to-[#7B42FF] bg-clip-text text-transparent">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="px-3 py-1 rounded-full bg-[#00FFD1]/20 text-[#00FFD1] text-sm border border-[#00FFD1]/30">
                  {product.brand}
                </div>

                {product.isAvailableForExchange && (
                  <div className="px-3 py-1 rounded-full bg-[#7B42FF]/20 text-[#8A2BE2] text-sm border border-[#7B42FF]/30 flex items-center gap-1">
                    <ArrowRightLeft size={14} />
                    <span>Exchange Available</span>
                  </div>
                )}
              </div>

              <p className="text-white/70 mb-6">{product.description}</p>

              {/* Price Display */}
              <div className="flex flex-wrap gap-6 mb-6">
                {product.tokenPrice > 0n && (
                  <div className="backdrop-blur-md bg-[#00FFD1]/10 border border-[#00FFD1]/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00FFD1]/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-[#00FFD1]"></div>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">THRIFT Price</p>
                      <p className="text-[#00FFD1] text-xl font-bold">
                        {formatEther(product.tokenPrice)}
                      </p>
                    </div>
                  </div>
                )}

                {product.ethPrice > 0n && (
                  <div className="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">ETH Price</p>
                      <p className="text-white text-xl font-bold">
                        {formatEther(product.ethPrice)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3 mb-8">
                <Clock className="w-5 h-5 text-white/50" />
                <p className="text-white/70">
                  <span className="text-[#00FFD1] font-medium">
                    {product.availableQuantity.toString()}
                  </span>{" "}
                  of {product.totalQuantity.toString()} available
                </p>
              </div>
            </div>

            {/* Exchange Toggle Button */}
            {product.isAvailableForExchange && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleExchangeMode}
                className="w-full py-3 px-4 rounded-xl backdrop-blur-md bg-purple-900/30 border border-purple-500/20 text-white flex items-center justify-center gap-2 hover:bg-purple-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
                {exchangeMode ? "Switch to Purchase" : "Switch to Exchange"}
              </motion.button>
            )}

            {/* Purchase Controls */}
            {!exchangeMode ? (
              <div className="space-y-6 backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Purchase Options
                </h3>

                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <label className="text-white/70 w-24">Quantity:</label>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="1"
                        max={Number(product.availableQuantity)}
                        value={Number(quantity)}
                        onChange={(e) =>
                          setQuantity(
                            BigInt(Math.max(1, parseInt(e.target.value) || 1))
                          )
                        }
                        className="w-full p-3 rounded-lg bg-purple-900/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50"
                      />
                      <div className="absolute inset-y-0 right-0 flex">
                        <button
                          className="px-3 text-white/70 hover:text-white"
                          onClick={() =>
                            setQuantity(quantity > 1n ? quantity - 1n : 1n)
                          }
                        >
                          -
                        </button>
                        <button
                          className="px-3 text-white/70 hover:text-white"
                          onClick={() =>
                            setQuantity(
                              quantity < product.availableQuantity
                                ? quantity + 1n
                                : product.availableQuantity
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-white/70">Payment Method:</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        className={`py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                          paymentMethod === "ETH"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-purple-900/30 text-white/70 border border-purple-500/20"
                        }`}
                        onClick={() => setPaymentMethod("ETH")}
                        disabled={!product.ethPrice || product.ethPrice === 0n}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${
                            paymentMethod === "ETH" ? "bg-white" : "bg-white/30"
                          } flex items-center justify-center`}
                        >
                          {paymentMethod === "ETH" && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        Pay with ETH
                      </button>

                      <button
                        className={`py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                          paymentMethod === "TOKEN"
                            ? "bg-gradient-to-r from-[#00FFD1] to-[#00E6BD] text-[#1A0B3B] shadow-lg shadow-[#00FFD1]/20"
                            : "bg-purple-900/30 text-white/70 border border-purple-500/20"
                        }`}
                        onClick={() => setPaymentMethod("TOKEN")}
                        disabled={
                          !product.tokenPrice || product.tokenPrice === 0n
                        }
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${
                            paymentMethod === "TOKEN"
                              ? "bg-[#1A0B3B]"
                              : "bg-white/30"
                          } flex items-center justify-center`}
                        >
                          {paymentMethod === "TOKEN" && (
                            <div className="w-2 h-2 rounded-full bg-[#00FFD1]"></div>
                          )}
                        </div>
                        Pay with THRIFT
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <motion.button
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToCart}
                      disabled={processing || product.availableQuantity < 1n}
                      className={`py-4 backdrop-blur-md bg-purple-900/40 border border-purple-500/30 rounded-xl font-medium flex items-center justify-center gap-2 text-white hover:bg-purple-900/60 transition-all duration-300 ${
                        product.availableQuantity < 1n
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePurchase}
                      disabled={processing || product.availableQuantity < 1n}
                      className={`py-4 bg-gradient-to-r from-[#7B42FF] to-[#8A2BE2] rounded-xl font-medium flex items-center justify-center gap-2 text-white shadow-lg shadow-[#7B42FF]/20 hover:shadow-[#7B42FF]/40 transition-all duration-300 relative overflow-hidden ${
                        product.availableQuantity < 1n
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {/* Animated glow effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></span>

                      {processing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Purchase Now
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Exchange Options
                </h3>

                {loadingUserProducts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00FFD1] border-t-transparent"></div>
                  </div>
                ) : userProductsData.length > 0 ? (
                  <div className="space-y-6">
                    {/* Product Selection */}
                    <div className="space-y-2">
                      <label className="text-white/70 block">
                        Select your product to offer:
                      </label>
                      <select
                        className="w-full p-3 rounded-lg bg-purple-900/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50"
                        value={selectedExchangeProduct?.toString() || ""}
                        onChange={(e) =>
                          setSelectedExchangeProduct(
                            e.target.value ? BigInt(e.target.value) : null
                          )
                        }
                      >
                        <option value="">Select a product</option>
                        {userProductsData.map((item) => (
                          <option
                            key={item.id.toString()}
                            value={item.id.toString()}
                            disabled={item.availableQuantity < 1n}
                          >
                            {item.name} ({item.brand}) -{" "}
                            {item.availableQuantity.toString()} available
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Token Top-up */}
                    <div className="space-y-2">
                      <label className="text-white/70 block">
                        Token Top-up (optional):
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full p-3 rounded-lg bg-purple-900/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50 pr-16"
                          placeholder="Amount in THRIFT"
                          value={tokenTopUp}
                          onChange={(e) => {
                            // Allow only valid decimal numbers
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              setTokenTopUp(value);
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-[#00FFD1]">THRIFT</span>
                        </div>
                      </div>
                      <p className="text-white/50 text-sm">
                        Add THRIFT tokens to make your exchange offer more
                        attractive
                      </p>
                    </div>

                    {/* Selected Product Preview */}
                    {selectedExchangeProduct && (
                      <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
                        <h4 className="text-white font-medium mb-2">
                          Selected Product
                        </h4>
                        {userProductsData
                          .filter((p) => p.id === selectedExchangeProduct)
                          .map((product) => (
                            <div
                              key={product.id.toString()}
                              className="flex items-center gap-3"
                            >
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-white">{product.name}</p>
                                <p className="text-white/70 text-sm">
                                  {product.brand} • {product.size}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Exchange Button */}
                    <motion.button
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExchange}
                      disabled={
                        processing ||
                        !selectedExchangeProduct ||
                        product.availableQuantity < 1n
                      }
                      className={`w-full py-4 bg-gradient-to-r from-[#00FFD1] to-[#00E6BD] rounded-xl font-medium flex items-center justify-center gap-2 text-[#1A0B3B] shadow-lg shadow-[#00FFD1]/20 hover:shadow-[#00FFD1]/40 transition-all duration-300 relative overflow-hidden ${
                        !selectedExchangeProduct ||
                        product.availableQuantity < 1n
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {/* Animated glow effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></span>

                      {processing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1A0B3B] border-t-transparent"></div>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-5 h-5" />
                          Create Exchange Offer
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70 mb-6">
                      You don&apos;t have any products to exchange.
                    </p>
                    <Link href="/marketplace/create">
                      <motion.button
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-[#7B42FF] to-[#8A2BE2] rounded-full font-medium text-white shadow-lg shadow-[#7B42FF]/20 hover:shadow-[#7B42FF]/40 transition-all duration-300"
                      >
                        List a Product
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-white/90">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-white/90">{success}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
