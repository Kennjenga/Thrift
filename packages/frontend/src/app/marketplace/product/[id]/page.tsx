"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatEther, parseEther } from "viem";
import {
  useMarketplace,
  useProductsData,
} from "@/blockchain/hooks/useMarketplace";
import { useCart, CartItem as ContextCartItem } from "@/contexts/cartContext";
import {
  ShoppingCart,
  RefreshCw,
  ArrowRightLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { ProductWithAvailability, PaymentMethod } from "@/types/market";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

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

  // Fetch user products when needed
  const { userProducts } = useProductsData(address);

  useEffect(() => {
    if (userProducts && userProducts.data && Array.isArray(userProducts.data)) {
      setUserProductsData(userProducts.data);
      setLoadingUserProducts(userProducts.isLoading);
    }
  }, [userProducts]);
  console.log("userdata", userProducts);
  console.log("product details: ", productData);

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
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Error state
  if (productError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error loading product: {productError.message}</p>
      </div>
    );
  }

  // No product found state
  if (!productLoading && !productData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>Product not found</p>
      </div>
    );
  }

  // At this point, we know product is not null
  const product = productData as ProductWithAvailability;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600">{product.brand}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">{product.description}</p>
              <div className="flex gap-4">
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {product.condition}
                </span>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {product.size}
                </span>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {product.gender}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {product.tokenPrice > 0n && (
                <p className="text-xl font-semibold">
                  {formatEther(product.tokenPrice)} THRIFT
                </p>
              )}
              {product.ethPrice > 0n && (
                <p className="text-xl font-semibold">
                  {formatEther(product.ethPrice)} ETH
                </p>
              )}
              <p className="text-sm text-gray-500">
                Available: {product.availableQuantity.toString()} of{" "}
                {product.totalQuantity.toString()}
              </p>
            </div>

            {/* Exchange Toggle Button */}
            {product.isAvailableForExchange && (
              <button
                onClick={toggleExchangeMode}
                className="flex items-center gap-2 text-blue-600 font-medium"
              >
                <ArrowRightLeft className="w-5 h-5" />
                {exchangeMode ? "Switch to Purchase" : "Switch to Exchange"}
              </button>
            )}

            {/* Purchase Controls */}
            {!exchangeMode ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <label className="text-gray-700">Quantity:</label>
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
                    className="w-20 p-2 border rounded"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                      paymentMethod === "ETH"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setPaymentMethod("ETH")}
                    disabled={!product.ethPrice || product.ethPrice === 0n}
                  >
                    Pay with ETH
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                      paymentMethod === "TOKEN"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setPaymentMethod("TOKEN")}
                    disabled={!product.tokenPrice || product.tokenPrice === 0n}
                  >
                    Pay with THRIFT
                  </button>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    disabled={processing || product.availableQuantity < 1n}
                    className={`w-1/2 py-4 bg-gray-200 text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      product.availableQuantity < 1n
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePurchase}
                    disabled={processing || product.availableQuantity < 1n}
                    className={`w-1/2 py-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
                      product.availableQuantity < 1n
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Purchase Now
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Exchange Controls */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">
                    Exchange for Your Product
                  </h3>

                  {loadingUserProducts ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                  ) : userProductsData.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-gray-700 block">
                          Select your product to offer:
                        </label>
                        <select
                          className="w-full p-2 border rounded-lg"
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

                      <div className="space-y-2 mt-4">
                        <label className="text-gray-700 block">
                          Token Top-up (optional):
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-lg"
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
                        <p className="text-sm text-gray-500">
                          Add THRIFT tokens to make your exchange offer more
                          attractive
                        </p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExchange}
                        disabled={
                          processing ||
                          !selectedExchangeProduct ||
                          product.availableQuantity < 1n
                        }
                        className={`w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
                          !selectedExchangeProduct ||
                          product.availableQuantity < 1n
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {processing ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-5 h-5" />
                            Create Exchange Offer
                          </>
                        )}
                      </motion.button>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      You don&apos;t have any products to exchange. List a
                      product first.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
