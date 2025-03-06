import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  GiftIcon, 
  ChartBarIcon, 
  ChatBubbleLeftIcon,
  XMarkIcon,
  MinusIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// Color System
const COLORS = {
  primary: {
    main: '#7B42FF',
    light: '#8A2BE2',
    dark: '#4A00E0',
  },
  secondary: {
    main: '#00FFD1',
    light: '#00FFFF',
    dark: '#00E6BD',
  },
  background: {
    dark: '#1A0B3B',
    light: '#2A1B54',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
  },
  glass: {
    background: 'rgba(42, 27, 84, 0.2)',
    border: 'rgba(123, 66, 255, 0.1)',
  }
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
    { name: "Home", icon: <HomeIcon className="w-6 h-6" />, path: "./" },
    { name: "Shop", icon: <ShoppingCartIcon className="w-6 h-6" />, path: "./marketplace" },
    { name: "Donate", icon: <GiftIcon className="w-6 h-6" />, path: "./donate" },
    { name: "Dashboard", icon: <ChartBarIcon className="w-6 h-6" />, path: "./dashboard" },
    { name: "Contact", icon: <ChatBubbleLeftIcon className="w-6 h-6" />, path: "#" },
  ];

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap');

        .navbar {
          background: rgba(26, 11, 59, 0.98);
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(123, 66, 255, 0.25);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
          font-family: 'Space Grotesk', sans-serif;
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
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 4s ease infinite;
        }

        @keyframes shine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .nav-link {
          position: relative;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          overflow: hidden;
        }

        .nav-link:hover {
          background: rgba(123, 66, 255, 0.15);
          transform: translateY(-2px) scale(1.02);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            ${COLORS.secondary.main},
            ${COLORS.primary.main}
          );
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .nav-link:hover::after {
          width: 80%;
        }

        .nav-link.active {
          background: rgba(123, 66, 255, 0.2);
          box-shadow: 0 0 15px rgba(123, 66, 255, 0.3);
        }

        .nav-icon {
          transition: transform 0.3s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1) rotate(-5deg);
        }

.mobile-menu {
            box-shadow: 
              0 10px 30px -10px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(123, 66, 255, 0.1);
          }

          .nav-icon {
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(123, 66, 255, 0.1);
          }

          .active .nav-icon {
            background: rgba(123, 66, 255, 0.2);
            box-shadow: 
              0 0 15px rgba(123, 66, 255, 0.2),
              inset 0 0 10px rgba(123, 66, 255, 0.1);
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .mobile-menu .nav-link {
            position: relative;
            overflow: hidden;
          }

          .mobile-menu .nav-link::before {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            height: 2px;
            width: 0;
            background: linear-gradient(
              90deg,
              ${COLORS.secondary.main},
              ${COLORS.primary.main}
            );
            transition: width 0.3s ease;
          }

          .mobile-menu .nav-link:hover::before {
            width: 100%;
          }

          .mobile-menu .nav-link.active::before {
            width: 100%;
          }
        `}</style>

      <nav className="navbar sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="logo-container flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/my-business-name-high-resolution-logo-transparent.png"
                alt="Ace Logo"
                width={45}
                height={45}
                className="rounded-full hover:animate-spin"
                priority
              />
              <h1 className="logo-gradient text-2xl font-bold ml-3">
                Ace
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="desktop-nav hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.path}
                  className={`nav-link flex items-center space-x-3 text-white font-medium
                    ${activeLink === link.name ? 'active' : ''}`}
                  onClick={() => setActiveLink(link.name)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span>{link.name}</span>
                </motion.a>
              ))}
              <motion.div 
                className="ml-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ConnectButton 
                  accountStatus="avatar"
                  chainStatus="icon"
                  showBalance={false}
                />
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="mobile-nav md:hidden menu-button text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MinusIcon className="w-6 h-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        
{/* Mobile Navigation */}
<AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="mobile-menu fixed inset-x-0 top-[80px] z-10"
            >
              <div className="container mx-auto px-6 py-4 bg-gradient-to-b from-[rgba(26,11,59,0.98)] to-[rgba(26,11,59,0.95)] backdrop-blur-xl border-t border-[rgba(123,66,255,0.15)]">
                <motion.div 
                  className="grid gap-3"
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    },
                    closed: {
                      transition: {
                        staggerChildren: 0.05,
                        staggerDirection: -1
                      }
                    }
                  }}
                >
                  {navLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.path}
                      className={`nav-link flex items-center justify-between text-white p-4 rounded-xl
                        ${activeLink === link.name ? 'active bg-[rgba(123,66,255,0.2)]' : ''}
                        hover:bg-[rgba(123,66,255,0.15)] transition-all duration-300`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setActiveLink(link.name);
                      }}
                      variants={{
                        open: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.4
                          }
                        },
                        closed: {
                          opacity: 0,
                          y: -20,
                          transition: {
                            duration: 0.3
                          }
                        }
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        translateX: 10
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="nav-icon p-2 rounded-lg bg-[rgba(123,66,255,0.1)]">
                          {link.icon}
                        </span>
                        <span className="font-medium text-base">{link.name}</span>
                      </div>
                      <motion.span
                        className="text-[rgba(255,255,255,0.3)]"
                        whileHover={{ scale: 1.2 }}
                      >
                        →
                      </motion.span>
                    </motion.a>
                  ))}
                  
                  <motion.div 
                    className="mt-4 p-4"
                    variants={{
                      open: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: 0.3,
                          duration: 0.4
                        }
                      },
                      closed: {
                        opacity: 0,
                        y: -20,
                        transition: {
                          duration: 0.3
                        }
                      }
                    }}
                  >
                    <ConnectButton 
                      accountStatus="avatar"
                      chainStatus="icon"
                      showBalance={false}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;