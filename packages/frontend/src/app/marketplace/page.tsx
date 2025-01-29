"use client";

// marketplace
import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import ProductCard from "./_components/ProductCard";
import Cart from "./_components/Cart";
import { CartProvider } from "./context/CartContext";
import { Product } from "@/types/market";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/blockchain/abis/thrift";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
          MARKETPLACE_ADDRESS,
          MARKETPLACE_ABI,
          provider
        );

        const count = await contract.productCount();
        if (count.isZero) return;

        const productsData: Product[] = [];
        for (let i = 1; i <= Number(count); i++) {
          const product = await contract.products(i);
          if (!product.isSold) {
            productsData.push({
              id: product.id.toString(),
              name: product.name,
              description: product.description,
              tokenPrice: formatEther(product.tokenPrice),
              ethPrice: formatEther(product.ethPrice),
              image: product.image,
              seller: product.seller,
              quantity: product.quantity.toString(),
            });
          }
        }
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <CartProvider>
      <div className="flex min-h-screen">
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Available Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
        <Cart />
      </div>
    </CartProvider>
  );
}
