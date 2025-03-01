"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  useDonationAndRecycling,
  useGetDonationCenter,
  useGetLatestClothingDonations,
  useGetLatestRecyclingDonations,
  useGetLatestTokenDonations,
  useDonationOperations,
  type DonationCenter,
  type PendingDonation,
  // DonationType,
} from "@/blockchain/hooks/useDonationCenter";
import { type Address } from "viem";
import {
  Loader2,
  ArrowLeft,
  // ExternalLink,
  Edit,
  ClipboardCheck,
} from "lucide-react";

// Utility function to format addresses
const formatAddress = (address: Address | string | undefined): string => {
  if (!address) return "";
  const addressStr = address.toString();
  return `${addressStr.substring(0, 6)}...${addressStr.substring(
    addressStr.length - 4
  )}`;
};

// Format timestamp from blockchain to readable date
const formatTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

// Tabs for the center detail page
type TabType = "overview" | "donate" | "history";

const CenterDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params as Promise<{ id: string }>);
  const centerId = BigInt(resolvedParams.id);
  const { address: userAddress } = useAccount(); // Get user's address from wagmi
  // console.log(`address`, userAddress);

  // Get center data
  const { data: centerData, isLoading: isLoadingCenter } =
    useGetDonationCenter(centerId);

  // console.log("center details:", centerData);

  // Use the donation operations hook for donating
  const {
    submitDonation,
    submitRecycling,
    donateTokens,
    isSubmitting,
    isConfirming,
    isSuccess,
  } = useDonationOperations();

  // Get user creator status from donation and recycling
  useDonationAndRecycling();

  // Get latest donation history - separate calls for each type
  const { clothingDonations, isLoading: isLoadingClothing } =
    useGetLatestClothingDonations(centerId) || {
      clothingDonations: [],
      isLoading: false,
    };

  const { recyclingDonations, isLoading: isLoadingRecycling } =
    useGetLatestRecyclingDonations(centerId) || {
      recyclingDonations: [],
      isLoading: false,
    };

  const { tokenDonations, isLoading: isLoadingTokens } =
    useGetLatestTokenDonations(centerId) || {
      tokenDonations: [],
      isLoading: false,
    };

  const isLoadingHistory =
    isLoadingClothing || isLoadingRecycling || isLoadingTokens;

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState({
    cloths: false,
    recycling: false,
    tokens: false,
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  // const donationWeight  = 0;
  const [recyclingWeight, setRecyclingWeight] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState("Clothing");

  // Clear messages when changing tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  // Track success and update UI accordingly
  useEffect(() => {
    if (isSuccess) {
      setSuccess("Donation submitted successfully!");
      setDonationAmount("");
      setRecyclingWeight("");
      setTokenAmount("");
      setDescription("");
    }
  }, [isSuccess]);

  // Convert the center data to the DonationCenter type with safer type checking
  // Fix: Handle the array structure from the centerData
  const center = useMemo(() => {
    if (!centerData || !Array.isArray(centerData)) return null;

    // Based on the console log, centerData is an array with indices:
    // 0: name
    // 1: description
    // 2: location
    // 3: isActive
    // 4: acceptsTokens
    // 5: acceptsRecycling
    // 6: isDonation
    // 7: owner
    // 8: totalDonationsReceived
    // 9: totalRecyclingReceived
    // 10: totalTokenDonationsReceived

    return {
      id: centerId,
      name: centerData[0] || "",
      description: centerData[1] || "",
      location: centerData[2] || "",
      isActive: Boolean(centerData[3]),
      acceptsTokens: Boolean(centerData[4]),
      acceptsRecycling: Boolean(centerData[5]),
      isDonation: Boolean(centerData[6]),
      owner: (centerData[7] as Address) || "0x0",
      totalDonationsReceived: BigInt(centerData[8] || 0),
      totalRecyclingReceived: BigInt(centerData[9] || 0),
      totalTokenDonationsReceived: BigInt(centerData[10] || 0),
    } as DonationCenter;
  }, [centerData, centerId]);

  // Check if current user is center owner
  const isOwnedByUser = useMemo(() => {
    if (!center || !userAddress) return false;
    if (!center.owner) return false;

    // Address from viem is already an object type that can be compared with string equality
    return center.owner.toLowerCase() === userAddress.toLowerCase();
  }, [center, userAddress]);

  // Handler for clothing donation
  const handleClothsDonation = async () => {
    if (!donationAmount || parseInt(donationAmount) <= 0) {
      setError("Please enter a valid number of items");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading((prev) => ({ ...prev, cloths: true }));

    try {
      // Convert values to appropriate types
      const itemCountBigInt = BigInt(parseInt(donationAmount));
      const weightInKgBigInt = BigInt(1); // Default weight if not specified

      await submitDonation(
        centerId,
        itemCountBigInt,
        itemType,
        description,
        weightInKgBigInt
      );

      // State will be updated in the useEffect when isSuccess changes
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to donate clothes"
      );
      setIsLoading((prev) => ({ ...prev, cloths: false }));
    }
  };

  // Handler for recycling donation
  const handleRecyclingDonation = async () => {
    if (!recyclingWeight || parseFloat(recyclingWeight) <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading((prev) => ({ ...prev, recycling: true }));

    try {
      // Convert to bigint by multiplying by 1000 to handle decimals
      const weightInKgBigInt = BigInt(
        Math.floor(parseFloat(recyclingWeight) * 1000)
      );

      await submitRecycling(centerId, description, weightInKgBigInt);

      // State will be updated in the useEffect when isSuccess changes
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to donate recycling"
      );
      setIsLoading((prev) => ({ ...prev, recycling: false }));
    }
  };

  // Handler for token donation
  const handleTokenDonation = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setError("Please enter a valid token amount");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading((prev) => ({ ...prev, tokens: true }));

    try {
      await donateTokens(centerId, BigInt(parseInt(tokenAmount)));

      // State will be updated in the useEffect when isSuccess changes
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to donate tokens"
      );
      setIsLoading((prev) => ({ ...prev, tokens: false }));
    }
  };

  // Reset loading states when transaction completes
  useEffect(() => {
    if (!isSubmitting && !isConfirming) {
      setIsLoading({
        cloths: false,
        recycling: false,
        tokens: false,
      });
    }
  }, [isSubmitting, isConfirming]);

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

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Center Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The donation center you&apos;re looking for doesn&apos;t exist or
            may have been removed.
          </p>
          <button
            onClick={() => router.push("/donate")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Centers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header section with center info and actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{center.name}</h1>
                {center.isActive ? (
                  <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">{center.description}</p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Location:</span> {center.location}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {center.acceptsTokens && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">
                    Accepts Tokens
                  </span>
                )}
                {center.acceptsRecycling && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                    Accepts Recycling
                  </span>
                )}
                {isOwnedByUser && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">
                    Your Center
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {isOwnedByUser && (
                <>
                  <button
                    onClick={() =>
                      router.push(`/donate/centers/${resolvedParams.id}/edit`)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Center
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/donate/centers/${resolvedParams.id}/manage`)
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Manage Donations
                  </button>
                </>
              )}
              <button
                onClick={() => router.push("/donate")}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Centers
              </button>
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "donate"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("donate")}
          >
            Donate
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Donation History
          </button>
        </div>

        {/* Success and error messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Inactive warning */}
        {!center.isActive && activeTab === "donate" && (
          <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg border border-yellow-200 mb-6">
            <h3 className="font-semibold text-lg flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              This center is currently inactive
            </h3>
            <p className="mt-2">
              Donations cannot be made to inactive centers. Please check back
              later or contact the center administrator.
            </p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Center Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800">
                  Clothing Donations
                </h3>
                <p className="text-3xl font-bold mt-2">
                  {center.totalDonationsReceived.toString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">items donated</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">
                  Recycling
                </h3>
                <p className="text-3xl font-bold mt-2">
                  {(Number(center.totalRecyclingReceived) / 1000).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-1">kilograms recycled</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800">
                  Token Donations
                </h3>
                <p className="text-3xl font-bold mt-2">
                  {center.totalTokenDonationsReceived.toString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">tokens received</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">About this Center</h3>
              <p className="text-gray-700">{center.description}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <p className="text-gray-700">{center.location}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Center Owner</h3>
                  <p className="text-gray-700 font-mono">
                    {formatAddress(center.owner)}
                    {isOwnedByUser && (
                      <span className="ml-2 text-xs text-blue-600 font-medium">
                        (You)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  What Can I Donate?
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="text-gray-700">
                    <span className="font-medium">Clothing:</span> Always
                    accepted when center is active
                  </li>
                  {center.acceptsRecycling && (
                    <li className="text-gray-700">
                      <span className="font-medium">Recycling:</span> This
                      center accepts recyclable materials
                    </li>
                  )}
                  {center.acceptsTokens && (
                    <li className="text-gray-700">
                      <span className="font-medium">Tokens:</span> This center
                      accepts token donations
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Donate Tab */}
        {activeTab === "donate" && (
          <div>
            {center.isActive ? (
              <>
                {/* Cloths Donation Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Donate Clothes</h2>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="clothingAmount"
                        className="block text-gray-700 mb-1"
                      >
                        Number of Items
                      </label>
                      <input
                        id="clothingAmount"
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="How many items?"
                        className="w-full border rounded p-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="itemType"
                        className="block text-gray-700 mb-1"
                      >
                        Item Type
                      </label>
                      <input
                        id="itemType"
                        type="text"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        placeholder="E.g., Shirts, Pants, etc."
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clothingDescription"
                        className="block text-gray-700 mb-1"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        id="clothingDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="E.g., 3 shirts, 2 pants, etc."
                        className="w-full border rounded p-2 h-20"
                      />
                    </div>
                    <button
                      onClick={handleClothsDonation}
                      disabled={
                        isLoading.cloths || isSubmitting || isConfirming
                      }
                      className={`w-full ${
                        isLoading.cloths || isSubmitting || isConfirming
                          ? "bg-blue-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white px-4 py-2 rounded flex justify-center items-center`}
                    >
                      {isLoading.cloths || isSubmitting || isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Donate Clothes"
                      )}
                    </button>
                  </div>
                </div>

                {/* Recycling Donation Section */}
                {center.acceptsRecycling && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Donate Recycling
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="recyclingWeight"
                          className="block text-gray-700 mb-1"
                        >
                          Weight in Kilograms
                        </label>
                        <input
                          id="recyclingWeight"
                          type="number"
                          value={recyclingWeight}
                          onChange={(e) => setRecyclingWeight(e.target.value)}
                          placeholder="Weight in kg"
                          className="w-full border rounded p-2"
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="recyclingDescription"
                          className="block text-gray-700 mb-1"
                        >
                          Description (optional)
                        </label>
                        <textarea
                          id="recyclingDescription"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="E.g., plastic bottles, cardboard, etc."
                          className="w-full border rounded p-2 h-20"
                        />
                      </div>
                      <button
                        onClick={handleRecyclingDonation}
                        disabled={
                          isLoading.recycling || isSubmitting || isConfirming
                        }
                        className={`w-full ${
                          isLoading.recycling || isSubmitting || isConfirming
                            ? "bg-green-400"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white px-4 py-2 rounded flex justify-center items-center`}
                      >
                        {isLoading.recycling || isSubmitting || isConfirming ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Donate Recycling"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Token Donation Section */}
                {center.acceptsTokens && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Donate Tokens
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="tokenAmount"
                          className="block text-gray-700 mb-1"
                        >
                          Number of Tokens
                        </label>
                        <input
                          id="tokenAmount"
                          type="number"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          placeholder="Number of tokens"
                          className="w-full border rounded p-2"
                          min="1"
                        />
                      </div>
                      <button
                        onClick={handleTokenDonation}
                        disabled={
                          isLoading.tokens || isSubmitting || isConfirming
                        }
                        className={`w-full ${
                          isLoading.tokens || isSubmitting || isConfirming
                            ? "bg-purple-400"
                            : "bg-purple-600 hover:bg-purple-700"
                        } text-white px-4 py-2 rounded flex justify-center items-center`}
                      >
                        {isLoading.tokens || isSubmitting || isConfirming ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Donate Tokens"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-lg flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  This center is currently inactive
                </h3>
                <p className="mt-2">
                  Donations cannot be made to inactive centers. Please check
                  back later or contact the center administrator.
                </p>
                {isOwnedByUser && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md">
                    <p className="font-medium">
                      You are the owner of this center.
                    </p>
                    <p className="mt-1">
                      You can activate this center by editing its settings.
                    </p>
                    <button
                      onClick={() =>
                        router.push(`/donate/centers/${resolvedParams.id}/edit`)
                      }
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Center Settings
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {isLoadingHistory ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {/* Clothing Donations History */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <h3 className="font-semibold text-blue-800">
                      Recent Clothing Donations
                    </h3>
                  </div>
                  {clothingDonations && clothingDonations.length > 0 ? (
                    <div className="divide-y">
                      {clothingDonations.map((donation: PendingDonation) => (
                        <div key={donation.id.toString()} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {donation.itemCount.toString()} items
                              </p>
                              <p className="text-sm text-gray-500">
                                From: {formatAddress(donation.donor.toString())}
                              </p>
                              <p className="text-sm text-gray-500">
                                Date: {formatTimestamp(donation.timestamp)}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                donation.isApproved
                                  ? "bg-green-100 text-green-800"
                                  : donation.isProcessed
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {donation.isApproved
                                ? "Approved"
                                : donation.isProcessed
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No clothing donations yet
                    </div>
                  )}
                </div>

                {/* Recycling Donations History */}
                {center.acceptsRecycling && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-green-50 p-4 border-b border-green-100">
                      <h3 className="font-semibold text-green-800">
                        Recent Recycling Donations
                      </h3>
                    </div>
                    {recyclingDonations && recyclingDonations.length > 0 ? (
                      <div className="divide-y">
                        {recyclingDonations.map((donation: PendingDonation) => (
                          <div key={donation.id.toString()} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {(Number(donation.weightInKg) / 1000).toFixed(
                                    2
                                  )}{" "}
                                  kg
                                </p>
                                <p className="text-sm text-gray-500">
                                  From: {formatAddress(donation.donor)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Date: {formatTimestamp(donation.timestamp)}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  donation.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : donation.isProcessed
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {donation.isApproved
                                  ? "Approved"
                                  : donation.isProcessed
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No recycling donations yet
                      </div>
                    )}
                  </div>
                )}

                {/* Token Donations History */}
                {center.acceptsTokens && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-purple-50 p-4 border-b border-purple-100">
                      <h3 className="font-semibold text-purple-800">
                        Recent Token Donations
                      </h3>
                    </div>
                    {tokenDonations && tokenDonations.length > 0 ? (
                      <div className="divide-y">
                        {tokenDonations.map((donation: PendingDonation) => (
                          <div key={donation.id.toString()} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {donation.tokenAmount.toString()} tokens
                                </p>
                                <p className="text-sm text-gray-500">
                                  From: {formatAddress(donation.donor)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Date: {formatTimestamp(donation.timestamp)}
                                </p>
                              </div>
                              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                                Confirmed
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No token donations yet
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterDetailsPage;
