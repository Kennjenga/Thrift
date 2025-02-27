"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  useGetDonationCenter,
  useDonationCenterManagement,
  // type DonationCenter,
} from "@/blockchain/hooks/useDonationCenter";
import { Loader2, Check, X, ArrowLeft } from "lucide-react";

const EditCenterPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const centerId = BigInt(resolvedParams.id);
  const { address: userAddress } = useAccount();

  // Get donation center details
  const { data: centerData, isLoading: isLoadingCenter } =
    useGetDonationCenter(centerId);

  console.log("Edit Center Page - center data:", centerData);

  // Use center management hook for updates
  const { updateDonationCenter } = useDonationCenterManagement();

  // Form state
  const [centerForm, setCenterForm] = useState({
    isActive: true,
    acceptsTokens: true,
    acceptsRecycling: true,
    isDonation: true,
  });

  // Transaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update form when center data loads
  useEffect(() => {
    if (centerData && Array.isArray(centerData)) {
      // Based on the console log, centerData is an array with indices:
      // 0: name
      // 1: description
      // 2: location
      // 3: isActive
      // 4: acceptsTokens
      // 5: acceptsRecycling
      // 6: isDonation
      // 7: owner

      setCenterForm({
        isActive: Boolean(centerData[3]) ?? true,
        acceptsTokens: Boolean(centerData[4]) ?? true,
        acceptsRecycling: Boolean(centerData[5]) ?? true,
        isDonation: Boolean(centerData[6]) ?? true,
      });

      console.log("Form updated with values:", {
        isActive: Boolean(centerData[3]),
        acceptsTokens: Boolean(centerData[4]),
        acceptsRecycling: Boolean(centerData[5]),
        isDonation: Boolean(centerData[6]),
      });
    }
  }, [centerData]);

  // Check if user owns this center
  const isOwnedByUser =
    centerData &&
    userAddress &&
    Array.isArray(centerData) &&
    centerData[7]?.toLowerCase() === userAddress.toLowerCase();

  console.log("Ownership check:", {
    centerOwner: Array.isArray(centerData) ? centerData[7] : null,
    userAddress,
    isOwnedByUser,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    console.log("Submitting form with values:", centerForm);

    try {
      await updateDonationCenter(
        centerId,
        centerForm.isActive,
        centerForm.acceptsTokens,
        centerForm.acceptsRecycling,
        centerForm.isDonation
      );

      setSuccess("Center updated successfully!");

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/donate/centers/${resolvedParams.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating center:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update center"
      );
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCenterForm((prev) => ({
      ...prev,
      [name]: checked,
    }));

    console.log(`Changed ${name} to ${checked}`);
  };

  // Show loading indicator while center data is being fetched
  if (isLoadingCenter) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading center details...</p>
        </div>
      </div>
    );
  }

  // Check if user has permission to edit
  if (!isOwnedByUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-bold text-red-600 mb-4">
              Permission Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to edit this donation center.
            </p>
            <button
              onClick={() =>
                router.push(`/donate/centers/${resolvedParams.id}`)
              }
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Donation Center</h1>

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-start">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-start">
            <X className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={centerForm.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
                disabled={isSubmitting}
              />
              <label htmlFor="isActive" className="ml-2">
                Center is Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDonation"
                name="isDonation"
                checked={centerForm.isDonation}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
                disabled={isSubmitting}
              />
              <label htmlFor="isDonation" className="ml-2">
                Accept Clothing Donations
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptsTokens"
                name="acceptsTokens"
                checked={centerForm.acceptsTokens}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
                disabled={isSubmitting}
              />
              <label htmlFor="acceptsTokens" className="ml-2">
                Accept Token Donations
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptsRecycling"
                name="acceptsRecycling"
                checked={centerForm.acceptsRecycling}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
                disabled={isSubmitting}
              />
              <label htmlFor="acceptsRecycling" className="ml-2">
                Accept Recycling
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() =>
                router.push(`/donate/centers/${resolvedParams.id}`)
              }
              className="px-4 py-2 text-gray-700 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded flex items-center justify-center`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCenterPage;
