"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

// Color System
const COLORS = {
  primary: {
    main: "#B5C7C4",
    light: "#C7D4D2",
    dark: "#96A7A4",
  },
  accent: {
    gold: "#E2D9C9",
    goldLight: "#F0EBE3",
    blush: "#D4DCDA",
  },
  text: {
    primary: "#6B7F7C",
    secondary: "#8A9D9A",
    muted: "#A5B4B1",
  },
  background: {
    light: "#FBFBFB",
    dark: "#F5F7F7",
  },
};

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: "Shop",
      icon: <LucideIcons.ShoppingBag size={20} />,
      links: [
        { label: "New Arrivals", url: "#" },
        { label: "Best Sellers", url: "#" },
        { label: "Eco Collections", url: "#" },
        { label: "Accessories", url: "#" },
      ],
    },
    {
      title: "About",
      icon: <LucideIcons.Info size={20} />,
      links: [
        { label: "Our Story", url: "#" },
        { label: "Sustainability", url: "#" },
        { label: "Impact Report", url: "#" },
        { label: "Careers", url: "#" },
      ],
    },
    {
      title: "Help",
      icon: <LucideIcons.HelpCircle size={20} />,
      links: [
        { label: "Contact Us", url: "#" },
        { label: "Shipping", url: "#" },
        { label: "Returns", url: "#" },
        { label: "FAQ", url: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <LucideIcons.Instagram size={24} />, url: "#", label: "Instagram" },
    { icon: <LucideIcons.Twitter size={24} />, url: "#", label: "Twitter" },
    { icon: <LucideIcons.Facebook size={24} />, url: "#", label: "Facebook" },
    { icon: <LucideIcons.Youtube size={24} />, url: "#", label: "Youtube" },
  ];

  return (
    <>
      <style jsx>{`
        .footer-container {
          background: linear-gradient(
            to bottom,
            ${COLORS.background.light},
            ${COLORS.background.dark}
          );
          border-top: 1px solid ${COLORS.primary.main}20;
        }

        .footer-gradient {
          background: linear-gradient(
            to top,
            ${COLORS.primary.main}15,
            transparent
          );
        }

        .section-title {
          color: ${COLORS.text.primary};
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title::after {
          content: "";
          flex-grow: 1;
          height: 1px;
          background: linear-gradient(
            to right,
            ${COLORS.primary.main}40,
            transparent
          );
          margin-left: 0.5rem;
        }

        .footer-link {
          color: ${COLORS.text.secondary};
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-link:hover {
          color: ${COLORS.primary.dark};
          transform: translateX(8px);
        }

        .footer-link::before {
          content: "→";
          opacity: 0;
          transition: all 0.3s ease;
        }

        .footer-link:hover::before {
          opacity: 1;
        }

        .social-icon {
          position: relative;
          color: ${COLORS.text.primary};
          transition: all 0.3s ease;
          padding: 0.75rem;
          border-radius: 50%;
          background: ${COLORS.background.light};
          box-shadow: 0 2px 8px ${COLORS.primary.main}20;
        }

        .social-icon:hover {
          color: ${COLORS.primary.main};
          transform: translateY(-4px);
          box-shadow: 0 4px 12px ${COLORS.primary.main}30;
        }

        .logo-container {
          position: relative;
          display: inline-block;
        }

        .logo-glow {
          position: absolute;
          inset: -1rem;
          background: radial-gradient(
            circle at center,
            ${COLORS.primary.main}20,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .logo-container:hover .logo-glow {
          opacity: 1;
        }

        .newsletter-input {
          background: ${COLORS.background.light};
          border: 1px solid ${COLORS.primary.main}30;
          color: ${COLORS.text.primary};
          transition: all 0.3s ease;
        }

        .newsletter-input:focus {
          border-color: ${COLORS.primary.main};
          box-shadow: 0 0 0 2px ${COLORS.primary.main}20;
        }

        .newsletter-button {
          background: linear-gradient(
            to right,
            ${COLORS.primary.main},
            ${COLORS.primary.dark}
          );
          color: white;
          transition: all 0.3s ease;
        }

        .newsletter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${COLORS.primary.main}30;
        }
      `}</style>

      <footer className="footer-container relative pt-24 pb-12">
        <div className="footer-gradient absolute inset-0" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <motion.div
                className="logo-container"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="/my-business-name-high-resolution-logo-transparent.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10"
                />
              </motion.div>

              <p className="text-[${COLORS.text.secondary}] leading-relaxed">
                Committed to sustainable fashion and environmental preservation.
                Join us in making a difference, one eco-friendly choice at a
                time.
              </p>

              <div className="space-y-4">
                <h5 className="font-medium text-[${COLORS.text.primary}]">
                  Subscribe to our newsletter
                </h5>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input flex-1 px-4 py-2 rounded-lg"
                  />
                  <button className="newsletter-button px-6 py-2 rounded-lg font-medium">
                    Subscribe
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    className="social-icon"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    title={link.label}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-6">
                <h4 className="section-title text-lg font-bold">
                  {section.icon}
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <motion.li key={link.label}>
                      <a href={link.url} className="footer-link">
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[${COLORS.primary.main}20] pt-8 text-center">
            <p className="text-[${COLORS.text.secondary}]">
              © {new Date().getFullYear()} Eco Fashion. All rights reserved.
            </p>
            <p className="text-sm text-[${COLORS.text.muted}] mt-2">
              Made with 🌱 for a sustainable future
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
