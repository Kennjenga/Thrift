"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "./_components/navbar";
import Footer from "@/components/footer";
import EcoCharacter from "@/components/eco-character";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product } from "@/types/market";
import { formatTokenAmount, formatETHPrice } from "@/utils/token-utils";
import { useRef, useEffect } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, AlertCircle, Plus, Package, Coins } from "lucide-react";

// Matching theme colors
const theme = {
  colors: {
    primary: "#B5C7C4", // Soft grey-green
    secondary: "#C7D4D2", // Light grey-green
    accent: "#DBE2E0", // Pale grey-green
    gold: "#E2D9C9", // Warm grey (kept for warmth)
    goldLight: "#F0EBE3", // Light beige
    background: "#FBFBFB", // Pure white
    text: "#6B7F7C", // Deep grey-green
    blush: "#D4DCDA", // Soft grey-green
    highlight: "#96A7A4", // Medium grey-green
    glass: "rgba(255, 255, 255, 0.15)",
  },
};

// Enhanced Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setRotation({
      x: (y - 0.5) * 20,
      y: (x - 0.5) * 20,
    });
  };

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
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: "transform 0.3s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
        style={{
          borderTop: isHovered ? `1px solid ${theme.colors.goldLight}` : "none",
        }}
      />
      {children}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </motion.div>
      )}
    </motion.div>
  );
};

const NeoButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`
        relative px-6 py-3 rounded-xl
        transition-all duration-300
        ${className}
      `}
      style={{
        boxShadow: isHovered
          ? `0 10px 20px -10px ${theme.colors.gold}40`
          : "8px 8px 16px #d1d9d9,-8px -8px 16px #ffffff",
        transform: isPressed ? "translateY(2px)" : "translateY(0)",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
          style={{
            opacity: isHovered ? 0.8 : 0.5,
          }}
        />
        {isHovered && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute top-0 left-0 w-full h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.colors.gold}40, transparent)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-full h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.colors.gold}40, transparent)`,
              }}
            />
          </motion.div>
        )}
      </div>
      <div className="relative z-10">{children}</div>
    </motion.button>
  );
};

// Enhanced Animated Background with gold particles
const AnimatedBackground = () => {
  const gradientRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(
            circle at 50% 50%,
            ${theme.colors.goldLight},
            ${theme.colors.secondary},
            ${theme.colors.background}
          )`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <div
        ref={gradientRef}
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(
            circle at 50% 50%,
            ${theme.colors.goldLight},
            ${theme.colors.secondary},
            ${theme.colors.background}
          )`,
        }}
      />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-particle"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 500),
              y: -20,
              rotate: 0,
            }}
            animate={{
              y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
              rotate: 360,
              x: `${Math.sin(i) * 200}px`,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  i % 2 === 0 ? theme.colors.gold : theme.colors.primary,
                opacity: 0.3,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Product Card Component with 3D and Neumorphism effects
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation based on mouse position
    const rotateX = (mouseY / (rect.height / 2)) * 10;
    const rotateY = -(mouseX / (rect.width / 2)) * 10;
    
    setRotation({ x: rotateX, y: rotateY, z: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0, z: 0 });
      }}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg">
        {/* 3D Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" 
          style={{
            boxShadow: `
              inset -2px -2px 6px rgba(255,255,255,0.1),
              inset 2px 2px 6px rgba(0,0,0,0.1),
              8px 8px 16px rgba(0,0,0,0.1),
              -8px -8px 16px rgba(255,255,255,0.1)
            `
          }}
        />

        {/* Product Image Container */}
        <div className="relative h-48 overflow-hidden">
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-300"
            />
          </motion.div>
          
          {/* Floating Price Tag */}
          <motion.div
            className="absolute top-4 right-4 px-4 py-2 rounded-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <p className="text-white font-bold">
              {formatETHPrice(product.ethPrice)} ETH
            </p>
          </motion.div>
        </div>

        {/* Content Container */}
        <div className="p-6 relative z-10">
          {/* Product Details */}
          <motion.div
            animate={{
              y: isHovered ? -5 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {product.name}
            </h3>
            <p className="text-white/80 mb-4">{product.brand}</p>

            {/* Stats Container */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">
                  Qty: {product.quantity}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">
                  {formatTokenAmount(product.tokenPrice)} Tokens
                </span>
              </div>
            </div>
          </motion.div>

          {/* Condition Badge */}
          <motion.div
            className="absolute bottom-6 right-6"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
          >
            <span className="px-4 py-1 rounded-full text-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
              }}
            >
              {product.condition}
            </span>
          </motion.div>
        </div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </motion.div>
  );
};

export default function MarketplacePage() {
  const { useGetAllProducts } = useMarketplace();
  const { data: productsData, isLoading, error } = useGetAllProducts();
  const products = productsData as Array<Product>;

  if (error) {
    return (
      <AnimatePresence>
        <div className="min-h-screen relative">
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
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="min-h-screen relative">
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
                    <ShoppingBag
                      className="w-full h-full"
                      style={{ color: theme.colors.gold }}
                    />
                  </motion.div>
                  <h1
                    className="text-4xl font-bold mb-6 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.text}, ${theme.colors.gold})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Thrift Marketplace
                  </h1>
                  <p
                    className="text-xl text-center"
                    style={{ color: theme.colors.text }}
                  >
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
                      <ProductCard product={product} />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && (!products || products.length === 0) && (
              <GlassCard className="p-12 rounded-3xl text-center">
                <Package
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: theme.colors.gold }}
                />
                <p style={{ color: theme.colors.text }} className="mb-6">
                  No products found in the marketplace
                </p>
                <Link href="/marketplace/create">
                  <NeoButton
                    className="bg-gradient-to-r from-primary to-secondary text-green"
                    onClick={() => {}}
                  >
                    <span className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      List a Product
                    </span>
                  </NeoButton>
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
