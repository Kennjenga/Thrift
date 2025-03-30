"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { parseEther } from "viem";

export interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description: string;
    size: string;
    condition: string;
    brand: string;
    categories: string[];
    gender: string;
    image: string;
    tokenPrice: bigint;
    ethPrice: bigint;
    quantity: bigint;
    isAvailableForExchange: boolean;
    exchangePreference: string;
  };
  onSuccess?: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const { updateProduct, updateQuantity } = useMarketplace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [brand, setBrand] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [image, setImage] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [ethPrice, setEthPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isAvailableForExchange, setIsAvailableForExchange] = useState(false);
  const [exchangePreference, setExchangePreference] = useState("");

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setSize(product.size);
      setCondition(product.condition);
      setBrand(product.brand);
      setCategories(product.categories);
      setGender(product.gender);
      setImage(product.image);

      // Convert bigint prices to string for the input
      setTokenPrice(
        product.tokenPrice
          ? (Number(product.tokenPrice) / 1e18).toString()
          : "0"
      );
      setEthPrice(
        product.ethPrice ? (Number(product.ethPrice) / 1e18).toString() : "0"
      );

      setQuantity(product.quantity ? product.quantity.toString() : "1");
      setIsAvailableForExchange(product.isAvailableForExchange);
      setExchangePreference(product.exchangePreference);
    }
  }, [product]);

  const handleCategoryChange = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((cat) => cat !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setNotification({ type: "", message: "" });

    try {
      // Convert string prices to bigint with 18 decimals
      const tokenPriceBigInt = parseEther(tokenPrice || "0");
      const ethPriceBigInt = parseEther(ethPrice || "0");
      const quantityBigInt = BigInt(quantity);

      // Update product details
      await updateProduct({
        productId: BigInt(product.id),
        name,
        description,
        size,
        condition,
        brand,
        categories,
        gender,
        image,
        tokenPrice: tokenPriceBigInt,
        ethPrice: ethPriceBigInt,
        isAvailableForExchange,
        exchangePreference,
      });

      // Update quantity separately if it changed
      if (quantityBigInt !== product.quantity) {
        await updateQuantity(BigInt(product.id), quantityBigInt);
      }

      setNotification({
        type: "success",
        message: "Product updated successfully!",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error("Error updating product:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to update product. Please try again.");
      } else {
        setError("Failed to update product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = [
    "Tops",
    "Bottoms",
    "Dresses",
    "Outerwear",
    "Activewear",
    "Footwear",
    "Accessories",
    "Vintage",
    "Luxury",
    "Casual",
  ];

  const conditionOptions = [
    "New with tags",
    "Like new",
    "Good",
    "Fair",
    "Poor",
  ];

  const genderOptions = ["Men", "Women", "Unisex", "Kids"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {notification.type === "success" && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select condition</option>
                  {conditionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  THRIFT Token Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ETH Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={ethPrice}
                  onChange={(e) => setEthPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {categoryOptions.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available-for-exchange"
                    checked={isAvailableForExchange}
                    onChange={(e) =>
                      setIsAvailableForExchange(e.target.checked)
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="available-for-exchange"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Available for exchange
                  </label>
                </div>
              </div>

              {isAvailableForExchange && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exchange Preference
                  </label>
                  <input
                    type="text"
                    value={exchangePreference}
                    onChange={(e) => setExchangePreference(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="E.g. Looking for winter jackets, size M"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
