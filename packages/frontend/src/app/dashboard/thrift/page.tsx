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
  Heart,
  Zap,
  Shield,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState("operations"); // "operations" or "admin"

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
    <div className="min-h-screen text-white overflow-hidden relative backdrop-blur-md bg-transparent">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7B42FF] rounded-full filter blur-[200px] opacity-[0.07] animate-pulse" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00FFFF] rounded-full filter blur-[200px] opacity-[0.07] animate-pulse" style={{ animationDuration: '25s' }} />
        
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.03]"></div>
      </div>
      
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div 
          className="mb-16 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-4 mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B42FF] to-[#00FFFF] p-[1px]">
                <div className="w-full h-full rounded-2xl bg-transparent backdrop-blur-xl flex items-center justify-center">
                  <Coins className="w-7 h-7 text-[#00FFFF]" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#00FFFF] via-[#7B42FF] to-[#00FFFF] bg-clip-text text-transparent">
                Thrift Token
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg text-[#B4A9D6] max-w-2xl"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Manage your Thrift tokens, perform transfers, and participate in the sustainable fashion ecosystem
            </motion.p>
          </div>
          
          {/* Connected Address */}
          <motion.div 
            className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[rgba(123,66,255,0.1)] border border-[rgba(123,66,255,0.2)] backdrop-blur-md"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse"></div>
            <span className="text-sm text-[#B4A9D6]">Connected: </span>
            <span className="text-sm font-mono text-white">{userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}</span>
          </motion.div>
        </motion.div>
        
        {/* Status Messages */}
        {error && (
          <motion.div 
            className="mb-8 bg-[rgba(255,27,107,0.15)] border border-[#FF1B6B]/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="w-6 h-6 text-[#FF1B6B]" />
            <p className="text-white">{error}</p>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="mb-8 bg-[rgba(0,255,209,0.15)] border border-[#00FFFF]/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="w-6 h-6 text-[#00FFFF]" />
            <p className="text-white">{success}</p>
          </motion.div>
        )}
        
        {/* Token Stats Dashboard */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-2xl p-8 overflow-hidden relative backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Balance Card */}
              <motion.div 
                className="bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.1)] rounded-xl p-6 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#00FFFF]" />
                  </div>
                  <h3 className="text-lg font-medium text-white/70">Your Balance</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTokenAmount(balance || BigInt(0))}
                </p>
                <div className="mt-2 text-sm text-white/50">THRIFT Tokens</div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>

              {/* Token Price Card */}
              <motion.div 
                className="bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.1)] rounded-xl p-6 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#7B42FF]/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#7B42FF]" />
                  </div>
                  <h3 className="text-lg font-medium text-white/70">Token Price</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTokenAmount(tokenPrice || BigInt(0))}
                </p>
                <div className="mt-2 text-sm text-white/50">ETH per Token</div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>

              {/* Total Supply Card */}
              <motion.div 
                className="bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.1)] rounded-xl p-6 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-[#00FFFF]" />
                  </div>
                  <h3 className="text-lg font-medium text-white/70">Total Supply</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTokenAmount(totalSupply || BigInt(0))}
                </p>
                <div className="mt-2 text-sm text-white/50">Circulating Tokens</div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>

              {/* Current Cap Card */}
              <motion.div 
                className="bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.1)] rounded-xl p-6 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#7B42FF]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#7B42FF]" />
                  </div>
                  <h3 className="text-lg font-medium text-white/70">Token Cap</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatTokenAmount(currentCap || BigInt(0))}
                </p>
                <div className="mt-2 text-sm text-white/50">Maximum Supply</div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-full p-1.5 inline-flex backdrop-blur-xl">
            <motion.button
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "operations" 
                  ? "bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] text-white shadow-lg shadow-[#7B42FF]/20" 
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setActiveTab("operations")}
              whileHover={{ scale: activeTab !== "operations" ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
            >
              Token Operations
            </motion.button>
            <motion.button
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "admin" 
                  ? "bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] text-white shadow-lg shadow-[#7B42FF]/20" 
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setActiveTab("admin")}
              whileHover={{ scale: activeTab !== "admin" ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
            >
              Admin Controls
            </motion.button>
          </div>
        </div>
        
        {/* Operations Tab Content */}
        {activeTab === "operations" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Buy Tokens */}
              <motion.div 
                className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-xl p-8 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FFFF] to-[#7B42FF] p-[1px]">
                    <div className="w-full h-full rounded-xl bg-transparent backdrop-blur-xl flex items-center justify-center">
                      <Coins className="w-6 h-6 text-[#00FFFF]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Buy Tokens</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">Amount in ETH</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] transition-all duration-300 backdrop-blur-md"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-white/50">ETH</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Estimated tokens: {buyAmount ? (parseFloat(buyAmount) / parseFloat(formatTokenAmount(tokenPrice || BigInt(1)))).toFixed(4) : '0'} THRIFT</span>
                  </div>
                  
                  <motion.button
                    onClick={handleBuyTokens}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] text-white font-medium relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine effect */}
                    <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Buy Tokens"}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>

              {/* Transfer Tokens */}
              <motion.div 
                className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-xl p-8 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B42FF] to-[#00FFFF] p-[1px]">
                    <div className="w-full h-full rounded-xl bg-transparent backdrop-blur-xl flex items-center justify-center">
                      <ArrowRightLeft className="w-6 h-6 text-[#7B42FF]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Transfer Tokens</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">Recipient Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={transferData.to}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          to: e.target.value as Address,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">Amount</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={transferData.amount}
                        onChange={(e) =>
                          setTransferData({ ...transferData, amount: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-white/50">THRIFT</div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={handleTransfer}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] text-white font-medium relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine effect */}
                    <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Transfer Tokens"}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>

              {/* Approve Tokens */}
              <motion.div 
                className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-xl p-8 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B42FF] to-[#00FFFF] p-[1px]">
                    <div className="w-full h-full rounded-xl bg-transparent backdrop-blur-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-[#7B42FF]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Approve Tokens</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">Spender Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={approveData.spender}
                      onChange={(e) =>
                        setApproveData({
                          ...approveData,
                          spender: e.target.value as Address,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">Amount</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={approveData.amount}
                        onChange={(e) =>
                          setApproveData({ ...approveData, amount: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-white/50">THRIFT</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Allows the spender to use your tokens on your behalf</span>
                  </div>
                  
                  <motion.button
                    onClick={handleApprove}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] text-white font-medium relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine effect */}
                    <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Approve Tokens"}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>

              {/* Burn Tokens */}
              <motion.div 
                className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-xl p-8 overflow-hidden relative group backdrop-blur-xl"
                whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(123, 66, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B42FF] to-[#00FFFF] p-[1px]">
                    <div className="w-full h-full rounded-xl bg-transparent backdrop-blur-xl flex items-center justify-center">
                      <Flame className="w-6 h-6 text-[#00FFFF]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Burn Tokens</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">Amount to Burn</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-white/50">THRIFT</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Warning: Burned tokens are permanently removed from circulation</span>
                  </div>
                  
                  <motion.button
                    onClick={handleBurn}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] text-white font-medium relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine effect */}
                    <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Burn Tokens"}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B42FF] to-[#00FFFF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Admin Tab Content */}
        {activeTab === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-xl p-8 overflow-hidden relative backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B42FF] to-[#00FFFF] p-[1px]">
                  <div className="w-full h-full rounded-xl bg-transparent backdrop-blur-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-[#7B42FF]" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white">Admin Controls</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Set Token Price */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(123,66,255,0.1)] flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#7B42FF]" />
                    </div>
                    <h4 className="text-lg font-medium text-white">Set Token Price</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">New Token Price (in ETH)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0.0"
                        value={newTokenPrice}
                        onChange={(e) => setNewTokenPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-white/50">ETH</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Current price: {formatTokenAmount(tokenPrice || BigInt(0))} ETH</span>
                  </div>
                  
                  <motion.button
                    onClick={handleSetTokenPrice}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl bg-[rgba(123,66,255,0.1)] border border-[#7B42FF]/30 text-white font-medium relative overflow-hidden group hover:bg-[rgba(123,66,255,0.2)] transition-all duration-300 backdrop-blur-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Update Token Price"}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>

                {/* Set Token Cap */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(123,66,255,0.1)] flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#7B42FF]" />
                    </div>
                    <h4 className="text-lg font-medium text-white">Set Token Cap</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 block">New Token Cap</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0"
                        value={newCap}
                        onChange={(e) => setNewCap(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(36,20,69,0.4)] border border-[rgba(123,66,255,0.2)] text-white focus:outline-none focus:border-[#7B42FF] focus:ring-1 focus:ring-[#7B42FF] transition-all duration-300 backdrop-blur-md"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-white/50">THRIFT</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/50 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Current cap: {formatTokenAmount(currentCap || BigInt(0))} THRIFT</span>
                  </div>
                  
                  <motion.button
                    onClick={handleSetCap}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl bg-[rgba(123,66,255,0.1)] border border-[#7B42FF]/30 text-white font-medium relative overflow-hidden group hover:bg-[rgba(123,66,255,0.2)] transition-all duration-300 backdrop-blur-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Update Token Cap"}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Token Info Section */}
        <motion.section 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-[rgba(26,16,53,0.3)] border border-[rgba(123,66,255,0.15)] rounded-xl p-8 overflow-hidden relative backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] bg-clip-text text-transparent">
                  About Thrift Tokens
                </h2>
                <p className="text-white/70 max-w-2xl">
                  Thrift Tokens power the sustainable fashion ecosystem, enabling users to swap clothes, 
                  earn rewards, and participate in governance. Each token represents a stake in our 
                  community-driven platform.
                </p>
              </div>
              
              <Link href="/marketplace">
                <motion.button 
                  className="px-8 py-4 bg-gradient-to-r from-[#00FFFF] to-[#7B42FF] rounded-xl font-medium relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,209,0.4)] active:scale-95"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Marketplace
                    <Heart size={16} />
                  </span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.section>
        
      </main>
      
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: var(--tw-opacity, 1); }
          50% { opacity: calc(var(--tw-opacity, 1) * 0.6); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}