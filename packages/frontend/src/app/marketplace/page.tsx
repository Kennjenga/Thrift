"use client";

import Link from "next/link";
import Image from "next/image";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product } from "@/types/market";
import { formatEther } from "ethers";
import { formatTokenAmount } from "@/utils/token-utils";

export default function MarketplacePage() {
  const { useGetAllProducts } = useMarketplace();
  const { data: productsData, isLoading, error } = useGetAllProducts();
  const products = productsData as Array<Product>;
  // console.log("products", products);
  // console.log("prodData", productsData);

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Error loading products: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Thrift Marketplace
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg p-4 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product: Product) => (
            <Link
              key={product.id}
              href={`/marketplace/product/${product.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="h-40 bg-gray-100 relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {product.brand}
                </p>
                <div className="mt-2">
                  <p className="text-lg font-bold">
                    {formatEther(product.ethPrice)} ETH
                  </p>
                  <p className="text-sm text-gray-600">
                    or {formatTokenAmount(product.tokenPrice)} Tokens
                  </p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.condition}
                  </span>
                  <span className="text-sm text-gray-600">
                    Qty: {product.quantity.toString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && (!products || products.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No products found in the marketplace
          </p>
          <Link
            href="/marketplace/create"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            List a Product
          </Link>
        </div>
      )}
    </div>
  );
}
