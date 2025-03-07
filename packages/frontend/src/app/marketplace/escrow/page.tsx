"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Escrow } from "@/types/market";
import {
  RefreshCw,
  Check,
  X,
  AlertCircle,
  ArrowRightLeft,
  ShoppingBag,
} from "lucide-react";
import {
  useEscrowData,
  useMarketplace,
} from "@/blockchain/hooks/useMarketplace";
import EcoCharacter from "@/components/eco-character";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const EscrowPage: React.FC = () => {
  const { address, isConnected } = useAccount() || {
    address: "",
    isConnected: false,
  };

  // Use the marketplace hook to get escrow-related functions
  const { confirmEscrow, rejectEscrow, cancelEscrow, refetchEscrows } =
    useMarketplace();

  // Component state
  const [buyerEscrowz, setBuyerEscrowz] = useState<bigint[]>([]);
  const [sellerEscrowz, setSellerEscrowz] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<bigint | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  console.log(refreshTrigger);

  // Get escrow data using the hook
  // Using a fixed address for development/testing - replace with actual user address in production
  const { buyerEscrows, sellerEscrows } = useEscrowData(address);

  // Update the local state arrays when the hook data changes
  useEffect(() => {
    if (buyerEscrows?.data && Array.isArray(buyerEscrows.data)) {
      setBuyerEscrowz(buyerEscrows.data);
    }

    if (sellerEscrows?.data && Array.isArray(sellerEscrows.data)) {
      setSellerEscrowz(sellerEscrows.data);
    }
  }, [buyerEscrows?.data, sellerEscrows?.data]);

  // Update loading state based on escrow data loading state
  useEffect(() => {
    const isLoading = buyerEscrows?.isLoading || sellerEscrows?.isLoading;
    setLoading(isLoading || !isConnected);
  }, [buyerEscrows?.isLoading, sellerEscrows?.isLoading, isConnected]);

  // Handle escrow acceptance
  const handleAcceptEscrow = async (escrowId: bigint) => {
    setProcessing(escrowId);
    setError("");
    setSuccess("");
    try {
      await confirmEscrow(escrowId);
      setSuccess(
        "Escrow accepted successfully! Transaction is being processed."
      );

      // Refetch data after successful action
      refetchEscrows();
      if (buyerEscrows?.refetch) buyerEscrows.refetch();
      if (sellerEscrows?.refetch) sellerEscrows.refetch();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error accepting escrow:", err);
      setError(
        (err as Error)?.message || "Failed to accept escrow. Please try again."
      );
    } finally {
      setProcessing(null);
    }
  };

  // Handle escrow rejection
  const handleRejectEscrow = async (escrowId: bigint) => {
    setProcessing(escrowId);
    setError("");
    setSuccess("");
    try {
      await rejectEscrow(escrowId, "Rejected by seller");
      setSuccess(
        "Escrow rejected successfully! Transaction is being processed."
      );

      // Refetch data after successful action
      refetchEscrows();
      if (buyerEscrows?.refetch) buyerEscrows.refetch();
      if (sellerEscrows?.refetch) sellerEscrows.refetch();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error rejecting escrow:", err);
      setError(
        (err as Error)?.message || "Failed to reject escrow. Please try again."
      );
    } finally {
      setProcessing(null);
    }
  };

  // Handle escrow cancellation
  const handleCancelEscrow = async (escrowId: bigint) => {
    setProcessing(escrowId);
    setError("");
    setSuccess("");
    try {
      await cancelEscrow(escrowId);
      setSuccess(
        "Escrow cancelled successfully! Transaction is being processed."
      );

      // Refetch data after successful action
      refetchEscrows();
      if (buyerEscrows?.refetch) buyerEscrows.refetch();
      if (sellerEscrows?.refetch) sellerEscrows.refetch();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error cancelling escrow:", err);
      setError(
        (err as Error)?.message || "Failed to cancel escrow. Please try again."
      );
    } finally {
      setProcessing(null);
    }
  };

  // Manually refresh escrow data
  const handleRefresh = () => {
    setLoading(true);
    refetchEscrows();
    if (buyerEscrows?.refetch) buyerEscrows.refetch();
    if (sellerEscrows?.refetch) sellerEscrows.refetch();
    setRefreshTrigger((prev) => prev + 1);
    setError("");
    setSuccess("");
  };

  // Get escrow status label and class
  const getStatusInfo = (escrow: Escrow) => {
    if (!escrow)
      return {
        label: "Unknown",
        class: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      };

    if (escrow.completed) {
      return {
        label: "Completed",
        class: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    }
    if (escrow.refunded) {
      return {
        label: "Cancelled/Rejected",
        class: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    }
    if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
      return {
        label: "Processing",
        class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
    }
    if (escrow.buyerConfirmed) {
      return {
        label: "Awaiting Seller",
        class: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      };
    }
    if (escrow.sellerConfirmed) {
      return {
        label: "Awaiting Buyer",
        class: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      };
    }
    return {
      label: "Pending",
      class: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
  };

  // Escrow card component that takes just an ID and handles its own data fetching
  const EscrowCardById = ({
    escrowId,
    isSeller,
  }: {
    escrowId: bigint;
    isSeller: boolean;
  }) => {
    const { useEscrowDetails, useProductDetails } = useMarketplace();
    const { escrow, isLoading: isLoadingEscrow } = useEscrowDetails(
      escrowId
    ) as { escrow: Escrow; isLoading: boolean };

    // Fetch product details once we have the escrow
    const [productId, setProductId] = useState<bigint | undefined>(undefined);

    useEffect(() => {
      if (escrow && escrow.productId) {
        setProductId(escrow.productId);
      }
    }, [escrow]);

    const { product, isLoading: isLoadingProduct } =
      useProductDetails(productId);

    const isLoading = isLoadingEscrow || isLoadingProduct;

    // Return a loading placeholder if still loading
    if (isLoading || !escrow) {
      return (
        <div className="bg-[#1A0B3B] border border-purple-500/10 rounded-xl p-6 mb-4 animate-pulse">
          <div className="h-16 bg-purple-800/20 rounded-lg mb-4"></div>
          <div className="h-4 bg-purple-800/20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-purple-800/20 rounded w-1/2"></div>
        </div>
      );
    }

    // Combine escrow with product data
    const escrowWithProduct: Escrow = {
      ...escrow,
      product: product || undefined,
      escrowId: escrow.escrowId,
      buyer: escrow.buyer,
      seller: escrow.seller,
      amount: escrow.amount,
      completed: escrow.completed,
      refunded: escrow.refunded,
      buyerConfirmed: escrow.buyerConfirmed,
      sellerConfirmed: escrow.sellerConfirmed,
      isToken: escrow.isToken,
      quantity: escrow.quantity,
      isExchange: escrow.isExchange,
      exchangeProductId: escrow.exchangeProductId,
      tokenTopUp: escrow.tokenTopUp,
    };

    // Once loaded, render the full card
    const statusInfo = getStatusInfo(escrowWithProduct);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative group overflow-hidden"
      >
        {/* Glow Effect on Hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] rounded-xl opacity-0 group-hover:opacity-50 blur-md group-hover:blur-lg transition-all duration-300" />

        <div className="bg-[#1A0B3B] border border-purple-500/10 rounded-xl p-6 mb-4 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4">
              {escrowWithProduct.product?.image && (
                <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={escrowWithProduct.product.image}
                    alt={escrowWithProduct.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-white">
                  {escrowWithProduct.product?.name ||
                    `Product #${escrowWithProduct.productId}`}
                </h3>
                <p className="text-gray-400">
                  {escrowWithProduct.product?.description?.slice(0, 60) ||
                    "No description available"}
                  {escrowWithProduct.product?.description &&
                  escrowWithProduct.product.description.length > 60
                    ? "..."
                    : ""}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Escrow ID: {escrowWithProduct.escrowId.toString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-xs px-3 py-1 rounded-full ${statusInfo.class} inline-block`}
              >
                {statusInfo.label}
              </span>
              <p className="text-sm text-gray-400 mt-2">
                {escrowWithProduct.isToken ? "THRIFT Payment" : "ETH Payment"}
              </p>
              <p className="text-sm text-gray-400">
                Quantity: {escrowWithProduct.quantity?.toString() || "0"}
              </p>
            </div>
          </div>

          <div className="mb-4">
            {!escrowWithProduct.isExchange ? (
              <p className="text-lg font-medium text-white">
                {!escrowWithProduct.isToken
                  ? `${formatEther(escrowWithProduct.amount || 0n)} ETH`
                  : `${formatEther(escrowWithProduct.amount || 0n)} THRIFT`}
              </p>
            ) : (
              <div className="bg-purple-900/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-[#00FFD1]">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="font-medium">Exchange Offer</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Exchange Product ID:{" "}
                  {escrowWithProduct.exchangeProductId?.toString() || "N/A"}
                </p>
                {escrowWithProduct.tokenTopUp > 0n && (
                  <p className="text-sm text-[#00FFD1] mt-1">
                    Top-up: {formatEther(escrowWithProduct.tokenTopUp)} THRIFT
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {isSeller &&
              !escrowWithProduct.sellerConfirmed &&
              !escrowWithProduct.completed &&
              !escrowWithProduct.refunded && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleAcceptEscrow(escrowWithProduct.escrowId)
                    }
                    disabled={processing !== null}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
                  >
                    {processing === escrowWithProduct.escrowId ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleRejectEscrow(escrowWithProduct.escrowId)
                    }
                    disabled={processing !== null}
                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    {processing === escrowWithProduct.escrowId ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Reject
                  </motion.button>
                </>
              )}

            {!isSeller &&
              !escrowWithProduct.buyerConfirmed &&
              !escrowWithProduct.completed &&
              !escrowWithProduct.refunded && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleAcceptEscrow(escrowWithProduct.escrowId)
                    }
                    disabled={processing !== null}
                    className="bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] text-[#1A0B3B] px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#00FFD1]/20"
                  >
                    {processing === escrowWithProduct.escrowId ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Confirm
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleCancelEscrow(escrowWithProduct.escrowId)
                    }
                    disabled={processing !== null}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {processing === escrowWithProduct.escrowId ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Cancel
                  </motion.button>
                </>
              )}
          </div>

          {/* Animated Progress Bar - Decorative */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
        </div>
      </motion.div>
    );
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Escrow Management
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-8"
          >
            <ShoppingBag className="w-16 h-16 mx-auto text-[#00FFD1] mb-4" />
            <p className="text-xl text-white mb-6">
              Please connect your wallet to view your escrows.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] text-[#1A0B3B] px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#00FFD1]/20"
            >
              Connect Wallet
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B]">
        <RefreshCw className="w-12 h-12 animate-spin text-[#00FFD1]" />
        <p className="mt-4 text-white text-lg">Loading escrow data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <EcoCharacter />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFD1] via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Escrow Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-[#7B42FF] text-white px-4 py-2 rounded-lg shadow-lg shadow-[#7B42FF]/20"
            disabled={processing !== null}
          >
            <RefreshCw
              className={`w-4 h-4 ${processing !== null ? "animate-spin" : ""}`}
            />
            Refresh
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center"
            >
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buyer Escrows */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">
              My Purchase/Exchange Requests
            </h2>
            {!buyerEscrowz || buyerEscrowz.length === 0 ? (
              <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6">
                <p className="text-gray-400">No active escrows as buyer</p>
              </div>
            ) : (
              buyerEscrowz.map((escrowId) => (
                <EscrowCardById
                  key={escrowId.toString()}
                  escrowId={escrowId}
                  isSeller={false}
                />
              ))
            )}
          </div>

          {/* Seller Escrows */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">
              Received Requests
            </h2>
            {!sellerEscrowz || sellerEscrowz.length === 0 ? (
              <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6">
                <p className="text-gray-400">No active escrows as seller</p>
              </div>
            ) : (
              sellerEscrowz.map((escrowId) => (
                <EscrowCardById
                  key={escrowId.toString()}
                  escrowId={escrowId}
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
