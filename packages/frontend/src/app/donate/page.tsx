"use client";

import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useThriftToken } from "@/blockchain/hooks/useDonationCenter";
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

// Type definitions
interface NavLink {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export default function DonationPage() {
  const {
    registerDonation,
    registerRecycling,
    addDonationCenter,
  } = useThriftToken();

  const [donationData, setDonationData] = useState({
    centerId: BigInt(0),
    itemCount: BigInt(0),
    itemType: "",
    description: "",
    weightInKg: BigInt(0),
  });

  const [recyclingData, setRecyclingData] = useState({
    centerId: BigInt(0),
    description: "",
    weightInKg: BigInt(0),
  });

  const [donationCenterData, setDonationCenterData] = useState({
    name: "",
    description: "",
    location: "",
    acceptsTokens: false,
    acceptsRecycling: false,
  });

  const navLinks: NavLink[] = [
    { name: "Home", icon: <House className="w-5 h-5" />, path: "/" },
    { name: "Shop", icon: <ShoppingBag className="w-5 h-5" />, path: "/marketplace" },
    { name: "Thrift", icon: <ShoppingBag className="w-5 h-5" />, path: "/thrift" },
    { name: "Donate", icon: <Heart className="w-5 h-5" />, path: "/donate" },
    { name: "Contact", icon: <Mail className="w-5 h-5" />, path: "#" },
  ];

  const handleRegisterDonation = async () => {
    try {
      await registerDonation(
        donationData.centerId,
        donationData.itemCount,
        donationData.itemType,
        donationData.description,
        donationData.weightInKg
      );
    } catch (error) {
      console.error("Donation registration failed", error);
    }
  };

  const handleRegisterRecycling = async () => {
    try {
      await registerRecycling(
        recyclingData.centerId,
        recyclingData.description,
        recyclingData.weightInKg
      );
    } catch (error) {
      console.error("Recycling registration failed", error);
    }
  };

  const handleAddDonationCenter = async () => {
    try {
      await addDonationCenter(
        donationCenterData.name,
        donationCenterData.description,
        donationCenterData.location,
        donationCenterData.acceptsTokens,
        donationCenterData.acceptsRecycling
      );
    } catch (error) {
      console.error("Donation center creation failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF6] to-[#F4EFE6]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-[#5E6C58]/10 shadow-soft">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="flex items-center group hover-lift">
              <div className="relative">
                <Image
                  src="/ace-logo.png"
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
        <div className="max-w-4xl mx-auto hero-card p-12 rounded-3xl glass-card mb-16">
          <div className="floating-icon left-icon">
            <Leaf className="w-8 h-8 text-[#5E6C58]" />
          </div>
          <h1 className="text-4xl font-bold text-[#162A2C] mb-6 text-center">
            Donation Center
          </h1>
          <p className="text-xl text-[#686867] text-center mb-8">
            Contribute to sustainable fashion by donating or recycling your clothes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Donation Registration */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Register Donation
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegisterDonation();
              }}
              className="space-y-4"
            >
              <input
                type="number"
                placeholder="Center ID"
                value={donationData.centerId.toString()}
                onChange={(e) =>
                  setDonationData({
                    ...donationData,
                    centerId: BigInt(e.target.value),
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="number"
                placeholder="Item Count"
                value={donationData.itemCount.toString()}
                onChange={(e) =>
                  setDonationData({
                    ...donationData,
                    itemCount: BigInt(e.target.value),
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Item Type"
                value={donationData.itemType}
                onChange={(e) =>
                  setDonationData({ ...donationData, itemType: e.target.value })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Description"
                value={donationData.description}
                onChange={(e) =>
                  setDonationData({
                    ...donationData,
                    description: e.target.value,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={donationData.weightInKg.toString()}
                onChange={(e) =>
                  setDonationData({
                    ...donationData,
                    weightInKg: BigInt(e.target.value),
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Register Donation
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Recycling Registration */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Recycle className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Register Recycling
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegisterRecycling();
              }}
              className="space-y-4"
            >
              <input
                type="number"
                placeholder="Center ID"
                value={recyclingData.centerId.toString()}
                onChange={(e) =>
                  setRecyclingData({
                    ...recyclingData,
                    centerId: BigInt(e.target.value),
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Description"
                value={recyclingData.description}
                onChange={(e) =>
                  setRecyclingData({
                    ...recyclingData,
                    description: e.target.value,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={recyclingData.weightInKg.toString()}
                onChange={(e) =>
                  setRecyclingData({
                    ...recyclingData,
                    weightInKg: BigInt(e.target.value),
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <button
                type="submit"
                className="btn-glass w-full flex items-center justify-center gap-2"
              >
                Register Recycling
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Add Donation Center */}
          <div className="glass-card p-8 rounded-3xl md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Add Donation Center
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddDonationCenter();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Name"
                value={donationCenterData.name}
                onChange={(e) =>
                  setDonationCenterData({
                    ...donationCenterData,
                    name: e.target.value,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Description"
                value={donationCenterData.description}
                onChange={(e) =>
                  setDonationCenterData({
                    ...donationCenterData,
                    description: e.target.value,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Location"
                value={donationCenterData.location}
                onChange={(e) =>
                  setDonationCenterData({
                    ...donationCenterData,
                    location: e.target.value,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <div className="flex gap-4">
                <div className="flex items-center gap-2 p-4 rounded-full border border-[#DBE0E2] bg-white/50">
                  <input
                    type="checkbox"
                    checked={donationCenterData.acceptsTokens}
                    onChange={(e) =>
                      setDonationCenterData({
                        ...donationCenterData,
                        acceptsTokens: e.target.checked,
                      })
                    }
                    className="form-checkbox text-[#5E6C58]"
                  />
                  <label className="text-[#686867]">Accepts Tokens</label>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-full border border-[#DBE0E2] bg-white/50">
                  <input
                    type="checkbox"
                    checked={donationCenterData.acceptsRecycling}
                    onChange={(e) =>
                      setDonationCenterData({
                        ...donationCenterData,
                        acceptsRecycling: e.target.checked,
                      })
                    }
                    className="form-checkbox text-[#5E6C58]"
                  />
                  <label className="text-[#686867]">Accepts Recycling</label>
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Add Donation Center
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}