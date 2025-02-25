"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
// import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { formatEther, type Address } from "viem";
import { Escrow, EscrowStatus, EscrowType } from "@/types/escrow";
import { RefreshCw, Check, X } from "lucide-react";
import {
  useGetUserActiveEscrowsAsBuyer,
  useGetUserActiveEscrowsAsSeller,
  useEscrowActions,
} from "@/blockchain/hooks/useMarketplace";

const EscrowPage = () => {
  const { address } = useAccount();
  const { data: buyerEscrowsData } = useGetUserActiveEscrowsAsBuyer(
    address as Address
  );
  const { data: sellerEscrowsData } = useGetUserActiveEscrowsAsSeller(
    address as Address
  );
  const { confirmEscrow, rejectEscrow, cancelEscrow } = useEscrowActions();

  const [buyerEscrows, setBuyerEscrows] = useState<Escrow[]>([]);
  const [sellerEscrows, setSellerEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update escrows when data is loaded
  useEffect(() => {
    if (buyerEscrowsData) {
      setBuyerEscrows(buyerEscrowsData as Escrow[]);
    }
    if (sellerEscrowsData) {
      setSellerEscrows(sellerEscrowsData as Escrow[]);
      setLoading(false);
    }
  }, [buyerEscrowsData, sellerEscrowsData]);

  const handleAcceptEscrow = async (escrowId: bigint) => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      await confirmEscrow(escrowId);
      setSuccess("Escrow accepted successfully!");
    } catch {
      setError(error || "Failed to accept escrow");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectEscrow = async (escrowId: bigint) => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      await rejectEscrow(escrowId, "Rejected by seller"); // Added reason parameter
      setSuccess("Escrow rejected successfully!");
    } catch {
      setError(error || "Failed to reject escrow");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelEscrow = async (escrowId: bigint) => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      await cancelEscrow(escrowId);
      setSuccess("Escrow cancelled successfully!");
    } catch {
      setError(error || "Failed to cancel escrow");
    } finally {
      setProcessing(false);
    }
  };

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
          <h3 className="text-lg font-semibold">{escrow.product.name}</h3>
          <p className="text-gray-600">{escrow.product.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {escrow.escrowType === EscrowType.PURCHASE
              ? "Purchase"
              : "Exchange"}
          </p>
          <p className="text-sm font-medium">
            Quantity: {escrow.quantity.toString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        {escrow.escrowType === EscrowType.PURCHASE ? (
          <p className="text-lg font-medium">
            {escrow.paymentType === "ETH"
              ? `${formatEther(escrow.ethValue || 0n)} ETH`
              : `${formatEther(escrow.tokenValue || 0n)} THRIFT`}
          </p>
        ) : (
          <div>
            <p className="text-sm">
              Exchange Product: {escrow.exchangeProduct?.name}
            </p>
            {escrow.tokenTopUp > 0n && (
              <p className="text-sm">
                Top-up: {formatEther(escrow.tokenTopUp)} THRIFT
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isSeller && escrow.status === EscrowStatus.PENDING && (
          <>
            <button
              onClick={() => handleAcceptEscrow(escrow.id)}
              disabled={processing}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => handleRejectEscrow(escrow.id)}
              disabled={processing}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </>
        )}

        {escrow.status === EscrowStatus.ACCEPTED && (
          <button
            onClick={() => handleCancelEscrow(escrow.id)}
            disabled={processing}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buyer Escrows */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              My Purchase/Exchange Requests
            </h2>
            {buyerEscrows.length === 0 ? (
              <p className="text-gray-500">No active escrows as buyer</p>
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
            {sellerEscrows.length === 0 ? (
              <p className="text-gray-500">No active escrows as seller</p>
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
