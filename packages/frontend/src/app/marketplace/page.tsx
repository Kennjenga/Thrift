"use client";

import Link from "next/link";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  AlertCircle, 
  Plus, 
  Package, 
  Coins, 
  Heart, 
  Clock,TrendingUp, 
  Users, 
  Leaf, 
  Recycle,
  ArrowRight, 
  Star,
  Shield,
 } from "lucide-react";
import Navbar from "@/components/navbar";
import EcoCharacter from "@/components/eco-character";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { Product } from "@/types/market";
import { formatTokenAmount, formatETHPrice } from "@/utils/token-utils";

// Color System
const COLORS = {
  primary: {
    main: '#7B42FF',
    light: '#8A2BE2',
    dark: '#4A00E0',
  },
  secondary: {
    main: '#00FFD1',
    light: '#00FFFF',
    dark: '#00E6BD',
  },
  accent: {
    pink: '#FF00FF',
    red: '#FF1B6B',
  },
  background: {
    dark: '#1A0B3B',
    light: '#2A1B54',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
    pink: '#FF00FF',
    red: '#FF1B6B',
  },
  glass: {
    background: 'rgba(42, 27, 84, 0.2)',
    border: 'rgba(123, 66, 255, 0.1)',
  }
};
// Styles object
const styles = {
  glassCard: `
    backdrop-blur-md
    bg-[${COLORS.glass.background}]
    border border-[${COLORS.glass.border}]
    rounded-xl
    overflow-hidden
    card-hover-effect
    shadow-[0_8px_32px_${COLORS.primary.main}1A]
  `,
  backgroundGradient: `
    bg-gradient-to-b from-[${COLORS.background.light}] to-[${COLORS.background.dark}]
    relative
  `,
  gridItem: `
    relative
    rounded-2xl
    overflow-hidden
    transition-transform
    duration-300
    hover:scale-105
    hover:z-10
  `,
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const BackgroundElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 ${styles.backgroundGradient}`} />
      
      <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-[${COLORS.accent.pink}] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-[${COLORS.primary.main}] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse`} />
      <div className={`absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[${COLORS.secondary.light}] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[${COLORS.accent.red}] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse`} />
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative
        bg-gradient-to-br from-purple-900/80 to-purple-800/80
        backdrop-blur-lg
        border border-purple-500/20
        rounded-[2rem]
        overflow-hidden
        group
        p-8
        hover:shadow-2xl
        hover:shadow-purple-500/20
        transition-all
        duration-300
      `}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Neon Lines Effect */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-[10%] w-[1px] h-[30%] bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50" />
        <div className="absolute top-0 right-[10%] w-[1px] h-[30%] bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50" />
      </div>

      {/* Glow Effects */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full filter blur-[80px] opacity-30" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500 rounded-full filter blur-[80px] opacity-30" />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Product Image Frame */}
        <div className="relative w-full aspect-square mb-6">
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-400/50 rounded-tl" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-400/50 rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-400/50 rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-400/50 rounded-br" />
          
          {/* Main Image Container */}
          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-purple-900/20 to-transparent" />
          </div>

          {/* Status Icon */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-400/30">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            {product.name}
          </h3>
          <p className="text-purple-200/80 text-sm mb-4">
            {product.brand}
          </p>

          {/* Status Tags */}
          <div className="flex justify-center gap-2 mb-6">
            <span className="px-4 py-1 bg-purple-500/20 rounded-full text-sm text-purple-200">
              {formatETHPrice(product.ethPrice)} ETH
            </span>
            <span className="px-4 py-1 bg-pink-500/20 rounded-full text-sm text-pink-200">
              #{product.id.toString().padStart(4, '0')}
            </span>
          </div>

          {/* Social Links/Stats */}
          <div className="flex justify-center gap-4 text-purple-200/80">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="text-sm">
                Qty: {product.quantity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">
                {Math.floor(Math.random() * 100)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={`${styles.glassCard} animate-pulse`}>
          <div className="aspect-square bg-white/10" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-8 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ErrorMessage = ({ message }: { message: string }) => (
  <div className={`${styles.glassCard} p-4 border-l-4 border-red-500 flex items-center gap-3`}>
    <AlertCircle className="w-6 h-6 text-red-500" />
    <p className="text-white/80">{message}</p>
  </div>
);

// Add these new statistics and features data
const marketStats = {
  activeUsers: "2.5K+",
  totalItems: "10K+",
  sustainabilityScore: "95%",
  averageSavings: "60%"
};

const features = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Eco-Friendly",
    description: "All items verified for sustainability"
  },
  {
    icon: <Recycle className="w-6 h-6" />,
    title: "Circular Fashion",
    description: "Reduce waste through clothing recycling"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Quality",
    description: "Each item carefully inspected"
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Swap Tokens",
    description: "Use tokens for sustainable clothing choices"
  }
];

// Avatar data
const avatarImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSheI9UkWllIpSNbs2UdE18KLLswgDON9qzXg&s";

const avatarColors = [
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-green-500'
];

// Updated Trust Indicators section with new avatars
const TrustIndicators = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className={`
        mt-16 pt-8 
        border-t border-[${COLORS.glass.border}]
      `}
    >
      <div className="flex justify-between items-center flex-wrap gap-6">
        {/* User Community Section */}
        <div className="flex items-center gap-6">
          {/* Avatar Group */}
          <div className="flex -space-x-3">
            {avatarColors.map((color, index) => (
              <motion.div
                key={index}
                className={`
                  relative
                  w-10 h-10
                  rounded-full
                  ${color}
                  border-2 border-[${COLORS.background.dark}]
                  overflow-hidden
                  hover:scale-110
                  transition-transform
                  z-[${4 - index}]
                `}
                whileHover={{ scale: 1.1, zIndex: 5 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Image
                  src={avatarImage}
                  alt={`Community Member ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
                <div className={`
                  absolute inset-0
                  bg-gradient-to-tr from-${color}/30 to-transparent
                  mix-blend-overlay
                `}/>
              </motion.div>
            ))}
            
            {/* More Users Circle */}
            <motion.div
              className={`
                relative
                w-10 h-10
                rounded-full
                flex items-center justify-center
                bg-[${COLORS.glass.background}]
                backdrop-blur-sm
                border-2 border-[${COLORS.background.dark}]
                hover:scale-110
                transition-transform
                z-0
              `}
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-white text-sm font-medium">+2k</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent" />
            </motion.div>
          </div>

          {/* Community Text */}
          <div className="space-y-1">
            <motion.div
              className="text-white font-medium"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Join our community
            </motion.div>
            <motion.div
              className={`text-sm text-[${COLORS.text.secondary}]`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              of sustainable fashion enthusiasts
            </motion.div>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-8">
          {/* Active Status */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <span className={`text-sm text-[${COLORS.text.secondary}]`}>
              24/7 Active
            </span>
          </motion.div>

          {/* Live Updates */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Clock className={`w-4 h-4 text-[${COLORS.secondary.main}]`} />
            <span className={`text-sm text-[${COLORS.text.secondary}]`}>
              Updated live
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Hero Section Component
const EnhancedHeroSection = () => {
  return (
    <section className="pt-20 pb-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className={`
                  px-4 py-2 rounded-full
                  bg-[${COLORS.glass.background}]
                  backdrop-blur-md
                  border border-[${COLORS.glass.border}]
                  flex items-center gap-2
                `}>
                  <TrendingUp className="w-4 h-4 text-[${COLORS.secondary.main}]" />
                  <span className="text-sm text-[${COLORS.text.secondary}]">
                    Trending Marketplace
                  </span>
                </div>
              </div>

              <h1 className="text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-[${COLORS.secondary.main}] via-[${COLORS.primary.main}] to-[${COLORS.accent.pink}] bg-clip-text text-transparent">
                  Sustainable Fashion
                </span>
                <br />
                <span className="bg-gradient-to-r from-[${COLORS.secondary.main}] via-[${COLORS.primary.main}] to-[${COLORS.accent.pink}] bg-clip-text text-transparent">
                  Marketplace
                </span>
              </h1>

              <p className="text-[${COLORS.text.secondary}] text-xl mb-8 max-w-xl">
                Join the revolution in sustainable fashion. 
                <br/>
                Shop eco-friendly clothing, accessories, and more.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(marketStats).map(([key, value]) => (
                  <div key={key} className={`
                    p-4 rounded-xl
                    bg-[${COLORS.glass.background}]
                    backdrop-blur-md
                    border border-[${COLORS.glass.border}]
                  `}>
                    <div className="text-2xl font-bold text-white mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-[${COLORS.text.secondary}]">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Features Grid */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                  className={`
                    p-6 rounded-xl
                    bg-[${COLORS.glass.background}]
                    backdrop-blur-md
                    border border-[${COLORS.glass.border}]
                    hover:bg-[${COLORS.glass.background}]/40
                    transition-colors
                    group
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-full
                    bg-[${COLORS.primary.main}]/20
                    flex items-center justify-center
                    mb-4 group-hover:scale-110
                    transition-transform
                  `}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[${COLORS.text.secondary}]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[${COLORS.primary.main}] rounded-full filter blur-[80px] opacity-30" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[${COLORS.secondary.main}] rounded-full filter blur-[80px] opacity-30" />
          </div>
        </div>

        {/* Trust Indicators */}
              <TrustIndicators />
      </div>
    </section>
  );
};

export default function MarketplacePage() {
  const { useGetAllProducts } = useMarketplace();
  const { data: productsData, isLoading, error } = useGetAllProducts();
  const products = productsData as Array<Product>;

  return (
    <AnimatePresence>
      <motion.div 
        className={`min-h-screen relative overflow-hidden text-[${COLORS.text.primary}] ${styles.backgroundGradient}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInUp}
        transition={pageTransition}
      >
        <BackgroundElements />
        <EcoCharacter />
        <Navbar />

        <main className="relative z-10">
           {/* Hero Section */}
          <EnhancedHeroSection/>

          <div className="container mx-auto px-4 py-16">
            {/* Main Content */}
            {error ? (
              <ErrorMessage message={error.message} />
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {products?.map((product, index) => (
                    <motion.div
                      key={product.id}
                      variants={fadeInUp}
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

            {/* Empty State */}
            {!isLoading && (!products || products.length === 0) && (
              <motion.div 
                className={`${styles.glassCard} p-12 text-center`}
                variants={fadeInUp}
              >
                <Package className="w-12 h-12 mx-auto mb-4 text-[${COLORS.secondary.main}]" />
                <p className="text-white/80 mb-6">No products found in the marketplace</p>
                <Link href="/marketplace/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-6 py-3
                      rounded-lg
                      bg-[${COLORS.secondary.main}]
                      text-[${COLORS.background.dark}]
                      font-medium
                      flex items-center justify-center gap-2
                    `}
                  >
                    <Plus className="w-5 h-5" />
                    List a Product
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </main>

      </motion.div>
    </AnimatePresence>
  );
}