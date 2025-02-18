"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "./_components/navbar";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product } from "@/types/market";
import { formatTokenAmount, formatETHPrice } from "@/utils/token-utils";
import {
  ShoppingBag,
  AlertCircle,
  Plus,
  // Tag,
  Package,
  Coins,
} from "lucide-react";

export default function MarketplacePage() {
  const { useGetAllProducts } = useMarketplace();
  const { data: productsData, isLoading, error } = useGetAllProducts();
  const products = productsData as Array<Product>;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-[#5E6C58]/10 shadow-soft">
          {/* Navigation content */}
        </nav>
        <div className="container mx-auto p-4">
          <div className="glass-card p-4 border-l-4 border-red-500 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-[#162A2C]">
              Error loading products: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto hero-card p-12 rounded-3xl glass-card mb-16">
          <div className="floating-icon left-icon">
            <ShoppingBag className="w-8 h-8 text-[#5E6C58]" />
          </div>
          <h1 className="text-4xl font-bold text-[#162A2C] mb-6 text-center">
            Thrift Marketplace
          </h1>
          <p className="text-xl text-[#686867] text-center">
            Discover sustainable fashion at great prices
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="glass-card rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-[#5E6C58]/10 rounded-t-3xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-[#5E6C58]/10 rounded-full w-3/4"></div>
                  <div className="h-4 bg-[#5E6C58]/10 rounded-full w-1/2"></div>
                  <div className="h-4 bg-[#5E6C58]/10 rounded-full w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.map((product: Product) => (
              <Link
                key={product.id}
                href={`/marketplace/product/${product.id}`}
                className="group"
              >
                <div className="glass-card rounded-3xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#162A2C] truncate">
                      {product.name}
                    </h3>
                    <p className="text-[#686867] truncate mt-1">
                      {product.brand}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#5E6C58]" />
                        <p className="text-lg font-bold text-[#162A2C]">
                          {formatETHPrice(product.ethPrice)} ETH
                        </p>
                      </div>
                      <p className="text-sm text-[#686867]">
                        or {formatTokenAmount(product.tokenPrice)} Tokens
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm bg-[#5E6C58]/10 text-[#5E6C58] px-4 py-1 rounded-full">
                        {product.condition}
                      </span>
                      <span className="text-sm text-[#686867]">
                        Qty: {product.quantity.toString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (
          <div className="glass-card p-12 rounded-3xl text-center">
            <Package className="w-12 h-12 text-[#5E6C58] mx-auto mb-4" />
            <p className="text-[#686867] mb-6">
              No products found in the marketplace
            </p>
            <Link
              href="/marketplace/create"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              List a Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
