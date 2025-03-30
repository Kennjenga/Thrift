"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import ProductEditModal from "./_components/ProductEditModal";
import { Loader } from "lucide-react";
import Image from "next/image";

// Define an interface for product data
interface Product {
  id: bigint;
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
}

const ManageClothesPage = () => {
  // Use the marketplace hook correctly - it exposes userProducts directly
  const marketplace = useMarketplace();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Set loading to reflect the marketplace's loading state
    setLoading(marketplace.isLoadingProducts);

    // When userProducts changes, update our local state
    if (marketplace.userProducts && !marketplace.isLoadingProducts) {
      setProducts(marketplace.userProducts as Product[]);
    }
  }, [marketplace.userProducts, marketplace.isLoadingProducts]);

  // Function to trigger a refresh of products
  const refreshProducts = () => {
    marketplace.refetchProducts();
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditSuccess = () => {
    refreshProducts();
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Manage Your Clothes</h1>

      {products.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">
            You haven&apos;t listed any clothes yet. Go to the marketplace to
            list your first item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id.toString()}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-3 aspect-h-4 w-full relative h-64">
                <Image
                  src={product.image || "/placeholder-product.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {product.brand} • {product.size} • {product.condition}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-indigo-600 font-medium">
                      {product.tokenPrice > 0n
                        ? `${Number(product.tokenPrice) / 1e18} THRIFT`
                        : ""}
                      {product.tokenPrice > 0n && product.ethPrice > 0n
                        ? " | "
                        : ""}
                      {product.ethPrice > 0n
                        ? `${Number(product.ethPrice) / 1e18} ETH`
                        : ""}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {product.quantity.toString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditClick(product)}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductEditModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          product={{
            ...selectedProduct,
            id: selectedProduct.id.toString(),
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ManageClothesPage;
