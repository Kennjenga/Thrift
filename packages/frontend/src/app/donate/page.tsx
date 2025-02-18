"use client";

import React, { useState } from "react";
import { formatTokenAmount } from "@/utils/token-utils";
import { useDonationContract } from "@/blockchain/hooks/useDonationCenter";
import { Recycle, Package, Building2, ChevronRight, Leaf } from "lucide-react";
import {
  DonationCenter,
  DonationData,
  RecyclingData,
  NewDonationCenterData,
} from "@/types/donate";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EcoCharacter from "@/components/eco-character";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

// Theme configuration
const theme = {
  colors: {
    primary: '#B5C7C4',
    secondary: '#C7D4D2',
    accent: '#DBE2E0',
    gold: '#E2D9C9',
    goldLight: '#F0EBE3',
    background: '#FBFBFB',
    text: '#6B7F7C',
    blush: '#D4DCDA',
    highlight: '#96A7A4',
    glass: 'rgba(255, 255, 255, 0.15)',
  }
};


// Enhanced Animated Background with gold particles
const AnimatedBackground = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gradientRef.current) {
        const { clientX, clientY } = e;
        const x = clientX / window.innerWidth;
        const y = clientY / window.innerHeight;
        
        gradientRef.current.style.background = `
          radial-gradient(
            circle at ${x * 100}% ${y * 100}%,
            ${theme.colors.goldLight},
            ${theme.colors.secondary},
            ${theme.colors.background}
          )
        `;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div 
        ref={gradientRef}
        className="absolute inset-0 transition-all duration-300 ease-out"
      />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-particle"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0 
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: 360,
              x: `${Math.sin(i) * 200}px`
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? theme.colors.gold : theme.colors.primary,
                opacity: 0.3
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Component interfaces
interface DonationCentersListProps {
  centers: DonationCenter[] | undefined;
  onSelect: (center: DonationCenter) => void;
}

interface DonationFormProps {
  centerId: number;
  onClose: () => void;
}

interface RecyclingFormProps {
  centerId: number;
  onClose: () => void;
}

interface RegisterCenterFormProps {
  onClose: () => void;
}

interface FormState extends Omit<DonationData, "itemCount" | "weightInKg"> {
  itemCount: string;
  weightInKg: string;
}

interface RecyclingFormState extends Omit<RecyclingData, "weightInKg"> {
  weightInKg: string;
}

// Enhanced Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`
        backdrop-blur-lg bg-white/10 
        border border-white/30 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        rounded-2xl
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Button Component
const NeoButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}> = ({ children, onClick, className = "", type = "button" }) => {
  return (
    <motion.button
      type={type}
      className={`
        px-6 py-3 rounded-xl
        bg-gradient-to-r from-primary to-secondary
        text-white font-medium
        transition-all duration-300
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
      }}
    >
      {children}
    </motion.button>
  );
};

// Enhanced DonationCentersList Component
const DonationCentersList: React.FC<DonationCentersListProps> = ({
  centers,
  onSelect,
}) => {
  return (
    <motion.div 
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {centers?.map((center) => (
        <GlassCard
          key={Number(center.id)}
          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <motion.div
            onClick={() => onSelect(center)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6" style={{ color: theme.colors.text }} />
              <h3 className="text-xl font-semibold" style={{ color: theme.colors.text }}>
                {center.name}
              </h3>
            </div>
            <p className="mb-4" style={{ color: theme.colors.text }}>
              {center.location}
            </p>
            <div className="flex gap-2">
              {center.acceptsTokens && (
                <span className="px-4 py-1 rounded-full text-sm" 
                  style={{ 
                    background: `${theme.colors.primary}20`,
                    color: theme.colors.text 
                  }}>
                  Accepts Tokens
                </span>
              )}
              {center.acceptsRecycling && (
                <span className="px-4 py-1 rounded-full text-sm"
                  style={{ 
                    background: `${theme.colors.primary}20`,
                    color: theme.colors.text 
                  }}>
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

// Enhanced DonationForm Component
const DonationForm: React.FC<DonationFormProps> = ({ centerId, onClose }) => {
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
      onClose();
    } catch (error) {
      console.error("Error registering donation:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6" style={{ color: theme.colors.text }} />
        <h2 className="text-2xl font-semibold" style={{ color: theme.colors.text }}>
          Register Donation
        </h2>
      </div>

      <motion.div className="space-y-4">
        <input
          type="number"
          placeholder="Number of Items"
          value={formData.itemCount}
          onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        <input
          type="text"
          placeholder="Item Type"
          value={formData.itemType}
          onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={formData.weightInKg}
          onChange={(e) => setFormData({ ...formData, weightInKg: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
      </motion.div>

      {estimatedReward != null && (
        <motion.div
          className="p-4 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: `${theme.colors.primary}20` }}
        >
          <p style={{ color: theme.colors.text }} className="text-center">
            Estimated Reward: {formatTokenAmount(estimatedReward as bigint)} tokens
          </p>
        </motion.div>
      )}

      <NeoButton type="submit" className="w-full">
        <span className="flex items-center justify-center gap-2">
          Register Donation
          <ChevronRight className="w-5 h-5" />
        </span>
      </NeoButton>
    </form>
  );
};

// Enhanced RecyclingForm Component
const RecyclingForm: React.FC<RecyclingFormProps> = ({ centerId, onClose }) => {
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
      onClose();
    } catch (error) {
      console.error("Error registering recycling:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Recycle className="w-6 h-6" style={{ color: theme.colors.text }} />
        <h2 className="text-2xl font-semibold" style={{ color: theme.colors.text }}>
          Register Recycling
        </h2>
      </div>

      <motion.div className="space-y-4">
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={formData.weightInKg}
          onChange={(e) => setFormData({ ...formData, weightInKg: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
      </motion.div>

      {estimatedReward != null && (
        <motion.div
          className="p-4 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: `${theme.colors.primary}20` }}
        >
          <p style={{ color: theme.colors.text }} className="text-center">
            Estimated Reward: {formatTokenAmount(estimatedReward as bigint)} tokens
          </p>
        </motion.div>
      )}

      <NeoButton type="submit" className="w-full">
        <span className="flex items-center justify-center gap-2">
          Register Recycling
          <ChevronRight className="w-5 h-5" />
        </span>
      </NeoButton>
    </form>
  );
};

// Enhanced RegisterCenterForm Component
const RegisterCenterForm: React.FC<RegisterCenterFormProps> = ({ onClose }) => {
  const { addDonationCenter } = useDonationContract();
  const [formData, setFormData] = useState<NewDonationCenterData>({
    name: "",
    description: "",
    location: "",
    acceptsTokens: false,
    acceptsRecycling: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addDonationCenter(
        formData.name,
        formData.description,
        formData.location,
        formData.acceptsTokens,
        formData.acceptsRecycling
      );
      onClose();
    } catch (error) {
      console.error("Error adding donation center:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6" style={{ color: theme.colors.background }} />
        <h2 className="text-2xl font-semibold" style={{ color: theme.colors.text }}>
          Register Donation Center
        </h2>
      </div>

      <motion.div className="space-y-4">
        <input
          type="text"
          placeholder="Center Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-6 py-3 rounded-full border focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.background}50`
          }}
          required
        />
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.acceptsTokens}
              onChange={(e) => setFormData({ ...formData, acceptsTokens: e.target.checked })}
              className="form-checkbox h-5 w-5"
              style={{ color: theme.colors.primary }}
            />
            <span style={{ color: theme.colors.text }}>Accepts Tokens</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.acceptsRecycling}
              onChange={(e) => setFormData({ ...formData, acceptsRecycling: e.target.checked })}
              className="form-checkbox h-5 w-5"
              style={{ color: theme.colors.primary }}
            />
            <span style={{ color: theme.colors.text }}>Accepts Recycling</span>
          </label>
        </div>
      </motion.div>

      <NeoButton type="submit" className="w-full">
        <span className="flex items-center justify-center gap-2">
          Register Center
          <ChevronRight className="w-5 h-5" />
        </span>
      </NeoButton>
    </form>
  );
};

// Main DonationPage Component
const DonationPage: React.FC = () => {
  const { allDonationCenters } = useDonationContract() as {
    allDonationCenters: DonationCenter[] | undefined;
  };
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [showRegisterCenter, setShowRegisterCenter] = useState<boolean>(false);
  const [activeForm, setActiveForm] = useState<"donation" | "recycling" | null>(null);

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
        <GlassCard className="max-w-4xl mx-auto p-12 mb-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4" style={{ color: theme.colors.text }}>
                Donation Centers
              </h1>
              <p className="text-xl" style={{ color: theme.colors.text }}>
                Find a donation center near you and contribute to sustainable fashion
              </p>
            </div>
            
            {!selectedCenter && (
              <NeoButton
                onClick={() => setShowRegisterCenter(true)}
                className="mx-auto"
              >
                <span className="flex items-center gap-2">
                  Register New Center
                  <ChevronRight className="w-5 h-5" />
                </span>
              </NeoButton>
            )}
          </motion.div>
        </GlassCard>

        {/* Centers List or Selected Center View */}
        {selectedCenter ? (
          <GlassCard className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6" style={{ color: theme.colors.text }} />
                <h2 className="text-2xl font-semibold" style={{ color: theme.colors.text }}>
                  {selectedCenter.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCenter(null);
                  setActiveForm(null);
                }}
                className="text-[#5E6C58] hover:text-[#162A2C] transition-colors"
              >
                ← Back to list
              </button>
            </div>

            <div className="mb-6">
              <p style={{ color: theme.colors.text }} className="mb-2">
                {selectedCenter.description}
              </p>
              <p style={{ color: theme.colors.text }}>
                {selectedCenter.location}
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              {selectedCenter.acceptsTokens && (
                <NeoButton
                  onClick={() => setActiveForm("donation")}
                >
                  <span className="flex items-center gap-2">
                    Make Donation
                    <Package className="w-5 h-5" />
                  </span>
                </NeoButton>
              )}
              {selectedCenter.acceptsRecycling && (
                <NeoButton
                  onClick={() => setActiveForm("recycling")}
                  className="bg-gradient-to-r from-goldLight to-gold"
                >
                  <span className="flex items-center gap-2">
                    Register Recycling
                    <Recycle className="w-5 h-5" />
                  </span>
                </NeoButton>
              )}
            </div>

            {activeForm && (
              <div className="mt-8 border-t border-[#DBE0E2] pt-8">
                {activeForm === "donation" ? (
                  <DonationForm
                    centerId={selectedCenter.id}
                    onClose={() => setActiveForm(null)}
                  />
                ) : (
                  <RecyclingForm
                    centerId={selectedCenter.id}
                    onClose={() => setActiveForm(null)}
                  />
                )}
              </div>
            )}
          </GlassCard>
        ) : (
          <DonationCentersList
            centers={allDonationCenters}
            onSelect={setSelectedCenter}
          />
        )}

        {/* Register Center Modal */}
        <AnimatePresence>
          {showRegisterCenter && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard className="max-w-md w-full p-8 relative">
                <button
                  onClick={() => setShowRegisterCenter(false)}
                  className="absolute top-4 right-4 text-[#686867] hover:text-[#162A2C]"
                >
                  ×
                </button>
                <RegisterCenterForm
                  onClose={() => setShowRegisterCenter(false)}
                />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default DonationPage;