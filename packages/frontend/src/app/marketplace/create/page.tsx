"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import {
  CreateProductFormData,
  ProductCondition,
  ProductGender,
} from "@/types/market";
import { AESTHETICS } from "@/constants/aesthetics"; // Import from constants instead of using the type
import { parseEther } from "viem";
import { Upload, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../_components/navbar";

const CreateProduct = () => {
  const router = useRouter();
  const { createProduct } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialFormState: CreateProductFormData = {
    name: "",
    description: "",
    size: "",
    condition: "New",
    brand: "",
    categories: [],
    gender: "Unisex",
    image: "",
    tokenPrice: "",
    ethPrice: "",
    quantity: "1",
    isAvailableForExchange: false,
    exchangePreference: "",
  };

  const [formData, setFormData] =
    useState<CreateProductFormData>(initialFormState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Convert string prices to BigInt with proper decimals
      const tokenPriceValue = formData.tokenPrice
        ? parseEther(formData.tokenPrice)
        : 0n;
      const ethPriceValue = formData.ethPrice
        ? parseEther(formData.ethPrice)
        : 0n;

      // Validate at least one price is set
      if (tokenPriceValue === 0n && ethPriceValue === 0n) {
        throw new Error("At least one price (ETH or THRIFT) must be set");
      }

      await createProduct(
        formData.name,
        formData.description,
        formData.size,
        formData.condition,
        formData.brand,
        formData.categories,
        formData.gender,
        formData.image,
        tokenPriceValue,
        ethPriceValue,
        BigInt(formData.quantity),
        formData.isAvailableForExchange,
        formData.exchangePreference
      );

      router.push("/marketplace");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((cat) => cat !== value)
        : [...prev.categories, value],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* <Navbar /> */}
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 md:p-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Product
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  required
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, size: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      condition: e.target.value as ProductCondition,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: e.target.value as ProductGender,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories (Select multiple)
              </label>
              <select
                multiple
                value={formData.categories}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
              >
                {/* Fixed: Using AESTHETICS instead of Aesthetics */}
                {AESTHETICS.map((aesthetic) => (
                  <option key={aesthetic} value={aesthetic}>
                    {aesthetic}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  THRIFT Price
                </label>
                <input
                  type="text"
                  value={formData.tokenPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tokenPrice: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ETH Price
                </label>
                <input
                  type="text"
                  value={formData.ethPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ethPrice: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quantity and Exchange */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailableForExchange}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAvailableForExchange: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available for Exchange
                  </span>
                </label>
              </div>
            </div>

            {formData.isAvailableForExchange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Preferences
                </label>
                <textarea
                  value={formData.exchangePreference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      exchangePreference: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                  placeholder="Describe what you'd like to exchange for..."
                />
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="https://"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Create Product
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProduct;
