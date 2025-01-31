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

  const {
    useGetProduct,
    useGetExchangeOffers,
    buyWithEth,
    buyWithTokens,
    // createEnhancedExchangeOffer,
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
      console.log("Purchase successful:", tx);
    } catch (error) {
      console.error("Error purchasing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWithTokens = async () => {
    setLoading(true);
    try {
      const tx = await buyWithTokens(productId, BigInt(quantity));
      console.log("Purchase successful:", tx);
    } catch (error) {
      console.error("Error purchasing:", error);
    } finally {
      setLoading(false);
    }
  };

  if (productLoading || !product) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        <Image
          src={product.image}
          alt={product.name}
          className="w-full rounded-lg"
          width={500}
          height={500}
        />
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <div className="space-y-2">
          <p className="text-gray-600">{product.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Brand:</span> {product.brand}
            </div>
            <div>
              <span className="font-medium">Size:</span> {product.size}
            </div>
            <div>
              <span className="font-medium">Condition:</span>{" "}
              {product.condition}
            </div>
            <div>
              <span className="font-medium">Gender:</span> {product.gender}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="font-medium">Price:</span>
            <div className="space-y-1">
              <p>{formatEther(product.ethPrice)} ETH</p>
              <p>{formatGwei(product.tokenPrice)} Tokens</p>
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
              className="w-32 p-2 border rounded-lg"
            />
          </div>

          <div className="space-x-4">
            <button
              onClick={handleBuyWithEth}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              Buy with ETH
            </button>
            <button
              onClick={handleBuyWithTokens}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300"
            >
              Buy with Tokens
            </button>
          </div>
        </div>

        {product.isAvailableForExchange && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Exchange Offers</h2>
            <p>{product.exchangePreference}</p>

            {userProducts && userProducts.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Make an Exchange Offer</h3>
                <select className="w-full p-2 border rounded-lg">
                  {userProducts.map((userProduct) => (
                    <option
                      key={userProduct.id.toString()}
                      value={userProduct.id.toString()}
                    >
                      {userProduct.name}
                    </option>
                  ))}
                </select>
                <button className="mt-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                  Create Offer
                </button>
              </div>
            )}

            {exchangeOffers && exchangeOffers.length > 0 ? (
              <div className="space-y-4">
                {exchangeOffers.map((offer, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <p>Offered Product: {offer.offeredProductId}</p>
                    <p>Token Top-up: {formatGwei(offer.tokenTopUp)}</p>
                    {product.seller === userAddress && (
                      <button
                        onClick={() =>
                          acceptEnhancedExchangeOffer(productId, BigInt(index))
                        }
                        className="mt-2 bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-700"
                      >
                        Accept Offer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No exchange offers yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
