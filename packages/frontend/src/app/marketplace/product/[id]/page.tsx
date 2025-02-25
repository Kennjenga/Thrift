"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatEther, type Address, parseEther } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import {
  useGetProductById,
  // useGetProductsByIds,
  useGetUserProducts,
} from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import {
  ShoppingCart,
  RefreshCw,
  ArrowRightLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { Product, PaymentMethod } from "@/types/market";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

const ProductPage = () => {
  const params = useParams();
  // const router = useRouter();
  const productId = params?.id as string;

  const { address } = useAccount();
  const { addItem } = useCart();

  // Product data loading
  const { data: productData, isLoading: productLoading } = useGetProductById(
    productId ? BigInt(productId) : undefined
  );

  // Get user's products for exchange
  const { data: userProductsData, isLoading: userProductsLoading } =
    useGetUserProducts(address as Address);

  // Get marketplace functions for transactions
  const { createExchangeOffer, createEscrowWithEth, createEscrowWithTokens } =
    useMarketplace();

  const [product, setProduct] = useState<Product | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<bigint>(BigInt(1));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ETH");
  const [exchangeMode, setExchangeMode] = useState(false);
  const [tokenTopUp, setTokenTopUp] = useState("");
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<
    bigint | null
  >(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);

  // Update product when data is loaded
  useEffect(() => {
    if (productData) {
      setProduct(productData as Product);
    }
  }, [productData]);

  // Update user products when data is loaded
  useEffect(() => {
    if (userProductsData) {
      setUserProducts(userProductsData as Product[]);
    }
  }, [userProductsData]);

  // Loading state
  if (productLoading || userProductsLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      quantity,
      paymentType: paymentMethod,
      name: product.name,
      description: product.description,
      size: product.size,
      brand: product.brand,
      condition: product.condition,
      gender: product.gender,
      image: product.image,
      ethPrice: product.ethPrice,
      tokenPrice: product.tokenPrice,
      isAvailableForExchange: product.isAvailableForExchange,
      seller: product.seller,
      categories: product.categories ? product.categories : [],
      exchangePreference: product.exchangePreference
        ? product.exchangePreference
        : "",
      isSold: false,
      isDeleted: false,
      inEscrowQuantity: 0n,
    });
    setSuccess("Item added to cart!");
  };

  const handlePurchase = async () => {
    if (!product || !address) return;
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      if (paymentMethod === "ETH") {
        if (!product.ethPrice) {
          throw new Error("ETH price not set for this product");
        }
        const totalCost = product.ethPrice * quantity;
        await createEscrowWithEth(product.id, quantity, totalCost);
      } else {
        await createEscrowWithTokens(product.id, quantity);
      }
      setSuccess("Purchase initiated! Check your escrow status.");
    } catch {
      console.error("Purchase error:", error);
      setError(error || "Failed to create purchase escrow");
    } finally {
      setProcessing(false);
    }
  };

  const handleExchange = async () => {
    if (!product || !selectedExchangeProduct || !address) return;
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      await createExchangeOffer(
        selectedExchangeProduct,
        product.id,
        quantity,
        tokenTopUp ? parseEther(tokenTopUp) : 0n
      );
      setSuccess("Exchange offer created! Check your escrow status.");
    } catch {
      console.error("Exchange error:", error);
      setError(error || "Failed to create exchange offer");
    } finally {
      setProcessing(false);
    }
  };

  const toggleExchangeMode = () => {
    setExchangeMode(!exchangeMode);
    setSelectedExchangeProduct(null);
    setTokenTopUp("");
  };

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
                    max={Number(product.quantity)}
                    value={Number(quantity)}
                    onChange={(e) =>
                      setQuantity(BigInt(parseInt(e.target.value) || 1))
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
                    disabled={!product.ethPrice}
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
                    disabled={!product.tokenPrice}
                  >
                    Pay with THRIFT
                  </button>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    disabled={processing}
                    className="w-1/2 py-4 bg-gray-200 text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePurchase}
                    disabled={processing}
                    className="w-1/2 py-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
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

                  {userProducts.length > 0 ? (
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
                          {userProducts.map((item) => (
                            <option
                              key={item.id.toString()}
                              value={item.id.toString()}
                            >
                              {item.name} ({item.brand})
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
                          onChange={(e) => setTokenTopUp(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Add THRIFT tokens to make your exchange offer more
                          attractive
                        </p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExchange}
                        disabled={processing || !selectedExchangeProduct}
                        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
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
