"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { formatEther, type Address } from "viem";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useCart } from "@/contexts/cartContext";
import { Coins, ShoppingBag, RefreshCw, ArrowRightLeft, X } from "lucide-react";
import { Product } from "@/types/market";
import { useAccount } from "wagmi";

// Type definitions for hook returns
type GetProductsBatchReturn = {
  data: Product[] | undefined;
  isLoading: boolean;
};

type GetUserProductsReturn = {
  data: bigint[] | undefined;
};

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { address } = useAccount();

  const {
    useGetProductsBatch,
    useGetUserProducts,
    createExchangeOffer,
    createEscrowWithEth,
    createEscrowWithTokens,
  } = useMarketplace();

  const { addItem } = useCart();

  const [quantity, setQuantity] = useState<bigint>(BigInt(1));
  const [loading, setLoading] = useState<"eth" | "tokens" | "exchange" | null>(
    null
  );
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<
    bigint | null
  >(null);
  const [tokenTopUp, setTokenTopUp] = useState<string>("0");

  // Properly typed hook calls with type assertions
  const { data: products = [], isLoading: productLoading } =
    useGetProductsBatch(id ? [BigInt(id)] : []) as GetProductsBatchReturn;

  // Only fetch user products if we have an address
  const { data: userProductIds = [] } = useGetUserProducts(
    address as Address
  ) as GetUserProductsReturn;

  const { data: userProducts = [], isLoading: userProductsLoading } =
    useGetProductsBatch(userProductIds || []) as GetProductsBatchReturn;

  const product = products[0];

  if (productLoading || userProductsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-500">Product not found</h2>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      ...product,
      quantity,
      paymentType: "ETH",
    });
  };

  const handleBuyWithEth = async () => {
    if (!address) return;
    try {
      setLoading("eth");
      await createEscrowWithEth(
        BigInt(product.id),
        quantity,
        product.ethPrice * quantity
      );
      router.push("/escrow");
    } catch (error) {
      console.error("ETH Purchase Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyWithTokens = async () => {
    if (!address) return;
    try {
      setLoading("tokens");
      await createEscrowWithTokens(BigInt(product.id), quantity);
      router.push("/escrow");
    } catch (error) {
      console.error("Token Purchase Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleExchange = async () => {
    if (!selectedExchangeProduct || !address) return;

    try {
      setLoading("exchange");
      await createExchangeOffer(
        selectedExchangeProduct,
        BigInt(product.id),
        BigInt(tokenTopUp)
      );
      setShowExchangeModal(false);
      router.push("/escrow");
    } catch (error) {
      console.error("Exchange Error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-96 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Brand</p>
              <p className="font-semibold">{product.brand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-semibold">{product.condition}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Size</p>
              <p className="font-semibold">{product.size}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-semibold">{product.gender}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <p className="text-xl font-bold">
                  {formatEther(product.ethPrice)} ETH
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <p className="text-xl font-bold">
                  {formatEther(product.tokenPrice)} Tokens
                </p>
              </div>
            </div>

            {product.isAvailableForExchange && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">
                  Exchange Preferences
                </h3>
                <p className="text-blue-700 mt-1">
                  {product.exchangePreference}
                </p>
              </div>
            )}
          </div>

          {address ? (
            <>
              <div className="flex items-center gap-4">
                <select
                  value={quantity.toString()}
                  onChange={(e) => setQuantity(BigInt(e.target.value))}
                  className="p-2 border rounded-lg"
                >
                  {[...Array(Number(product.quantity))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleBuyWithEth}
                  disabled={loading === "eth"}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {loading === "eth" ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                  Buy with ETH
                </button>

                <button
                  onClick={handleBuyWithTokens}
                  disabled={loading === "tokens"}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading === "tokens" ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                  Buy with Tokens
                </button>
              </div>

              {product.isAvailableForExchange && (
                <button
                  onClick={() => setShowExchangeModal(true)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  Propose Exchange
                </button>
              )}
            </>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800">
              Please connect your wallet to purchase this item
            </div>
          )}
        </div>
      </div>

      {/* Exchange Modal */}
      {showExchangeModal && address && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Exchange Offer</h2>
              <button onClick={() => setShowExchangeModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Select one of your items to exchange
              </p>

              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {(userProducts as Product[])
                  .filter((p) => p.isAvailableForExchange)
                  .map((userProduct) => (
                    <div
                      key={userProduct.id.toString()}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedExchangeProduct === userProduct.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedExchangeProduct(userProduct.id)}
                    >
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20">
                          <Image
                            src={userProduct.image}
                            alt={userProduct.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{userProduct.name}</h3>
                          <p className="text-sm text-gray-600">
                            {userProduct.brand}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Token Top-up Amount
                </label>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={tokenTopUp}
                    onChange={(e) => setTokenTopUp(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                    min="0"
                    step="0.000000000000000001"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowExchangeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExchange}
                  disabled={!selectedExchangeProduct || loading === "exchange"}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading === "exchange" ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    "Create Exchange Offer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
