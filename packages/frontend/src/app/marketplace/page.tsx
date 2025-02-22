"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Package } from "lucide-react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product } from "@/types/market";
import { formatETHPrice } from "@/utils/token-utils";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-purple-900/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20"
    >
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        <p className="text-purple-200/80">{product.brand}</p>

        <div className="flex justify-between items-center">
          <span className="text-white font-medium">
            {formatETHPrice(product.ethPrice)} ETH
          </span>
          <span className="text-sm text-purple-200/60">
            Qty: {String(product.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
    <AlertCircle className="w-6 h-6 text-red-500" />
    <p className="text-white/80">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 bg-purple-900/20 rounded-xl border border-purple-500/20">
    <Package className="w-12 h-12 mx-auto mb-4 text-purple-400" />
    <p className="text-white/80 mb-6">No products found in the marketplace</p>
    <Link href="/marketplace/create">
      <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors">
        List a Product
      </button>
    </Link>
  </div>
);

const MarketplacePage = () => {
  const { useGetAllProducts } = useMarketplace();
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = React.useState(0);

  const {
    data: productsData,
    isLoading,
    error,
  } = useGetAllProducts(currentPage, PAGE_SIZE);
  const products = productsData as Array<Product>;
  console.log(productsData);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Marketplace</h1>

        {isLoading && currentPage === 0 ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorDisplay message={error.message} />
        ) : !products || products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id?.toString() || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/marketplace/product/${product.id}`}>
                      <ProductCard product={product} />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {products.length >= PAGE_SIZE && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
