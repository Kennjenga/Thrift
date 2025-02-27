"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther, type Address } from "viem";
import { Escrow } from "@/types/escrow";
import { RefreshCw, Check, X, AlertCircle } from "lucide-react";
import {
  useGetUserActiveEscrowsAsBuyer,
  useGetUserActiveEscrowsAsSeller,
  useEscrowActions,
  // useReadContract,
} from "@/blockchain/hooks/useMarketplace";
// import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/blockchain/abis/thrift";

const EscrowPage = () => {
  const { address, isConnected } = useAccount();

  // Fetch escrow IDs
  const {
    data: buyerEscrowIds,
    isLoading: isBuyerLoading,
    refetch: refetchBuyerEscrows,
  } = useGetUserActiveEscrowsAsBuyer(
    isConnected ? (address as Address) : undefined
  );

  const {
    data: sellerEscrowIds,
    isLoading: isSellerLoading,
    refetch: refetchSellerEscrows,
  } = useGetUserActiveEscrowsAsSeller(
    isConnected ? (address as Address) : undefined
  );

  // Escrow actions
  const { confirmEscrow, rejectEscrow, cancelEscrow } = useEscrowActions();

  // Component state
  const [buyerEscrows, setBuyerEscrows] = useState<Escrow[]>([]);
  const [sellerEscrows, setSellerEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check for wallet connection
  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
    }
  }, [isConnected]);

  // Fetch escrow details when we have escrow IDs
  useEffect(() => {
    const fetchEscrowDetails = async () => {
      try {
        // Process buyer escrows
        if (Array.isArray(buyerEscrowIds) && buyerEscrowIds.length > 0) {
          console.log("Fetching details for buyer escrows:", buyerEscrowIds);
          const escrowDetailsPromises = buyerEscrowIds.map(async (escrowId) => {
            try {
              const result = await fetch(`/api/escrows/${escrowId.toString()}`);
              if (!result.ok) {
                throw new Error(`Error fetching escrow: ${result.statusText}`);
              }
              return await result.json();
            } catch (err) {
              console.error(`Error fetching escrow ${escrowId}:`, err);
              return null;
            }
          });

          const fetchedEscrows = await Promise.all(escrowDetailsPromises);
          const validEscrows = fetchedEscrows.filter(
            (escrow) => escrow !== null
          );
          setBuyerEscrows(validEscrows);
        } else {
          console.log("No buyer escrow IDs found");
          setBuyerEscrows([]);
        }

        // Process seller escrows
        if (Array.isArray(sellerEscrowIds) && sellerEscrowIds.length > 0) {
          console.log("Fetching details for seller escrows:", sellerEscrowIds);
          const escrowDetailsPromises = sellerEscrowIds.map(
            async (escrowId) => {
              try {
                const result = await fetch(
                  `/api/escrows/${escrowId.toString()}`
                );
                if (!result.ok) {
                  throw new Error(
                    `Error fetching escrow: ${result.statusText}`
                  );
                }
                return await result.json();
              } catch (err) {
                console.error(`Error fetching escrow ${escrowId}:`, err);
                return null;
              }
            }
          );

          const fetchedEscrows = await Promise.all(escrowDetailsPromises);
          const validEscrows = fetchedEscrows.filter(
            (escrow) => escrow !== null
          );
          setSellerEscrows(validEscrows);
        } else {
          console.log("No seller escrow IDs found");
          setSellerEscrows([]);
        }
      } catch (err) {
        console.error("Error fetching escrow details:", err);
        setError("Failed to load escrow data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    if (!isBuyerLoading && !isSellerLoading) {
      fetchEscrowDetails();
    }
  }, [
    buyerEscrowIds,
    sellerEscrowIds,
    isBuyerLoading,
    isSellerLoading,
    refreshTrigger,
  ]);

  // Handle escrow acceptance
  const handleAcceptEscrow = async (escrowId: bigint) => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const tx = await confirmEscrow(escrowId);
      console.log("Escrow acceptance transaction:", tx);
      setSuccess(
        "Escrow accepted successfully! Transaction is being processed."
      );

      // Refetch data after successful action
      refetchBuyerEscrows();
      refetchSellerEscrows();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error accepting escrow:", err);
      setError("Failed to accept escrow. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle escrow rejection
  const handleRejectEscrow = async (escrowId: bigint) => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const tx = await rejectEscrow(escrowId, "Rejected by seller");
      console.log("Escrow rejection transaction:", tx);
      setSuccess(
        "Escrow rejected successfully! Transaction is being processed."
      );

      // Refetch data after successful action
      refetchBuyerEscrows();
      refetchSellerEscrows();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error rejecting escrow:", err);
      setError("Failed to reject escrow. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle escrow cancellation
  const handleCancelEscrow = async (escrowId: bigint) => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const tx = await cancelEscrow(escrowId);
      console.log("Escrow cancellation transaction:", tx);
      setSuccess(
        "Escrow cancelled successfully! Transaction is being processed."
      );

      // Refetch data after successful action
      refetchBuyerEscrows();
      refetchSellerEscrows();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error cancelling escrow:", err);
      setError("Failed to cancel escrow. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Manually refresh escrow data
  const handleRefresh = () => {
    setLoading(true);
    refetchBuyerEscrows();
    refetchSellerEscrows();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Escrow card component
  const EscrowCard = ({
    escrow,
    isSeller,
  }: {
    escrow: Escrow;
    isSeller: boolean;
  }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {escrow.product?.name || `Product #${escrow.product?.id}`}
          </h3>
          <p className="text-gray-600">
            {escrow.product?.description || "No description available"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Escrow ID: {escrow.id.toString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {escrow.isToken ? "Token Exchange" : "Purchase"}
          </p>
          <p className="text-sm font-medium">
            Quantity: {escrow.quantity?.toString() || "0"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        {!escrow.isExchange ? (
          <p className="text-lg font-medium">
            {!escrow.isToken
              ? `${formatEther(escrow.amount || 0n)} ETH`
              : `${formatEther(escrow.amount || 0n)} THRIFT`}
          </p>
        ) : (
          <div>
            <p className="text-sm">
              Exchange Product ID: {escrow.exchangeProduct?.toString() || "N/A"}
            </p>
            {escrow.tokenTopUp > 0n && (
              <p className="text-sm">
                Top-up: {formatEther(escrow.tokenTopUp)} THRIFT
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isSeller &&
          !escrow.sellerConfirmed &&
          !escrow.completed &&
          !escrow.refunded && (
            <>
              <button
                onClick={() => handleAcceptEscrow(escrow.id)}
                disabled={processing}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => handleRejectEscrow(escrow.id)}
                disabled={processing}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

        {!isSeller &&
          !escrow.buyerConfirmed &&
          !escrow.completed &&
          !escrow.refunded && (
            <>
              <button
                onClick={() => handleAcceptEscrow(escrow.id)}
                disabled={processing}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
              <button
                onClick={() => handleCancelEscrow(escrow.id)}
                disabled={processing}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}

        {escrow.completed && (
          <div className="text-green-600 font-medium flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Completed
          </div>
        )}

        {escrow.refunded && (
          <div className="text-red-600 font-medium flex items-center">
            <X className="w-4 h-4 mr-1" />
            Cancelled/Rejected
          </div>
        )}

        {!escrow.completed && !escrow.refunded && (
          <div className="text-blue-600 font-medium">
            {escrow.buyerConfirmed ? "Buyer Confirmed" : "Awaiting Buyer"}
            {" • "}
            {escrow.sellerConfirmed ? "Seller Confirmed" : "Awaiting Seller"}
          </div>
        )}
      </div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Escrow Management</h2>
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-8 rounded-lg">
            <p className="text-lg">
              Please connect your wallet to view your escrows.
            </p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || isBuyerLoading || isSellerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-600">Loading escrow data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            disabled={processing}
          >
            <RefreshCw
              className={`w-4 h-4 ${processing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Debug Information */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <p className="text-sm mb-1">Wallet Address: {address}</p>
          <p className="text-sm mb-1">
            Buyer Escrow IDs:{" "}
            {Array.isArray(buyerEscrowIds)
              ? buyerEscrowIds.map((id) => id.toString()).join(", ") || "None"
              : "None"}
          </p>
          <p className="text-sm">
            Seller Escrow IDs:{" "}
            {Array.isArray(sellerEscrowIds)
              ? sellerEscrowIds.map((id) => id.toString()).join(", ") || "None"
              : "None"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buyer Escrows */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              My Purchase/Exchange Requests
            </h2>
            {!Array.isArray(buyerEscrowIds) || buyerEscrowIds.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No active escrows as buyer</p>
              </div>
            ) : buyerEscrows.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Loading escrow details...</p>
              </div>
            ) : (
              buyerEscrows.map((escrow) => (
                <EscrowCard
                  key={escrow.id.toString()}
                  escrow={escrow}
                  isSeller={false}
                />
              ))
            )}
          </div>

          {/* Seller Escrows */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Received Requests</h2>
            {!Array.isArray(sellerEscrowIds) || sellerEscrowIds.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No active escrows as seller</p>
              </div>
            ) : sellerEscrows.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Loading escrow details...</p>
              </div>
            ) : (
              sellerEscrows.map((escrow) => (
                <EscrowCard
                  key={escrow.id.toString()}
                  escrow={escrow}
                  isSeller={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscrowPage;
