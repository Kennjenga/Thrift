"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  useContractOwnership,
  useCreatorManagement,
} from "@/blockchain/hooks/useDonationCenter";
import { type Address } from "viem";
import { useReadContract } from "wagmi";
import {
  DONATION_AND_RECYCLING_ABI,
  DONATION_AND_RECYCLING_ADDRESS,
} from "@/blockchain/abis/thrift";
import { motion } from "framer-motion";
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  UserPlus, 
  UserMinus, 
  ShieldAlert,
  Lock,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
  input: `
    w-full
    bg-purple-900/20
    backdrop-blur-md
    border border-purple-500/20
    rounded-lg
    p-3
    text-white
    placeholder-white/40
    focus:outline-none
    focus:border-[#00FFD1]
    focus:ring-1
    focus:ring-[#00FFD1]
    transition-all
    duration-300
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

const AdminCreatorManagementPage: React.FC = () => {
  const { address: userAddress } = useAccount();
  const { owner } = useContractOwnership();
  const { approveCreator, revokeCreator } = useCreatorManagement();

  const [newCreatorAddress, setNewCreatorAddress] = useState<string>("");
  const [revokeCreatorAddress, setRevokeCreatorAddress] = useState<string>("");
  const [isSubmittingApprove, setIsSubmittingApprove] =
    useState<boolean>(false);
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState<boolean>(false);
  const [creators, setCreators] = useState<Address[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // For checking creator status from input fields
  const [addressToCheck, setAddressToCheck] = useState<Address | null>(null);

  // Use the read contract hook at component level for checking creator status
  const { data: isAddressCreator } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: "approvedCreators",
    args: addressToCheck ? [addressToCheck] : undefined,
    query: { enabled: Boolean(addressToCheck) },
  });

  const creatorsPerPage = 12;
  const isAdmin =
    userAddress && owner && userAddress.toLowerCase() === owner.toLowerCase();

  // Function to format wallet addresses for display
  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Use contract hook to get approved creators list
  const { data: approvedCreatorsList, refetch: refetchCreators } =
    useReadContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: "getApprovedCreators", // This function name should match your actual contract
    });

  console.log("creator list", approvedCreatorsList);

  // Function to fetch creators - memoized with useCallback
  const fetchCreators = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await refetchCreators();

      if (Array.isArray(approvedCreatorsList)) {
        setCreators(approvedCreatorsList as Address[]);
      } else if (approvedCreatorsList) {
        // Handle case where result exists but is not an array
        console.warn(
          "Creator list is not in expected format:",
          approvedCreatorsList
        );
        setCreators([]);
      } else {
        // If no data, empty array
        setCreators([]);
      }
    } catch (err) {
      console.error("Error fetching creators:", err);
      setError("Failed to load creators. Please try again later.");
      setCreators([]);
    } finally {
      setIsLoading(false);
    }
  }, [approvedCreatorsList, refetchCreators]);

  // Check if an address is a creator
  const checkIfCreator = async (address: string): Promise<boolean> => {
    try {
      setAddressToCheck(address as Address);
      // Return result from the last check
      return Boolean(isAddressCreator);
    } catch (err) {
      console.error("Error checking if address is creator:", err);
      return false;
    }
  };

  // Set creators when data is available
  useEffect(() => {
    if (approvedCreatorsList && Array.isArray(approvedCreatorsList)) {
      setCreators(approvedCreatorsList as Address[]);
      setIsLoading(false);
    }
  }, [approvedCreatorsList]);

  // Initial fetch on component mount
  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      refetchCreators().catch((err) => {
        console.error("Error fetching creators:", err);
        setError("Failed to load creators. Please try again later.");
        setIsLoading(false);
      });
    }
  }, [isAdmin, refetchCreators]);

  // Handle approving a new creator
  const handleApproveCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCreatorAddress) {
      setError("Please enter a valid address");
      return;
    }

    setIsSubmittingApprove(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(newCreatorAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Set address to check
      setAddressToCheck(newCreatorAddress as Address);

      // Wait for the next render to get updated isAddressCreator
      setTimeout(async () => {
        // Check if already a creator
        if (isAddressCreator) {
          setError("This address is already a creator");
          setIsSubmittingApprove(false);
          return;
        }

        try {
          // Approve creator
          await approveCreator(newCreatorAddress as Address);

          setSuccessMessage(
            `Creator role granted to ${formatAddress(newCreatorAddress)}`
          );
          setNewCreatorAddress("");

          // Refresh the creators list
          await fetchCreators();
        } catch (err: unknown) {
          console.error("Error approving creator:", err);
          setError(
            (err as Error).message ||
              "Failed to approve creator. Please try again."
          );
        } finally {
          setIsSubmittingApprove(false);
        }
      }, 500);
    } catch (err: unknown) {
      console.error("Error in validation:", err);
      setError((err as Error).message || "Invalid address format");
      setIsSubmittingApprove(false);
    }
  };

  // Handle revoking a creator
  const handleRevokeCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!revokeCreatorAddress) {
      setError("Please enter a valid address");
      return;
    }

    setIsSubmittingRevoke(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(revokeCreatorAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Set address to check
      setAddressToCheck(revokeCreatorAddress as Address);

      // Wait for the next render to get updated isAddressCreator
      setTimeout(async () => {
        // Check if actually a creator
        if (!isAddressCreator) {
          setError("This address is not a creator");
          setIsSubmittingRevoke(false);
          return;
        }

        try {
          // Revoke creator
          await revokeCreator(revokeCreatorAddress as Address);

          setSuccessMessage(
            `Creator role revoked from ${formatAddress(revokeCreatorAddress)}`
          );
          setRevokeCreatorAddress("");

          // Refresh the creators list
          await fetchCreators();
        } catch (err: unknown) {
          console.error("Error revoking creator:", err);
          setError(
            (err as Error).message ||
              "Failed to revoke creator. Please try again."
          );
        } finally {
          setIsSubmittingRevoke(false);
        }
      }, 500);
    } catch (err: unknown) {
      console.error("Error in validation:", err);
      setError((err as Error).message || "Invalid address format");
      setIsSubmittingRevoke(false);
    }
  };

  // Handle direct revoke from list
  const handleRevokeFromList = async (address: Address) => {
    setIsSubmittingRevoke(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await revokeCreator(address);
      setSuccessMessage(
        `Creator role revoked from ${formatAddress(address.toString())}`
      );

      // Refresh the creators list
      await fetchCreators();
    } catch (err: unknown) {
      console.error("Error revoking creator:", err);
      setError(
        (err as Error).message || "Failed to revoke creator. Please try again."
      );
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  // Calculate pagination
  const indexOfLastCreator = currentPage * creatorsPerPage;
  const indexOfFirstCreator = indexOfLastCreator - creatorsPerPage;
  const currentCreators = creators.slice(
    indexOfFirstCreator,
    indexOfLastCreator
  );
  const totalPages = Math.ceil(creators.length / creatorsPerPage);

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className={`min-h-screen ${styles.backgroundGradient}`}>
        <BackgroundElements />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <motion.h1 
            className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#00FFD1] via-white to-[#FF00FF] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Admin Creator Management
          </motion.h1>
          
          <motion.div 
            className={`${styles.glassCard} p-8`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-center flex-col py-12">
              <motion.div
                className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Lock className="w-12 h-12 text-[#FF1B6B]" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Access Denied
              </h2>
              <p className="text-white/70 text-center max-w-md">
                You need to be the contract owner to access this page. Please
                connect with the admin account to manage creators.
              </p>
              
              <motion.div 
                className="mt-8 p-4 backdrop-blur-md bg-purple-900/30 border border-purple-500/20 rounded-lg text-white/60 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-start">
                  <ShieldAlert className="w-5 h-5 text-[#FF00FF] mr-3 mt-0.5 flex-shrink-0" />
                  <p>
                    This administrative interface is restricted to authorized personnel only. 
                    If you believe you should have access, please verify you are connected with 
                    the correct wallet address.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.backgroundGradient}`}>
      <BackgroundElements />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <motion.h1 
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#00FFD1] via-white to-[#FF00FF] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Admin Creator Management
        </motion.h1>

        {/* Alert Messages */}
        {error && (
          <motion.div
            className="backdrop-blur-md bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            className="backdrop-blur-md bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Grant Creator Role */}
          <motion.div 
            className={`${styles.glassCard} p-6`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-[#00FFD1]/20 flex items-center justify-center mr-3">
                <UserPlus className="h-5 w-5 text-[#00FFD1]" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Grant Creator Role
              </h2>
            </div>
            
            <form onSubmit={handleApproveCreator}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newCreatorAddress}
                  onChange={(e) => setNewCreatorAddress(e.target.value)}
                  placeholder="0x..."
                  className={styles.input}
                  disabled={isSubmittingApprove}
                />
              </div>
              <motion.button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium flex justify-center items-center
                  ${isSubmittingApprove
                    ? "bg-green-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#00FFD1] to-[#00E6BD] text-[#1A0B3B] hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]"
                  } transition-all duration-300`}
                disabled={isSubmittingApprove}
                whileHover={!isSubmittingApprove ? { scale: 1.02 } : {}}
                whileTap={!isSubmittingApprove ? { scale: 0.98 } : {}}
              >
                {isSubmittingApprove ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Grant Creator Role
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Revoke Creator Role */}
          <motion.div 
            className={`${styles.glassCard} p-6`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FF1B6B]/20 flex items-center justify-center mr-3">
                <UserMinus className="h-5 w-5 text-[#FF1B6B]" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Revoke Creator Role
              </h2>
            </div>
            
            <form onSubmit={handleRevokeCreator}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={revokeCreatorAddress}
                  onChange={(e) => setRevokeCreatorAddress(e.target.value)}
                  placeholder="0x..."
                  className={styles.input}
                  disabled={isSubmittingRevoke}
                />
              </div>
              <motion.button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium flex justify-center items-center
                  ${isSubmittingRevoke
                    ? "bg-red-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#FF1B6B] to-[#FF5E86] text-white hover:shadow-[0_0_15px_rgba(255,27,107,0.4)]"
                  } transition-all duration-300`}
                disabled={isSubmittingRevoke}
                whileHover={!isSubmittingRevoke ? { scale: 1.02 } : {}}
                whileTap={!isSubmittingRevoke ? { scale: 0.98 } : {}}
              >
                {isSubmittingRevoke ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserMinus className="h-5 w-5 mr-2" />
                    Revoke Creator Role
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Admin Information Card */}
        <motion.div 
          className={`${styles.glassCard} p-6 mb-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7B42FF]/20 flex items-center justify-center mr-3">
              <ShieldAlert className="h-5 w-5 text-[#7B42FF]" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Admin Information
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="backdrop-blur-md bg-purple-900/30 border border-purple-500/20 rounded-lg p-4">
              <p className="text-white/80">
                <span className="text-[#00FFD1] font-medium">Creator Role:</span> Creators can establish donation centers and manage donations. Grant this role to trusted individuals only.
              </p>
            </div>
            
            <div className="backdrop-blur-md bg-purple-900/30 border border-purple-500/20 rounded-lg p-4">
              <p className="text-white/80">
                <span className="text-[#00FFD1] font-medium">Admin Account:</span> You are currently connected as the contract owner with address: <span className="font-mono text-[#FF00FF]">{formatAddress(userAddress || "")}</span>
              </p>
            </div>
            
            <div className="backdrop-blur-md bg-purple-900/30 border border-purple-500/20 rounded-lg p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-white/80">
                Administrative actions are recorded on the blockchain and cannot be reversed. Please verify all addresses before granting or revoking creator roles.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Creators List */}
        <motion.div 
          className={`${styles.glassCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#FF00FF]/20 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-[#FF00FF]" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Current Creators
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-[#00FFD1]/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full bg-[#00FFD1]/40 animate-pulse"></div>
                <Loader2 className="h-16 w-16 animate-spin text-[#00FFD1] relative z-10" />
              </div>
              <p className="mt-4 text-white/60">Loading creators...</p>
            </div>
          ) : creators.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-500/10">
                  <thead className="bg-purple-900/30">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {currentCreators.map((creator, index) => (
                      <motion.tr 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-purple-500/10"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-white">
                              {formatAddress(creator.toString())}
                              <span className="text-xs text-white/50 ml-2 font-mono">
                                ({creator})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <motion.button
                            onClick={() => handleRevokeFromList(creator)}
                            className="text-[#FF1B6B] hover:text-[#FF5E86] bg-[#FF1B6B]/10 hover:bg-[#FF1B6B]/20 px-3 py-1 rounded-lg flex items-center ml-auto"
                            disabled={isSubmittingRevoke}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isSubmittingRevoke ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserMinus className="h-4 w-4 mr-1" />
                                Revoke
                              </>
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-6 border-t border-purple-500/10">
                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      currentPage === 1
                        ? "bg-purple-900/20 text-white/40 cursor-not-allowed"
                        : "bg-purple-900/30 text-white hover:bg-purple-900/50"
                    }`}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </motion.button>
                  <span className="text-sm text-white/70">
                    Page {currentPage} of {totalPages}
                  </span>
                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      currentPage === totalPages
                        ? "bg-purple-900/20 text-white/40 cursor-not-allowed"
                        : "bg-purple-900/30 text-white hover:bg-purple-900/50"
                    }`}
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <motion.div 
                className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="h-10 w-10 text-white/30" />
              </motion.div>
              <h3 className="text-xl font-medium text-white mb-2">
                No creators found
              </h3>
              <p className="text-white/60 max-w-md mx-auto">
                There are currently no approved creators in the system. Use the form above to grant creator roles.
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Refresh Button */}
        <motion.div 
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.button
            onClick={() => fetchCreators()}
            className="bg-purple-900/30 hover:bg-purple-900/50 text-white/80 hover:text-white px-6 py-3 rounded-lg flex items-center border border-purple-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh Creator List
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCreatorManagementPage;