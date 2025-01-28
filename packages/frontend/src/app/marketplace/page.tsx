"use client";

import React, { useState } from "react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useThriftToken } from "@/blockchain/hooks/useThriftToken";
// import { useAccount } from "wagmi";

interface Product {
  id: bigint;
  name: string;
  description: string;
  tokenPrice: bigint;
  ethPrice: bigint;
  quantity: bigint;
  image: string;
}

export default function MarketplacePage() {
  //   const { address } = useAccount();
  const {
    products,
    // productCount = 0,
    buyWithTokens,
    buyWithEth,
    listProduct,
  } = useMarketplace() as {
    products: Product[] | undefined;
    productCount: number | undefined;
    buyWithTokens: (id: bigint, quantity: bigint) => Promise<void>;
    buyWithEth: (id: bigint, quantity: bigint) => Promise<void>;
    listProduct: (
      name: string,
      description: string,
      tokenPrice: bigint,
      ethPrice: bigint,
      quantity: bigint,
      image: string
    ) => Promise<void>;
  };

  const productList = products ?? [];
  const { balance } = useThriftToken() as {
    balance: bigint | null | undefined;
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    tokenPrice: BigInt(0),
    ethPrice: BigInt(0),
    quantity: BigInt(0),
    image: "",
  });

  const handleListProduct = async () => {
    try {
      await listProduct(
        newProduct.name,
        newProduct.description,
        newProduct.tokenPrice,
        newProduct.ethPrice,
        newProduct.quantity,
        newProduct.image
      );
      // Reset form or show success message
    } catch (error) {
      console.error("Failed to list product", error);
    }
  };

  const handleBuyProduct = async (
    product: Product,
    paymentMethod: "token" | "eth"
  ) => {
    try {
      if (paymentMethod === "token") {
        await buyWithTokens(product.id, BigInt(1));
      } else {
        await buyWithEth(product.id, BigInt(1));
      }
    } catch (error) {
      console.error("Purchase failed", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>

      {/* User Balance */}
      <div className="mb-4">
        <p>Your Token Balance: {balance?.toString() || "0"}</p>
      </div>

      {productList.map((product) => (
        <div key={product.id.toString()} className="grid grid-cols-3 gap-4">
          {products?.map((product) => (
            <div key={product.id.toString()} className="border p-4">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div className="flex justify-between">
                <button
                  onClick={() => handleBuyProduct(product, "token")}
                  className="bg-blue-500 text-white p-2"
                >
                  Buy with Tokens ({product.tokenPrice.toString()})
                </button>
                <button
                  onClick={() => handleBuyProduct(product, "eth")}
                  className="bg-green-500 text-white p-2"
                >
                  Buy with ETH ({product.ethPrice.toString()})
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Product Listing Form */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">List New Product</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleListProduct();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="w-full p-2 border"
          />
          <input
            type="text"
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="w-full p-2 border"
          />
          <input
            type="number"
            placeholder="Token Price"
            value={newProduct.tokenPrice.toString()}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                tokenPrice: BigInt(e.target.value),
              })
            }
            className="w-full p-2 border"
          />
          <input
            type="number"
            placeholder="ETH Price"
            value={newProduct.ethPrice.toString()}
            onChange={(e) =>
              setNewProduct({ ...newProduct, ethPrice: BigInt(e.target.value) })
            }
            className="w-full p-2 border"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newProduct.quantity.toString()}
            onChange={(e) =>
              setNewProduct({ ...newProduct, quantity: BigInt(e.target.value) })
            }
            className="w-full p-2 border"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.value })
            }
            className="w-full p-2 border"
          />
          <button type="submit" className="w-full bg-purple-500 text-white p-2">
            List Product
          </button>
        </form>
      </div>
    </div>
  );
}
