"use client";

import type { NextPage } from "next";
import Navbar from "@/components/navbar";
import {
  Leaf,
  ShoppingBag,
  Heart,
  Mail,
  Recycle,
  // Users,
  // Trees,
  // Clock,
  Handshake,
  Plane,
  Shirt,
  BadgeDollarSign,
  Sparkles,
  ChevronRight,
  House,
  // Search
} from "lucide-react";
import {
  Savings,
  // LocalOffer,
  ShoppingCart,
  // Favorite,
  Email,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from "@mui/icons-material";

// Type definitions
interface FeaturedItem {
  name: string;
  price: string;
  category: string;
  image: string;
  sustainability: string;
}

interface Stat {
  number: string;
  label: string;
  icon: React.ReactNode;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}
interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const featuredItems: FeaturedItem[] = [
  {
    name: "Vintage Denim Jacket",
    price: "45",
    category: "Outerwear",
    image: "/jacket.jpg",
    sustainability: "Saves 20kg CO₂",
  },
  {
    name: "Classic White Blouse",
    price: "28",
    category: "Tops",
    image: "/blouse.jpg",
    sustainability: "Saves 15kg CO₂",
  },
  {
    name: "Leather Crossbody Bag",
    price: "35",
    category: "Accessories",
    image: "/bag.jpg",
    sustainability: "Saves 12kg CO₂",
  },
];

const Home: NextPage = () => {
  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "#" },
    {
      name: "Shop",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "./marketplace",
    },
    {
      name: "thrift",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "./thrift",
    },
    { name: "Donate", icon: <Heart className="w-5 h-5" />, path: "./donate" },
    { name: "Contact", icon: <Mail className="w-5 h-5" />, path: "#" },
  ];
  const stats: Stat[] = [
    {
      number: "1,000+",
      label: "Available Items",
      icon: <Shirt className="w-8 h-8" />,
    },
    {
      number: "500+",
      label: "Happy Customers",
      icon: <Handshake className="w-8 h-8" />,
    },
    {
      number: "2,000kg",
      label: "CO₂ Saved",
      icon: <Recycle className="w-8 h-8" />,
    },
  ];

  const features: Feature[] = [
    {
      icon: <BadgeDollarSign className="w-8 h-8" />,
      title: "Save Money",
      description:
        "Get high-quality fashion at fraction of retail prices while supporting sustainable practices.",
    },
    {
      icon: <Plane className="w-8 h-8" />,
      title: "Eco-Friendly",
      description:
        "Each purchase reduces fashion waste and helps create a more sustainable future for our planet.",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Timeless Style",
      description:
        "Discover unique, pre-loved pieces that stand the test of time and tell their own stories.",
    },
  ];

  const socialLinks: SocialLink[] = [
    { icon: <Facebook className="w-6 h-6" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="w-6 h-6" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="w-6 h-6" />, href: "#", label: "Instagram" },
    { icon: <LinkedIn className="w-6 h-6" />, href: "#", label: "LinkedIn" },
  ];

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Newsletter subscription logic
  };

  const handleItemClick = (): void => {
    // Item click handling logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto hero-card p-12 rounded-3xl glass-card">
          <div className="floating-icon left-icon">
            <Leaf className="w-8 h-8 text-[#5E6C58]" />
          </div>
          <div className="floating-icon right-icon">
            <Savings className="w-8 h-8 text-[#5E6C58]" />
          </div>

          <h2 className="text-5xl font-bold mb-6 text-[#162A2C] relative">
            Sustainable Fashion for a Better Tomorrow
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#C0B283] to-[#DCD0C0] opacity-10 blur"></div>
          </h2>
          <p className="text-xl text-[#686867] mb-12 leading-relaxed">
            Discover eco-friendly and stylish clothing that makes a difference.
            Join our community of conscious consumers.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#shop" className="btn-primary">
              <span>Shop Now</span>
              <ShoppingCart className="w-5 h-5 ml-2" />
            </a>
            <a href="#learn" className="btn-glass">
              <span>Learn More</span>
              <Plane className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-card p-8 text-center transform hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-[#5E6C58] mb-4">{stat.icon}</div>
              <h3 className="text-4xl font-bold text-[#162A2C] mb-2 stats-number">
                {stat.number}
              </h3>
              <p className="text-[#686867]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items Section */}
      <section
        id="shop"
        className="container mx-auto py-16 bg-[#162A2C]/5 rounded-3xl my-16"
      >
        <h2 className="text-3xl font-bold text-center text-[#162A2C] mb-12">
          Featured Thrift Finds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {featuredItems.map((item, index) => (
            <div
              key={index}
              className="glass-card overflow-hidden group"
              onClick={() => handleItemClick()}
              role="button"
              tabIndex={0}
              onKeyPress={(e: React.KeyboardEvent) => {
                if (e.key === "Enter") handleItemClick();
              }}
            >
              <div className="relative h-64 bg-[#DBE0E2]/20">
                <div className="absolute inset-0 flex items-center justify-center text-[#686867]">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <div className="absolute top-4 right-4 bg-[#5E6C58] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  {item.sustainability}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#162A2C] mb-2">
                  {item.name}
                </h3>
                <p className="text-[#686867] mb-2">{item.category}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[#5E6C58] font-bold">
                    ${item.price}
                  </span>
                  <button
                    className="btn-glass px-4 py-2 text-sm flex items-center gap-2"
                    aria-label={`View details for ${item.name}`}
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="learn" className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-center text-[#162A2C] mb-12">
          Why Choose Ace
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-8 text-center transform hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-[#5E6C58] mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#162A2C] mb-4">
                {feature.title}
              </h3>
              <p className="text-[#686867]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto py-16">
        <div className="glass-card p-12 text-center">
          <Email className="w-12 h-12 text-[#5E6C58] mb-6" />
          <h2 className="text-3xl font-bold text-[#162A2C] mb-6">
            Join Our Sustainable Fashion Community
          </h2>
          <p className="text-[#686867] mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive thrift finds,
            sustainability tips, and community updates.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex max-w-md mx-auto gap-4"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58]"
              required
              aria-label="Email subscription"
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap flex items-center gap-2"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
              <Mail className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 backdrop-blur-md bg-white/50 border-t border-[#5E6C58]/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-[#162A2C] font-bold mb-4">About Ace</h3>
              <p className="text-[#686867]">
                Sustainable fashion marketplace promoting eco-friendly shopping
                and conscious consumption.
              </p>
            </div>
            <div>
              <h3 className="text-[#162A2C] font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      className="text-[#686867] hover:text-[#5E6C58] flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[#162A2C] font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                {["FAQ", "Contact", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[#686867] hover:text-[#5E6C58] flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[#162A2C] font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-[#686867] hover:text-[#5E6C58] transition-colors duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center text-[#162A2C] border-t border-[#5E6C58]/10 pt-8">
            <p>&copy; {new Date().getFullYear()} Ace. All rights reserved.</p>
            <p className="text-sm mt-2 flex items-center justify-center">
              Made with{" "}
              <Heart className="w-5 h-5 mx-2 text-[#C0B283] animate-pulse" />{" "}
              for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
