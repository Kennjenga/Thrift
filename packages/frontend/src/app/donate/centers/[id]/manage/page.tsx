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
} from "lucide-react";

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

  console.log("Manage Page - center data:", centerData);

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
  console.log("pending donations ids", pendingDonationIds);

  // Get details for those donation IDs
  const { donationsDetails, isLoading: isLoadingDetails } =
    useGetPendingDonationsDetails(pendingDonationIds);

    console.log("pending donations details", donationsDetails);

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

    // Based on the console log from other components, centerData is an array with indices:
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

    console.log("Processed center for management:", {
      ...processedCenter,
      totalDonationsReceived: processedCenter.totalDonationsReceived.toString(),
      totalRecyclingReceived: processedCenter.totalRecyclingReceived.toString(),
      totalTokenDonationsReceived:
        processedCenter.totalTokenDonationsReceived.toString(),
    });

    return processedCenter;
  }, [centerData, centerId]);

  // Function to display the appropriate donation type and amount
  const getDonationTypeAndAmount = (donation: PendingDonation) => {
    if (donation.isTokenDonation) {
      return {
        type: "Token",
        amount: `${donation.tokenAmount.toString()} tokens`,
      };
    } else if (donation.isRecycling) {
      return {
        type: "Recycling",
        amount: `${(Number(donation.weightInKg) / 1000).toFixed(2)} kg`,
      };
    } else {
      return {
        type: "Clothing",
        amount: `${donation.itemCount.toString()} items`,
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

      console.log("Approving donation:", {
        id: donation.id.toString(),
        isRecycling: donation.isRecycling,
        itemCount: donation.isRecycling ? 0 : donation.itemCount.toString(),
        weightInKg: donation.weightInKg.toString(),
      });

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

      console.log("Rejecting donation:", {
        id: donation.id.toString(),
      });

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

  // Check if user is center owner - only used in UI for the inactive center warning
  const showOwnerControls =
    userAddress &&
    center.owner &&
    center.owner.toLowerCase() === userAddress.toLowerCase();

  console.log("Ownership status:", {
    centerOwner: center.owner,
    userAddress,
    showOwnerControls,
  });

  // Log donations details for debugging
  console.log("Pending donations:", donationsDetails);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-cyan-500">Manage</span>{" "}
              <span className="text-purple-500">Donations</span>{" "}
              <span className="text-gray-700">
                for Center #{resolvedParams.id}
              </span>
            </h1>
            {center && (
              <div className="flex items-center mt-1">
                <p className="text-gray-600">{center.name}</p>
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
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-gray-800 flex items-center"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() =>
                router.push(`/donate/centers/${resolvedParams.id}`)
              }
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Center
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`p-4 mb-4 rounded flex items-start ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : message.type === "error"
                ? "bg-red-100 text-red-800"
                : ""
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {message.type === "success" ? (
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
              ) : (
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
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        )}

        {/* Inactive center warning - only show edit button if user is owner */}
        {!center.isActive && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 mb-6 flex items-start">
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
                <button
                  onClick={() =>
                    router.push(`/donate/centers/${resolvedParams.id}/edit`)
                  }
                  className="mt-3 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded text-sm"
                >
                  Edit Center Status
                </button>
              )}
            </div>
          </div>
        )}

        {/* Donation stats */}
        {donationsDetails && donationsDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Pending Donations Overview
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold">{donationStats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">Clothing</p>
                <p className="text-2xl font-bold text-blue-700">
                  {donationStats.clothing}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600">Recycling</p>
                <p className="text-2xl font-bold text-green-700">
                  {donationStats.recycling}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600">Tokens</p>
                <p className="text-2xl font-bold text-purple-700">
                  {donationStats.token}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter controls */}
        {donationsDetails && donationsDetails.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter by:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-2 py-1 text-xs rounded-full ${
                    filter === "all"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("clothing")}
                  className={`px-2 py-1 text-xs rounded-full ${
                    filter === "clothing"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                >
                  Clothing
                </button>
                <button
                  onClick={() => setFilter("recycling")}
                  className={`px-2 py-1 text-xs rounded-full ${
                    filter === "recycling"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  Recycling
                </button>
                <button
                  onClick={() => setFilter("token")}
                  className={`px-2 py-1 text-xs rounded-full ${
                    filter === "token"
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                  }`}
                >
                  Tokens
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "newest" | "oldest")
                }
                className="text-xs border rounded p-1"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredAndSortedDonations &&
            filteredAndSortedDonations.length > 0 ? (
            <div className="divide-y">
              {filteredAndSortedDonations.map((donation) => {
                const { type, amount } = getDonationTypeAndAmount(donation);
                const isProcessing =
                  processingDonationId === donation.id.toString();

                return (
                  <div key={donation.id.toString()} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              type === "Recycling"
                                ? "bg-green-500"
                                : type === "Token"
                                ? "bg-purple-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <p className="font-medium text-lg">{type} Donation</p>
                          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            ID: {donation.id.toString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">From:</span>{" "}
                          {formatAddress(donation.donor)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Amount:</span> {amount}
                        </p>
                        {donation.description && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Description:</span>{" "}
                            {donation.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{" "}
                          {formatTimestamp(donation.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(donation)}
                          disabled={isProcessing || isLoading}
                          className={`${
                            isProcessing || isLoading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          } text-white px-4 py-2 rounded flex items-center`}
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
                        </button>
                        <button
                          onClick={() => handleReject(donation)}
                          disabled={isProcessing || isLoading}
                          className={`${
                            isProcessing || isLoading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          } text-white px-4 py-2 rounded flex items-center`}
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
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {filter !== "all"
                  ? `No pending ${filter} donations`
                  : "No pending donations"}
              </h3>
              <p className="text-gray-500">
                {filter !== "all"
                  ? `There are no pending ${filter} donations for this center at the moment.`
                  : "There are no pending donations for this center at the moment."}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Show all donation types
                </button>
              )}
              {!center.isActive && (
                <p className="mt-2 text-yellow-600">
                  Note: Your center is currently inactive and cannot receive new
                  donations.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Batch actions (future enhancement) */}
        {filteredAndSortedDonations &&
          filteredAndSortedDonations.length > 1 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => refreshData()}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
                >
                  Refresh List
                </button>
                {center.isActive === false && showOwnerControls && (
                  <button
                    onClick={() =>
                      router.push(`/donate/centers/${resolvedParams.id}/edit`)
                    }
                    className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded border border-yellow-200"
                  >
                    Activate Center
                  </button>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ManageCenterPage;
