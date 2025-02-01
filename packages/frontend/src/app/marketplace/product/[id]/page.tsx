"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { formatEther, formatGwei } from "viem";
import { ExchangeOffer, Product } from "@/types/market";

export default function ProductPage() {
  const params = useParams();
  const productId = BigInt(params.id as string);
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<
    bigint | null
  >(null);
  const [tokenTopUp, setTokenTopUp] = useState("0");

  const {
    useGetProduct,
    useGetExchangeOffers,
    buyWithEth,
    buyWithTokens,
    createEnhancedExchangeOffer,
    acceptEnhancedExchangeOffer,
    useGetProductsByOwner,
    userAddress,
  } = useMarketplace();

  const { data, isLoading: productLoading } = useGetProduct(productId);
  const { data: exchangeOffersData } = useGetExchangeOffers(productId);
  const { data: userProducts } = useGetProductsByOwner(userAddress!);

  const product = data as Product;
  const exchangeOffers = exchangeOffersData as Array<ExchangeOffer>;

  const handleBuyWithEth = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const tx = await buyWithEth(
        productId,
        BigInt(quantity),
        product.ethPrice * BigInt(quantity)
      );
      alert("Purchase successful!");
    } catch (error) {
      console.error("Error purchasing:", error);
      alert("Purchase failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWithTokens = async () => {
    setLoading(true);
    try {
      const tx = await buyWithTokens(productId, BigInt(quantity));
      alert("Purchase successful!");
    } catch (error) {
      console.error("Error purchasing:", error);
      alert("Purchase failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExchangeOffer = async () => {
    if (!selectedExchangeProduct) {
      alert("Please select a product to exchange");
      return;
    }

    setLoading(true);
    try {
      const tx = await createEnhancedExchangeOffer(
        selectedExchangeProduct,
        productId,
        BigInt(1), // default exchange quantity
        BigInt(tokenTopUp)
      );
      alert("Exchange offer created successfully!");
    } catch (error) {
      console.error("Error creating exchange offer:", error);
      alert("Failed to create exchange offer. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (productLoading || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailRow label="Brand" value={product.brand} />
              <DetailRow label="Size" value={product.size} />
              <DetailRow label="Condition" value={product.condition} />
              <DetailRow label="Gender" value={product.gender} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Price:</span>
              <div className="flex space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {formatEther(product.ethPrice)} ETH
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {formatGwei(product.tokenPrice)} Tokens
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.quantity.toString()}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleBuyWithEth}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Buy with ETH
              </button>
              <button
                onClick={handleBuyWithTokens}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Buy with Tokens
              </button>
            </div>
          </div>

          {product.isAvailableForExchange && (
            <div className="mt-8 bg-purple-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-purple-800">
                Exchange Options
              </h2>
              <p className="text-gray-600 mb-4">{product.exchangePreference}</p>

              {userProducts && userProducts.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Product to Exchange
                    </label>
                    <select
                      value={selectedExchangeProduct?.toString() || ""}
                      onChange={(e) =>
                        setSelectedExchangeProduct(BigInt(e.target.value))
                      }
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a Product</option>
                      {userProducts.map((userProduct) => (
                        <option
                          key={userProduct.id.toString()}
                          value={userProduct.id.toString()}
                        >
                          {userProduct.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Token Top-up (Optional)
                    </label>
                    <input
                      type="number"
                      value={tokenTopUp}
                      onChange={(e) => setTokenTopUp(e.target.value)}
                      min="0"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter additional token amount"
                    />
                  </div>

                  <button
                    onClick={handleCreateExchangeOffer}
                    disabled={loading || !selectedExchangeProduct}
                    className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Create Exchange Offer
                  </button>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Current Exchange Offers
                </h3>
                {exchangeOffers && exchangeOffers.length > 0 ? (
                  <div className="space-y-4">
                    {exchangeOffers.map((offer, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              Offered Product ID:{" "}
                              {offer.offeredProductId.toString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Token Top-up: {formatGwei(offer.tokenTopUp)}{" "}
                              Tokens
                            </p>
                          </div>
                          {product.seller === userAddress && (
                            <button
                              onClick={() =>
                                acceptEnhancedExchangeOffer(
                                  productId,
                                  BigInt(index)
                                )
                              }
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Accept Offer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No exchange offers yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
);
