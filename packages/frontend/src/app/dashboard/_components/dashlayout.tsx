"use client";
import React from "react";
import Link from "next/link";
import Navbar from "./navbar";
import { usePathname } from "next/navigation";
import { Home, Wallet, Shirt, Heart, Settings } from "lucide-react";

// Refined Dark Purple Color System
const COLORS = {
  primary: {
    main: "#6A1B9A", // Rich dark purple
    light: "#8E24AA", // Medium purple
    dark: "#4A148C", // Deep purple
    hover: "#7B1FA2", // Hover state
  },
  secondary: {
    main: "#512DA8", // Complementary indigo-purple
    light: "#673AB7", // Light indigo
    dark: "#311B92", // Deep indigo
  },
  accent: {
    violet: "#9C27B0", // Violet accent
    plum: "#7D3C98", // Plum accent
  },
  background: {
    darker: "#1A0033", // Very dark purple background
    dark: "#2D0059", // Dark purple background
    medium: "#3A0066", // Medium purple surface
  },
  text: {
    primary: "#FFFFFF", // White text
    secondary: "rgba(255, 255, 255, 0.8)", // Slightly dimmed white
    muted: "rgba(255, 255, 255, 0.6)", // Muted text
  },
  glass: {
    background: "rgba(42, 20, 72, 0.3)", // Translucent purple
    border: "rgba(90, 50, 150, 0.2)", // Light purple border
    highlight: "rgba(255, 255, 255, 0.05)", // Subtle highlight
    shadow: "rgba(0, 0, 0, 0.25)", // Deeper shadow
  },
};

// Global Styles (Removed Animations)
const GlobalStyles = `
  :root {
    --primary-main: ${COLORS.primary.main};
    --primary-light: ${COLORS.primary.light};
    --primary-dark: ${COLORS.primary.dark};
    --secondary-main: ${COLORS.secondary.main};
    --secondary-light: ${COLORS.secondary.light};
    --secondary-dark: ${COLORS.secondary.dark};
    --background-darker: ${COLORS.background.darker};
    --background-dark: ${COLORS.background.dark};
    --background-medium: ${COLORS.background.medium};
  }

  body {
    background: var(--background-darker);
    color: ${COLORS.text.primary};
  }

  .glass-card {
    background: ${COLORS.glass.background};
    backdrop-filter: blur(16px);
    border: 1px solid ${COLORS.glass.border};
    box-shadow: 0 8px 24px ${COLORS.glass.shadow};
  }

  .glass-card:hover {
    background: rgba(58, 28, 99, 0.35);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px ${COLORS.glass.shadow};
  }
`;

// Background Elements Component (Simplified, No Animation)
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${COLORS.background.dark}, ${COLORS.background.darker})`,
        }}
      />

      {/* Static Ambient Glows */}
      <div
        className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full filter blur-[120px] opacity-[0.12]"
        style={{ background: COLORS.primary.light }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-[0.10]"
        style={{ background: COLORS.secondary.main }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-[250px] h-[250px] rounded-full filter blur-[100px] opacity-[0.08]"
        style={{ background: COLORS.accent.violet }}
      />
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
import { ReactNode } from "react";

const GlassCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
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
        background: COLORS.glass.background,
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
  const pathname = usePathname();

  return (
    <GlassCard className="h-[calc(100vh-64px)] p-6">
      {/* Navigation Links */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <div className="relative">
                <div
                  className={`
                    flex items-center gap-3
                    px-4 py-3
                    rounded-lg
                    transition-colors duration-300
                    ${
                      isActive
                        ? `bg-[${COLORS.primary.main}]/20 text-white`
                        : `text-[${COLORS.text.secondary}] hover:text-white hover:bg-[${COLORS.primary.hover}]/10`
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r"
                      style={{ background: COLORS.primary.light }}
                    />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
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
  return (
    <>
      <style jsx global>
        {GlobalStyles}
      </style>
      <div
        className="min-h-screen"
        style={{ background: COLORS.background.darker }}
      >
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
              <div
                style={{
                  opacity: 1,
                  transform: "translateY(0)",
                }}
              >
                <GlassCard className="p-6">
                  {/* Main Content */}
                  <div className="relative">{children}</div>
                </GlassCard>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
