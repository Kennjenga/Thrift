"use client";

import { Upload, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { parseEther } from "viem";
import { parseTokenAmount } from "@/utils/token-utils";
import Navbar from "../_components/navbar";

export default function CreateProduct() {
  const sizeOptions = {
    topsSizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
    bottomsSizes: [
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
    ],
    shoesSizes: {
      men: ["6", "7", "8", "9", "10", "11", "12", "13", "14"],
      women: ["5", "6", "7", "8", "9", "10", "11"],
      kids: ["1", "2", "3", "4", "5", "6"],
    },
    dressSizes: [
      "0",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14",
      "16",
      "18",
      "20",
      "22",
      "24",
    ],
  };

  const { listProduct } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const [selectedSizeType, setSelectedSizeType] = useState("tops");
  const [selectedShoeType, setSelectedShoeType] = useState("men");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: "",
    condition: "New",
    brand: "",
    categories: "",
    gender: "Unisex",
    image: "",
    tokenPrice: "",
    ethPrice: "",
    quantity: "1",
    isAvailableForExchange: false,
    exchangePreference: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert token price from human-readable to blockchain format
      const tokenPriceValue = parseTokenAmount(formData.tokenPrice || "0");
      if (tokenPriceValue === null) {
        throw new Error("Invalid token price");
      }

      // Convert ETH price from human-readable to blockchain format
      let ethPriceValue;
      try {
        ethPriceValue = parseEther(formData.ethPrice || "0");
      } catch {
        throw new Error("Invalid ETH price");
      }

      const tx = await listProduct(
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
      console.log("Product listed:", tx);
    } catch (error) {
      console.error("Error listing product:", error);
      // You might want to show this error to the user
      alert(error instanceof Error ? error.message : "Failed to list product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    // Handle number inputs for prices
    if (name === "tokenPrice" || name === "ethPrice") {
      // Allow only numbers and decimals
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSizeOptions = () => {
    switch (selectedSizeType) {
      case "tops":
        return sizeOptions.topsSizes;
      case "bottoms":
        return sizeOptions.bottomsSizes;
      case "shoes":
        return sizeOptions.shoesSizes[
          selectedShoeType as keyof typeof sizeOptions.shoesSizes
        ];
      case "dress":
        return sizeOptions.dressSizes;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="glass-card p-12 rounded-3xl mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Upload className="w-8 h-8 text-[#5E6C58]" />
              <h1 className="text-3xl font-bold text-[#162A2C]">
                List New Product
              </h1>
            </div>
            <p className="text-[#686867] text-lg">
              Fill in the details below to list your product in the marketplace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-semibold text-[#162A2C] mb-6">
                Basic Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="input-primary h-32 resize-none rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-semibold text-[#162A2C] mb-6">
                Product Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Size Type
                  </label>
                  <select
                    value={selectedSizeType}
                    onChange={(e) => setSelectedSizeType(e.target.value)}
                    className="input-primary mb-4"
                  >
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="shoes">Shoes</option>
                    <option value="dress">Dress</option>
                  </select>

                  {selectedSizeType === "shoes" && (
                    <select
                      value={selectedShoeType}
                      onChange={(e) => setSelectedShoeType(e.target.value)}
                      className="input-primary mb-4"
                    >
                      <option value="men">Men&apos;s</option>
                      <option value="women">Women&apos;s</option>
                      <option value="kids">Kids&apos;</option>
                    </select>
                  )}

                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    className="input-primary"
                  >
                    <option value="">Select Size</option>
                    {getSizeOptions().map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="input-primary"
                  >
                    <option>New</option>
                    <option>Like New</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="input-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Categories
                  </label>
                  <input
                    type="text"
                    name="categories"
                    value={formData.categories}
                    onChange={handleChange}
                    required
                    placeholder="Comma separated"
                    className="input-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-primary"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="input-primary"
                  />
                </div>
              </div>
            </div>

            {/* Image and Pricing */}
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-semibold text-[#162A2C] mb-6">
                Image and Pricing
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#686867] mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    className="input-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#686867] mb-2">
                      Token Price (Thrifts)
                    </label>
                    <input
                      type="text"
                      name="tokenPrice"
                      value={formData.tokenPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="input-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#686867] mb-2">
                      ETH Price
                    </label>
                    <input
                      type="text"
                      name="ethPrice"
                      value={formData.ethPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="input-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Options */}
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-semibold text-[#162A2C] mb-6">
                Exchange Options
              </h2>
              <div className="space-y-6">
                <label className="flex items-center space-x-3 hover-lift">
                  <input
                    type="checkbox"
                    name="isAvailableForExchange"
                    checked={formData.isAvailableForExchange}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-[#DBE0E2] text-[#5E6C58] focus:ring-[#5E6C58]"
                  />
                  <span className="text-[#162A2C]">Available for Exchange</span>
                </label>

                {formData.isAvailableForExchange && (
                  <div>
                    <label className="block text-sm font-medium text-[#686867] mb-2">
                      Exchange Preferences
                    </label>
                    <textarea
                      name="exchangePreference"
                      value={formData.exchangePreference}
                      onChange={handleChange}
                      className="input-primary h-24 resize-none rounded-2xl"
                      placeholder="Describe what you'd like to exchange for..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
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
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
