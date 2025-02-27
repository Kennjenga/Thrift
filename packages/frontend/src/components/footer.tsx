"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

// Color System from the marketplace design
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
  },
};

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: "Shop",
      icon: <LucideIcons.ShoppingBag size={20} className="text-[#00FFD1]" />,
      links: [
        { label: "New Arrivals", url: "#" },
        { label: "Best Sellers", url: "#" },
        { label: "Eco Collections", url: "#" },
        { label: "Accessories", url: "#" },
      ],
    },
    {
      title: "About",
      icon: <LucideIcons.Info size={20} className="text-[#00FFD1]" />,
      links: [
        { label: "Our Story", url: "#" },
        { label: "Sustainability", url: "#" },
        { label: "Impact Report", url: "#" },
        { label: "Careers", url: "#" },
      ],
    },
    {
      title: "Help",
      icon: <LucideIcons.HelpCircle size={20} className="text-[#00FFD1]" />,
      links: [
        { label: "Contact Us", url: "#" },
        { label: "Shipping", url: "#" },
        { label: "Returns", url: "#" },
        { label: "FAQ", url: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <LucideIcons.Instagram size={20} />, url: "#", label: "Instagram" },
    { icon: <LucideIcons.Twitter size={20} />, url: "#", label: "Twitter" },
    { icon: <LucideIcons.Facebook size={20} />, url: "#", label: "Facebook" },
    { icon: <LucideIcons.Youtube size={20} />, url: "#", label: "Youtube" },
  ];

  return (
    <footer className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]" />

        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF00FF] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7B42FF] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#00FFFF] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF1B6B] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse" />
      </div>

      {/* Top Border with Glow */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#00FFD1] via-[#7B42FF] to-[#FF00FF]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#00FFD1] via-[#7B42FF] to-[#FF00FF] blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo and Newsletter Section */}
          <div className="space-y-8">
            <motion.div
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] rounded-full opacity-0 hover:opacity-70 blur-md transition-opacity duration-300"></div>
              <div className="relative z-10">
                <Image
                  src="/my-business-name-high-resolution-logo-transparent.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="h-12 w-12"
                />
              </div>
            </motion.div>

            <p className="text-white/70 leading-relaxed">
              Committed to sustainable fashion and environmental preservation.
              Join us in making a difference, one eco-friendly choice at a time.
            </p>

            <div className="space-y-4">
              <h5 className="font-medium text-white bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] bg-clip-text text-transparent">
                Subscribe to our newsletter
              </h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40"
                />
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 0 15px rgba(0,255,209,0.4)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] text-[#1A0B3B] rounded-lg font-medium shadow-[0_0_10px_rgba(0,255,209,0.3)] transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:border-[#00FFD1]/50 transition-colors"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: "0 0 15px rgba(0,255,209,0.3)"
                  }}
                  title={link.label}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Link Sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-lg font-bold flex items-center gap-2 text-white">
                {section.icon}
                {section.title}
                <div className="h-px flex-grow bg-gradient-to-r from-[#00FFD1]/50 to-transparent ml-2"></div>
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <motion.li key={link.label}>
                    <a 
                      href={link.url} 
                      className="text-white/70 hover:text-[#00FFD1] transition-colors flex items-center group"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 text-[#00FFD1]">→</span>
                      <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section with Copyright */}
        <div className="pt-8 text-center relative">
          {/* Divider with glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7B42FF]/50 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7B42FF]/30 to-transparent blur-sm"></div>
          
          <p className="text-white/70">
            © {new Date().getFullYear()} Eco Fashion. All rights reserved.
          </p>
          <p className="text-sm text-white/50 mt-2 flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#00FFD1]/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#00FFD1]"></span>
            </span>
            Made with 🌱 for a sustainable future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;