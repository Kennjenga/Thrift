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
} from "@/blockchain/hooks/useDonationCenter";
import { type Address } from "viem";
import {
  Loader2,
  ArrowLeft,
  Edit,
  ClipboardCheck,
  Package,
  Search,
  Filter,
  Heart,
  ArrowRight,
  Clock,
  Repeat,
  AlertCircle,
  Recycle,
  Shirt,
  Coins,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatEther } from "ethers";
import Image from "next/image";
import Link from "next/link";

// Color System - Using the cyberpunk theme from marketplace
const COLORS = {
  primary: {
    main: "#7B42FF",
    light: "#8A2BE2",
    dark: "#4A00E0",
  },
  secondary: {
    main: "#00FFD1",
    light: "#00FFFF",
    dark: "#00E6BD",
  },
  accent: {
    pink: "#FF00FF",
    red: "#FF1B6B",
  },
  background: {
    dark: "#1A0B3B",
    light: "#2A1B54",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    muted: "rgba(255, 255, 255, 0.5)",
    pink: "#FF00FF",
    red: "#FF1B6B",
  },
  glass: {
    background: "rgba(42, 27, 84, 0.2)",
    border: "rgba(123, 66, 255, 0.1)",
  },
};

// Styles object
const styles = {
  glassCard: `
    backdrop-blur-md
    bg-opacity-20 bg-purple-900
    border border-purple-500/10
    rounded-xl
    overflow-hidden
    hover:transform hover:scale-[1.02]
    hover:shadow-lg hover:shadow-purple-500/20
    transition-all duration-300
  `,
  glassEffect: `
    backdrop-blur-lg
    bg-opacity-20 bg-purple-900
    border border-purple-500/10
    rounded-lg
    p-4
  `,
  backgroundGradient: `
    bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]
    relative
  `,
  gradientText: `
    bg-clip-text text-transparent 
    bg-gradient-to-r from-[#00FFD1] to-[#7B42FF]
  `,
  button: `
    px-4 py-2
    rounded-lg
    font-medium
    transition-all duration-300
    hover:shadow-md
  `,
  primaryButton: `
    bg-gradient-to-r from-[#00FFD1] to-[#00FFFF]
    text-[#1A0B3B]
    hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]
  `,
  secondaryButton: `
    border border-[#00FFD1]
    text-[#00FFD1]
    hover:bg-[#00FFD1]/10
  `,
  input: `
    w-full
    bg-purple-900/20
    backdrop-blur-md
    border border-purple-500/20
    rounded-lg
    p-3
    text-white
    placeholder-white/40
    focus:outline-none
    focus:border-[#00FFD1]
    focus:ring-1
    focus:ring-[#00FFD1]
    transition-all
    duration-300
  `,
};

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

// Background Elements Component
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

// Tabs for the center detail page
type TabType = "overview" | "donate" | "history";

const CenterDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params as Promise<{ id: string }>);
  const centerId = BigInt(resolvedParams.id);
  const { address: userAddress } = useAccount(); // Get user's address from wagmi

  // Get center data
  const { data: centerData, isLoading: isLoadingCenter } =
    useGetDonationCenter(centerId);

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
  const center = useMemo(() => {
    if (!centerData || !Array.isArray(centerData)) return null;

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
      <div className={`min-h-screen ${styles.backgroundGradient} flex justify-center items-center`}>
        <BackgroundElements />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full bg-[#00FFD1]/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-[#00FFD1]/40 animate-pulse"></div>
            <Loader2 className="h-16 w-16 animate-spin text-[#00FFD1] relative z-10" />
          </div>
          <p className="text-white/70 text-lg">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className={`min-h-screen ${styles.backgroundGradient} flex justify-center items-center`}>
        <BackgroundElements />
        <div className={`text-center ${styles.glassCard} p-8 max-w-md relative z-10`}>
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Center Not Found
          </h1>
          <p className="text-white/70 mb-6">
            The donation center you&apos;re looking for doesn&apos;t exist or
            may have been removed.
          </p>
          <motion.button
            onClick={() => router.push("/donate")}
            className={`${styles.button} ${styles.primaryButton} flex items-center justify-center mx-auto`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Centers
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.backgroundGradient}`}>
      <BackgroundElements />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header section with center info and actions */}
        <motion.div 
          className={`${styles.glassCard} p-6 mb-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFD1] via-white to-[#FF00FF] bg-clip-text text-transparent">
                  {center.name}
                </h1>
                {center.isActive ? (
                  <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00FFD1]/20 text-[#00FFD1] border border-[#00FFD1]/30">
                    Active
                  </span>
                ) : (
                  <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF1B6B]/20 text-[#FF1B6B] border border-[#FF1B6B]/30">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-white/70 mt-2 max-w-2xl">{center.description}</p>
              <p className="text-white/70 mt-2 flex items-center">
                <span className="inline-block w-4 h-4 mr-2 rounded-full bg-[#7B42FF]/50"></span>
                {center.location}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {center.acceptsTokens && (
                  <span className="bg-[#7B42FF]/20 text-[#00FFFF] px-3 py-1 text-xs rounded-full border border-[#7B42FF]/30 backdrop-blur-md">
                    Accepts Tokens
                  </span>
                )}
                {center.acceptsRecycling && (
                  <span className="bg-[#00FFD1]/20 text-[#00FFD1] px-3 py-1 text-xs rounded-full border border-[#00FFD1]/30 backdrop-blur-md">
                    Accepts Recycling
                  </span>
                )}
                {isOwnedByUser && (
                  <span className="bg-[#FF00FF]/20 text-[#FF00FF] px-3 py-1 text-xs rounded-full border border-[#FF00FF]/30 backdrop-blur-md">
                    Your Center
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {isOwnedByUser && (
                <>
                  <motion.button
                    onClick={() =>
                      router.push(`/donate/centers/${resolvedParams.id}/edit`)
                    }
                    className="w-full bg-[#7B42FF] hover:bg-[#8A2BE2] text-white px-4 py-2 rounded-lg flex items-center justify-center border border-[#7B42FF]/50 shadow-[0_0_10px_rgba(123,66,255,0.3)]"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(123,66,255,0.5)" 
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Center
                  </motion.button>
                  <motion.button
                    onClick={() =>
                      router.push(`/donate/centers/${resolvedParams.id}/manage`)
                    }
                    className="w-full bg-[#FF00FF]/80 hover:bg-[#FF00FF] text-white px-4 py-2 rounded-lg flex items-center justify-center border border-[#FF00FF]/30 shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(255,0,255,0.4)" 
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Manage Donations
                  </motion.button>
                </>
              )}
              <motion.button
                onClick={() => router.push("/donate")}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center border border-white/10 backdrop-blur-md"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Centers
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs navigation */}
        <div className="flex border-b border-purple-500/20 mb-8">
          {["overview", "donate", "history"].map((tab) => (
            <motion.button
              key={tab}
              className={`px-6 py-3 font-medium relative ${
                activeTab === tab
                  ? "text-[#00FFD1]"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab as TabType)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF]"
                  layoutId="activeTab"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Success and error messages */}
        {success && (
          <motion.div 
            className="backdrop-blur-md bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-green-400"
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
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="backdrop-blur-md bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-red-400"
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
          </motion.div>
        )}

        {/* Inactive warning */}
        {!center.isActive && activeTab === "donate" && (
          <motion.div 
            className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-6 rounded-lg mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div 
            className={`${styles.glassCard}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 border-b border-purple-500/20">
              <h2 className="text-xl font-semibold text-white">Center Overview</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div 
                  className="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                      <Shirt className="h-6 w-6 text-[#00FFFF]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      Clothing Donations
                    </h3>
                    <p className="text-3xl font-bold mt-2 text-[#00FFFF]">
                      {center.totalDonationsReceived.toString()}
                    </p>
                    <p className="text-sm text-white/60 mt-1">items donated</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="backdrop-blur-md bg-green-500/10 border border-green-500/20 p-6 rounded-xl relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/20 rounded-full"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                      <Recycle className="h-6 w-6 text-[#00FFD1]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      Recycling
                    </h3>
                    <p className="text-3xl font-bold mt-2 text-[#00FFD1]">
                      {(Number(center.totalRecyclingReceived) / 1000).toFixed(2)}
                    </p>
                    <p className="text-sm text-white/60 mt-1">kilograms recycled</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="backdrop-blur-md bg-purple-500/10 border border-purple-500/20 p-6 rounded-xl relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/20 rounded-full"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                      <Coins className="h-6 w-6 text-[#FF00FF]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      Token Donations
                    </h3>
                    <p className="text-3xl font-bold mt-2 text-[#FF00FF]">
                      {center.totalTokenDonationsReceived.toString()}
                    </p>
                    <p className="text-sm text-white/60 mt-1">tokens received</p>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">About this Center</h3>
                  <p className="text-white/70 leading-relaxed backdrop-blur-md bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg">
                    {center.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="backdrop-blur-md bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-white">Location</h3>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#7B42FF]/20 flex items-center justify-center mr-3">
                        <svg className="h-5 w-5 text-[#00FFD1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-white/70">{center.location}</p>
                    </div>
                  </div>

                  <div className="backdrop-blur-md bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-white">Center Owner</h3>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#7B42FF]/20 flex items-center justify-center mr-3">
                        <svg className="h-5 w-5 text-[#FF00FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-white/70 font-mono">
                        {formatAddress(center.owner)}
                        {isOwnedByUser && (
                          <span className="ml-2 text-xs text-[#FF00FF] font-medium">
                            (You)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-md bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-white">What Can I Donate?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                        <Shirt className="h-4 w-4 text-[#00FFFF]" />
                      </div>
                      <p className="text-white/70">
                        <span className="font-medium text-white">Clothing:</span> Always
                        accepted when center is active
                      </p>
                    </div>
                    
                    {center.acceptsRecycling && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                          <Recycle className="h-4 w-4 text-[#00FFD1]" />
                        </div>
                        <p className="text-white/70">
                          <span className="font-medium text-white">Recycling:</span> This
                          center accepts recyclable materials
                        </p>
                      </div>
                    )}
                    
                    {center.acceptsTokens && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                          <Coins className="h-4 w-4 text-[#FF00FF]" />
                        </div>
                        <p className="text-white/70">
                          <span className="font-medium text-white">Tokens:</span> This
                          center accepts token donations
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Donate Tab */}
        {activeTab === "donate" && (
          <div className="space-y-6">
            {center.isActive ? (
              <>
                {/* Cloths Donation Section */}
                <motion.div 
                  className={`${styles.glassCard}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 border-b border-purple-500/20 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <Shirt className="h-5 w-5 text-[#00FFFF]" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Donate Clothes</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label
                        htmlFor="clothingAmount"
                        className="block text-white/80 mb-2 font-medium"
                      >
                        Number of Items
                      </label>
                      <input
                        id="clothingAmount"
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="How many items?"
                        className={styles.input}
                        min="1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="itemType"
                        className="block text-white/80 mb-2 font-medium"
                      >
                        Item Type
                      </label>
                      <input
                        id="itemType"
                        type="text"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        placeholder="E.g., Shirts, Pants, etc."
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clothingDescription"
                        className="block text-white/80 mb-2 font-medium"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        id="clothingDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="E.g., 3 shirts, 2 pants, etc."
                        className={`${styles.input} h-24 resize-none`}
                      />
                    </div>
                    <motion.button
                      onClick={handleClothsDonation}
                      disabled={isLoading.cloths || isSubmitting || isConfirming}
                      className={`w-full py-3 px-4 rounded-lg font-medium flex justify-center items-center
                        ${isLoading.cloths || isSubmitting || isConfirming
                          ? "bg-blue-500/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] text-white hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                        } transition-all duration-300`}
                      whileHover={
                        !(isLoading.cloths || isSubmitting || isConfirming) 
                          ? { scale: 1.02 } 
                          : {}
                      }
                      whileTap={
                        !(isLoading.cloths || isSubmitting || isConfirming) 
                          ? { scale: 0.98 } 
                          : {}
                      }
                    >
                      {isLoading.cloths || isSubmitting || isConfirming ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shirt className="h-5 w-5 mr-2" />
                          Donate Clothes
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Recycling Donation Section */}
                {center.acceptsRecycling && (
                  <motion.div 
                    className={`${styles.glassCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="p-6 border-b border-purple-500/20 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <Recycle className="h-5 w-5 text-[#00FFD1]" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Donate Recycling</h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          htmlFor="recyclingWeight"
                          className="block text-white/80 mb-2 font-medium"
                        >
                          Weight in Kilograms
                        </label>
                        <input
                          id="recyclingWeight"
                          type="number"
                          value={recyclingWeight}
                          onChange={(e) => setRecyclingWeight(e.target.value)}
                          placeholder="Weight in kg"
                          className={styles.input}
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="recyclingDescription"
                          className="block text-white/80 mb-2 font-medium"
                        >
                          Description (optional)
                        </label>
                        <textarea
                          id="recyclingDescription"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="E.g., plastic bottles, cardboard, etc."
                          className={`${styles.input} h-24 resize-none`}
                        />
                      </div>
                      <motion.button
                        onClick={handleRecyclingDonation}
                        disabled={isLoading.recycling || isSubmitting || isConfirming}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex justify-center items-center
                          ${isLoading.recycling || isSubmitting || isConfirming
                            ? "bg-green-500/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#00FFD1] to-[#00E6BD] text-[#1A0B3B] hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]"
                          } transition-all duration-300`}
                        whileHover={
                          !(isLoading.recycling || isSubmitting || isConfirming) 
                            ? { scale: 1.02 } 
                            : {}
                        }
                        whileTap={
                          !(isLoading.recycling || isSubmitting || isConfirming) 
                            ? { scale: 0.98 } 
                            : {}
                        }
                      >
                        {isLoading.recycling || isSubmitting || isConfirming ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Recycle className="h-5 w-5 mr-2" />
                            Donate Recycling
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Token Donation Section */}
                {center.acceptsTokens && (
                  <motion.div 
                    className={`${styles.glassCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="p-6 border-b border-purple-500/20 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <Coins className="h-5 w-5 text-[#FF00FF]" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Donate Tokens</h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          htmlFor="tokenAmount"
                          className="block text-white/80 mb-2 font-medium"
                        >
                          Number of Tokens
                        </label>
                        <input
                          id="tokenAmount"
                          type="number"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          placeholder="Number of tokens"
                          className={styles.input}
                          min="1"
                        />
                      </div>
                      <motion.button
                        onClick={handleTokenDonation}
                        disabled={isLoading.tokens || isSubmitting || isConfirming}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex justify-center items-center
                          ${isLoading.tokens || isSubmitting || isConfirming
                            ? "bg-purple-500/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#7B42FF] to-[#FF00FF] text-white hover:shadow-[0_0_15px_rgba(123,66,255,0.4)]"
                          } transition-all duration-300`}
                        whileHover={
                          !(isLoading.tokens || isSubmitting || isConfirming) 
                            ? { scale: 1.02 } 
                            : {}
                        }
                        whileTap={
                          !(isLoading.tokens || isSubmitting || isConfirming) 
                            ? { scale: 0.98 } 
                            : {}
                        }
                      >
                        {isLoading.tokens || isSubmitting || isConfirming ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Coins className="h-5 w-5 mr-2" />
                            Donate Tokens
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div 
                className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-6 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
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
                  <div className="mt-6 p-4 backdrop-blur-md bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg">
                    <p className="font-medium">
                      You are the owner of this center.
                    </p>
                    <p className="mt-1">
                      You can activate this center by editing its settings.
                    </p>
                    <motion.button
                      onClick={() =>
                        router.push(`/donate/centers/${resolvedParams.id}/edit`)
                      }
                      className="mt-4 bg-[#7B42FF] hover:bg-[#8A2BE2] text-white px-4 py-2 rounded-lg text-sm flex items-center w-auto border border-[#7B42FF]/50 shadow-[0_0_10px_rgba(123,66,255,0.3)]"
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: "0 0 20px rgba(123,66,255,0.5)" 
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Center Settings
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {isLoadingHistory ? (
              <div className="flex justify-center p-12">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 rounded-full bg-[#00FFD1]/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full bg-[#00FFD1]/40 animate-pulse"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-[#00FFD1] relative z-10" />
                </div>
              </div>
            ) : (
              <>
                {/* Clothing Donations History */}
                <motion.div 
                  className={`${styles.glassCard} overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 border-b border-purple-500/20 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <Shirt className="h-5 w-5 text-[#00FFFF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Recent Clothing Donations</h3>
                  </div>
                  
                  {clothingDonations && clothingDonations.length > 0 ? (
                    <div className="divide-y divide-purple-500/10">
                      {clothingDonations.map((donation: PendingDonation, index: number) => (
                        <motion.div 
                          key={donation.id.toString()} 
                          className="p-5 hover:bg-purple-500/10 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-white">
                                {donation.itemCount.toString()} items
                              </p>
                              <p className="text-sm text-white/60 mt-1">
                                From: {formatAddress(donation.donor.toString())}
                              </p>
                              <p className="text-sm text-white/60 mt-0.5">
                                Date: {formatTimestamp(donation.timestamp)}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm ${
                                donation.isApproved
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : donation.isProcessed
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              {donation.isApproved
                                ? "Approved"
                                : donation.isProcessed
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-white/50">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No clothing donations yet</p>
                    </div>
                  )}
                </motion.div>

                {/* Recycling Donations History */}
                {center.acceptsRecycling && (
                  <motion.div 
                    className={`${styles.glassCard} overflow-hidden`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="p-6 border-b border-purple-500/20 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <Recycle className="h-5 w-5 text-[#00FFD1]" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Recent Recycling Donations</h3>
                    </div>
                    
                    {recyclingDonations && recyclingDonations.length > 0 ? (
                      <div className="divide-y divide-purple-500/10">
                        {recyclingDonations.map((donation: PendingDonation, index: number) => (
                          <motion.div 
                            key={donation.id.toString()} 
                            className="p-5 hover:bg-purple-500/10 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-white">
                                  {(Number(donation.weightInKg) / 1000).toFixed(2)} kg
                                </p>
                                <p className="text-sm text-white/60 mt-1">
                                  From: {formatAddress(donation.donor)}
                                </p>
                                <p className="text-sm text-white/60 mt-0.5">
                                  Date: {formatTimestamp(donation.timestamp)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm ${
                                  donation.isApproved
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : donation.isProcessed
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                }`}
                              >
                                {donation.isApproved
                                  ? "Approved"
                                  : donation.isProcessed
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-white/50">
                        <Recycle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No recycling donations yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Token Donations History */}
                {center.acceptsTokens && (
                  <motion.div 
                    className={`${styles.glassCard} overflow-hidden`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="p-6 border-b border-purple-500/20 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <Coins className="h-5 w-5 text-[#FF00FF]" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Recent Token Donations</h3>
                    </div>
                    
                    {tokenDonations && tokenDonations.length > 0 ? (
                      <div className="divide-y divide-purple-500/10">
                        {tokenDonations.map((donation: PendingDonation, index: number) => (
                          <motion.div 
                            key={donation.id.toString()} 
                            className="p-5 hover:bg-purple-500/10 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-white">
                                  {donation.tokenAmount.toString()} tokens
                                </p>
                                <p className="text-sm text-white/60 mt-1">
                                  From: {formatAddress(donation.donor)}
                                </p>
                                <p className="text-sm text-white/60 mt-0.5">
                                  Date: {formatTimestamp(donation.timestamp)}
                                </p>
                              </div>
                              <span className="px-3 py-1 text-xs rounded-full backdrop-blur-sm bg-green-500/20 text-green-400 border border-green-500/30">
                                Confirmed
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-white/50">
                        <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No token donations yet</p>
                      </div>
                    )}
                  </motion.div>
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