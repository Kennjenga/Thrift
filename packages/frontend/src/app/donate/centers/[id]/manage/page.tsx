"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  useGetDonationCenter,
  useGetActiveCenterPendingDonations,
  useGetPendingDonationsDetails,
  useDonationApproval,
  type DonationCenter,
  type PendingDonation,
} from "@/blockchain/hooks/useDonationCenter";
import { type Address } from "viem";
import {
  Loader2,
  Check,
  X,
  RefreshCw,
  ArrowLeft,
  AlertOctagon,
  Info,
  Filter,
  Clock,
  Shirt,
  Recycle,
  Coins,
  AlertCircle,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";

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

// Function to format addresses safely
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

const ManageCenterPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params as Promise<{ id: string }>);
  const centerId = BigInt(resolvedParams.id);
  const { address: userAddress } = useAccount();

  const [message, setMessage] = useState({ type: "", text: "" });
  const [processingDonationId, setProcessingDonationId] = useState<
    string | null
  >(null);
  // Add filter state
  const [filter, setFilter] = useState<
    "all" | "clothing" | "recycling" | "token"
  >("all");
  // Add sort state
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Get center information
  const { data: centerData, isLoading: isLoadingCenter } =
    useGetDonationCenter(centerId);

  // Get the donation approval/rejection functions
  const {
    approveDonation,
    rejectDonation,
    isSubmitting,
    isConfirming,
    isSuccess,
    error: approvalError,
  } = useDonationApproval();

  // Get pending donation IDs for this center
  const {
    pendingDonationIds,
    isLoading: isLoadingIds,
    refetch: refetchIds,
  } = useGetActiveCenterPendingDonations(centerId);

  // Get details for those donation IDs
  const { donationsDetails, isLoading: isLoadingDetails } =
    useGetPendingDonationsDetails(pendingDonationIds);

  const isLoading =
    isLoadingCenter ||
    isLoadingIds ||
    isLoadingDetails ||
    isSubmitting ||
    isConfirming;

  // Auto-refresh the donations list periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isSubmitting && !isConfirming) {
        refetchIds();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [refetchIds, isSubmitting, isConfirming]);

  // Function to manually refresh data (memoized to prevent dependency issues)
  const refreshData = useCallback(() => {
    setMessage({ type: "", text: "" }); // Clear any messages
    refetchIds();
  }, [refetchIds]);

  // Track success and update UI accordingly
  useEffect(() => {
    if (isSuccess) {
      setMessage({
        type: "success",
        text: "Donation processed successfully!",
      });

      // Refresh the list after success
      setTimeout(() => {
        refreshData();
        setProcessingDonationId(null);
      }, 1500);
    }
  }, [isSuccess, refreshData]);

  // Track errors
  useEffect(() => {
    if (approvalError) {
      setMessage({
        type: "error",
        text: `Failed to process: ${approvalError.message || "Unknown error"}`,
      });
      setProcessingDonationId(null);
    }
  }, [approvalError]);

  // Convert center data to the proper type - FIXED for array structure
  const center = useMemo(() => {
    if (!centerData || !Array.isArray(centerData)) return null;

    const processedCenter = {
      id: centerId,
      name: centerData[0] || "",
      description: centerData[1] || "",
      location: centerData[2] || "",
      isActive: Boolean(centerData[3]),
      acceptsTokens: Boolean(centerData[4]),
      acceptsRecycling: Boolean(centerData[5]),
      isDonation: Boolean(centerData[6]),
      owner: centerData[7] as Address,
      totalDonationsReceived: BigInt(centerData[8] || 0),
      totalRecyclingReceived: BigInt(centerData[9] || 0),
      totalTokenDonationsReceived: BigInt(centerData[10] || 0),
    } as DonationCenter;

    return processedCenter;
  }, [centerData, centerId]);

  // Function to display the appropriate donation type and amount
  const getDonationTypeAndAmount = (donation: PendingDonation) => {
    if (donation.isTokenDonation) {
      return {
        type: "Token",
        amount: `${donation.tokenAmount.toString()} tokens`,
        icon: <Coins className="h-5 w-5 text-[#FF00FF]" />,
        color: "purple",
      };
    } else if (donation.isRecycling) {
      return {
        type: "Recycling",
        amount: `${(Number(donation.weightInKg) / 1000).toFixed(2)} kg`,
        icon: <Recycle className="h-5 w-5 text-[#00FFD1]" />,
        color: "green",
      };
    } else {
      return {
        type: "Clothing",
        amount: `${donation.itemCount.toString()} items`,
        icon: <Shirt className="h-5 w-5 text-[#00FFFF]" />,
        color: "blue",
      };
    }
  };

  // Filter and sort donations
  const filteredAndSortedDonations = useMemo(() => {
    if (!donationsDetails) return [];

    // First, filter the donations
    let filtered = [...donationsDetails];
    if (filter === "clothing") {
      filtered = filtered.filter(
        (donation) => !donation.isRecycling && !donation.isTokenDonation
      );
    } else if (filter === "recycling") {
      filtered = filtered.filter((donation) => donation.isRecycling);
    } else if (filter === "token") {
      filtered = filtered.filter((donation) => donation.isTokenDonation);
    }

    // Then, sort the filtered donations
    return filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return Number(b.timestamp) - Number(a.timestamp);
      } else {
        return Number(a.timestamp) - Number(b.timestamp);
      }
    });
  }, [donationsDetails, filter, sortOrder]);

  const handleApprove = async (donation: PendingDonation) => {
    try {
      setProcessingDonationId(donation.id.toString());
      setMessage({ type: "", text: "" });

      // For clothing donations: use the actual item count and weight
      // For recycling: use the actual weight
      const verifiedItemCount = donation.isRecycling
        ? BigInt(0)
        : donation.itemCount;
      const verifiedWeightInKg = donation.weightInKg;

      await approveDonation(
        donation.id, // pendingDonationId
        verifiedItemCount,
        verifiedWeightInKg
      );

      // Success will be handled by the useEffect tracking isSuccess
    } catch (error) {
      console.error("Error approving donation:", error);
      setMessage({
        type: "error",
        text: `Failed to approve: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setProcessingDonationId(null);
    }
  };

  const handleReject = async (donation: PendingDonation) => {
    try {
      setProcessingDonationId(donation.id.toString());
      setMessage({ type: "", text: "" });

      await rejectDonation(
        donation.id, // pendingDonationId
        "Rejected by center administrator"
      );

      // Success will be handled by the useEffect tracking isSuccess
    } catch (error) {
      console.error("Error rejecting donation:", error);
      setMessage({
        type: "error",
        text: `Failed to reject: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setProcessingDonationId(null);
    }
  };

  // Calculate stats
  const donationStats = useMemo(() => {
    if (!donationsDetails)
      return { total: 0, clothing: 0, recycling: 0, token: 0 };

    const stats = {
      total: donationsDetails.length,
      clothing: donationsDetails.filter(
        (d) => !d.isRecycling && !d.isTokenDonation
      ).length,
      recycling: donationsDetails.filter((d) => d.isRecycling).length,
      token: donationsDetails.filter((d) => d.isTokenDonation).length,
    };

    return stats;
  }, [donationsDetails]);

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

  // Check if user is center owner - only used in UI for the inactive center warning
  const showOwnerControls =
    userAddress &&
    center.owner &&
    center.owner.toLowerCase() === userAddress.toLowerCase();

  return (
    <div className={`min-h-screen ${styles.backgroundGradient}`}>
      <BackgroundElements />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold">
              <span className={styles.gradientText}>Manage Donations</span>{" "}
              <span className="text-white/70">
                for Center #{resolvedParams.id}
              </span>
            </h1>
            {center && (
              <div className="flex items-center mt-2">
                <p className="text-white/80">{center.name}</p>
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
            )}
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={refreshData}
              className="backdrop-blur-md bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white flex items-center border border-white/10"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
            <motion.button
              onClick={() =>
                router.push(`/donate/centers/${resolvedParams.id}`)
              }
              className="backdrop-blur-md bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white flex items-center border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Center
            </motion.button>
          </div>
        </motion.div>

        {message.text && (
          <motion.div
            className={`backdrop-blur-md p-4 mb-6 rounded-lg flex items-start ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : message.type === "error"
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : ""
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {message.type === "success" ? (
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
              ) : (
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
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{message.text}</p>
            </div>
          </motion.div>
        )}

        {/* Inactive center warning - only show edit button if user is owner */}
        {!center.isActive && (
          <motion.div 
            className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-6 rounded-lg mb-6 flex items-start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertOctagon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">
                This center is currently inactive
              </h3>
              <p className="mt-1">
                New donations cannot be received while the center is inactive.
                You can still manage existing pending donations.
              </p>
              {showOwnerControls && (
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
                  Edit Center Status
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Donation stats */}
        {donationsDetails && donationsDetails.length > 0 && (
          <motion.div 
            className={`${styles.glassCard} p-6 mb-6`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-medium text-white mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-[#00FFD1]" />
              Pending Donations Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-lg relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
                <p className="text-sm text-white/60">Total Pending</p>
                <p className="text-3xl font-bold text-white mt-1">{donationStats.total}</p>
              </motion.div>
              
              <motion.div 
                className="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-[#00FFFF]" />
                  <p className="text-sm text-[#00FFFF]">Clothing</p>
                </div>
                <p className="text-3xl font-bold text-[#00FFFF] mt-1">
                  {donationStats.clothing}
                </p>
              </motion.div>
              
              <motion.div 
                className="backdrop-blur-md bg-green-500/10 border border-green-500/20 p-4 rounded-lg relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/10 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-[#00FFD1]" />
                  <p className="text-sm text-[#00FFD1]">Recycling</p>
                </div>
                <p className="text-3xl font-bold text-[#00FFD1] mt-1">
                  {donationStats.recycling}
                </p>
              </motion.div>
              
              <motion.div 
                className="backdrop-blur-md bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[#FF00FF]" />
                  <p className="text-sm text-[#FF00FF]">Tokens</p>
                </div>
                <p className="text-3xl font-bold text-[#FF00FF] mt-1">
                  {donationStats.token}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Filter controls */}
        {donationsDetails && donationsDetails.length > 0 && (
          <motion.div 
            className={`${styles.glassEffect} mb-6 flex flex-col sm:flex-row justify-between items-center gap-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-[#00FFD1]" />
              <span className="text-sm text-white/70">Filter:</span>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 text-xs rounded-full backdrop-blur-md border ${
                    filter === "all"
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  All
                </motion.button>
                <motion.button
                  onClick={() => setFilter("clothing")}
                  className={`px-3 py-1.5 text-xs rounded-full backdrop-blur-md border ${
                    filter === "clothing"
                      ? "bg-blue-500/20 text-[#00FFFF] border-blue-500/30"
                      : "bg-blue-500/5 text-blue-400/60 border-blue-500/10 hover:bg-blue-500/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center">
                    <Shirt className="h-3 w-3 mr-1" />
                    Clothing
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setFilter("recycling")}
                  className={`px-3 py-1.5 text-xs rounded-full backdrop-blur-md border ${
                    filter === "recycling"
                      ? "bg-green-500/20 text-[#00FFD1] border-green-500/30"
                      : "bg-green-500/5 text-green-400/60 border-green-500/10 hover:bg-green-500/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center">
                    <Recycle className="h-3 w-3 mr-1" />
                    Recycling
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setFilter("token")}
                  className={`px-3 py-1.5 text-xs rounded-full backdrop-blur-md border ${
                    filter === "token"
                      ? "bg-purple-500/20 text-[#FF00FF] border-purple-500/30"
                      : "bg-purple-500/5 text-purple-400/60 border-purple-500/10 hover:bg-purple-500/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center">
                    <Coins className="h-3 w-3 mr-1" />
                    Tokens
                  </div>
                  </motion.button>
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Clock className="h-4 w-4 text-[#00FFD1]" />
              <span className="text-sm text-white/70">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "newest" | "oldest")
                }
                className="text-xs backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-1.5 text-white focus:outline-none focus:border-[#00FFD1]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </motion.div>
        )}

        <motion.div 
          className={`${styles.glassCard} overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full bg-[#00FFD1]/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full bg-[#00FFD1]/40 animate-pulse"></div>
                <Loader2 className="h-16 w-16 animate-spin text-[#00FFD1] relative z-10" />
              </div>
            </div>
          ) : filteredAndSortedDonations &&
            filteredAndSortedDonations.length > 0 ? (
            <div className="divide-y divide-purple-500/10">
              {filteredAndSortedDonations.map((donation, index) => {
                const { type, amount, icon, color } = getDonationTypeAndAmount(donation);
                const isProcessing =
                  processingDonationId === donation.id.toString();

                return (
                  <motion.div 
                    key={donation.id.toString()} 
                    className="p-6 hover:bg-purple-500/10 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div>
                        <div className="flex items-center mb-3">
                          <div className={`w-10 h-10 rounded-full ${
                              color === "green" 
                                ? "bg-green-500/20" 
                                : color === "purple" 
                                ? "bg-purple-500/20" 
                                : "bg-blue-500/20"
                            } flex items-center justify-center mr-3`}>
                            {icon}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className={`font-medium text-lg ${
                                color === "green" 
                                  ? "text-[#00FFD1]" 
                                  : color === "purple" 
                                  ? "text-[#FF00FF]" 
                                  : "text-[#00FFFF]"
                              }`}>
                                {type} Donation
                              </p>
                              <span className="ml-2 text-xs text-white/50 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                ID: {donation.id.toString()}
                              </span>
                            </div>
                            <p className="text-sm text-white/60">
                              {amount}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm text-white/60">
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-white/30 mr-2"></span>
                            <span className="font-medium text-white/80">From:</span>{" "}
                            {formatAddress(donation.donor)}
                          </p>
                          
                          {donation.description && (
                            <p className="flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-white/30 mr-2"></span>
                              <span className="font-medium text-white/80">Description:</span>{" "}
                              {donation.description}
                            </p>
                          )}
                          
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-white/30 mr-2"></span>
                            <span className="font-medium text-white/80">Date:</span>{" "}
                            {formatTimestamp(donation.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => handleApprove(donation)}
                          disabled={isProcessing || isLoading}
                          className={`${
                            isProcessing || isLoading
                              ? "bg-green-500/30 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#00FFD1] to-[#00E6BD] text-[#1A0B3B] hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]"
                          } px-4 py-2 rounded-lg flex items-center font-medium min-w-[120px] justify-center`}
                          whileHover={
                            !(isProcessing || isLoading) 
                              ? { scale: 1.05 } 
                              : {}
                          }
                          whileTap={
                            !(isProcessing || isLoading) 
                              ? { scale: 0.95 } 
                              : {}
                          }
                        >
                          {isProcessing &&
                          processingDonationId === donation.id.toString() ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleReject(donation)}
                          disabled={isProcessing || isLoading}
                          className={`${
                            isProcessing || isLoading
                              ? "bg-red-500/30 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#FF1B6B] to-[#FF5E86] text-white hover:shadow-[0_0_15px_rgba(255,27,107,0.4)]"
                          } px-4 py-2 rounded-lg flex items-center font-medium min-w-[120px] justify-center`}
                          whileHover={
                            !(isProcessing || isLoading) 
                              ? { scale: 1.05 } 
                              : {}
                          }
                          whileTap={
                            !(isProcessing || isLoading) 
                              ? { scale: 0.95 } 
                              : {}
                          }
                        >
                          {isProcessing &&
                          processingDonationId === donation.id.toString() ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <motion.div 
                className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Package className="h-10 w-10 text-white/30" />
              </motion.div>
              <h3 className="text-xl font-medium text-white mb-2">
                {filter !== "all"
                  ? `No pending ${filter} donations`
                  : "No pending donations"}
              </h3>
              <p className="text-white/60 max-w-md mx-auto">
                {filter !== "all"
                  ? `There are no pending ${filter} donations for this center at the moment.`
                  : "There are no pending donations for this center at the moment."}
              </p>
              {filter !== "all" && (
                <motion.button
                  onClick={() => setFilter("all")}
                  className="mt-6 text-[#00FFD1] hover:text-[#00FFFF] text-sm border-b border-[#00FFD1]/30 hover:border-[#00FFFF]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show all donation types
                </motion.button>
              )}
              {!center.isActive && (
                <p className="mt-4 text-yellow-400/80 bg-yellow-400/10 backdrop-blur-md p-3 rounded-lg inline-block">
                  Note: Your center is currently inactive and cannot receive new
                  donations.
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Batch actions (future enhancement) */}
        {filteredAndSortedDonations &&
          filteredAndSortedDonations.length > 1 && (
            <motion.div 
              className="mt-6 backdrop-blur-md bg-purple-900/20 border border-purple-500/10 p-4 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-sm font-medium text-white/80 mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => refreshData()}
                  className="text-xs px-4 py-2 bg-blue-500/10 text-[#00FFFF] hover:bg-blue-500/20 rounded-lg border border-blue-500/20 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh List
                </motion.button>
                {center.isActive === false && showOwnerControls && (
                  <motion.button
                    onClick={() =>
                      router.push(`/donate/centers/${resolvedParams.id}/edit`)
                    }
                    className="text-xs px-4 py-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg border border-yellow-500/20 flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Activate Center
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default ManageCenterPage;