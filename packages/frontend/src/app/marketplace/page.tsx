"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "./_components/navbar";
import Footer from "@/components/footer";
import EcoCharacter from "@/components/eco-character";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product } from "@/types/market";
import { formatTokenAmount, formatETHPrice } from "@/utils/token-utils";
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ShoppingBag,
  AlertCircle,
  Plus,
  Package,
  Coins,
} from "lucide-react";

// Matching theme colors
const theme = {
  colors: {
    primary: '#B5C7C4',
    secondary: '#C7D4D2',
    accent: '#DBE2E0',
    gold: '#E2D9C9',
    goldLight: '#F0EBE3',
    background: '#FBFBFB',
    text: '#6B7F7C',
    glass: 'rgba(255, 255, 255, 0.15)',
  }
};

// Enhanced Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden
        backdrop-blur-lg bg-white/10
        border border-white/30
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        rounded-2xl
        ${className}
      `}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      {children}
    </motion.div>
  );
};

// Enhanced Animated Background with gold particles
const AnimatedBackground = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gradientRef.current) {
        const { clientX, clientY } = e;
        const x = clientX / window.innerWidth;
        const y = clientY / window.innerHeight;
        
        gradientRef.current.style.background = `
          radial-gradient(
            circle at ${x * 100}% ${y * 100}%,
            ${theme.colors.goldLight},
            ${theme.colors.secondary},
            ${theme.colors.background}
          )
        `;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div 
        ref={gradientRef}
        className="absolute inset-0 transition-all duration-300 ease-out"
      />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-particle"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0 
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: 360,
              x: `${Math.sin(i) * 200}px`
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? theme.colors.gold : theme.colors.primary,
                opacity: 0.3
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function MarketplacePage() {
  const { useGetAllProducts } = useMarketplace();
  const { data: productsData, isLoading, error } = useGetAllProducts();
  const products = productsData as Array<Product>;

  if (error) {
    return (
      <div className="min-h-screen relative" >
        <AnimatedBackground />
        <EcoCharacter />
        <Navbar />
        <div className="container mx-auto p-4">
          <GlassCard className="p-4 border-l-4 border-red-500 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p style={{ color: theme.colors.text }}>
              Error loading products: {error.message}
            </p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="min-h-screen relative" style={{ background: theme.colors.background }}>
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Eco Character */}
        <EcoCharacter />

        {/* Main Content */}
        <Navbar />

        <main className="relative z-10">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <GlassCard className="p-12 rounded-3xl">
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <ShoppingBag className="w-full h-full" style={{ color: theme.colors.gold }} />
                  </motion.div>
                  <h1 className="text-4xl font-bold mb-6 text-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.text}, ${theme.colors.gold})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Thrift Marketplace
                  </h1>
                  <p className="text-xl text-center" style={{ color: theme.colors.text }}>
                    Discover sustainable fashion at great prices
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <GlassCard
                    key={index}
                    className="rounded-3xl overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-white/10" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-white/10 rounded-full w-3/4" />
                      <div className="h-4 bg-white/10 rounded-full w-1/2" />
                      <div className="h-4 bg-white/10 rounded-full w-2/3" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {products?.map((product: Product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/marketplace/product/${product.id}`}>
                        <GlassCard className="overflow-hidden">
                          <div className="h-48 relative overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              layout="fill"
                              objectFit="cover"
                              className="transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-semibold truncate"
                              style={{ color: theme.colors.text }}
                            >
                              {product.name}
                            </h3>
                            <p className="truncate mt-1" style={{ color: theme.colors.text }}>
                              {product.brand}
                            </p>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4" style={{ color: theme.colors.gold }} />
                                <p className="text-lg font-bold" style={{ color: theme.colors.text }}>
                                  {formatETHPrice(product.ethPrice)} ETH
                                </p>
                              </div>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                or {formatTokenAmount(product.tokenPrice)} Tokens
                              </p>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <span className="text-sm px-4 py-1 rounded-full"
                                style={{ 
                                  background: `${theme.colors.primary}20`,
                                  color: theme.colors.text 
                                }}
                              >
                                {product.condition}
                              </span>
                              <span style={{ color: theme.colors.text }}>
                                Qty: {product.quantity.toString()}
                              </span>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && (!products || products.length === 0) && (
              <GlassCard className="p-12 rounded-3xl text-center">
                <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.gold }} />
                <p style={{ color: theme.colors.text }} className="mb-6">
                  No products found in the marketplace
                </p>
                <Link
                  href="/marketplace/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: theme.colors.text
                  }}
                >
                  <Plus className="w-5 h-5" />
                  List a Product
                </Link>
              </GlassCard>
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </AnimatePresence>
  );
}

