"use client";

import type { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {
  Leaf,
  House,
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

interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
};
