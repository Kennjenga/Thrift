"use client";

import React from "react";
import { useAccount } from "wagmi";
import {
  ShoppingBag,
  User,
  CircleDollarSign,
  Gift,
  Recycle,
} from "lucide-react";

// Import custom hooks
import { useDonationStatistics } from "@/blockchain/hooks/useDonationCenter";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { useThriftToken } from "@/blockchain/hooks/useThriftToken";
import { useUserAesthetics } from "@/blockchain/hooks/useUserAesthetics";

// Import types
import { type Product } from "@/types/market";

const formatTokenAmount = (amount: bigint | undefined): string => {
  if (!amount) return "0";
  return (Number(amount) / 1e18).toFixed(2);
};

export default function UserDashboard() {
  const { address, isConnected } = useAccount();

  // Use only necessary hooks
  const { userProducts, buyerEscrows, sellerEscrows } = useMarketplace();
  const { useGetBalance } = useThriftToken();
  const { userAesthetics, isSet: isAestheticsSet } = useUserAesthetics();
  const userStats = useDonationStatistics();

  // Get user balance if connected
  const { data: userBalance = 0n } = useGetBalance(
    address || "0x0000000000000000000000000000000000000000"
  );

  // Calculate user statistics
  const pendingTransactionsCount =
    ((buyerEscrows as bigint[] | undefined)?.length || 0) +
    ((sellerEscrows as bigint[] | undefined)?.length || 0);

  // Check if user has set their aesthetics
  const hasSetAesthetics =
    isAestheticsSet &&
    ((userAesthetics as string[] | undefined)?.length ?? 0) > 0;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <User className="h-16 w-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-500 mb-6 text-center">
          Connect your wallet to view your personal dashboard
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* User Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Thrift Dashboard</h1>
          <p className="text-gray-500">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 px-4 py-2 rounded-lg flex items-center">
          <CircleDollarSign className="mr-2 h-5 w-5 text-blue-500" />
          <span className="font-medium">
            {formatTokenAmount(userBalance)} THRIFT
          </span>
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Marketplace Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-5 w-5 mr-2 text-purple-500" />
            <h2 className="font-medium">Marketplace</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Listed Items</span>
              <span className="font-medium">
                {(userProducts as Product[] | undefined)?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Purchases</span>
              <span className="font-medium">
                {(buyerEscrows as bigint[] | undefined)?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sales</span>
              <span className="font-medium">
                {(sellerEscrows as bigint[] | undefined)?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Donation Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-4">
            <Gift className="h-5 w-5 mr-2 text-green-500" />
            <h2 className="font-medium">Donations</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Clothing</span>
              <span className="font-medium">
                {userStats?.totalClothingDonations || 0} items
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Recycling</span>
              <span className="font-medium">
                {userStats?.totalRecyclingWeight || 0} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Token</span>
              <span className="font-medium">
                {formatTokenAmount(userStats?.totalTokenDonations)} THRIFT
              </span>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 mr-2 text-indigo-500" />
            <h2 className="font-medium">Profile</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Aesthetics</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  hasSetAesthetics
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {hasSetAesthetics ? "Set" : "Not Set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pending Transactions</span>
              <span className="font-medium">{pendingTransactionsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rewards Earned</span>
              <span className="font-medium">
                {formatTokenAmount(userStats?.totalTokenDonations || 0n)} THRIFT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-8">
        <h2 className="font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <ShoppingBag className="h-6 w-6 text-purple-500 mb-2" />
            <span className="text-sm">My Listings</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <Gift className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-sm">Donate</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <Recycle className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-sm">Recycle</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <CircleDollarSign className="h-6 w-6 text-yellow-500 mb-2" />
            <span className="text-sm">Buy Tokens</span>
          </button>
        </div>
      </div>

      {/* Aesthetics Section (if set) */}
      {hasSetAesthetics && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h2 className="font-medium mb-3">Your Style Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {(userAesthetics as string[]).map((aesthetic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
              >
                {aesthetic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
