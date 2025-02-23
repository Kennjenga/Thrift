"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import EcoCharacter from "@/components/eco-character";
import { formatTokenAmount } from "@/utils/token-utils";
import { toast } from "react-hot-toast";
import { useDonationContract } from "@/blockchain/hooks/useDonationCenter"; // Updated import
import {
  Recycle,
  Package,
  Building2,
  Heart,
  FileText,
  MapPin,
  Check,
  X,
  ArrowRight,
  Search,
  AlertCircle,
} from "lucide-react";

// Define FormState type
interface FormState {
  itemCount: string;
  itemType: string;
  description: string;
  weightInKg: string;
}

type RecyclingFormState = {
  description: string;
  weightInKg: string;
};

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
  },
  glass: {
    background: "rgba(42, 27, 84, 0.2)",
    border: "rgba(123, 66, 255, 0.1)",
  },
};

// Styles
const styles = {
  gradientText: `
    bg-gradient-to-r 
    from-[${COLORS.secondary.main}] 
    via-[${COLORS.primary.main}] 
    to-[${COLORS.accent.pink}] 
    bg-clip-text 
    text-transparent 
    animate-gradient
  `,
  glassEffect: `
    backdrop-blur-lg 
    bg-[${COLORS.glass.background}] 
    border border-[${COLORS.glass.border}] 
    shadow-[0_8px_32px_${COLORS.primary.main}1A]
  `,
  input: `
    w-full px-6 py-3
    rounded-full
    border border-[${COLORS.glass.border}]
    bg-[${COLORS.glass.background}]
    text-[${COLORS.text.primary}]
    focus:outline-none focus:ring-2
    focus:ring-[${COLORS.secondary.main}]
    placeholder-[${COLORS.text.muted}]
  `,
};

// Enhanced Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[${COLORS.background.light}] to-[${COLORS.background.dark}]`}
        />

        <div
          className={`absolute top-0 right-0 w-[300px] h-[300px] bg-[${COLORS.accent.pink}] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse`}
        />
        <div
          className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-[${COLORS.primary.main}] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse`}
        />
        <div
          className={`absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[${COLORS.secondary.light}] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[${COLORS.accent.red}] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse`}
        />
      </div>
    </div>
  );
};

// Enhanced Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    className={`${styles.glassEffect} rounded-2xl ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Enhanced Button Component
const NeoButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}> = ({ children, onClick, className = "", type = "button" }) => (
  <motion.button
    type={type}
    className={`
      px-6 py-3 rounded-xl
      bg-gradient-to-r from-[${COLORS.secondary.main}] to-[${COLORS.secondary.light}]
      text-[${COLORS.background.dark}]
      font-medium
      transition-all duration-300
      hover:shadow-[0_0_20px_rgba(0,255,209,0.4)]
      ${className}
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    {children}
  </motion.button>
);

// Form Components
const DonationForm: React.FC<{ centerId: number; onClose: () => void }> = ({
  centerId,
  onClose,
}) => {
  const { submitDonation, useCalculateClothingReward } = useDonationContract();
  const [formData, setFormData] = useState<FormState>({
    itemCount: "",
    itemType: "",
    description: "",
    weightInKg: "",
  });

  const { data: estimatedReward } = useCalculateClothingReward(
    BigInt(formData.itemCount || "0"),
    BigInt(formData.weightInKg || "0")
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitDonation(
        BigInt(centerId),
        BigInt(formData.itemCount),
        formData.itemType,
        formData.description,
        BigInt(formData.weightInKg)
      );
      toast.success("Donation submitted successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit donation");
      console.error(error);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-[${COLORS.secondary.main}]/20`}>
          <Package className={`w-6 h-6 text-[${COLORS.secondary.main}]`} />
        </div>
        <div>
          <h2 className={`text-xl font-semibold ${styles.gradientText}`}>
            Register Donation
          </h2>
          <p className={`text-sm text-[${COLORS.text.secondary}]`}>
            Record your clothing donation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={STYLES.label}>Number of Items</label>
            <div className="relative">
              <input
                type="number"
                value={formData.itemCount}
                onChange={(e) =>
                  setFormData({ ...formData, itemCount: e.target.value })
                }
                className={STYLES.input}
                placeholder="Enter quantity"
                min="1"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                items
              </span>
            </div>
          </div>

          <div>
            <label className={STYLES.label}>Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.weightInKg}
                onChange={(e) =>
                  setFormData({ ...formData, weightInKg: e.target.value })
                }
                className={STYLES.input}
                placeholder="Enter weight"
                min="0"
                step="0.1"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                kg
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className={STYLES.label}>Item Type</label>
          <div className="relative">
            <input
              type="text"
              value={formData.itemType}
              onChange={(e) =>
                setFormData({ ...formData, itemType: e.target.value })
              }
              className={STYLES.input}
              placeholder="e.g., Shirts, Pants, Dresses"
              required
            />
          </div>
        </div>

        <div>
          <label className={STYLES.label}>Description</label>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`${STYLES.input} min-h-[120px] resize-none`}
              placeholder="Describe the items you're donating..."
              required
            />
            <FileText className="absolute right-3 top-3 w-5 h-5 text-white/20" />
          </div>
        </div>
      </div>

      {estimatedReward != null && (
        <motion.div
          className={`
            p-4 rounded-xl
            bg-gradient-to-r from-[${COLORS.primary.main}]/10 to-[${COLORS.secondary.main}]/10
            border border-[${COLORS.secondary.main}]/20
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[${COLORS.text.secondary}]`}>
              Estimated Reward:
            </span>
            <span
              className={`text-lg font-medium text-[${COLORS.secondary.main}]`}
            >
              {formatTokenAmount(estimatedReward as bigint)} tokens
            </span>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className={`
            flex-1 px-4 py-3 rounded-xl
            border border-white/10
            text-[${COLORS.text.secondary}]
            hover:bg-white/5
            transition-colors
          `}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={`
            flex-1 px-4 py-3 rounded-xl
            bg-gradient-to-r from-[${COLORS.secondary.main}] to-[${COLORS.secondary.light}]
            text-[${COLORS.background.dark}] font-medium
            hover:opacity-90
            transition-opacity
            flex items-center justify-center gap-2
          `}
        >
          <span>Register Donation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.form>
  );
};

const RecyclingForm: React.FC<{ centerId: number; onClose: () => void }> = ({
  centerId,
  onClose,
}) => {
  const { submitRecycling, useCalculateRecyclingReward } =
    useDonationContract();
  const [formData, setFormData] = useState<RecyclingFormState>({
    description: "",
    weightInKg: "",
  });

  const { data: estimatedReward } = useCalculateRecyclingReward(
    BigInt(formData.weightInKg || "0")
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitRecycling(
        BigInt(centerId),
        formData.description,
        BigInt(formData.weightInKg)
      );
      toast.success("Recycling submitted successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit recycling");
      console.error(error);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-[${COLORS.secondary.main}]/20`}>
          <Recycle className={`w-6 h-6 text-[${COLORS.secondary.main}]`} />
        </div>
        <div>
          <h2 className={`text-xl font-semibold ${styles.gradientText}`}>
            Register Recycling
          </h2>
          <p className={`text-sm text-[${COLORS.text.secondary}]`}>
            Record your recycling contribution
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={STYLES.label}>Description</label>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`${STYLES.input} min-h-[120px] resize-none`}
              placeholder="Describe the items you're recycling..."
              required
            />
            <FileText className="absolute right-3 top-3 w-5 h-5 text-white/20" />
          </div>
        </div>

        <div>
          <label className={STYLES.label}>Weight (kg)</label>
          <div className="relative">
            <input
              type="number"
              value={formData.weightInKg}
              onChange={(e) =>
                setFormData({ ...formData, weightInKg: e.target.value })
              }
              className={STYLES.input}
              placeholder="Enter weight in kilograms"
              min="0"
              step="0.1"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
              kg
            </span>
          </div>
        </div>
      </div>

      {estimatedReward != null && (
        <motion.div
          className={`
            p-4 rounded-xl
            bg-gradient-to-r from-[${COLORS.primary.main}]/10 to-[${COLORS.secondary.main}]/10
            border border-[${COLORS.secondary.main}]/20
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[${COLORS.text.secondary}]`}>
              Estimated Reward:
            </span>
            <span
              className={`text-lg font-medium text-[${COLORS.secondary.main}]`}
            >
              {formatTokenAmount(estimatedReward as bigint)} tokens
            </span>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className={`
            flex-1 px-4 py-3 rounded-xl
            border border-white/10
            text-[${COLORS.text.secondary}]
            hover:bg-white/5
            transition-colors
          `}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={`
            flex-1 px-4 py-3 rounded-xl
            bg-gradient-to-r from-[${COLORS.secondary.main}] to-[${COLORS.secondary.light}]
            text-[${COLORS.background.dark}] font-medium
            hover:opacity-90
            transition-opacity
            flex items-center justify-center gap-2
          `}
        >
          <span>Register Recycling</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.form>
  );
};

// Register Center Form Component
// Updated RegisterCenterForm Component
// Add these new style utilities
const STYLES = {
  input: `
    w-full px-4 py-3
    bg-white/5
    border border-white/10
    rounded-lg
    text-white
    placeholder:text-white/40
    focus:outline-none focus:border-[${COLORS.secondary.main}]
    transition-all duration-300
  `,
  label: `
    block text-sm font-medium
    text-white/70 mb-1.5
  `,
  section: `
    backdrop-filter backdrop-blur-lg
    bg-white/5
    border border-white/10
    rounded-xl p-5
    transition-all duration-300
  `,
  checkbox: `
    relative w-5 h-5
    border-2 rounded
    transition-all duration-200
    focus:ring-offset-2 focus:ring-2
  `,
};

const RegisterCenterForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addDonationCenter } = useDonationContract();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await addDonationCenter(
        formData.get("name") as string,
        formData.get("description") as string,
        formData.get("location") as string,
        formData.get("acceptsTokens") === "true",
        formData.get("acceptsRecycling") === "true"
      );

      toast.success("Center registered successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to register center");
      console.error(error);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-gray-900/95 to-gray-900/98 shadow-2xl"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-gray-900/80 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-[${COLORS.primary.main}]/20`}>
                <Building2
                  className={`w-6 h-6 text-[${COLORS.primary.main}]`}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Register Center
                </h2>
                <p className="text-sm text-white/60">
                  Create a new donation or recycling center
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className={STYLES.section}>
            <h3 className="text-lg font-medium text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className={STYLES.label}>
                  Center Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={STYLES.input}
                    placeholder="Enter center name"
                    required
                  />
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                </div>
              </div>

              <div>
                <label htmlFor="description" className={STYLES.label}>
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`${STYLES.input} min-h-[100px] resize-none`}
                    placeholder="Describe your center"
                    required
                  />
                  <FileText className="absolute right-3 top-3 w-5 h-5 text-white/20" />
                </div>
              </div>

              <div>
                <label htmlFor="location" className={STYLES.label}>
                  Location
                </label>
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={STYLES.input}
                    placeholder="Enter center location"
                    required
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Type Selection */}
          <div className={STYLES.section}>
            <h3 className="text-lg font-medium text-white mb-4">Center Type</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                className={`
                relative flex items-start gap-4 p-4
                rounded-lg cursor-pointer
                border border-white/10
                hover:bg-white/5
                ${
                  formData.centerType === "donation"
                    ? "bg-white/10 border-[${COLORS.secondary.main}]"
                    : ""
                }
                transition-all duration-300
              `}
              >
                <input
                  type="radio"
                  name="centerType"
                  checked={formData.centerType === "donation"}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      centerType: "donation",
                      acceptsDonations: true,
                      acceptsRecycling: false,
                    })
                  }
                  className="sr-only"
                />
                <div
                  className={`
                  flex-shrink-0 w-5 h-5 mt-1
                  rounded-full border-2
                  ${
                    formData.centerType === "donation"
                      ? `border-[${COLORS.secondary.main}] bg-[${COLORS.secondary.main}]`
                      : "border-white/30"
                  }
                `}
                >
                  {formData.centerType === "donation" && (
                    <div className="w-full h-full rounded-full bg-white/30" />
                  )}
                </div>
                <div>
                  <span className="block text-sm font-medium text-white">
                    Donation Center
                  </span>
                  <span className="block text-sm text-white/60 mt-1">
                    Accept clothing and fashion item donations
                  </span>
                </div>
              </label>

              <label
                className={`
                relative flex items-start gap-4 p-4
                rounded-lg cursor-pointer
                border border-white/10
                hover:bg-white/5
                ${
                  formData.centerType === "recycling"
                    ? "bg-white/10 border-[${COLORS.secondary.main}]"
                    : ""
                }
                transition-all duration-300
              `}
              >
                <input
                  type="radio"
                  name="centerType"
                  checked={formData.centerType === "recycling"}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      centerType: "recycling",
                      acceptsDonations: false,
                      acceptsRecycling: true,
                    })
                  }
                  className="sr-only"
                />
                <div
                  className={`
                  flex-shrink-0 w-5 h-5 mt-1
                  rounded-full border-2
                  ${
                    formData.centerType === "recycling"
                      ? `border-[${COLORS.secondary.main}] bg-[${COLORS.secondary.main}]`
                      : "border-white/30"
                  }
                `}
                >
                  {formData.centerType === "recycling" && (
                    <div className="w-full h-full rounded-full bg-white/30" />
                  )}
                </div>
                <div>
                  <span className="block text-sm font-medium text-white">
                    Recycling Center
                  </span>
                  <span className="block text-sm text-white/60 mt-1">
                    Process and recycle fashion items
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Features */}
          <div className={STYLES.section}>
            <h3 className="text-lg font-medium text-white mb-4">
              Additional Features
            </h3>
            <label
              className={`
              flex items-center gap-3 p-4
              rounded-lg cursor-pointer
              border border-white/10
              hover:bg-white/5
              ${
                formData.acceptsTokens
                  ? "bg-white/10 border-[${COLORS.secondary.main}]"
                  : ""
              }
              transition-all duration-300
            `}
            >
              <input
                type="checkbox"
                checked={formData.acceptsTokens}
                onChange={(e) =>
                  setFormData({ ...formData, acceptsTokens: e.target.checked })
                }
                className="sr-only"
              />
              <div
                className={`
                w-5 h-5 rounded
                border-2
                flex items-center justify-center
                ${
                  formData.acceptsTokens
                    ? `border-[${COLORS.secondary.main}] bg-[${COLORS.secondary.main}]`
                    : "border-white/30"
                }
              `}
              >
                {formData.acceptsTokens && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-white">
                  Accept Tokens
                </span>
                <span className="block text-sm text-white/60 mt-1">
                  Enable token-based rewards for contributions
                </span>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-gray-900/80 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`
                  px-4 py-2
                  bg-[${COLORS.accent.pink}]
                  text-white
                  font-medium
                  rounded-lg
                  hover:opacity-90
                  transition-all duration-300
                  flex items-center gap-2
                `}
              >
                <span>Register Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// First, create the GiveTokensForm component

const GiveTokensForm: React.FC<{
  centerId: number;
  onClose: () => void;
  centerType: string;
}> = ({ centerId, onClose, centerType }) => {
  const { donateTokens } = useDonationContract();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDonateTokens = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid token amount");
      return;
    }

    setIsLoading(true);
    try {
      await donateTokens(BigInt(centerId), BigInt(amount));
      toast.success("Tokens donated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to donate tokens");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-xl max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyan-400/20">
          <Heart className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Donate Tokens
          </h2>
          <p className="text-sm text-gray-300">
            Support {centerType === "recycling" ? "recycling" : "donation"}{" "}
            initiatives
          </p>
        </div>
      </div>

      <form onSubmit={handleDonateTokens} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Token Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all duration-300"
              placeholder="Enter amount to donate"
              min="1"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              Tokens
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p>Your tokens will support:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                {centerType === "recycling" ? (
                  <>
                    <li>Sustainable recycling operations</li>
                    <li>Material processing improvements</li>
                    <li>Environmental initiatives</li>
                  </>
                ) : (
                  <>
                    <li>Clothing distribution programs</li>
                    <li>Storage and sorting facilities</li>
                    <li>Community outreach</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-400 text-gray-900 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <span>Donate Tokens</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Centers List Component
interface DonationCenter {
  id: number;
  name: string;
  location: string;
  acceptsTokens: boolean;
  acceptsDonations: boolean;
  acceptsRecycling: boolean;
}

interface PendingDonation {
  id: bigint;
  donor: string;
  centerId: bigint;
  itemCount: bigint;
  itemType: string;
  description: string;
  weightInKg: bigint;
  timestamp: bigint;
}

interface DonationCentersListProps {
  centers: DonationCenter[];
  onSelect: (center: DonationCenter) => void;
}

const DonationCentersList: React.FC<DonationCentersListProps> = ({
  centers,
  onSelect,
}) => {
  const { useUserPendingDonations } = useDonationContract();
  const { data: pendingDonations } = useUserPendingDonations() as {
    data: PendingDonation[] | undefined;
  };

  const handleCenterSelect = (center: DonationCenter) => {
    // Check if user has pending donations at this center
    const hasPendingDonations = pendingDonations?.some(
      (donation) => BigInt(donation.centerId) === BigInt(center.id)
    );

    if (hasPendingDonations) {
      toast("You have pending donations at this center that need approval", {
        icon: "⚠️",
      });
    }

    onSelect(center);
  };

  return (
    <div className="space-y-6">
      {pendingDonations && pendingDonations.length > 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              You have {pendingDonations.length} pending donation
              {pendingDonations.length !== 1 ? "s" : ""} awaiting approval
            </p>
          </div>
        </div>
      )}

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {centers?.map((center) => (
          <motion.div
            key={center.id}
            className="group relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            onClick={() => handleCenterSelect(center)}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {center.acceptsRecycling ? (
                  <Recycle className="w-6 h-6 text-cyan-400" />
                ) : (
                  <Building2 className="w-6 h-6 text-purple-400" />
                )}
                <h3 className="text-xl font-semibold text-white">
                  {center.name}
                </h3>
              </div>

              <p className="mb-4 text-gray-300">{center.location}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {center.acceptsTokens && (
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Accepts Tokens
                  </span>
                )}
                {center.acceptsDonations && (
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Accepts Donations
                  </span>
                )}
                {center.acceptsRecycling && (
                  <span className="px-3 py-1 rounded-full text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Accepts Recycling
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Search and Filter Types
type FilterOptions = {
  acceptsDonations: boolean;
  acceptsRecycling: boolean;
  acceptsTokens: boolean;
};

// Enhanced Hero Section Component
const HeroSection: React.FC<{
  onSearch: (term: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onRegisterClick: () => void;
}> = ({ onSearch, onFilter, onRegisterClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    acceptsDonations: false,
    acceptsRecycling: false,
    acceptsTokens: false,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterOptions) => {
    const newFilters = {
      ...filters,
      [key]: !filters[key],
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <GlassCard className="max-w-5xl mx-auto p-12 mb-16 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

      <motion.div
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-center space-y-6">
          {/* Main Title and Description */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1
              className={`text-5xl font-bold mb-6 ${styles.gradientText} tracking-tight`}
            >
              Discover Centers
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Connect with local centers that make sustainable fashion
              accessible. Whether you&apos;re donating clothes or recycling
              materials.
              <br />
              Our network of centers helps you make a positive impact on the
              environment.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search for centers by name or location..."
                className={`
                  w-full px-6 py-4 pr-12
                  bg-white/5 
                  border border-white/10
                  rounded-xl
                  text-white
                  placeholder:text-white/40
                  focus:outline-none
                  focus:border-[${COLORS.secondary.main}]
                  transition-all duration-300
                `}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-white/60 mr-2">Filter by:</span>
            {[
              { key: "acceptsDonations", label: "Donations", icon: Package },
              { key: "acceptsRecycling", label: "Recycling", icon: Recycle },
              { key: "acceptsTokens", label: "Rewards", icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key as keyof FilterOptions)}
                className={`
                  px-4 py-2 
                  rounded-full 
                  flex items-center gap-2
                  transition-all duration-300
                  ${
                    filters[key as keyof FilterOptions]
                      ? `bg-[${COLORS.secondary.main}] text-[${COLORS.background.dark}]`
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <NeoButton onClick={onRegisterClick} className="px-8 py-4">
              <span className="flex items-center gap-2">
                Register New Center
                <Building2 className="w-5 h-5" />
              </span>
            </NeoButton>
          </motion.div>
        </div>
      </motion.div>
    </GlassCard>
  );
};

// Main Page Component
const DonationPage: React.FC = () => {
  const {
    donationCenterCount,
    useDonationCenter,
    addDonationCenter,
    submitDonation,
    submitRecycling,
    donateTokens,
  } = useDonationContract();

  // State management remains the same
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<DonationCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(
    null
  );
  const [showRegisterCenter, setShowRegisterCenter] = useState(false);
  const [activeForm, setActiveForm] = useState<
    "donation" | "recycling" | "tokens" | null
  >(null);

  // Load centers using the new hook
  useEffect(() => {
    if (!donationCenterCount) return;

    const loadCenters = async () => {
      const loadedCenters = await Promise.all(
        Array.from(
          { length: Number(donationCenterCount) },
          (_, i) => useDonationCenter(BigInt(i)).data
        )
      );

      const validCenters = loadedCenters.filter(Boolean) as DonationCenter[];
      setCenters(validCenters);
      setFilteredCenters(validCenters);
    };

    loadCenters();
  }, [donationCenterCount, useDonationCenter]);

  // Search and filter functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, filters);
  };

  const handleFilter = (newFilters: typeof filters) => {
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  const applyFilters = (term: string, activeFilters: typeof filters) => {
    let filtered = [...centers];

    // Apply search term
    if (term) {
      filtered = filtered.filter(
        (center) =>
          center.name.toLowerCase().includes(term.toLowerCase()) ||
          center.location.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Apply filters
    if (activeFilters.acceptsDonations) {
      filtered = filtered.filter((center) => center.acceptsDonations);
    }
    if (activeFilters.acceptsRecycling) {
      filtered = filtered.filter((center) => center.acceptsRecycling);
    }
    if (activeFilters.acceptsTokens) {
      filtered = filtered.filter((center) => center.acceptsTokens);
    }

    setFilteredCenters(filtered);
  };

  // Form submission handlers
  const handleDonationSubmit = async (formData: {
    centerId: number;
    itemCount: string;
    itemType: string;
    description: string;
    weightInKg: string;
  }) => {
    try {
      await submitDonation(
        BigInt(formData.centerId),
        BigInt(formData.itemCount),
        formData.itemType,
        formData.description,
        BigInt(formData.weightInKg)
      );
      toast.success("Donation submitted successfully!");
      setActiveForm(null);
    } catch (error) {
      toast.error("Failed to submit donation");
      console.error(error);
    }
  };

  const handleRecyclingSubmit = async (formData: {
    centerId: number;
    description: string;
    weightInKg: string;
  }) => {
    try {
      await submitRecycling(
        BigInt(formData.centerId),
        formData.description,
        BigInt(formData.weightInKg)
      );
      toast.success("Recycling submitted successfully!");
      setActiveForm(null);
    } catch (error) {
      toast.error("Failed to submit recycling");
      console.error(error);
    }
  };

  const handleTokenDonation = async (centerId: number, amount: string) => {
    try {
      await donateTokens(BigInt(centerId), BigInt(amount));
      toast.success("Tokens donated successfully!");
      setActiveForm(null);
    } catch (error) {
      toast.error("Failed to donate tokens");
      console.error(error);
    }
  };

  const handleRegisterCenter = async (formData: {
    name: string;
    description: string;
    location: string;
    acceptsTokens: boolean;
    acceptsRecycling: boolean;
  }) => {
    try {
      await addDonationCenter(
        formData.name,
        formData.description,
        formData.location,
        formData.acceptsTokens,
        formData.acceptsRecycling
      );
      toast.success("Center registered successfully!");
      setShowRegisterCenter(false);
    } catch (error) {
      toast.error("Failed to register center");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <EcoCharacter />
      <Navbar />

      <motion.div className="container mx-auto px-4 py-16">
        <HeroSection
          onSearch={handleSearch}
          onFilter={handleFilter}
          onRegisterClick={() => setShowRegisterCenter(true)}
        />

        {selectedCenter ? (
          <GlassCard className="p-8">
            {/* Center Details */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-secondary-main" />
                <div>
                  <h2 className="text-2xl font-semibold gradient-text">
                    {selectedCenter.name}
                  </h2>
                  <p className="text-sm text-white/70">
                    {selectedCenter.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCenter(null);
                  setActiveForm(null);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Back to list
              </button>
            </div>

            {/* Forms */}
            {activeForm === "donation" && (
              <DonationForm
                centerId={selectedCenter.id}
                onClose={() => setActiveForm(null)}
              />
            )}
            {activeForm === "recycling" && (
              <RecyclingForm
                centerId={selectedCenter.id}
                onClose={() => setActiveForm(null)}
              />
            )}
            {activeForm === "tokens" && (
              <GiveTokensForm
                centerId={selectedCenter.id}
                onClose={() => setActiveForm(null)}
                centerType={
                  selectedCenter.acceptsRecycling ? "recycling" : "donation"
                }
              />
            )}
          </GlassCard>
        ) : (
          <DonationCentersList
            centers={filteredCenters}
            onSelect={setSelectedCenter}
          />
        )}

        <AnimatePresence>
          {showRegisterCenter && (
            <RegisterCenterForm onClose={() => setShowRegisterCenter(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DonationPage;
function setSearchTerm(term: string) {
  throw new Error("Function not implemented.");
}
