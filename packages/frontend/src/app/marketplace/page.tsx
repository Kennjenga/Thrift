"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Package,
  Search,
  Filter,
  Heart,
  ArrowRight,
  Repeat,
} from "lucide-react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import {
  ProductCondition,
  ProductGender,
  ProductWithAvailability,
  SearchParams,
} from "@/types/market";
import { AESTHETICS } from "@/constants/aesthetics";
import { formatEther } from "ethers";

// Styles object
const styles = {
  glassCard: `
    backdrop-blur-md
    bg-opacity-20 bg-purple-900
    border border-purple-500/10
    rounded-xl
    overflow-hidden
    hover:transform hover:scale-[1.02]
    hover:shadow-lg hover:shadow-purple-500/20
    transition-all duration-300
  `,
  glassEffect: `
    backdrop-blur-lg
    bg-opacity-20 bg-purple-900
    border border-purple-500/10
    rounded-lg
    p-4
  `,
  backgroundGradient: `
    bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]
    relative
  `,
  gradientText: `
    bg-clip-text text-transparent 
    bg-gradient-to-r from-[#00FFD1] to-[#7B42FF]
  `,
  button: `
    px-4 py-2
    rounded-lg
    font-medium
    transition-all duration-300
    hover:shadow-md
  `,
  primaryButton: `
    bg-gradient-to-r from-[#00FFD1] to-[#00FFFF]
    text-[#1A0B3B]
    hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]
  `,
  secondaryButton: `
    border border-[#00FFD1]
    text-[#00FFD1]
    hover:bg-[#00FFD1]/10
  `,
};

const BackgroundElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]" />

      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF00FF] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7B42FF] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#00FFFF] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF1B6B] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse" />
    </div>
  );
};

interface ProductCardProps {
  product: ProductWithAvailability;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      className="relative group overflow-hidden rounded-xl"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/0 via-purple-900/40 to-purple-900/90 opacity-70 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      {/* Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] rounded-xl opacity-0 group-hover:opacity-70 blur-md group-hover:blur-lg transition-all duration-300" />

      {/* Card Content Container */}
      <div className="relative bg-purple-900/20 backdrop-blur-md border border-purple-500/10 rounded-xl overflow-hidden z-20">
        {/* Image Container */}
        <div className="relative aspect-[4/5]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
            {product.isAvailableForExchange && (
              <div className="px-3 py-1 rounded-full bg-[#00FFD1]/20 backdrop-blur-md text-[#FF00FF] text-xs font-medium border border-[#00FFD1]/30">
                Exchange
              </div>
            )}

            {/* Like Button */}
            <motion.button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 hover:text-[#FF1B6B] transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={14} />
            </motion.button>
          </div>
        </div>

        {/* Card Details */}
        <div className="relative p-4 bg-gradient-to-b from-purple-900/60 to-purple-900/90 backdrop-blur-md">
          {/* Product Info */}
          <div className="mb-3">
            <h3 className="font-medium text-white truncate">{product.name}</h3>
            <p className="text-sm text-white/70 truncate">{product.brand}</p>
          </div>

          {/* Price and Action */}
          <div className="flex justify-between items-center">
            <div>
              {product.tokenPrice > 0n && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#00FFD1]/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#00FFD1]"></div>
                  </div>
                  <p className="text-sm font-medium text-[#00FFD1]">
                    {formatEther(product.tokenPrice)} THRIFT
                  </p>
                </div>
              )}
              {product.ethPrice > 0n && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatEther(product.ethPrice)} ETH
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Neon View Button */}
            <div className="overflow-hidden">
              <motion.button
                className="
                  py-1.5 px-4 
                  rounded-full 
                  bg-[#7B42FF] 
                  text-white 
                  text-xs 
                  font-medium 
                  transform 
                  translate-y-8 
                  opacity-0 
                  group-hover:translate-y-0 
                  group-hover:opacity-100 
                  transition-all 
                  duration-300
                  shadow-[0_0_10px_rgba(123,66,255,0.7)]
                  hover:shadow-[0_0_20px_rgba(123,66,255,0.9)]
                  hover:bg-[#8A2BE2]
                  relative
                  overflow-hidden
                  border
                  border-[#7B42FF]/50
                "
                whileHover={{
                  scale: 1.05,
                  textShadow: "0 0 8px rgba(255,255,255,0.8)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Inner glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#7B42FF]/0 via-[#8A2BE2]/30 to-[#7B42FF]/0 animate-pulse"></span>

                {/* Button text */}
                <span className="relative z-10">View Item</span>

                {/* Animated border glow */}
                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#7B42FF] via-[#FF00FF] to-[#7B42FF] opacity-70 blur-md group-hover:animate-pulse"></span>
              </motion.button>
            </div>
          </div>

          {/* Animated Progress Bar - Decorative */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFD1]"></div>
  </div>
);

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
    <AlertCircle className="w-6 h-6 text-red-500" />
    <p className="text-red-700">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl">
    <Package className="w-12 h-12 mx-auto mb-4 text-white/40" />
    <p className="text-white/70 mb-6">No products found in the marketplace</p>
    <Link href="/marketplace/create">
      <button className={`${styles.button} ${styles.primaryButton}`}>
        List a Product
      </button>
    </Link>
  </div>
);

const MarketplaceHeader = () => (
  <div className="mb-12 text-center">
    <h2 className="text-4xl font-bold leading-tight mb-6 bg-gradient-to-r from-[#00FFD1] via-purple-300 to-pink-400 bg-clip-text text-transparent animate-gradient">
      Digital Fashion Marketplace
    </h2>
    <p className="text-white/70 max-w-2xl mx-auto">
      Discover unique fashion items from sustainable creators around the world.
      Buy with crypto, exchange items, or swap with Thrift tokens.
    </p>
  </div>
);

interface FilterState {
  nameQuery: string;
  categories: string[];
  brand: string;
  condition: ProductCondition | "";
  gender: ProductGender | "";
  size: string;
  minPrice: string;
  maxPrice: string;
  onlyAvailable: boolean;
  exchangeOnly: boolean;
  page: bigint;
  pageSize: bigint;
}

interface FilterSectionProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  handleSearch: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  setFilters,
  handleSearch,
}) => (
  <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-3 mb-8">
    <div className="flex items-center w-full gap-2">
      {/* Search Input - Flexible width */}
      <div className="relative flex-grow max-w-[30%]">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full py-2 px-8 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#00FFD1] text-sm"
          value={filters.nameQuery}
          onChange={(e) =>
            setFilters((prev: FilterState) => ({
              ...prev,
              nameQuery: e.target.value,
            }))
          }
        />
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
      </div>

      {/* Filters Group - Fixed width elements in a row */}
      <div className="flex items-center gap-2 flex-1">
        {/* Category Filter */}
        <select
          className="py-2 px-3 bg-white/10 border border-white/20 rounded-full text-white appearance-none text-sm focus:outline-none focus:border-[#00FFD1] w-full"
          value={filters.categories[0] || ""}
          onChange={(e) =>
            setFilters((prev: FilterState) => ({
              ...prev,
              categories: e.target.value ? [e.target.value] : [],
            }))
          }
        >
          <option value="">Aesthetic</option>
          {Object.values(AESTHETICS).map((aesthetic) => (
            <option key={aesthetic} value={aesthetic}>
              {aesthetic}
            </option>
          ))}
        </select>

        {/* Condition Filter */}
        <select
          className="py-2 px-3 bg-white/10 border border-white/20 rounded-full text-white appearance-none text-sm focus:outline-none focus:border-[#00FFD1] w-full"
          value={filters.condition}
          onChange={(e) =>
            setFilters((prev: FilterState) => ({
              ...prev,
              condition: e.target.value as ProductCondition | "",
            }))
          }
        >
          <option value="">Condition</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
        </select>

        {/* Price Range - Combined */}
        <div className="flex items-center bg-white/10 border border-white/20 rounded-full py-2 px-3 w-full">
          <input
            type="number"
            placeholder="Min"
            className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none text-sm text-center"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((prev: FilterState) => ({
                ...prev,
                minPrice: e.target.value,
              }))
            }
            min="0"
          />
          <div className="text-white/50 mx-1">-</div>
          <input
            type="number"
            placeholder="Max"
            className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none text-sm text-center"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev: FilterState) => ({
                ...prev,
                maxPrice: e.target.value,
              }))
            }
            min="0"
          />
          <div className="text-white/50 ml-1">ETH</div>
        </div>
      </div>

      {/* Exchange Toggle + Button Group */}
      <div className="flex items-center gap-3">
        {/* Exchange Only Toggle - Compact */}
        <label className="flex items-center gap-1.5 text-white cursor-pointer whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={filters.exchangeOnly}
            onChange={(e) =>
              setFilters((prev: FilterState) => ({
                ...prev,
                exchangeOnly: e.target.checked,
              }))
            }
            className="w-3.5 h-3.5 accent-[#00FFD1]"
          />
          Exchange
        </label>

        {/* Apply Button */}
        <button
          onClick={handleSearch}
          className="py-2 px-4 bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] text-[#1A0B3B] rounded-full font-medium text-sm hover:shadow-[0_0_15px_rgba(0,255,209,0.4)] transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Filter size={14} />
          Filter
        </button>
      </div>
    </div>
  </div>
);

const MarketplacePage: React.FC = () => {
  const {
    activeProducts,
    isLoadingProducts,
    refetchProducts,
    useProductSearch,
  } = useMarketplace();

  // For search functionality
  const [searchParams, setSearchParams] = useState<SearchParams | undefined>(
    undefined
  );

  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useProductSearch(searchParams) as {
    results: {
      products: ProductWithAvailability[];
      totalResults: bigint;
      totalPages: bigint;
      currentPage: bigint;
    } | null;
    isLoading: boolean;
    error: string | null;
  };

  const [products, setProducts] = useState<ProductWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
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

  // Initial load of products
  useEffect(() => {
    if (activeProducts && Array.isArray(activeProducts)) {
      setProducts(activeProducts);
      setLoading(false);
    }
  }, [activeProducts]);

  // Handle search results
  useEffect(() => {
    if (searchParams) {
      if (searchResults && searchResults.products) {
        setProducts(searchResults.products);
      } else if (searchError) {
        setError("An error occurred while searching. Please try again.");
      }
      setLoading(false);
    }
  }, [searchResults, searchError, searchParams]);

  const handleSearch = () => {
    setLoading(true);
    setError(null);

    // Create search params object for the hook
    setSearchParams({
      nameQuery: filters.nameQuery,
      categories: filters.categories,
      brand: filters.brand,
      condition: filters.condition,
      gender: filters.gender,
      size: filters.size,
      minPrice: filters.minPrice
        ? BigInt(Math.floor(parseFloat(filters.minPrice) * 1e18))
        : 0n,
      maxPrice: filters.maxPrice
        ? BigInt(Math.floor(parseFloat(filters.maxPrice) * 1e18))
        : 0n,
      onlyAvailable: filters.onlyAvailable,
      exchangeOnly: filters.exchangeOnly,
      page: filters.page,
      pageSize: filters.pageSize,
    });
  };

  // Set loading state based on hook state
  useEffect(() => {
    setLoading(isLoadingProducts || isSearchLoading);
  }, [isLoadingProducts, isSearchLoading]);

  return (
    <div className="min-h-screen relative">
      <BackgroundElements />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <MarketplaceHeader />

        <FilterSection
          filters={filters}
          setFilters={setFilters}
          handleSearch={handleSearch}
        />

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-8 h-8
                    rounded-full
                    flex items-center justify-center
                    ${
                      index === 0
                        ? "bg-purple-500"
                        : index === 1
                        ? "bg-pink-500"
                        : index === 2
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }
                    border-2 border-[#1A0B3B]
                    relative
                    z-[${4 - index}]
                  `}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ))}
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border-2 border-[#1A0B3B] text-white text-xs font-medium z-0">
                +{products.length}
              </div>
            </div>
            <p className="text-white/70">Active Sellers</p>
          </div>

          <div className="flex gap-3">
            <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              onClick={() => refetchProducts()}
            >
              <Repeat size={20} />
            </button>
            <Link href="/marketplace/create">
              <button
                className={`${styles.button} ${styles.primaryButton} flex items-center gap-2`}
              >
                List Item <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>

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

        {/* Pagination */}
        {searchResults &&
          "totalPages" in searchResults &&
          searchResults.totalPages > 1n && (
            <div className="mt-12 flex justify-center">
              <div className="flex gap-2">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  onClick={() => {
                    if (filters.page > 1n) {
                      const newPage = filters.page - 1n;
                      setFilters((prev: FilterState) => ({
                        ...prev,
                        page: newPage,
                      }));
                      handleSearch();
                    }
                  }}
                  disabled={filters.page <= 1n}
                >
                  &lt;
                </button>

                {/* Generate page buttons */}
                {Array.from(
                  { length: Number(searchResults.totalPages) },
                  (_, i) => (
                    <button
                      key={i}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                        BigInt(i + 1) === filters.page
                          ? "bg-[#7B42FF] text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      } transition-colors`}
                      onClick={() => {
                        const newPage = BigInt(i + 1);
                        setFilters((prev: FilterState) => ({
                          ...prev,
                          page: newPage,
                        }));
                        handleSearch();
                      }}
                    >
                      {i + 1}
                    </button>
                  )
                )}

                <button
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  onClick={() => {
                    if (
                      searchResults &&
                      "totalPages" in searchResults &&
                      filters.page < searchResults.totalPages
                    ) {
                      const newPage = filters.page + 1n;
                      setFilters((prev: FilterState) => ({
                        ...prev,
                        page: newPage,
                      }));
                      handleSearch();
                    }
                  }}
                  disabled={filters.page >= searchResults.totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default MarketplacePage;
