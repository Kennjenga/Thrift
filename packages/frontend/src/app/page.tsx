"use client";

import type { NextPage } from "next";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import Footer from "@/components/footer";
import EcoCharacter from "@/components/eco-character";

// Updated color palette with soft gold accents
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

// Main Page Implementation
const Home: NextPage = () => {
  return (
    <AnimatePresence>
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <EcoCharacter />
        <Navbar />

        <main>
          <HeroSection />
          <FeatureSection />
          <NewsletterSection />
        </main>

        <Footer />
      </div>
    </AnimatePresence>
  );
};

export default Home;

// Enhanced NeoButton with gold accents
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

// Enhanced InteractiveFeatureCard with 3D effects and animations
const InteractiveFeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
}> = ({ icon, title, description, stats }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setRotation({
      x: (y - 0.5) * 10,
      y: (x - 0.5) * 10,
    });
  };

  return (
    <motion.div
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        perspective: "1000px",
      }}
    >
      <motion.div
        className="h-full"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <GlassCard className="p-8 h-full">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto mb-6 relative"
            animate={{
              rotate: isHovered ? [0, 360] : 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.gold}, ${theme.colors.primary})`,
                opacity: 0.2,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {icon}
            </div>
          </motion.div>

          <h3
            className="text-xl font-bold text-center mb-4"
            style={{ color: theme.colors.text }}
          >
            {title}
          </h3>

          <p className="text-gray-600 text-center mb-6">{description}</p>

          <motion.div
            className="grid grid-cols-2 gap-4"
            animate={{
              opacity: isHovered ? 1 : 0.7,
              y: isHovered ? 0 : 10,
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-3 rounded-lg"
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.gold}10)`
                    : "transparent",
                }}
              >
                <motion.p
                  className="text-2xl font-bold"
                  animate={{
                    color: isHovered ? theme.colors.gold : theme.colors.text,
                  }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute top-0 left-0 w-full h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.colors.gold}30, transparent)`,
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-full h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.colors.gold}30, transparent)`,
                }}
              />
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

// [Previous imports and theme remain the same...]

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

// Enhanced Glass Card with gold highlights
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

// Enhanced Hero Section with interactive elements
const HeroSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const heroContent = [
    {
      title: "Sustainable Fashion for a Better Tomorrow",
      subtitle: "Join our eco-conscious community",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQhH6MUt16EJdLbLEfZ26Iod6UaoAdwMKUFA&s",
    },
    {
      title: "Style Meets Sustainability",
      subtitle: "Discover our eco-friendly collection",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDN1l5Ni0n2uXdUHmHnh0cin-19u11RID1rA&s",
    },
    {
      title: "Fashion with Purpose",
      subtitle: "Making a difference, one piece at a time",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI5O3lJtn0FwOVOPU28r-KiqKg7W2fokDIkA&s",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroContent.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroContent.length]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${activeIndex}`}
                className="text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.text}, ${theme.colors.gold})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {heroContent[activeIndex].title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`subtitle-${activeIndex}`}
                className="text-xl text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {heroContent[activeIndex].subtitle}
              </motion.p>
            </AnimatePresence>

            <div className="flex gap-6">
              <NeoButton
                className="bg-gradient-to-r from-primary to-secondary text-green"
                onClick={() => {}}
              >
                <span className="flex items-center">
                  Explore Collection
                  <LucideIcons.ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </NeoButton>
              <NeoButton
                className="bg-gradient-to-r from-goldLight to-gold text-text"
                onClick={() => {}}
              >
                <span className="flex items-center">
                  Our Impact
                  <LucideIcons.LineChart className="w-5 h-5 ml-2" />
                </span>
              </NeoButton>
            </div>
          </motion.div>

          {/* Right side - Image */}
          <div className="hidden md:block relative h-[500px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`image-${activeIndex}`}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={heroContent[activeIndex].image}
                  alt={heroContent[activeIndex].title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-2xl"
                  style={{
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

// [To be continued in Part 2...]
// Enhanced Feature Section with interactive elements
const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: (
        <LucideIcons.Leaf
          className="w-8 h-8"
          style={{ color: theme.colors.gold }}
        />
      ),
      title: "Eco-Friendly Materials",
      description:
        "Our products are crafted from sustainable and recycled materials, giving new life to existing resources.",
      stats: [
        { label: "Recycled Materials", value: "85%" },
        { label: "CO₂ Reduction", value: "60%" },
      ],
    },
    {
      icon: (
        <LucideIcons.Droplets
          className="w-8 h-8"
          style={{ color: theme.colors.primary }}
        />
      ),
      title: "Water Conservation",
      description:
        "Our production process saves millions of liters of water annually through innovative techniques.",
      stats: [
        { label: "Water Saved", value: "2M L" },
        { label: "Ocean Impact", value: "90%" },
      ],
    },
    {
      icon: (
        <LucideIcons.Heart
          className="w-8 h-8"
          style={{ color: theme.colors.secondary }}
        />
      ),
      title: "Fair Trade Certified",
      description:
        "Supporting ethical labor practices and sustainable communities worldwide.",
      stats: [
        { label: "Worker Benefits", value: "100%" },
        { label: "Community Impact", value: "75%" },
      ],
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.text}, ${theme.colors.gold})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Why Choose Sustainable Fashion?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <InteractiveFeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Newsletter Section with animated elements
const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setEmail("");
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <motion.div
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <GlassCard className="max-w-3xl mx-auto p-12">
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 relative"
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
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.gold}, ${theme.colors.primary})`,
                  opacity: 0.2,
                }}
              />
              <LucideIcons.Mail
                className="w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ color: theme.colors.text }}
              />
            </motion.div>

            <h3
              className="text-3xl font-bold mb-4"
              style={{ color: theme.colors.text }}
            >
              Join Our Eco-Community
            </h3>
            <p className="text-gray-600">
              Get sustainable fashion tips and exclusive offers delivered to
              your inbox
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2"
                style={{
                  color: theme.colors.text,
                }}
              />
              <NeoButton
                className="bg-gradient-to-r from-primary to-secondary text-green"
                onClick={() => {}}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <LucideIcons.Loader className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <span className="flex items-center">
                    Subscribe
                    <LucideIcons.Send className="w-5 h-5 ml-2" />
                  </span>
                )}
              </NeoButton>
            </div>
          </form>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center mt-4 text-green-600"
              >
                Thanks for subscribing! 🌱
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </section>
  );
};
