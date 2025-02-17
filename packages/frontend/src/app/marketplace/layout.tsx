// src/app/marketplace/layout.tsx
"use client";

import { ClientCartProvider } from "./_components/clientcartprovider";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientCartProvider>{children}</ClientCartProvider>;
}
