import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {
  House,
  ShoppingBag,
  Heart,
  LayoutDashboard,
} from "lucide-react";

// Color System
const COLORS = {
  primary: {
    main: '#C0B283',
    light: '#DCD0C0',
    dark: '#A89A6B',
  },
  text: {
    primary: '#162A2C',
    secondary: '#5E6C58',
  },
  background: {
    light: '#FFFFFF',
    dark: '#F5F5F5',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(94, 108, 88, 0.1)',
  }
};

interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbar = () => {
  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "../../" },
    { name: "Shop", icon: <ShoppingBag className="w-5 h-5" />, path: "../../marketplace" },
    { name: "Donate", icon: <Heart className="w-5 h-5" />, path: "../../donate" },
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "../../dashboard" },
  ];

  return (
    <>
      <style jsx>{`
        .navbar {
          background: ${COLORS.glass.background};
          backdrop-filter: blur(12px);
          border-bottom: 1px solid ${COLORS.glass.border};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .logo-container {
          position: relative;
          transition: transform 0.3s ease;
        }

        .logo-container:hover {
          transform: translateY(-2px);
        }

        .logo-glow {
          position: absolute;
          inset: -8px;
          background: linear-gradient(to right, ${COLORS.primary.main}, ${COLORS.primary.light});
          opacity: 0;
          border-radius: 12px;
          filter: blur(8px);
          transition: opacity 0.3s ease;
        }

        .logo-container:hover .logo-glow {
          opacity: 0.3;
        }

        .logo-text {
          background: linear-gradient(to right, ${COLORS.primary.main}, ${COLORS.primary.dark});
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .nav-link {
          position: relative;
          color: ${COLORS.text.primary};
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: ${COLORS.primary.main};
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, ${COLORS.primary.main}, ${COLORS.primary.light});
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-icon {
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1);
          color: ${COLORS.primary.main};
        }

        .connect-button-wrapper {
          position: relative;
        }

        .connect-button-wrapper::before {
          content: '';
          position: absolute;
          inset: -8px;
          background: linear-gradient(to right, ${COLORS.primary.main}, ${COLORS.primary.light});
          opacity: 0;
          border-radius: 12px;
          filter: blur(8px);
          transition: opacity 0.3s ease;
        }

        .connect-button-wrapper:hover::before {
          opacity: 0.2;
        }

        .shine-effect {
          position: relative;
          overflow: hidden;
        }

        .shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        :global(.rainbow-kit-connect-button) {
          background: ${COLORS.glass.background} !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid ${COLORS.glass.border} !important;
          transition: all 0.3s ease !important;
        }

        :global(.rainbow-kit-connect-button:hover) {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 16px rgba(192, 178, 131, 0.2) !important;
        }
      `}</style>

      <nav className="navbar sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Logo */}
          <div className="logo-container flex items-center">
            <div className="logo-glow" />
            <div className="relative">
              <Image
                src="/my-business-name-high-resolution-logo-transparent.png"
                alt="Ace Logo"
                width={45}
                height={45}
                className="rounded-lg shine-effect"
                priority
              />
            </div>
            <h1 className="logo-text text-2xl font-bold ml-2">
              Ace
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="nav-link flex items-center space-x-2"
              >
                <span className="nav-icon">
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          {/* Connect Button */}
          <div className="connect-button-wrapper">
            <ConnectButton 
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;