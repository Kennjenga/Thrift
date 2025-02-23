"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useEscrow } from "@/blockchain/hooks/useEscrow";
import { EscrowCard } from "./_components/escrowCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const EscrowPage = () => {
  const { address } = useAccount();
  const {
    escrows,
    loading,
    isInitializing,
    handleConfirm,
    handleRefund,
    getEscrowStatus,
    getUserRole,
    canConfirm,
    canRefund,
  } = useEscrow();

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A0B3B] text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-white/60">
            Please connect your wallet to view escrows
          </p>
        </motion.div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A0B3B] text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-white/60">Loading escrows...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A0B3B] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold">Escrow Dashboard</h1>
          <div className="text-white/60">Total Escrows: {escrows.length}</div>
        </motion.div>

        {escrows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-[rgba(123,66,255,0.1)] rounded-xl border border-[rgba(123,66,255,0.25)]"
          >
            <p className="text-white/60">No escrows found</p>
            <p className="text-sm text-white/40 mt-2">
              Escrows will appear here when you make a purchase or receive an
              exchange offer
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {escrows.map((escrow) => (
              <EscrowCard
                key={escrow.escrowId.toString()}
                escrow={escrow}
                status={getEscrowStatus(escrow)}
                role={getUserRole(escrow)}
                canConfirm={canConfirm(escrow)}
                canRefund={canRefund(escrow)}
                isLoading={loading[escrow.escrowId.toString()]}
                onConfirm={handleConfirm}
                onRefund={handleRefund}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EscrowPage;
