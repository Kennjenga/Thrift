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
  // SwapHorizontal,
} from "lucide-react";

// Context and Hook Imports
import { useCart } from "@/contexts/cartContext";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useThriftToken } from "@/blockchain/hooks/useThriftToken";

// Type Imports
import { ExchangeOffer, Product } from "@/types/market";

// Utility Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" />
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md flex items-center">
    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
    {message}
  </div>
);

export default function ProductPage() {
  // URL and State Management
  const params = useParams();
  const productId = BigInt(params.id as string);

  // State Hooks
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const { data: exchangeOffersData = [] } = useGetExchangeOffers(productId);

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

  // Exchange Modal Component
  const ExchangeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            {/* <SwapHorizontal className="mr-2" /> Create Exchange Offer */}
          </h3>
          <button
            onClick={() => setShowExchangeModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Your Product
            </label>
            <select
              value={selectedExchangeProduct?.toString() || ""}
              onChange={(e) =>
                setSelectedExchangeProduct(BigInt(e.target.value))
              }
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Top-up (Optional)
            </label>
            <input
              type="number"
              min={0}
              value={tokenTopUp}
              onChange={(e) => setTokenTopUp(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            onClick={handleCreateExchangeOffer}
            disabled={!selectedExchangeProduct || loading}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <RefreshCw className="animate-spin mr-2" /> : null}
            Create Exchange Offer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <CartButton />
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.brand}</p>
          </div>

          {/* Product Specs */}
          <div className="bg-white rounded-lg border p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Condition", value: product.condition },
                { label: "Size", value: product.size },
                { label: "Gender", value: product.gender },
                {
                  label: "Available",
                  value: `${product.quantity.toString()} items`,
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-sm font-medium text-gray-500">
                    {label}
                  </span>
                  <p className="text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing and Purchase Options */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  ETH Price
                </span>
                <p className="text-2xl font-bold text-gray-900">
                  {formatEther(product.ethPrice)} ETH
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Token Price
                </span>
                <p className="text-2xl font-bold text-gray-900">
                  {formatEther(product.tokenPrice)} Tokens
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center w-full px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBuyWithEth}
                    disabled={loading}
                    className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Buy with ETH
                  </button>
                  <button
                    onClick={handleBuyWithTokens}
                    disabled={loading}
                    className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Buy with Tokens
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Section */}
          {product.isAvailableForExchange && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                {/* <SwapHorizontal className="mr-2" /> Exchange Options */}
              </h3>
              <p className="text-gray-600 mb-4">
                {String(product.exchangePreference)}
              </p>

              <button
                onClick={() => setShowExchangeModal(true)}
                className="w-full px-6 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Create Exchange Offer
              </button>

              {/* Exchange Offers */}
              {exchangeOffersData && exchangeOffersData.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Current Offers
                  </h4>
                  {exchangeOffersData.map((offer, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">
                          Offered Product ID:{" "}
                          {offer.offeredProductId?.toString() || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {offer.quantity?.toString() || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Token Top-up:{" "}
                          {offer.tokenTopUp
                            ? formatEther(offer.tokenTopUp)
                            : "0"}{" "}
                          Tokens
                        </p>
                      </div>
                      {product.seller === userAddress && (
                        <button
                          onClick={() =>
                            handleAcceptExchangeOffer(BigInt(index))
                          }
                          disabled={loading}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
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

      {/* Exchange Modal */}
      {showExchangeModal && <ExchangeModal />}
    </div>
  );
}
