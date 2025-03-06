"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Loader2, Check, X, ArrowLeft, Settings, 
  Recycle, Gift, Package, Search, Filter, Heart, 
  ArrowRight, Clock, Repeat, AlertCircle, ToggleRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatEther } from "ethers";
import {
  useGetDonationCenter,
  useDonationCenterManagement,
} from "@/blockchain/hooks/useDonationCenter";

// Color System
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
    hover:transform hover:scale-[1.02]
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

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFD1]"></div>
  </div>
);

// Error Display Component
const ErrorDisplay = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="mb-6 p-4 backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-xl flex items-center"
  >
    <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
    <p className="text-red-400">{message}</p>
  </motion.div>
);

// Success Display Component
const SuccessDisplay = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="mb-6 p-4 backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-xl flex items-center"
  >
    <Check className="h-5 w-5 mr-2 text-[#00FFD1]" />
    <p className="text-[#00FFD1]">{message}</p>
  </motion.div>
);
// Form Toggle Option Component
const FormToggleOption = ({ 
  id, 
  label, 
  icon: Icon, 
  checked, 
  onChange, 
  disabled 
}: {
  id: string;
  label: string;
  icon: any;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
  >
    <div className="flex items-center space-x-3">
      <Icon className="h-5 w-5 text-[#00FFD1]" />
      <label htmlFor={id} className="text-white">{label}</label>
    </div>
    <input
      type="checkbox"
      id={id}
      name={id}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 rounded border-white/20 text-[#7B42FF] focus:ring-[#00FFD1]"
      disabled={disabled}
    />
  </motion.div>
);

// Main Edit Center Page Component
const EditCenterPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const centerId = BigInt(resolvedParams.id);
  const { address: userAddress } = useAccount();

  const { data: centerData, isLoading: isLoadingCenter } = useGetDonationCenter(centerId);
  const { updateDonationCenter } = useDonationCenterManagement();

  // Form state
  const [centerForm, setCenterForm] = useState({
    isActive: true,
    acceptsTokens: true,
    acceptsRecycling: true,
    isDonation: true,
  });

  // Transaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update form when center data loads
  useEffect(() => {
    if (centerData && Array.isArray(centerData)) {
      setCenterForm({
        isActive: Boolean(centerData[3]) ?? true,
        acceptsTokens: Boolean(centerData[4]) ?? true,
        acceptsRecycling: Boolean(centerData[5]) ?? true,
        isDonation: Boolean(centerData[6]) ?? true,
      });
    }
  }, [centerData]);

  // Check if user owns this center
  const isOwnedByUser = centerData && 
    userAddress && 
    Array.isArray(centerData) && 
    centerData[7]?.toLowerCase() === userAddress.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await updateDonationCenter(
        centerId,
        centerForm.isActive,
        centerForm.acceptsTokens,
        centerForm.acceptsRecycling,
        centerForm.isDonation
      );

      setSuccess("Center updated successfully!");
      setTimeout(() => {
        router.push(`/donate/centers/${resolvedParams.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating center:", error);
      setError(error instanceof Error ? error.message : "Failed to update center");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCenterForm(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  if (isLoadingCenter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A1B54] to-[#1A0B3B] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isOwnedByUser) {
    return (
      <div className="min-h-screen relative">
        <BackgroundElements />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${styles.glassCard} p-6`}
          >
            <h1 className="text-xl font-bold text-red-400 mb-4">
              Permission Denied
            </h1>
            <p className="text-white/70 mb-4">
              You don&apos;t have permission to edit this donation center.
            </p>
            <button
              onClick={() => router.push(`/donate/centers/${resolvedParams.id}`)}
              className="flex items-center px-4 py-2 bg-[#7B42FF] text-white rounded-lg hover:bg-[#8A2BE2] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Center
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundElements />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00FFD1] via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Edit Donation Center
          </h1>
          <p className="text-white/70">
            Manage your donation center's settings and capabilities
          </p>
        </motion.div>

        {success && <SuccessDisplay message={success} />}
        {error && <ErrorDisplay message={error} />}

        <motion.form
          onSubmit={handleSubmit}
          className={`${styles.glassCard} p-6 space-y-6`}
        >
          <div className="space-y-4">
            {[
              { id: "isActive", label: "Center is Active", icon: Settings },
              { id: "isDonation", label: "Accept Clothing Donations", icon: Gift },
              { id: "acceptsTokens", label: "Accept Token Donations", icon: ToggleRight },
              { id: "acceptsRecycling", label: "Accept Recycling", icon: Recycle },
            ].map((option) => (
              <FormToggleOption
                key={option.id}
                {...option}
                checked={centerForm[option.id as keyof typeof centerForm]}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <motion.button
              type="button"
              onClick={() => router.push(`/donate/centers/${resolvedParams.id}`)}
              className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className={`px-6 py-2 bg-gradient-to-r from-[#00FFD1] to-[#7B42FF] text-white rounded-lg
                ${isSubmitting ? 'opacity-70' : 'hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]'}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EditCenterPage;