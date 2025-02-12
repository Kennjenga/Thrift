"use client";

import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatTokenAmount } from "@/utils/token-utils";
import Image from "next/image";
import { useDonationContract } from "@/blockchain/hooks/useDonationCenter";
import {
  Recycle,
  Package,
  Building2,
  ChevronRight,
  House,
  ShoppingBag,
  Heart,
  Mail,
  Leaf,
} from "lucide-react";
import {
  DonationCenter,
  DonationData,
  RecyclingData,
  NewDonationCenterData,
} from "@/types/donate";

interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

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

const DonationCentersList: React.FC<DonationCentersListProps> = ({
  centers,
  onSelect,
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {centers?.map((center) => (
        <div
          key={Number(center.id)}
          className="glass-card p-6 rounded-3xl cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelect(center)}
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-[#5E6C58]" />
            <h3 className="text-xl font-semibold text-[#162A2C]">
              {center.name}
            </h3>
          </div>
          <p className="text-[#686867] mb-4">{center.location}</p>
          <div className="flex gap-2">
            {center.acceptsTokens && (
              <span className="px-4 py-1 rounded-full text-sm bg-[#5E6C58]/10 text-[#5E6C58]">
                Accepts Tokens
              </span>
            )}
            {center.acceptsRecycling && (
              <span className="px-4 py-1 rounded-full text-sm bg-[#5E6C58]/10 text-[#5E6C58]">
                Accepts Recycling
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const DonationForm: React.FC<DonationFormProps> = ({ centerId, onClose }) => {
  const { registerDonation, useCalculateClothingReward } =
    useDonationContract();
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
        <Package className="w-6 h-6 text-[#5E6C58]" />
        <h2 className="text-2xl font-semibold text-[#162A2C]">
          Register Donation
        </h2>
      </div>

      <input
        type="number"
        placeholder="Number of Items"
        value={formData.itemCount}
        onChange={(e) =>
          setFormData({ ...formData, itemCount: e.target.value })
        }
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <input
        type="text"
        placeholder="Item Type"
        value={formData.itemType}
        onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <input
        type="number"
        placeholder="Weight (kg)"
        value={formData.weightInKg}
        onChange={(e) =>
          setFormData({ ...formData, weightInKg: e.target.value })
        }
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />

      {estimatedReward != null && (
        <div className="p-4 rounded-full bg-[#5E6C58]/10">
          <p className="text-[#5E6C58] text-center">
            Estimated Reward: {formatTokenAmount(estimatedReward as bigint)}{" "}
            tokens
          </p>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Register Donation
        <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  );
};

const RecyclingForm: React.FC<RecyclingFormProps> = ({ centerId, onClose }) => {
  const { registerRecycling, useCalculateRecyclingReward } =
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
        <Recycle className="w-6 h-6 text-[#5E6C58]" />
        <h2 className="text-2xl font-semibold text-[#162A2C]">
          Register Recycling
        </h2>
      </div>

      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <input
        type="number"
        placeholder="Weight (kg)"
        value={formData.weightInKg}
        onChange={(e) =>
          setFormData({ ...formData, weightInKg: e.target.value })
        }
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />

      {estimatedReward != null && (
        <div className="p-4 rounded-full bg-[#5E6C58]/10">
          <p className="text-[#5E6C58] text-center">
            Estimated Reward: {formatTokenAmount(estimatedReward as bigint)}{" "}
            tokens
          </p>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Register Recycling
        <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  );
};

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
        <Building2 className="w-6 h-6 text-[#5E6C58]" />
        <h2 className="text-2xl font-semibold text-[#162A2C]">
          Register Donation Center
        </h2>
      </div>

      <input
        type="text"
        placeholder="Center Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
        required
      />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.acceptsTokens}
            onChange={(e) =>
              setFormData({ ...formData, acceptsTokens: e.target.checked })
            }
            className="form-checkbox h-5 w-5 text-[#5E6C58]"
          />
          Accepts Tokens
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.acceptsRecycling}
            onChange={(e) =>
              setFormData({ ...formData, acceptsRecycling: e.target.checked })
            }
            className="form-checkbox h-5 w-5 text-[#5E6C58]"
          />
          Accepts Recycling
        </label>
      </div>

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Register Center
        <ChevronRight className="w-5 h-5" />
      </button>
    </form>
  );
};

const DonationPage: React.FC = () => {
  const { allDonationCenters } = useDonationContract() as {
    allDonationCenters: DonationCenter[] | undefined;
  };
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(
    null
  );
  const [showRegisterCenter, setShowRegisterCenter] = useState<boolean>(false);
  const [activeForm, setActiveForm] = useState<"donation" | "recycling" | null>(
    null
  );

  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "/" },
    {
      name: "Shop",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "/marketplace",
    },
    {
      name: "Thrift",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "/thrift",
    },
    { name: "Donate", icon: <Heart className="w-5 h-5" />, path: "/donate" },
    { name: "Contact", icon: <Mail className="w-5 h-5" />, path: "#" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-[#5E6C58]/10 shadow-soft">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="flex items-center group hover-lift">
              <div className="relative">
                <Image
                  src="/my-business-name-high-resolution-logo-transparent.png"
                  alt="Ace Logo"
                  width={45}
                  height={45}
                  className="mr-2 rounded-lg shine-effect"
                  priority
                />
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#C0B283] to-[#DCD0C0] opacity-30 blur group-hover:opacity-40 transition duration-300"></div>
              </div>
              <h1 className="text-2xl font-bold text-[#162A2C] ml-2 gold-gradient">
                Ace
              </h1>
            </div>
          </div>

          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="nav-link group flex items-center space-x-2 text-[#162A2C]"
              >
                <span className="text-lg group-hover:text-[#C0B283] transition-colors duration-300">
                  {link.icon}
                </span>
                <span className="relative">
                  {link.name}
                  <span className="nav-link-underline"></span>
                </span>
              </a>
            ))}
          </div>

          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto hero-card p-12 rounded-3xl glass-card mb-16">
          <div className="floating-icon left-icon">
            <Leaf className="w-8 h-8 text-[#5E6C58]" />
          </div>
          <h1 className="text-4xl font-bold text-[#162A2C] mb-6 text-center">
            Donation Centers
          </h1>
          <p className="text-xl text-[#686867] text-center mb-8">
            Find a donation center near you and contribute to sustainable
            fashion
          </p>
          {!selectedCenter && (
            <button
              onClick={() => setShowRegisterCenter(true)}
              className="btn-primary flex items-center justify-center gap-2 mx-auto"
            >
              Register New Center
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Centers List or Selected Center View */}
        {selectedCenter ? (
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#5E6C58]" />
                <h2 className="text-2xl font-semibold text-[#162A2C]">
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
              <p className="text-[#686867] mb-2">
                {selectedCenter.description}
              </p>
              <p className="text-[#686867]">{selectedCenter.location}</p>
            </div>

            <div className="flex gap-4 mb-6">
              {selectedCenter.acceptsTokens && (
                <button
                  onClick={() => setActiveForm("donation")}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  Make Donation
                  <Package className="w-5 h-5" />
                </button>
              )}
              {selectedCenter.acceptsRecycling && (
                <button
                  onClick={() => setActiveForm("recycling")}
                  className="btn-glass flex items-center justify-center gap-2"
                >
                  Register Recycling
                  <Recycle className="w-5 h-5" />
                </button>
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
          </div>
        ) : (
          <DonationCentersList
            centers={allDonationCenters}
            onSelect={setSelectedCenter}
          />
        )}

        {/* Register Center Modal */}
        {showRegisterCenter && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card p-8 rounded-3xl max-w-md w-full relative">
              <button
                onClick={() => setShowRegisterCenter(false)}
                className="absolute top-4 right-4 text-[#686867] hover:text-[#162A2C]"
              >
                ×
              </button>
              <RegisterCenterForm
                onClose={() => setShowRegisterCenter(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationPage;
