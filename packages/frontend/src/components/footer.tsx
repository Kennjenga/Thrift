// components/footer.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from "lucide-react";

// Include the theme object since it's used in the Footer
const theme = {
  colors: {
    primary: '#B5C7C4',    
    secondary: '#C7D4D2',  
    accent: '#DBE2E0',     
    gold: '#E2D9C9',       
    goldLight: '#F0EBE3',  
    background: '#FBFBFB', 
    text: '#6B7F7C',       
    blush: '#D4DCDA',      
    highlight: '#96A7A4',  
    glass: 'rgba(255, 255, 255, 0.15)',
  }
};

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", url: "#" },
        { label: "Best Sellers", url: "#" },
        { label: "Eco Collections", url: "#" },
        { label: "Accessories", url: "#" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Story", url: "#" },
        { label: "Sustainability", url: "#" },
        { label: "Impact Report", url: "#" },
        { label: "Careers", url: "#" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Contact Us", url: "#" },
        { label: "Shipping", url: "#" },
        { label: "Returns", url: "#" },
        { label: "FAQ", url: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <LucideIcons.Instagram />, url: "#" },
    { icon: <LucideIcons.Twitter />, url: "#" },
    { icon: <LucideIcons.Facebook />, url: "#" },
    { icon: <LucideIcons.Youtube />, url: "#" },
  ];

  return (
    <footer className="relative pt-24 pb-12">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <motion.img 
              src="/my-business-name-high-resolution-logo-transparent.png" 
              alt="Logo" 
              className="h-8 mb-6"
              whileHover={{ scale: 1.05 }}
            />
            <p className="text-gray-600">
              Committed to sustainable fashion and environmental preservation.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  className="text-gray-400 hover:text-gold transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-bold mb-6" style={{ color: theme.colors.text }}>
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <motion.li key={link.label}
                    whileHover={{ x: 5 }}
                  >
                    <a
                      href={link.url}
                      className="text-gray-600 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary/20 pt-8 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Eco Fashion. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Made with 🌱 for a sustainable future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;