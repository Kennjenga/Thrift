"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useDonationAndRecycling,
  useGetDonationCenter,
  useGetLatestDonations,
  useGetActiveCenterPendingDonations,
  useGetPendingDonationsDetails,
  type DonationCenter,
  type PendingDonation,
} from "@/blockchain/hooks/useDonationCenter";

// Utility function to format addresses
const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Format timestamp from blockchain to readable date
const formatTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

// Tabs for the center detail page
type TabType = "overview" | "pending" | "clothing" | "recycling" | "tokens";

const CenterDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { donationCenter, donateCloths, donateTokens, donateRecycling } =
    useDonationAndRecycling();

  const [isLoading, setIsLoading] = useState({
    cloths: false,
    recycling: false,
    tokens: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [recyclingWeight, setRecyclingWeight] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const handleClothsDonation = async () => {
    if (!donationAmount || parseInt(donationAmount) <= 0) {
      setError("Please enter a valid number of items");
      return;
    }

    setError(null);
    setIsLoading((prev) => ({ ...prev, cloths: true }));

    try {
      await donateCloths(resolvedParams.id, parseInt(donationAmount));
      setDonationAmount("");
      // Optional: Show success message
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to donate clothes"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, cloths: false }));
    }
  };

  const handleRecyclingDonation = async () => {
    if (!recyclingWeight || parseFloat(recyclingWeight) <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    setError(null);
    setIsLoading((prev) => ({ ...prev, recycling: true }));

    try {
      await donateRecycling(resolvedParams.id, parseFloat(recyclingWeight));
      setRecyclingWeight("");
      // Optional: Show success message
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to donate recycling"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, recycling: false }));
    }
  };

  const handleTokenDonation = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setError("Please enter a valid token amount");
      return;
    }

    setError(null);
    setIsLoading((prev) => ({ ...prev, tokens: true }));

    try {
      await donateTokens(resolvedParams.id, tokenAmount);
      setTokenAmount("");
      // Optional: Show success message
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to donate tokens"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, tokens: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Donate to Center</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Cloths Donation Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Donate Clothes</h2>
          <div className="flex gap-4">
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder="Number of items"
              className="flex-1 border rounded p-2"
              min="1"
            />
            <button
              onClick={handleClothsDonation}
              disabled={isLoading.cloths}
              className={`${
                isLoading.cloths ? "bg-blue-400" : "bg-blue-600"
              } text-white px-4 py-2 rounded`}
            >
              {isLoading.cloths ? "Donating..." : "Donate Clothes"}
            </button>
          </div>
        </div>

        {/* Recycling Donation Section */}
        {donationCenter?.acceptsRecycling && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Donate Recycling</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={recyclingWeight}
                onChange={(e) => setRecyclingWeight(e.target.value)}
                placeholder="Weight in kg"
                className="flex-1 border rounded p-2"
                min="0.1"
                step="0.1"
              />
              <button
                onClick={handleRecyclingDonation}
                disabled={isLoading.recycling}
                className={`${
                  isLoading.recycling ? "bg-green-400" : "bg-green-600"
                } text-white px-4 py-2 rounded`}
              >
                {isLoading.recycling ? "Donating..." : "Donate Recycling"}
              </button>
            </div>
          </div>
        )}

        {/* Token Donation Section */}
        {donationCenter?.acceptsTokens && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Donate Tokens</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Number of tokens"
                className="flex-1 border rounded p-2"
                min="1"
              />
              <button
                onClick={handleTokenDonation}
                disabled={isLoading.tokens}
                className={`${
                  isLoading.tokens ? "bg-purple-400" : "bg-purple-600"
                } text-white px-4 py-2 rounded`}
              >
                {isLoading.tokens ? "Donating..." : "Donate Tokens"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterDetailsPage;
