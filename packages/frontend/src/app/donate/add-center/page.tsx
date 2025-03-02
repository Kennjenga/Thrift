"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  useDonationAndRecycling,
  useDonationCenterManagement,
} from "@/blockchain/hooks/useDonationCenter"; // Updated import path
import { motion } from "framer-motion";
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  FileText, 
  Building2, 
  Recycle,
  Shirt,
  Coins,
  ArrowLeft,
  Lock,
  PlusCircle
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
  checkbox: `
    h-5 w-5
    rounded
    border-purple-500/30
    bg-purple-900/20
    text-[#00FFD1]
    focus:ring-[#00FFD1]
    focus:ring-offset-0
    focus:ring-offset-transparent
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

// Center form state type
type CenterForm = {
  name: string;
  description: string;
  location: string;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
  isDonation: boolean;
};

const AddDonationCenterPage: React.FC = () => {
  const router = useRouter();
  const { isCreator } = useDonationAndRecycling();
  const { addDonationCenter } = useDonationCenterManagement();

  const [centerForm, setCenterForm] = useState<CenterForm>({
    name: "",
    description: "",
    location: "",
    acceptsTokens: true,
    acceptsRecycling: true,
    isDonation: true, // Default to true for donation centers
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Use the transaction receipt hook at top level
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Use effect to redirect after successful transaction
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/donate");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Call the contract function
      const result = await addDonationCenter(
        centerForm.name,
        centerForm.description,
        centerForm.location,
        centerForm.acceptsTokens,
        centerForm.acceptsRecycling,
        centerForm.isDonation
      );

      setIsSubmitting(false);
      setTransactionPending(true);

      // Only set txHash if we actually got a hash back (might be void)
      if (result !== undefined && typeof result === "string") {
        setTxHash(result as `0x${string}`);
      } else {
        console.log("Transaction submitted without returning a hash");
        // Still show pending state and redirect after a delay
        setTimeout(() => {
          router.push("/donate");
        }, 3000);
      }
    } catch (err) {
      setError("Failed to create donation center. Please try again.");
      console.error(err);
      setIsSubmitting(false);
      setTransactionPending(false);
    }
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setCenterForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isCreator) {
    return (
      <div className={`min-h-screen ${styles.backgroundGradient}`}>
        <BackgroundElements />
        <div className="relative z-10 max-w-md mx-auto px-4 py-12">
          <motion.h1 
            className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#00FFD1] via-white to-[#FF00FF] bg-clip-text text-transparent text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Add Donation Center
          </motion.h1>
          
          <motion.div 
            className={`${styles.glassCard} p-8`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-center flex-col py-8">
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
              <p className="text-white/70 text-center mb-8">
                You need creator permissions to add donation centers.
              </p>
              
              <motion.button
                onClick={() => router.push("/donate")}
                className="bg-gradient-to-r from-[#7B42FF] to-[#8A2BE2] text-white px-6 py-3 rounded-lg flex items-center hover:shadow-[0_0_15px_rgba(123,66,255,0.4)] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Centers
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.backgroundGradient}`}>
      <BackgroundElements />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <motion.h1 
          className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#00FFD1] via-white to-[#FF00FF] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Add New Donation Center
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className={`${styles.glassCard} p-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <label className="flex items-center text-sm font-medium text-white/80 mb-2">
                <Building2 className="h-4 w-4 mr-2 text-[#00FFD1]" />
                Center Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={centerForm.name}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className={styles.input}
                placeholder="Enter center name"
              />
            </div>

            {/* Description field */}
            <div>
              <label className="flex items-center text-sm font-medium text-white/80 mb-2">
                <FileText className="h-4 w-4 mr-2 text-[#00FFD1]" />
                Description
              </label>
              <textarea
                name="description"
                required
                value={centerForm.description}
                onChange={handleChange}
                rows={3}
                disabled={isSubmitting || transactionPending || isConfirming}
                className={styles.input}
                placeholder="Describe your donation center"
              />
            </div>

            {/* Location field */}
            <div>
              <label className="flex items-center text-sm font-medium text-white/80 mb-2">
                <MapPin className="h-4 w-4 mr-2 text-[#00FFD1]" />
                Location
              </label>
              <input
                type="text"
                name="location"
                required
                value={centerForm.location}
                onChange={handleChange}
                disabled={isSubmitting || transactionPending || isConfirming}
                className={styles.input}
                placeholder="Enter physical location"
              />
            </div>

            <div className="pt-4 border-t border-purple-500/20">
              <h3 className="text-white font-medium mb-4">Donation Types Accepted</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* IsDonation checkbox */}
                <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 flex items-center">
                  <input
                    type="checkbox"
                    id="isDonation"
                    name="isDonation"
                    checked={centerForm.isDonation}
                    onChange={handleChange}
                    disabled={isSubmitting || transactionPending || isConfirming}
                    className={styles.checkbox}
                  />
                  <label htmlFor="isDonation" className="ml-3 flex items-center text-white/90">
                    <Shirt className="h-5 w-5 mr-2 text-[#FF00FF]" />
                    Clothing Donations
                  </label>
                </div>

                {/* Accepts tokens checkbox */}
                <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 flex items-center">
                  <input
                    type="checkbox"
                    id="acceptsTokens"
                    name="acceptsTokens"
                    checked={centerForm.acceptsTokens}
                    onChange={handleChange}
                    disabled={isSubmitting || transactionPending || isConfirming}
                    className={styles.checkbox}
                  />
                  <label htmlFor="acceptsTokens" className="ml-3 flex items-center text-white/90">
                    <Coins className="h-5 w-5 mr-2 text-[#FFD700]" />
                    Token Donations
                  </label>
                </div>

                {/* Accepts recycling checkbox */}
                <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 flex items-center">
                  <input
                    type="checkbox"
                    id="acceptsRecycling"
                    name="acceptsRecycling"
                    checked={centerForm.acceptsRecycling}
                    onChange={handleChange}
                    disabled={isSubmitting || transactionPending || isConfirming}
                    className={styles.checkbox}
                  />
                  <label htmlFor="acceptsRecycling" className="ml-3 flex items-center text-white/90">
                    <Recycle className="h-5 w-5 mr-2 text-[#00FFD1]" />
                    Recycling
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                className="backdrop-blur-md bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {(transactionPending || isConfirming) && (
              <motion.div
                className="backdrop-blur-md bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mr-3 relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                  <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                </div>
                <span>
                  {isSuccess
                    ? "Success! Redirecting..."
                    : "Transaction pending, please wait..."}
                </span>
              </motion.div>
            )}

            {isSuccess && (
              <motion.div
                className="backdrop-blur-md bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle className="h-5 w-5 mr-3" />
                <span>Donation center created successfully!</span>
              </motion.div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <motion.button
                type="button"
                onClick={() => router.push("/donate")}
                disabled={isSubmitting || transactionPending || isConfirming}
                className={`px-5 py-2.5 rounded-lg flex items-center
                  ${isSubmitting || transactionPending || isConfirming
                    ? "bg-purple-900/20 text-white/40 cursor-not-allowed"
                    : "bg-purple-900/30 text-white hover:bg-purple-900/50 border border-purple-500/20"
                  }`}
                whileHover={!(isSubmitting || transactionPending || isConfirming) ? { scale: 1.02 } : {}}
                whileTap={!(isSubmitting || transactionPending || isConfirming) ? { scale: 0.98 } : {}}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={isSubmitting || transactionPending || isConfirming}
                className={`px-5 py-2.5 rounded-lg flex items-center
                  ${isSubmitting || transactionPending || isConfirming
                    ? "bg-[#00FFD1]/50 text-white/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#00FFD1] to-[#00FFFF] text-[#1A0B3B] hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]"
                  }`}
                whileHover={!(isSubmitting || transactionPending || isConfirming) ? { scale: 1.02 } : {}}
                whileTap={!(isSubmitting || transactionPending || isConfirming) ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Center
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.form>
        
        {/* Info Card */}
        <motion.div 
          className={`${styles.glassCard} p-6 mt-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7B42FF]/20 flex items-center justify-center mr-3">
              <AlertTriangle className="h-5 w-5 text-[#7B42FF]" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Important Information
            </h2>
          </div>
          
          <div className="space-y-3 text-white/70">
            <p>
              Creating a donation center will deploy a smart contract to the blockchain. This action cannot be undone.
            </p>
            <p>
              As the creator, you will be responsible for managing donations and maintaining the center's information.
            </p>
            <p>
              Gas fees will apply for this transaction. Ensure you have sufficient funds in your wallet.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddDonationCenterPage;