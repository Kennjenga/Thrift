"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  useDonationAndRecycling,
  useDonationCenterManagement,
} from "@/blockchain/hooks/useDonationCenter"; // Updated import path

// Center form state type
type CenterForm = {
  name: string;
  description: string;
  location: string;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
  isDonation: boolean;
};

const AddDonationCenterPage: React.FC = () => {
  const router = useRouter();
  const { isCreator } = useDonationAndRecycling();
  const { addDonationCenter } = useDonationCenterManagement();

  const [centerForm, setCenterForm] = useState<CenterForm>({
    name: "",
    description: "",
    location: "",
    acceptsTokens: true,
    acceptsRecycling: true,
    isDonation: true, // Default to true for donation centers
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Use the transaction receipt hook at top level
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Use effect to redirect after successful transaction
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/donate");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Call the contract function
      const result = await addDonationCenter(
        centerForm.name,
        centerForm.description,
        centerForm.location,
        centerForm.acceptsTokens,
        centerForm.acceptsRecycling,
        centerForm.isDonation
      );

      setIsSubmitting(false);
      setTransactionPending(true);

      // Only set txHash if we actually got a hash back (might be void)
      if (result !== undefined && typeof result === "string") {
        setTxHash(result as `0x${string}`);
      } else {
        console.log("Transaction submitted without returning a hash");
        // Still show pending state and redirect after a delay
        setTimeout(() => {
          router.push("/donate");
        }, 3000);
      }
    } catch (err) {
      setError("Failed to create donation center. Please try again.");
      console.error(err);
      setIsSubmitting(false);
      setTransactionPending(false);
    }
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setCenterForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Unauthorized
            </h1>
            <p className="text-gray-600 mb-4">
              You need creator permissions to add donation centers.
            </p>
            <button
              onClick={() => router.push("/donate")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Back to Centers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Add New Donation Center
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Center Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={centerForm.name}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                required
                value={centerForm.description}
                onChange={handleChange}
                rows={3}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Location field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                required
                value={centerForm.location}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* IsDonation checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDonation"
                checked={centerForm.isDonation}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Accept Clothing Donations
              </label>
            </div>

            {/* Accepts tokens checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptsTokens"
                checked={centerForm.acceptsTokens}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Accept Token Donations
              </label>
            </div>

            {/* Accepts recycling checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptsRecycling"
                checked={centerForm.acceptsRecycling}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Accept Recycling
              </label>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {(transactionPending || isConfirming) && (
              <div className="text-blue-600 flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isSuccess
                  ? "Success! Redirecting..."
                  : "Transaction pending, please wait..."}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push("/donate")}
                disabled={isSubmitting || transactionPending || isConfirming}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || transactionPending || isConfirming}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                  isSubmitting || transactionPending || isConfirming
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Center"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDonationCenterPage;
