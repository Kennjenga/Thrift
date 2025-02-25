"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDonationAndRecycling } from "@/blockchain/hooks/useDonationCenter";

// Center form state type
type CenterForm = {
  name: string;
  description: string;
  location: string;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
};

const AddDonationCenterPage: React.FC = () => {
  const router = useRouter();
  const { isCreator, addDonationCenter, userAddress } =
    useDonationAndRecycling();

  const [centerForm, setCenterForm] = useState<CenterForm>({
    name: "",
    description: "",
    location: "",
    acceptsTokens: true,
    acceptsRecycling: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addDonationCenter(
        centerForm.name,
        centerForm.description,
        centerForm.location,
        centerForm.acceptsTokens,
        centerForm.acceptsRecycling
      );
      router.push("/donate");
    } catch (err) {
      setError("Failed to create donation center. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Accepts tokens checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptsTokens"
                checked={centerForm.acceptsTokens}
                onChange={handleChange}
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
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Accept Recycling
              </label>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push("/donate")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                  isSubmitting
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
