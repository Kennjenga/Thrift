"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Package } from "lucide-react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product, ProductCondition, ProductGender } from "@/types/market";
import { AESTHETICS } from "@/constants/aesthetics";
// import { formatETHPrice} from "@/utils/token-utils";
// import { useAccount } from "wagmi";
import { formatEther } from "ethers";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 truncate">{product.brand}</p>
        <div className="mt-2 flex justify-between items-center">
          <div>
            {product.tokenPrice > 0n && (
              <p className="text-sm font-medium text-gray-900">
                {formatEther(product.tokenPrice)} THRIFT
              </p>
            )}
            {product.ethPrice > 0n && (
              <p className="text-sm font-medium text-gray-900">
                {formatEther(product.ethPrice)} ETH
              </p>
            )}
          </div>
          {product.isAvailableForExchange && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Exchange
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
    <AlertCircle className="w-6 h-6 text-red-500" />
    <p className="text-red-700">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 bg-gray-100 rounded-xl border border-gray-200">
    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
    <p className="text-gray-600 mb-6">No products found in the marketplace</p>
    <Link href="/marketplace/create">
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
        List a Product
      </button>
    </Link>
  </div>
);

const MarketplacePage = () => {
  // const { address } = useAccount();
  const { allActiveProducts, searchProducts } = useMarketplace();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    nameQuery: "",
    categories: [] as string[],
    brand: "",
    condition: "" as ProductCondition | "",
    gender: "" as ProductGender | "",
    size: "",
    minPrice: "",
    maxPrice: "",
    onlyAvailable: true,
    exchangeOnly: false,
    page: 1n,
    pageSize: 12n,
  });

  useEffect(() => {
    if (allActiveProducts) {
      setProducts(allActiveProducts as Product[]);
      setLoading(false);
    }
  }, [allActiveProducts]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fixed: Removed explicit typing to avoid type mismatch
      const result = await searchProducts(
        filters.nameQuery,
        filters.categories,
        filters.brand,
        filters.condition,
        filters.gender,
        filters.size,
        filters.minPrice ? BigInt(parseFloat(filters.minPrice) * 1e18) : 0n,
        filters.maxPrice ? BigInt(parseFloat(filters.maxPrice) * 1e18) : 0n,
        filters.onlyAvailable,
        filters.exchangeOnly,
        filters.page,
        filters.pageSize
      );

      if (result && result.success && result.data) {
        setProducts(result.data.products || []);
      } else {
        setProducts([]);
        if (result.error) {
          setError("An error occurred while searching. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setError("Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 min-w-[200px] p-2 border rounded"
              value={filters.nameQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, nameQuery: e.target.value }))
              }
            />

            {/* Category Filter */}
            <select
              className="p-2 border rounded"
              value={filters.categories[0] || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  categories: e.target.value ? [e.target.value] : [],
                }))
              }
            >
              <option value="">All Categories</option>
              {/* Fixed: Use AESTHETICS which is imported as a constant */}
              {Object.values(AESTHETICS).map((aesthetic) => (
                <option key={aesthetic} value={aesthetic}>
                  {aesthetic}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              className="p-2 border rounded"
              value={filters.condition}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  condition: e.target.value as ProductCondition,
                }))
              }
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>

            {/* Price Range */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                className="w-24 p-2 border rounded"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                min="0"
              />
              <input
                type="number"
                placeholder="Max Price"
                className="w-24 p-2 border rounded"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                min="0"
              />
            </div>

            {/* Exchange Only Toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.exchangeOnly}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    exchangeOnly: e.target.checked,
                  }))
                }
              />
              Exchange Only
            </label>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <ErrorDisplay message={error} />}

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id.toString()}
                href={`/marketplace/product/${product.id}`}
                className="group"
              >
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
