"use client";

import type { NextPage } from "next";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import EcoCharacter from "@/components/eco-character";
import { ArrowRight, Clock, Heart, Repeat } from "lucide-react";
// import Footer from "@/components/footer";

// Color System
const COLORS = {
  primary: {
    main: "#7B42FF",
    light: "#8A2BE2",
    dark: "#4A00E0",
  },
  secondary: {
    main: "#00FFD1",
    light: "#00FFFF",
    dark: "#00E6BD",
  },
  accent: {
    pink: "#FF00FF",
    red: "#FF1B6B",
  },
  background: {
    dark: "#1A0B3B",
    light: "#2A1B54",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    muted: "rgba(255, 255, 255, 0.5)",
    pink: "#FF00FF",
    red: "#FF1B6B",
  },
  glass: {
    background: "rgba(42, 27, 84, 0.2)",
    border: "rgba(123, 66, 255, 0.1)",
  },
};

// Global Styles
const GlobalStyles = `
  :root {
    --primary-main: ${COLORS.primary.main};
    --primary-light: ${COLORS.primary.light};
    --primary-dark: ${COLORS.primary.dark};
    --secondary-main: ${COLORS.secondary.main};
    --secondary-light: ${COLORS.secondary.light};
    --secondary-dark: ${COLORS.secondary.dark};
    --background-dark: ${COLORS.background.dark};
    --background-light: ${COLORS.background.light};
  }

  body {
    background: var(--background-dark);
    color: ${COLORS.text.primary};
  }

  .glass-card {
    background: ${COLORS.glass.background};
    backdrop-filter: blur(16px);
    border: 1px solid ${COLORS.glass.border};
    box-shadow: 0 8px 32px ${COLORS.primary.main}1A;
  }

  .glass-card:hover {
    background: rgba(42, 27, 84, 0.3);
    transform: translateY(-5px);
    box-shadow: 0 12px 40px ${COLORS.primary.main}26;
  }

  .bg-gradient-dark {
    background: linear-gradient(180deg, ${COLORS.background.light} 0%, ${COLORS.background.dark} 100%);
  }

  @keyframes pulse {
    0%, 100% { opacity: var(--tw-opacity); }
    50% { opacity: calc(var(--tw-opacity) * 0.6); }
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .animate-pulse {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 8s ease infinite;
}
`;

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
  glassEffect: `
    backdrop-blur-lg
    bg-[${COLORS.glass.background}]
    border border-[${COLORS.glass.border}]
    rounded-lg
    p-4
  `,
  backgroundGradient: `
    bg-gradient-to-b from-[${COLORS.background.light}] to-[${COLORS.background.dark}]
    relative
  `,
  gradientText: `
    bg-clip-text text-transparent 
    bg-gradient-to-r from-[${COLORS.text.muted}] to-[${COLORS.text.secondary}]
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
  glowEffect: `
    absolute
    inset-0
    bg-gradient-to-br
    from-white/5
    to-transparent
    opacity-0
    group-hover:opacity-100
    transition-opacity
    duration-300
  `,
};

const BackgroundElements = () => {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${styles.backgroundGradient}`} />

        <div
          className={`absolute top-0 right-0 w-[300px] h-[300px] bg-[${COLORS.accent.pink}] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse`}
        />
        <div
          className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-[${COLORS.primary.main}] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse`}
        />
        <div
          className={`absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[${COLORS.secondary.light}] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[${COLORS.accent.red}] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse`}
        />
        <div
          className={`absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-[${COLORS.primary.dark}] rounded-full filter blur-[90px] opacity-[0.07] animate-pulse`}
        />
        <div
          className={`absolute bottom-1/3 right-1/3 w-[280px] h-[280px] bg-[${COLORS.primary.light}] rounded-full filter blur-[110px] opacity-[0.09] animate-pulse`}
        />
      </div>
    </>
  );
};

const StyleSheet = () => (
  <style jsx global>
    {GlobalStyles}
  </style>
);

const HeroSection = () => {
  return (
    <section className="pt-16 pb-16 container mx-auto px-4 relative">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 pr-0 lg:pr-12">
          <h1 className="text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-cyan-green via-purple-300 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Collect Extra
            <br />
            Ordinary
            <br />
            Fashion & Tokens
          </h1>
          <p
            className={`text-[${COLORS.text.secondary}] text-lg mb-8 max-w-xl`}
          >
            Swap clothes, earn tokens, and make sustainable fashion choices with
            ACE&apos;s Web3-powered thrift platform.
          </p>

          <div className="flex gap-4 mb-12">
            {/* Start Swapping Button */}
            <button
              className={`
            px-8 py-3.5
            bg-gradient-to-r from-[${COLORS.secondary.main}] to-[${COLORS.secondary.light}]
            text-[${COLORS.background.dark}]
            rounded-full font-medium
            relative
            overflow-hidden
            transform transition-all duration-300
            hover:scale-105
            hover:shadow-[0_0_20px_rgba(0,255,209,0.4)]
            active:scale-95
            before:content-['']
            before:absolute
            before:top-0 before:left-0
            before:w-full before:h-full
            before:bg-white
            before:opacity-0
            before:transition-opacity
            before:duration-300
            hover:before:opacity-20
          `}
            >
              <span className="relative z-10">Start Swapping</span>
            </button>

            {/* Learn More Button */}
            <button
              className={`
            px-8 py-3.5
            border border-[${COLORS.secondary.main}]
            text-[${COLORS.secondary.main}]
            rounded-full font-medium
            relative
            overflow-hidden
            transform transition-all duration-300
            hover:scale-105
            hover:border-opacity-80
            hover:shadow-[0_0_20px_rgba(0,255,209,0.2)]
            active:scale-95
            before:content-['']
            before:absolute
            before:top-0 before:left-0
            before:w-full before:h-full
            before:bg-[${COLORS.secondary.main}]
            before:opacity-0
            before:transition-opacity
            before:duration-300
            hover:before:opacity-10
          `}
            >
              <span className="relative z-10">Learn More</span>
            </button>
          </div>

          {/* Community Stats Section */}
          <div className="flex items-center gap-6">
            {/* Avatar Group Icons */}
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`
                      w-10 h-10
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
                      border-2 border-[${COLORS.background.dark}]
                      relative
                      hover:transform hover:scale-110
                      transition-all duration-300
                      z-[${4 - index}]
                    `}
                >
                  <svg
                    className="w-5 h-5 text-white"
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
              {/* More Users Circle */}
              <div
                className={`
                  w-10 h-10
                  rounded-full
                  flex items-center justify-center
                  bg-[${COLORS.glass.background}]
                  backdrop-blur-sm
                  border-2 border-[${COLORS.background.dark}]
                  text-white text-sm font-medium
                  hover:transform hover:scale-110
                  transition-all duration-300
                  z-0
                `}
              >
                +2k
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl font-bold text-[${COLORS.secondary.main}]`}
                >
                  2.5k+
                </span>
                <div
                  className={`
                    px-2 py-1
                    rounded-full
                    bg-[${COLORS.secondary.main}]/10
                    text-[${COLORS.secondary.main}]
                    text-xs
                    font-medium
                  `}
                >
                  +12% ↑
                </div>
              </div>
              <p className={`text-[${COLORS.text.secondary}] text-sm`}>
                Active Swappers
              </p>
            </div>

            {/* Vertical Divider */}
            <div className={`h-12 w-px bg-[${COLORS.text.secondary}]/20`}></div>

            {/* Additional Stats */}
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-12 h-12
                  rounded-full
                  flex items-center justify-center
                  bg-[${COLORS.glass.background}]
                  backdrop-blur-sm
                  border border-[${COLORS.glass.border}]
                `}
              >
                <Clock className={`w-6 h-6 text-[${COLORS.secondary.main}]`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl font-bold text-[${COLORS.secondary.main}]`}
                  >
                    24/7
                  </span>
                </div>
                <p className={`text-[${COLORS.text.secondary}] text-sm`}>
                  Always Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Fashion Grid */}
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
          <FashionGrid />
        </div>
      </div>
    </section>
  );
};

const FashionGrid = () => {
  const gridItems = [
    {
      id: 1,
      size: "col-span-1 row-span-1",
      scale: "scale-100",
      offset: "translate-y-0",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM5gjG8J1vcqUrsAsbi2YxCqcFuklMh0p3Tw&s",
    },
    {
      id: 2,
      size: "col-span-2 row-span-1",
      scale: "scale-110",
      offset: "-translate-y-4",
      image:
        "https://cdn.dribbble.com/userupload/3605379/file/original-6ee09c18336d4046b43f19820b361db2.png?resize=400x0",
    },
    {
      id: 3,
      size: "col-span-1 row-span-2",
      scale: "scale-105",
      offset: "translate-x-4",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVa2vjKhPWJaNFBB1h_GMCisHkN7LLvp2YLg&s",
    },
    {
      id: 4,
      size: "col-span-1 row-span-1",
      scale: "scale-125",
      offset: "translate-y-6",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpTYpxmocGZllM4_21N7KICnBH9Jn7jiNI1w&s",
    },
  ];

  return (
    <div className="relative w-full max-w-[600px] mx-auto overflow-visible">
      {/* Main Grid Container */}
      <div className="grid grid-cols-3 gap-4 relative z-10">
        {gridItems.map((item, index) => (
          <motion.div
            key={item.id}
            className={`
              relative
              ${item.size}
              ${item.offset}
              ${item.scale}
              transform-gpu
              hover:z-20
              transition-all
              duration-500
            `}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut",
            }}
          >
            <div
              className="
              relative 
              w-full 
              h-full 
              rounded-2xl 
              overflow-hidden 
              group
              hover:scale-105
              transition-transform
              duration-300
            "
            >
              {/* Image Container */}
              <div className="relative w-full h-0 pb-[100%]">
                <Image
                  src={item.image}
                  alt={`Grid Item ${item.id}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-2xl"
                />

                {/* Glass Morphism Effect */}
                <div
                  className="
                  absolute 
                  inset-0 
                  bg-gradient-to-br 
                  from-white/10 
                  to-black/30
                  backdrop-blur-sm
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-300
                  rounded-2xl
                "
                />

                {/* Border Glow */}
                <div
                  className="
                  absolute 
                  inset-0 
                  rounded-2xl 
                  border 
                  border-white/20
                  group-hover:border-purple-500/50
                  transition-colors
                  duration-300
                "
                />

                {/* Content Overlay */}
                <div
                  className="
                  absolute 
                  bottom-0 
                  left-0 
                  right-0 
                  p-4 
                  bg-gradient-to-t 
                  from-black/60 
                  to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-300
                "
                >
                  <div className="flex justify-between items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="
                        w-8 
                        h-8 
                        flex 
                        items-center 
                        justify-center 
                        bg-white/10 
                        backdrop-blur-md 
                        rounded-full
                    "
                    >
                      <Heart size={16} className="text-white" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ambient Glow Effects */}
      <div
        className="
        absolute 
        -top-32 
        -right-32 
        w-[400px] 
        h-[400px] 
        bg-purple-500/20 
        rounded-full 
        blur-[120px]
        mix-blend-screen
      "
      />
      <div
        className="
        absolute 
        -bottom-32 
        -left-32 
        w-[400px] 
        h-[400px] 
        bg-pink-500/20 
        rounded-full 
        blur-[120px]
        mix-blend-screen
      "
      />
    </div>
  );
};
export { FashionGrid };

const Home: NextPage = () => {
  return (
    <>
      <StyleSheet />
      <div
        className={`min-h-screen relative overflow-hidden text-[${COLORS.text.primary}] ${styles.backgroundGradient}`}
      >
        <BackgroundElements />
        <EcoCharacter />
        <Navbar />
        <main className="relative z-10">
          <HeroSection />
          <FashionMarquee />
          <FeaturedCollection />
          <TopFashionItems />
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Home;

// Continuing from Part 1, here's Part 2 with FashionMarquee, FeaturedCollection, and related components:

const FashionMarquee = () => {
  const brands = [
    "Sustainable Fashion",
    "Eco-Friendly",
    "Web3 Fashion",
    "Digital Wardrobe",
    "Fashion NFTs",
    "Circular Economy",
    "Swap & Earn",
    "Community Driven",
  ];

  return (
    <div className="py-12 overflow-hidden bg-[${COLORS.background.light}]/30">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...brands, ...brands].map((brand, index) => (
          <div
            key={index}
            className={`
              mx-8 py-2 px-6
              rounded-full
              text-[${COLORS.text.secondary}]
              border border-[${COLORS.primary.main}]/20
              bg-[${COLORS.glass.background}]
              backdrop-blur-sm
            `}
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
};

const FeaturedCollection = () => {
  const collections = [
    {
      id: 1,
      title: "Old Money Aesthetic",
      items: 45,
      value: "2.5k ACE",
      image:
        "https://i.pinimg.com/736x/e9/4d/48/e94d48756de583d8495b6e095d4aee8a.jpg",
    },
    {
      id: 2,
      title: "Street Aesthetic",
      items: 32,
      value: "1.8k ACE",
      image:
        "https://aesthetic-clothing.com/cdn/shop/products/aesthetic-clothing-smile-pants-157.jpg?v=1635414457",
    },
    {
      id: 3,
      title: "Y2K Aesthetic",
      items: 28,
      value: "2.2k ACE",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG5FTrv-fUnwLgCoCKNzKrneZiYqjNYg30eA&s",
    },
  ];

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2
            className={`text-4xl font-bold leading-tight mb-6 bg-gradient-to-r from-cyan-green via-purple-300 to-pink-400 bg-clip-text text-transparent animate-gradient`}
          >
            Featured Collections
          </h2>
          <p className={`text-[${COLORS.text.secondary}] max-w-xl`}>
            Explore curated collections from top sustainable fashion creators
            and brands. Each piece tells a unique story of style and
            sustainability.
          </p>
        </div>
        <button
          className={`
          flex items-center gap-2
          px-6 py-3
          rounded-lg
          border border-[${COLORS.secondary.main}]
          text-[${COLORS.secondary.main}]
          hover:bg-[${COLORS.secondary.main}]/10
          transition-colors
        `}
        >
          View All
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <FeaturedItemCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
};

interface Collection {
  id: number;
  title: string;
  items: number;
  value: string;
  image: string;
}

const FeaturedItemCard: React.FC<{ collection: Collection }> = ({
  collection,
}) => {
  return (
    <motion.div
      className={styles.glassCard}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={collection.image}
          alt={collection.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-3">{collection.title}</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <TimeBox value={collection.items} label="Items" />
            <TimeBox value={collection.value} label="Value" />
          </div>
          <button
            className={`
            p-3 rounded-full
            bg-[${COLORS.primary.main}]/10
            hover:bg-[${COLORS.primary.main}]/20
            text-[${COLORS.primary.main}]
            transition-colors
          `}
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TimeBox: React.FC<{ value: string | number; label: string }> = ({
  value,
  label,
}) => {
  return (
    <div
      className={`
      px-4 py-2 rounded-lg
      bg-[${COLORS.glass.background}]
      backdrop-blur-sm
      border border-[${COLORS.glass.border}]
    `}
    >
      <div className={`text-[${COLORS.text.primary}] font-bold`}>{value}</div>
      <div className={`text-[${COLORS.text.secondary}] text-sm`}>{label}</div>
    </div>
  );
};

// Additional utility components

const GlassButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        ${styles.glassEffect}
        hover:bg-[${COLORS.glass.background}]/40
        transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = COLORS.primary.main,
}) => {
  return (
    <span
      className={`
      px-3 py-1
      rounded-full
      text-sm
      bg-[${color}]/10
      text-[${color}]
      border border-[${color}]/20
    `}
    >
      {children}
    </span>
  );
};

const TopFashionItems = () => {
  const fashionItems = [
    {
      id: 1,
      title: "Vintage Leather Jacket",
      description: "Authentic 1970s leather jacket with unique patina",
      price: "120 ACE",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpTYpxmocGZllM4_21N7KICnBH9Jn7jiNI1w&s",
      owner: "vintage.eth",
      likes: 234,
      timeLeft: "2 days",
      tags: ["Vintage", "Leather", "Outerwear"],
    },
    {
      id: 2,
      title: "Eco-friendly Denim Set",
      description: "Sustainable denim collection made from recycled materials",
      price: "85 ACE",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpTYpxmocGZllM4_21N7KICnBH9Jn7jiNI1w&s",
      owner: "sustainable.eth",
      likes: 189,
      timeLeft: "4 days",
      tags: ["Sustainable", "Denim", "Set"],
    },
    {
      id: 3,
      title: "Designer Silk Scarf",
      description: "Limited edition silk scarf with digital art print",
      price: "95 ACE",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpTYpxmocGZllM4_21N7KICnBH9Jn7jiNI1w&s",
      owner: "artfashion.eth",
      likes: 156,
      timeLeft: "1 day",
      tags: ["Designer", "Accessories", "Limited"],
    },
    {
      id: 4,
      title: "Smart Casual Blazer",
      description: "Tech-integrated blazer with temperature regulation",
      price: "150 ACE",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpTYpxmocGZllM4_21N7KICnBH9Jn7jiNI1w&s",
      owner: "future.eth",
      likes: 278,
      timeLeft: "3 days",
      tags: ["Smart", "Formal", "Innovation"],
    },
  ];

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2
            className={`text-4xl font-bold leading-tight mb-6 bg-gradient-to-r from-cyan-green via-purple-300 to-pink-400 bg-clip-text text-transparent animate-gradient`}
          >
            Top Fashion Items
          </h2>
          <p className={`text-[${COLORS.text.secondary}] max-w-xl`}>
            Discover the most sought-after pieces in our community marketplace.
            Each item is verified for authenticity and quality.
          </p>
        </div>
        <div className="flex gap-4">
          <GlassButton onClick={() => {}}>
            <Repeat size={20} />
            <span>Refresh</span>
          </GlassButton>
          <button
            className={`
            flex items-center gap-2
            px-6 py-3
            rounded-lg
            bg-[${COLORS.primary.main}]
            text-white
            hover:bg-[${COLORS.primary.dark}]
            transition-colors
          `}
          >
            View All Items
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {fashionItems.map((item) => (
          <FashionItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

interface FashionItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  owner: string;
  likes: number;
  timeLeft: string;
  tags: string[];
}

const FashionItemCard = ({ item }: { item: FashionItem }) => {
  return (
    <motion.div
      className={styles.glassCard}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-square">
        <Image
          src={item.image}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
      </div>

      <div className="p-6">
        <p className={`text-sm text-[${COLORS.text.secondary}] mb-4`}>
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag: string, index: number) => (
            <Badge key={index}>{tag}</Badge>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className={`text-[${COLORS.secondary.main}] font-bold`}>
              {item.price}
            </div>
            <div className={`text-sm text-[${COLORS.text.secondary}]`}>
              @{item.owner}
            </div>
          </div>
          <button
            className={`
            px-4 py-2
            rounded-lg
            bg-[${COLORS.secondary.main}]
            text-[${COLORS.background.dark}]
            font-medium
            hover:bg-[${COLORS.secondary.dark}]
            transition-colors
          `}
          >
            Swap Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Export all components
export { TopFashionItems, FashionItemCard, GlassButton, Badge };
