"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import {
  CreateProductFormData,
  ProductCondition,
  ProductGender,
} from "@/types/market";
import { AESTHETICS } from "@/constants/aesthetics";
import { parseEther } from "viem";
import {
  Upload,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";

// Color System from the first code
// const COLORS = {
//   primary: {
//     main: "#7B42FF",
//     light: "#8A2BE2",
//     dark: "#4A00E0",
//   },
//   secondary: {
//     main: "#00FFD1",
//     light: "#00FFFF",
//     dark: "#00E6BD",
//   },
//   accent: {
//     pink: "#FF00FF",
//     red: "#FF1B6B",
//   },
//   background: {
//     dark: "#1A0B3B",
//     light: "#2A1B54",
//   },
//   text: {
//     primary: "#FFFFFF",
//     secondary: "rgba(255, 255, 255, 0.7)",
//     muted: "rgba(255, 255, 255, 0.5)",
//   },
// };

const BackgroundElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]" />

      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF00FF] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7B42FF] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#00FFFF] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF1B6B] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse" />
    </div>
  );
};

const CreateProduct = () => {
  const router = useRouter();
  // Use the updated productOperations hook
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

      // Use the new hook format
      await createProduct({
        name: formData.name,
        description: formData.description,
        size: formData.size,
        condition: formData.condition,
        brand: formData.brand,
        categories: formData.categories,
        gender: formData.gender,
        image: formData.image,
        tokenPrice: tokenPriceValue,
        ethPrice: ethPriceValue,
        quantity: BigInt(formData.quantity),
        isAvailableForExchange: formData.isAvailableForExchange,
        exchangePreference: formData.exchangePreference,
      });

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
    <div className="min-h-screen relative">
      <BackgroundElements />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6 md:p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/marketplace")}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Marketplace</span>
            </button>

            <div className="w-10 h-10 rounded-full bg-[#00FFD1]/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#00FFD1]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFD1] via-purple-300 to-pink-400 bg-clip-text text-transparent mb-6">
            Create New Product
          </h1>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40 h-32"
                  required
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, size: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white appearance-none"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white appearance-none"
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
              <label className="block text-sm font-medium text-white/80 mb-1">
                Aesthetic Categories (Select multiple)
              </label>
              <select
                multiple
                value={formData.categories}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white h-32"
              >
                {Object.values(AESTHETICS).map((aesthetic) => (
                  <option key={aesthetic} value={aesthetic}>
                    {aesthetic}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-white/50">
                Hold Ctrl/Cmd to select multiple options
              </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  THRIFT Price
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40 pl-10"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-[#00FFD1]/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00FFD1]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  ETH Price
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40 pl-10"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity and Exchange */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isAvailableForExchange}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isAvailableForExchange: e.target.checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors duration-300 ${
                        formData.isAvailableForExchange
                          ? "bg-[#00FFD1]"
                          : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform duration-300 ${
                          formData.isAvailableForExchange
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    Available for Exchange
                  </span>
                </label>
              </div>
            </div>

            {formData.isAvailableForExchange && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40 h-24"
                  placeholder="Describe what you'd like to exchange for..."
                />
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#00FFD1] text-white placeholder-white/40"
                required
                placeholder="https://"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(0,255,209,0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`
                w-full py-3.5 rounded-lg font-medium flex items-center justify-center gap-2
                ${loading ? "bg-opacity-70 cursor-not-allowed" : ""}
                bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] 
                text-[#1A0B3B] 
                shadow-[0_0_10px_rgba(0,255,209,0.3)]
                transition-all duration-300
              `}
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

            {/* Animated Progress Bar - Decorative */}
            <div
              className={`h-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] rounded-full transition-all duration-300 ${
                loading ? "w-full" : "w-0"
              }`}
            ></div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProduct;
