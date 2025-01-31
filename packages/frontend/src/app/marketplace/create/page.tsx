"use client";

import { useState } from "react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { parseEther, parseGwei } from "viem";

export default function CreateProduct() {
  const { listProduct } = useMarketplace();
  const [loading, setLoading] = useState(false);
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
      const tx = await listProduct(
        formData.name,
        formData.description,
        formData.size,
        formData.condition,
        formData.brand,
        formData.categories,
        formData.gender,
        formData.image,
        parseGwei(formData.tokenPrice || "0"),
        parseEther(formData.ethPrice || "0"),
        BigInt(formData.quantity),
        formData.isAvailableForExchange,
        formData.exchangePreference
      );
      console.log("Product listed:", tx);
    } catch (error) {
      console.error("Error listing product:", error);
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
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">List New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            >
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <input
              type="text"
              name="categories"
              value={formData.categories}
              onChange={handleChange}
              required
              placeholder="Comma separated"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Unisex</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Token Price
            </label>
            <input
              type="number"
              name="tokenPrice"
              value={formData.tokenPrice}
              onChange={handleChange}
              step="0.000000001"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ETH Price</label>
            <input
              type="number"
              name="ethPrice"
              value={formData.ethPrice}
              onChange={handleChange}
              step="0.000000000000000001"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isAvailableForExchange"
              checked={formData.isAvailableForExchange}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">Available for Exchange</span>
          </label>
        </div>

        {formData.isAvailableForExchange && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Exchange Preferences
            </label>
            <textarea
              name="exchangePreference"
              value={formData.exchangePreference}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg h-24"
              placeholder="Describe what you'd like to exchange for..."
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
