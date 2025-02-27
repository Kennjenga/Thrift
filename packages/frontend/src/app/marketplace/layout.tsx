// src/app/marketplace/layout.tsx
"use client";

import { CartProvider } from "@/contexts/cartContext";
import Navbar from "./_components/navbar";
import Footer from "@/components/footer";
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartProvider>
        <Navbar />
        {children}
        <Footer />
      </CartProvider>
      ;
    </>
  );
}
