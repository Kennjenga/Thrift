"use client";

import React, { useState, useEffect } from "react";
import { useThriftToken } from "@/blockchain/hooks/useThriftToken";
import { Address } from "viem";
import {
  parseTokenAmount,
  formatTokenAmount,
  formatNumber,
} from "@/utils/token-utils";

export default function ThriftTokenPage() {
  const {
    totalSupply,
    currentCap,
    tokenPrice,
    rewardPoolAllocation,
    userAddress,
    useGetBalance,
    useGetAllowance,
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
  const { data: balance } = useGetBalance(userAddress as Address);

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Thrift Token Management</h1>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Token Information */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="text-gray-600 font-semibold">Balance</h2>
          <p className="text-2xl">{formatTokenAmount(balance || BigInt(0))}</p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="text-gray-600 font-semibold">Token Price</h2>
          <p className="text-2xl">
            {formatTokenAmount(tokenPrice || BigInt(0))}
          </p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="text-gray-600 font-semibold">Total Supply</h2>
          <p className="text-2xl">
            {formatTokenAmount(totalSupply || BigInt(0))}
          </p>
        </div>
        <div className="p-4 border rounded bg-white shadow">
          <h2 className="text-gray-600 font-semibold">Current Cap</h2>
          <p className="text-2xl">
            {formatTokenAmount(currentCap || BigInt(0))}
          </p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Buy Tokens */}
        <div className="p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Buy Tokens</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Amount in ETH"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleBuyTokens}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Buy Tokens"}
            </button>
          </div>
        </div>

        {/* Transfer Tokens */}
        <div className="p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Transfer Tokens</h2>
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
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Amount"
              value={transferData.amount}
              onChange={(e) =>
                setTransferData({ ...transferData, amount: e.target.value })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleTransfer}
              disabled={loading}
              className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Transfer"}
            </button>
          </div>
        </div>

        {/* Approve Tokens */}
        <div className="p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Approve Tokens</h2>
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
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Amount"
              value={approveData.amount}
              onChange={(e) =>
                setApproveData({ ...approveData, amount: e.target.value })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleApprove}
              disabled={loading}
              className="w-full bg-purple-500 text-white p-3 rounded hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Approve"}
            </button>
          </div>
        </div>

        {/* Burn Tokens */}
        <div className="p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Burn Tokens</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Amount to Burn"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleBurn}
              disabled={loading}
              className="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Burn"}
            </button>
          </div>
        </div>

        {/* Set Token Price (Admin Only) */}
        <div className="p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">
            Set Token Price (Admin)
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="New Token Price"
              value={newTokenPrice}
              onChange={(e) => setNewTokenPrice(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleSetTokenPrice}
              disabled={loading}
              className="w-full bg-teal-500 text-white p-3 rounded hover:bg-teal-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Update Price"}
            </button>
          </div>
        </div>

        {/* Set Token Cap (Admin Only) */}
        <div className="p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Set Token Cap (Admin)</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="New Token Cap"
              value={newCap}
              onChange={(e) => setNewCap(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleSetCap}
              disabled={loading}
              className="w-full bg-orange-500 text-white p-3 rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Set Cap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
