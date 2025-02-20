"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/navbar";
import EcoCharacter from "@/components/eco-character";
import { formatTokenAmount } from "@/utils/token-utils";
import { toast } from 'react-hot-toast';
import { useDonationContract } from "@/blockchain/hooks/useDonationCenter";
import { 
  Recycle, 
  Package, 
  Building2, 
  ChevronRight, 
  Heart,
  FileText, 
  MapPin, 
  Check,
  X,
  ArrowRight,
  HeartOff,
  Search
 } from "lucide-react";
import {
  DonationCenter,
  DonationData,
  RecyclingData,
  NewDonationCenterData,
} from "@/types/donate";

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
    main: '#7B42FF',
    light: '#8A2BE2',
    dark: '#4A00E0',
  },
  secondary: {
    main: '#00FFD1',
    light: '#00FFFF',
    dark: '#00E6BD',
  },
  accent: {
    pink: '#FF00FF',
    red: '#FF1B6B',
  },
  background: {
    dark: '#1A0B3B',
    light: '#2A1B54',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
  },
  glass: {
    background: 'rgba(42, 27, 84, 0.2)',
    border: 'rgba(123, 66, 255, 0.1)',
  }
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
        <div className={`absolute inset-0 bg-gradient-to-b from-[${COLORS.background.light}] to-[${COLORS.background.dark}]`} />
        
        <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-[${COLORS.accent.pink}] rounded-full filter blur-[120px] opacity-[0.15] animate-pulse`} />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-[${COLORS.primary.main}] rounded-full filter blur-[150px] opacity-[0.12] animate-pulse`} />
        <div className={`absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[${COLORS.secondary.light}] rounded-full filter blur-[100px] opacity-[0.1] animate-pulse`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[${COLORS.accent.red}] rounded-full filter blur-[130px] opacity-[0.08] animate-pulse`} />
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
const DonationForm: React.FC<{ centerId: number; onClose: () => void }> = ({ centerId, onClose }) => {
  const { registerDonation, useCalculateClothingReward } = useDonationContract();
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
      await registerDonation(
        BigInt(centerId),
        BigInt(formData.itemCount),
        formData.itemType,
        formData.description,
        BigInt(formData.weightInKg)
      );
      toast.success("Donation registered successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to register donation");
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
                onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                className={STYLES.input}
                placeholder="Enter quantity"
                min="1"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">items</span>
            </div>
          </div>

          <div>
            <label className={STYLES.label}>Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.weightInKg}
                onChange={(e) => setFormData({ ...formData, weightInKg: e.target.value })}
                className={STYLES.input}
                placeholder="Enter weight"
                min="0"
                step="0.1"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">kg</span>
            </div>
          </div>
        </div>

        <div>
          <label className={STYLES.label}>Item Type</label>
          <div className="relative">
            <input
              type="text"
              value={formData.itemType}
              onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <span className={`text-[${COLORS.text.secondary}]`}>Estimated Reward:</span>
            <span className={`text-lg font-medium text-[${COLORS.secondary.main}]`}>
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

const RecyclingForm: React.FC<{ centerId: number; onClose: () => void }> = ({ centerId, onClose }) => {
  const { registerRecycling, useCalculateRecyclingReward } = useDonationContract();
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
      await registerRecycling(
        BigInt(centerId),
        formData.description,
        BigInt(formData.weightInKg)
      );
      toast.success("Recycling registered successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to register recycling");
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, weightInKg: e.target.value })}
              className={STYLES.input}
              placeholder="Enter weight in kilograms"
              min="0"
              step="0.1"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">kg</span>
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
            <span className={`text-[${COLORS.text.secondary}]`}>Estimated Reward:</span>
            <span className={`text-lg font-medium text-[${COLORS.secondary.main}]`}>
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
  `
};

const RegisterCenterForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addDonationCenter } = useDonationContract();
  const [formData, setFormData] = useState<NewDonationCenterData>({
    name: "",
    description: "",
    location: "",
    acceptsTokens: false,
    acceptsDonations: false,
    acceptsRecycling: false,
    centerType: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.centerType) {
      toast.error("Please select a center type");
      return;
    }
    try {
      await addDonationCenter(
        formData.name,
        formData.description,
        formData.location,
        formData.acceptsTokens,
        formData.centerType === 'recycling'
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
                <Building2 className={`w-6 h-6 text-[${COLORS.primary.main}]`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Register Center</h2>
                <p className="text-sm text-white/60">Create a new donation or recycling center</p>
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
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className={STYLES.label}>Center Name</label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={STYLES.input}
                    placeholder="Enter center name"
                    required
                  />
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                </div>
              </div>

              <div>
                <label htmlFor="description" className={STYLES.label}>Description</label>
                <div className="relative">
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${STYLES.input} min-h-[100px] resize-none`}
                    placeholder="Describe your center"
                    required
                  />
                  <FileText className="absolute right-3 top-3 w-5 h-5 text-white/20" />
                </div>
              </div>

              <div>
                <label htmlFor="location" className={STYLES.label}>Location</label>
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              <label className={`
                relative flex items-start gap-4 p-4
                rounded-lg cursor-pointer
                border border-white/10
                hover:bg-white/5
                ${formData.centerType === 'donation' ? 'bg-white/10 border-[${COLORS.secondary.main}]' : ''}
                transition-all duration-300
              `}>
                <input
                  type="radio"
                  name="centerType"
                  checked={formData.centerType === 'donation'}
                  onChange={() => setFormData({
                    ...formData,
                    centerType: 'donation',
                    acceptsDonations: true,
                    acceptsRecycling: false
                  })}
                  className="sr-only"
                />
                <div className={`
                  flex-shrink-0 w-5 h-5 mt-1
                  rounded-full border-2
                  ${formData.centerType === 'donation' 
                    ? `border-[${COLORS.secondary.main}] bg-[${COLORS.secondary.main}]` 
                    : 'border-white/30'}
                `}>
                  {formData.centerType === 'donation' && (
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

              <label className={`
                relative flex items-start gap-4 p-4
                rounded-lg cursor-pointer
                border border-white/10
                hover:bg-white/5
                ${formData.centerType === 'recycling' ? 'bg-white/10 border-[${COLORS.secondary.main}]' : ''}
                transition-all duration-300
              `}>
                <input
                  type="radio"
                  name="centerType"
                  checked={formData.centerType === 'recycling'}
                  onChange={() => setFormData({
                    ...formData,
                    centerType: 'recycling',
                    acceptsDonations: false,
                    acceptsRecycling: true
                  })}
                  className="sr-only"
                />
                <div className={`
                  flex-shrink-0 w-5 h-5 mt-1
                  rounded-full border-2
                  ${formData.centerType === 'recycling' 
                    ? `border-[${COLORS.secondary.main}] bg-[${COLORS.secondary.main}]` 
                    : 'border-white/30'}
                `}>
                  {formData.centerType === 'recycling' && (
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
            <h3 className="text-lg font-medium text-white mb-4">Additional Features</h3>
            <label className={`
              flex items-center gap-3 p-4
              rounded-lg cursor-pointer
              border border-white/10
              hover:bg-white/5
              ${formData.acceptsTokens ? 'bg-white/10 border-[${COLORS.secondary.main}]' : ''}
              transition-all duration-300
            `}>
              <input
                type="checkbox"
                checked={formData.acceptsTokens}
                onChange={(e) => setFormData({ ...formData, acceptsTokens: e.target.checked })}
                className="sr-only"
              />
              <div className={`
                w-5 h-5 rounded
                border-2
                flex items-center justify-center
                ${formData.acceptsTokens 
                  ? `border-[${COLORS.secondary.main}] bg-[${COLORS.secondary.main}]` 
                  : 'border-white/30'}
              `}>
                {formData.acceptsTokens && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <span className="text-sm font-medium text-white">Accept Tokens</span>
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
const GiveTokensForm: React.FC<{ centerId: number; onClose: () => void }> = ({ centerId, onClose }) => {
  const [amount, setAmount] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className={`w-6 h-6 text-[${COLORS.secondary.main}]`} />
        <h2 className={`text-2xl font-semibold ${styles.gradientText}`}>
          Give Tokens
        </h2>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <label className={STYLES.label}>Token Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={STYLES.input}
              placeholder="Enter amount of tokens"
              min="1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
              Tokens
            </span>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3">
        <NeoButton 
          onClick={onClose}
          className="flex-1"
        >
          <span className="flex items-center justify-center gap-2">
            Cancel
          </span>
        </NeoButton>

        <NeoButton 
          onClick={() => {}} // Placeholder for token sending logic
          className="flex-1"
        >
          <span className="flex items-center justify-center gap-2">
            Send Tokens
            <ArrowRight className="w-5 h-5" />
          </span>
        </NeoButton>
      </div>
    </div>
  );
};

interface DonationCentersListProps {
  centers: DonationCenter[];
  onSelect: (center: DonationCenter) => void;
}

// Centers List Component
const DonationCentersList: React.FC<DonationCentersListProps> = ({ centers, onSelect }) => {
  return(
  <motion.div
    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ staggerChildren: 0.1 }}
  >
    {centers?.map((center, index) => (
      <GlassCard
        key={index}
        className="p-6 curssor-pointer hover:shadow-lg transition-all duration-300"
      >
        <motion.div
          onClick={() => onSelect(center)}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className={`w-6 h-6 text-[${COLORS.secondary.main}]`} />
            <h3 className={`text-xl font-semibold text-[${COLORS.text.primary}]`}>
              {center.name}
            </h3>
          </div>
          
          <p className={`mb-4 text-[${COLORS.text.secondary}]`}>
            {center.location}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {center.acceptsTokens && (
              <span className={`
                px-3 py-1 rounded-full text-sm
                bg-[${COLORS.primary.main}]/10
                text-[${COLORS.secondary.main}]
                border border-[${COLORS.primary.main}]/20
              `}>
                Accepts Tokens
              </span>
            )}
            {center.acceptsDonations && (
              <span className={`
                px-3 py-1 rounded-full text-sm
                bg-[${COLORS.secondary.main}]/10
                text-[${COLORS.secondary.main}]
                border border-[${COLORS.secondary.main}]/20
              `}>
                Accepts Donations
              </span>
            )}
            {center.acceptsRecycling && (
              <span className={`
                px-3 py-1 rounded-full text-sm
                bg-[${COLORS.accent.pink}]/10
                text-[${COLORS.accent.pink}]
                border border-[${COLORS.accent.pink}]/20
              `}>
                Accepts Recycling
              </span>
            )}
          </div>
        </motion.div>
      </GlassCard>
    ))}
  </motion.div>
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
            <h1 className={`text-5xl font-bold mb-6 ${styles.gradientText} tracking-tight`}>
              Discover Centers
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Connect with local centers that make sustainable fashion accessible. 
              Whether you're donating clothes or recycling materials.
              <br/> 
              Our network of centers helps you make a positive impact on the environment.
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
              { key: 'acceptsDonations', label: 'Donations', icon: Package },
              { key: 'acceptsRecycling', label: 'Recycling', icon: Recycle },
              { key: 'acceptsTokens', label: 'Rewards', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key as keyof FilterOptions)}
                className={`
                  px-4 py-2 
                  rounded-full 
                  flex items-center gap-2
                  transition-all duration-300
                  ${filters[key as keyof FilterOptions] 
                    ? `bg-[${COLORS.secondary.main}] text-[${COLORS.background.dark}]`
                    : 'bg-white/5 text-white/60 hover:bg-white/10'}
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
            <NeoButton
              onClick={onRegisterClick}
              className="px-8 py-4"
            >
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
  const { allDonationCenters } = useDonationContract();
  const centers = allDonationCenters as DonationCenter[];
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [showRegisterCenter, setShowRegisterCenter] = useState<boolean>(false);
  const [activeForm, setActiveForm] = useState<"donation" | "recycling" | "tokens" | null>(null);
  const [filteredCenters, setFilteredCenters] = useState<DonationCenter[]>(Array.isArray(allDonationCenters) ? allDonationCenters : []);

 // Initialize filteredCenters when allDonationCenters changes
 useEffect(() => {
  if (allDonationCenters && Array.isArray(allDonationCenters)) {
    setFilteredCenters(allDonationCenters as DonationCenter[]);
  }
}, [allDonationCenters]);

const handleSearch = (term: string) => {
  if (!allDonationCenters || !Array.isArray(allDonationCenters)) return;
  
  const filtered = (allDonationCenters as DonationCenter[]).filter(center => 
    center.name.toLowerCase().includes(term.toLowerCase()) ||
    center.location.toLowerCase().includes(term.toLowerCase())
  );
  setFilteredCenters(filtered);
};

const handleFilter = (filters: FilterOptions) => {
  if (!allDonationCenters || !Array.isArray(allDonationCenters)) return;

  const filtered = (allDonationCenters as DonationCenter[]).filter(center => {
    if (filters.acceptsDonations && !center.acceptsDonations) return false;
    if (filters.acceptsRecycling && !center.acceptsRecycling) return false;
    if (filters.acceptsTokens && !center.acceptsTokens) return false;
    return true;
  });
  setFilteredCenters(filtered);
};

  // Function to render appropriate forms based on center type
  const renderForms = (center: DonationCenter) => {
    const forms = [];

    if (center.acceptsDonations) {
      forms.push(
        <NeoButton 
          key="donation" 
          onClick={() => setActiveForm("donation")}
          className="flex-1"
        >
          <span className="flex items-center gap-2">
            Make Donation
            <Package className="w-5 h-5" />
          </span>
        </NeoButton>
      );
    }

    if (center.acceptsRecycling) {
      forms.push(
        <NeoButton 
          key="recycling" 
          onClick={() => setActiveForm("recycling")}
          className="flex-1"
        >
          <span className="flex items-center gap-2">
            Register Recycling
            <Recycle className="w-5 h-5" />
          </span>
        </NeoButton>
      );
    }

    if (center.acceptsTokens) {
      forms.push(
        <NeoButton 
          key="tokens" 
          onClick={() => setActiveForm("tokens")}
          className="flex-1"
        >
          <span className="flex items-center gap-2">
            Give Tokens
            <Heart className="w-5 h-5" />
          </span>
        </NeoButton>
      );
    }

    return forms;
  };

  const renderSelectedCenter = () => (
    <GlassCard className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Building2 className={`w-6 h-6 text-[${COLORS.secondary.main}]`} />
          <div>
            <h2 className={`text-2xl font-semibold ${styles.gradientText}`}>
              {selectedCenter?.name}
            </h2>
            <p className={`text-sm text-[${COLORS.text.secondary}]`}>
              {selectedCenter?.location}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedCenter(null);
            setActiveForm(null);
          }}
          className={`text-[${COLORS.text.secondary}] hover:text-[${COLORS.text.primary}] transition-colors`}
        >
          ← Back to list
        </button>
      </div>

      {/* Center Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        {selectedCenter && renderForms(selectedCenter)}
      </div>

      {/* Active Form */}
      {activeForm && selectedCenter && (
        <div className={`
          mt-8 pt-8
          border-t border-[${COLORS.glass.border}]
        `}>
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
            />
          )}
        </div>
      )}
    </GlassCard>
  );

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <EcoCharacter />
      <Navbar />
      
      <motion.div
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
          <HeroSection 
          onSearch={handleSearch} 
          onFilter={handleFilter}
          onRegisterClick={() => setShowRegisterCenter(true)}
           />

        {/* Main Content */}
        {selectedCenter ? (
          renderSelectedCenter()
        ) : (
          <DonationCentersList
          centers={filteredCenters}
          onSelect={setSelectedCenter}
          />
        )}

        {/* Register Center Modal */}
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