// src/app/marketplace/layout.tsx
"use client";

import { CartProvider } from "@/contexts/cartContext";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
