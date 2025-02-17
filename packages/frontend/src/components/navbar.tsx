import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {
  House,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  Mail,
  // Users,
  // Trees,
  // Clock,
  // Search
} from "lucide-react";

interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbar = () => {
  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "./" },
    {
      name: "Shop",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "./marketplace",
    },
    // {
    //   name: "thrift",
    //   icon: <ShoppingBag className="w-5 h-5" />,
    //   path: "./thrift",
    // },
    {
      name: "Donate",
      icon: <Heart className="w-5 h-5" />,
      path: "./donate",
    },
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "./dashboard",
    },
    { name: "Contact", icon: <Mail className="w-5 h-5" />, path: "#" },
  ];

  return (
    <>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-[#5E6C58]/10 shadow-soft">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            {/* Logo Container */}
            <div className="flex items-center group hover-lift">
              <div className="relative">
                <Image
                  src="/my-business-name-high-resolution-logo-transparent.png"
                  alt="Ace Logo"
                  width={45}
                  height={45}
                  className="mr-2 rounded-lg shine-effect"
                  priority
                />
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#C0B283] to-[#DCD0C0] opacity-30 blur group-hover:opacity-40 transition duration-300"></div>
              </div>
              <h1 className="text-2xl font-bold text-[#162A2C] ml-2 gold-gradient">
                Ace
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="nav-link group flex items-center space-x-2 text-[#162A2C]"
              >
                <span className="text-lg group-hover:text-[#C0B283] transition-colors duration-300">
                  {link.icon}
                </span>
                <span className="relative">
                  {link.name}
                  <span className="nav-link-underline"></span>
                </span>
              </a>
            ))}
          </div>

          {/* Connect Button */}
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
