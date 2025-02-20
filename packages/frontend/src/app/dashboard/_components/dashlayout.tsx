"use client";
import React from "react";
import Link from "next/link";
import Navbar from "./navbar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, Wallet, Shirt, Heart, Settings } from "lucide-react";

// Enhanced Color System
const COLORS = {
  primary: {
    main: "#7B42FF",
    light: "#8A2BE2",
    dark: "#4A00E0",
    gradient: "rgba(123, 66, 255, 0.15)",
  },
  secondary: {
    main: "#00FFD1",
    light: "#00FFFF",
    dark: "#00E6BD",
    gradient: "rgba(0, 255, 209, 0.15)",
  },
  accent: {
    pink: "#FF00FF",
    red: "#FF1B6B",
    pinkGradient: "rgba(255, 0, 255, 0.15)",
    redGradient: "rgba(255, 27, 107, 0.15)",
  },
  background: {
    dark: "#1A0B3B",
    light: "#2A1B54",
    glass: "rgba(42, 27, 84, 0.25)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    muted: "rgba(255, 255, 255, 0.5)",
  },
  glass: {
    background: "rgba(42, 27, 84, 0.2)",
    border: "rgba(123, 66, 255, 0.1)",
    highlight: "rgba(255, 255, 255, 0.05)",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
};

// Enhanced Styles Object
const styles = {
  glassCard: `
    backdrop-blur-md
    bg-[${COLORS.glass.background}]
    border border-[${COLORS.glass.border}]
    rounded-xl
    overflow-hidden
    transition-all duration-300
    hover:shadow-[0_8px_32px_${COLORS.primary.main}1A]
  `,
  glassEffect: `
    backdrop-blur-lg
    bg-[${COLORS.glass.background}]
    border border-[${COLORS.glass.border}]
    rounded-lg
  `,
  backgroundGradient: `
    bg-gradient-to-b from-[${COLORS.background.light}] to-[${COLORS.background.dark}]
    relative
  `,
  gradientText: `
    bg-clip-text text-transparent 
    bg-gradient-to-r from-[${COLORS.secondary.main}] via-[${COLORS.primary.main}] to-[${COLORS.accent.pink}]
    animate-gradient
  `,
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

  @keyframes pulse {
    0%, 100% { opacity: var(--tw-opacity); }
    50% { opacity: calc(var(--tw-opacity) * 0.6); }
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

  .animate-pulse {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

// Background Elements Component
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 ${styles.backgroundGradient}`} />

      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF00FF] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7B42FF] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#00FFFF] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF1B6B] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse" />
    </div>
  );
};

// Navigation Items
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/thrift", label: "Thrift Tokens", icon: Wallet },
  { href: "/dashboard/manage-clothes", label: "Manage Clothes", icon: Shirt },
  {
    href: "/dashboard/manage-donation",
    label: "Donation Centers",
    icon: Heart,
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-xl
        backdrop-blur-xl
        ${className}
      `}
      style={{
        background: `linear-gradient(135deg, ${COLORS.glass.background} 0%, ${COLORS.glass.highlight} 50%, ${COLORS.glass.background} 100%)`,
        borderTop: `1px solid ${COLORS.glass.highlight}`,
        borderLeft: `1px solid ${COLORS.glass.highlight}`,
        boxShadow: `0 4px 6px -1px ${COLORS.glass.shadow}, 0 2px 4px -1px ${COLORS.glass.shadow}`,
      }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// SideNav Component
function SideNav() {
  return (
    <GlassCard className="h-[calc(100vh-64px)] p-6">
      {/* Navigation Links */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <motion.div whileHover={{ x: 5 }} className="relative group">
              <div
                className={`
                flex items-center gap-3
                px-4 py-3
                rounded-lg
                text-[${COLORS.text.secondary}]
                hover:text-white
                transition-all duration-300
                hover:bg-[${COLORS.primary.main}]/10
              `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>

                {/* Hover Gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-lg"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.primary.gradient}, transparent)`,
                  }}
                  initial={{ x: -100 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          </Link>
        ))}
      </nav>
    </GlassCard>
  );
}

// Main Dashboard Layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <style jsx global>
        {GlobalStyles}
      </style>
      <div className={`min-h-screen ${styles.backgroundGradient}`}>
        <BackgroundElements />

        <div className="relative z-10">
          {/* Top Navigation */}
          <Navbar />

          <div className="flex">
            {/* Sidebar */}
            <aside className="fixed top-16 bottom-0 w-64 hidden md:block p-4">
              <SideNav />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard className="p-6">
                    {/* Main Content */}
                    <div className="relative">{children}</div>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
