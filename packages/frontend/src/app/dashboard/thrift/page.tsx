"use client";

import React, { useState, useEffect } from "react";
import { useThriftToken } from "@/blockchain/hooks/useThriftToken";
import { Address } from "viem";
import { parseTokenAmount, formatTokenAmount } from "@/utils/token-utils";
import {
  Coins,
  ArrowRightLeft,
  Lock,
  Flame,
  Settings,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Wallet,
  CreditCard,
  BarChart,
  Target,
} from "lucide-react";

export default function ThriftTokenPage() {
  const {
    totalSupply,
    currentCap,
    tokenPrice,
    userAddress,
    useGetBalance,
    approve,
    transfer,
    buyTokens,
    burn,
    setTokenPrice,
    setCap,
  } = useThriftToken();

  // State management
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // User balance
  const { data: balance } = useGetBalance(userAddress as Address) as {
    data: bigint | undefined;
  };

  // Form states
  const [buyAmount, setBuyAmount] = useState("");
  const [transferData, setTransferData] = useState({
    to: "" as Address,
    amount: "",
  });
  const [approveData, setApproveData] = useState({
    spender: "" as Address,
    amount: "",
  });
  const [burnAmount, setBurnAmount] = useState("");
  const [newTokenPrice, setNewTokenPrice] = useState("");
  const [newCap, setNewCap] = useState("");

  // Reset messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Error handler
  const handleError = (error: Error, action: string) => {
    console.error(`${action} failed:`, error);
    setError(error?.message || `${action} failed. Please try again.`);
    setLoading(false);
  };

  // Success handler
  const handleSuccess = (message: string) => {
    setSuccess(message);
    setLoading(false);
  };

  // Buy tokens
  const handleBuyTokens = async () => {
    try {
      setLoading(true);
      const amount = parseTokenAmount(buyAmount);
      await buyTokens(amount);
      handleSuccess("Tokens purchased successfully!");
      setBuyAmount("");
    } catch (error) {
      handleError(error as Error, "Token purchase");
    }
  };

  // Transfer tokens
  const handleTransfer = async () => {
    try {
      setLoading(true);
      const amount = parseTokenAmount(transferData.amount);
      await transfer(transferData.to, amount);
      handleSuccess("Transfer completed successfully!");
      setTransferData({ to: "" as Address, amount: "" });
    } catch (error) {
      handleError(error as Error, "Transfer");
    }
  };

  // Approve tokens
  const handleApprove = async () => {
    try {
      setLoading(true);
      const amount = parseTokenAmount(approveData.amount);
      await approve(approveData.spender, amount);
      handleSuccess("Approval granted successfully!");
      setApproveData({ spender: "" as Address, amount: "" });
    } catch (error) {
      handleError(error as Error, "Approval");
    }
  };

  // Burn tokens
  const handleBurn = async () => {
    try {
      setLoading(true);
      const amount = parseTokenAmount(burnAmount);
      await burn(amount);
      handleSuccess("Tokens burned successfully!");
      setBurnAmount("");
    } catch (error) {
      handleError(error as Error, "Burn");
    }
  };

  // Set token price
  const handleSetTokenPrice = async () => {
    try {
      setLoading(true);
      await setTokenPrice(BigInt(newTokenPrice));
      handleSuccess("Token price updated successfully!");
      setNewTokenPrice("");
    } catch (error) {
      handleError(error as Error, "Price update");
    }
  };

  // Set cap
  const handleSetCap = async () => {
    try {
      setLoading(true);
      await setCap(BigInt(newCap));
      handleSuccess("Token cap updated successfully!");
      setNewCap("");
    } catch (error) {
      handleError(error as Error, "Cap update");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto hero-card p-12 rounded-3xl glass-card mb-16">
          <h1 className="text-4xl font-bold text-[#162A2C] mb-6 text-center">
            Thrift Token Management
          </h1>
          <p className="text-xl text-[#686867] text-center">
            Manage your Thrift tokens and perform various token operations
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-8 glass-card p-4 border-l-4 border-red-500 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-[#162A2C]">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-8 glass-card p-4 border-l-4 border-green-500 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <p className="text-[#162A2C]">{success}</p>
          </div>
        )}

        {/* Token Information */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-[#686867] font-semibold">Balance</h2>
            </div>
            <p className="text-2xl text-[#162A2C] font-bold">
              {formatTokenAmount(balance || BigInt(0))}
            </p>
          </div>
          <div className="glass-card p-6 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-[#686867] font-semibold">Token Price</h2>
            </div>
            <p className="text-2xl text-[#162A2C] font-bold">
              {formatTokenAmount(tokenPrice || BigInt(0))}
            </p>
          </div>
          <div className="glass-card p-6 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4">
              <BarChart className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-[#686867] font-semibold">Total Supply</h2>
            </div>
            <p className="text-2xl text-[#162A2C] font-bold">
              {formatTokenAmount(totalSupply || BigInt(0))}
            </p>
          </div>
          <div className="glass-card p-6 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-[#686867] font-semibold">Current Cap</h2>
            </div>
            <p className="text-2xl text-[#162A2C] font-bold">
              {formatTokenAmount(currentCap || BigInt(0))}
            </p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Buy Tokens */}
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Coins className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Buy Tokens
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Amount in ETH"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                onClick={handleBuyTokens}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Processing..." : "Buy Tokens"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Transfer Tokens */}
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <ArrowRightLeft className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Transfer Tokens
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient Address"
                value={transferData.to}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    to: e.target.value as Address,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Amount"
                value={transferData.amount}
                onChange={(e) =>
                  setTransferData({ ...transferData, amount: e.target.value })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="btn-glass w-full"
              >
                {loading ? "Processing..." : "Transfer"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Approve Tokens */}
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Approve Tokens
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Spender Address"
                value={approveData.spender}
                onChange={(e) =>
                  setApproveData({
                    ...approveData,
                    spender: e.target.value as Address,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Amount"
                value={approveData.amount}
                onChange={(e) =>
                  setApproveData({ ...approveData, amount: e.target.value })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                onClick={handleApprove}
                disabled={loading}
                className="btn-glass w-full"
              >
                {loading ? "Processing..." : "Approve"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Burn Tokens */}
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Burn Tokens
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Amount to Burn"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                onClick={handleBurn}
                disabled={loading}
                className="btn-danger w-full"
              >
                {loading ? "Processing..." : "Burn"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Set Token Price (Admin Only) */}
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Set Token Price (Admin)
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="New Token Price"
                value={newTokenPrice}
                onChange={(e) => setNewTokenPrice(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                onClick={handleSetTokenPrice}
                disabled={loading}
                className="btn-warning w-full"
              >
                {loading ? "Processing..." : "Update Price"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Set Token Cap (Admin Only) */}
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Set Token Cap (Admin)
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="New Token Cap"
                value={newCap}
                onChange={(e) => setNewCap(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                onClick={handleSetCap}
                disabled={loading}
                className="btn-warning w-full"
              >
                {loading ? "Processing..." : "Set Cap"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
