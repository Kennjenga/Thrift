// components/ClientCartProvider.tsx
"use client";

import { CartProvider } from "@/contexts/cartContext";
import { ReactNode } from "react";

export const ClientCartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <CartProvider>{children}</CartProvider>;
};
