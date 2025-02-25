import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {
  House,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { CartButton } from "@/components/cartButton";

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
  background: {
    dark: "#1A0B3B",
    light: "#2A1B54",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    muted: "rgba(255, 255, 255, 0.5)",
  },
};

interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-6 h-6" />, path: "/" },
    {
      name: "Shop",
      icon: <ShoppingBag className="w-6 h-6" />,
      path: "/marketplace",
    },
    { name: "Donate", icon: <Heart className="w-6 h-6" />, path: "/donate" },
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-6 h-6" />,
      path: "/dashboard",
    },
    { name: "Contact", icon: <Mail className="w-6 h-6" />, path: "#" },
  ];

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap");

        .navbar {
          background: rgba(26, 11, 59, 0.98);
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(123, 66, 255, 0.25);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
          font-family: "Space Grotesk", sans-serif;
        }

        .logo-container {
          position: relative;
          z-index: 20;
        }

        .logo-gradient {
          background: linear-gradient(
            135deg,
            ${COLORS.secondary.main},
            ${COLORS.primary.main},
            ${COLORS.secondary.light}
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .nav-link {
          position: relative;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          transition: background-color 0.3s ease;
          background: transparent;
          overflow: hidden;
        }

        .nav-link:hover {
          background: rgba(123, 66, 255, 0.15);
        }

        .nav-link.active {
          background: rgba(123, 66, 255, 0.2);
          box-shadow: 0 0 15px rgba(123, 66, 255, 0.3);
        }

        .mobile-menu {
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(123, 66, 255, 0.1);
        }

        .nav-icon {
          transition: background-color 0.3s ease;
        }
      `}</style>

      <nav className="navbar sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="logo-container flex items-center">
              <Image
                src="/my-business-name-high-resolution-logo-transparent.png"
                alt="Ace Logo"
                width={45}
                height={45}
                className="rounded-full"
                priority
              />
              <h1 className="logo-gradient text-2xl font-bold ml-3">Ace</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className={`nav-link flex items-center space-x-3 text-white font-medium
                    ${activeLink === link.name ? "active" : ""}`}
                  onClick={() => setActiveLink(link.name)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
              <div className="flex items-center space-x-4">
                <ConnectButton
                  accountStatus="avatar"
                  chainStatus="icon"
                  showBalance={false}
                />
                <CartButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-menu fixed inset-x-0 top-[80px] z-10">
            <div className="container mx-auto px-6 py-4 bg-gradient-to-b from-[rgba(26,11,59,0.98)] to-[rgba(26,11,59,0.95)] backdrop-blur-xl border-t border-[rgba(123,66,255,0.15)]">
              <div className="grid gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.path}
                    className={`nav-link flex items-center justify-between text-white p-4 rounded-xl
                      ${
                        activeLink === link.name
                          ? "active bg-[rgba(123,66,255,0.2)]"
                          : ""
                      }
                      hover:bg-[rgba(123,66,255,0.15)] transition-colors duration-300`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveLink(link.name);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="nav-icon p-2 rounded-lg bg-[rgba(123,66,255,0.1)]">
                        {link.icon}
                      </span>
                      <span className="font-medium text-base">{link.name}</span>
                    </div>
                    <span className="text-[rgba(255,255,255,0.3)]">→</span>
                  </a>
                ))}

                <div className="mt-4 p-4 flex flex-col space-y-4">
                  <ConnectButton
                    accountStatus="avatar"
                    chainStatus="icon"
                    showBalance={false}
                  />
                  <CartButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
