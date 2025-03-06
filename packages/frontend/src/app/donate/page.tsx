"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  useDonationAndRecycling,
  useContractOwnership,
  type DonationCenter,
} from "@/blockchain/hooks/useDonationCenter";
import Navbar from "@/components/navbar";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  Filter,
  Recycle,
  Coins,
  MapPin,
  User,
  Gift,
  Package,
  Plus,
  Edit,
  Settings,
  ChevronRight,
  Home,
  ShoppingBag,
  Heart,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

// Color System (same as marketplace)
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

// Styles object (same as marketplace)
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

// Utility function to format addresses
const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Type for filter options
type FilterOptions = {
  owner: string;
  isActive: string;
  acceptsTokens: string;
  acceptsRecycling: string;
  search: string;
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
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-[#00FFD1]/20"></div>
      <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-2 border-[#00FFD1] animate-spin"></div>
    </div>
  </div>
);

// Error Display Component
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
    <AlertCircle className="w-6 h-6 text-red-500" />
    <p className="text-red-400">{message}</p>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-12 backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl">
    <Package className="w-12 h-12 mx-auto mb-4 text-white/40" />
    <p className="text-white/70 mb-6">No donation centers found matching your criteria</p>
    <button className={`${styles.button} ${styles.primaryButton}`}>
      Adjust Filters
    </button>
  </div>
);

// Donation Center Card Component
const DonationCenterCard = ({ 
  center, 
  isOwnedByUser,
  router
}: { 
  center: DonationCenter, 
  isOwnedByUser: boolean,
  router: any
}) => {
  return (
    <motion.div 
      className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              {center.name}
              {center.isActive ? (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00FFD1]/20 text-[#00FFD1] border border-[#00FFD1]/30">
                  Active
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF1B6B]/20 text-[#FF1B6B] border border-[#FF1B6B]/30">
                  Inactive
                </span>
              )}
            </h2>
            <p className="text-white/70 mt-1">{center.description}</p>
          </div>

          {/* Action Buttons for owner */}
          {isOwnedByUser && (
            <div className="flex space-x-2">
              <button
                className="bg-[#7B42FF] hover:bg-[#8A2BE2] text-white px-3 py-1 text-sm rounded-lg flex items-center"
                onClick={() => router.push(`/donate/centers/${center.id}/edit`)}
              >
                <Edit size={14} className="mr-1" /> Edit
              </button>
              <button
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-sm rounded-lg flex items-center"
                onClick={() => router.push(`/donate/centers/${center.id}/manage`)}
              >
                <Settings size={14} className="mr-1" /> Manage
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <MapPin size={16} className="text-[#00FFD1] mr-2" />
            <div>
              <h3 className="text-sm font-medium text-white/50">Location</h3>
              <p className="mt-0.5 text-sm text-white">{center.location}</p>
            </div>
          </div>
          <div className="flex items-center">
            <User size={16} className="text-[#00FFD1] mr-2" />
            <div>
              <h3 className="text-sm font-medium text-white/50">Owner</h3>
              <p className="mt-0.5 text-sm text-white">
                {formatAddress(center.owner)}
                {isOwnedByUser && (
                  <span className="ml-2 text-xs text-[#00FFD1] font-medium">
                    (You)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Gift size={16} className="text-[#00FFD1] mr-2" />
            <div>
              <h3 className="text-sm font-medium text-white/50">Accepts</h3>
              <p className="mt-0.5 text-sm text-white">
                {center.acceptsTokens && center.acceptsRecycling
                  ? "Tokens & Recycling"
                  : center.acceptsTokens
                  ? "Tokens Only"
                  : center.acceptsRecycling
                  ? "Recycling Only"
                  : "Clothing Only"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-purple-500/10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <h3 className="text-sm font-medium text-white/50 mb-1">Total Donations</h3>
            <div className="flex items-center">
              <Package className="text-[#00FFD1] mr-2 w-5 h-5" />
              <p className="text-lg font-semibold text-white">
                {center.totalDonationsReceived.toString()} items
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <h3 className="text-sm font-medium text-white/50 mb-1">Total Recycling</h3>
            <div className="flex items-center">
              <Recycle className="text-[#00FFD1] mr-2 w-5 h-5" />
              <p className="text-lg font-semibold text-white">
                {center.totalRecyclingReceived.toString()} kg
              </p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <h3 className="text-sm font-medium text-white/50 mb-1">Token Donations</h3>
            <div className="flex items-center">
              <Coins className="text-[#00FFD1] mr-2 w-5 h-5" />
              <p className="text-lg font-semibold text-white">
                {center.totalTokenDonationsReceived.toString()} tokens
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            className="
              py-2 px-4 
              rounded-lg 
              bg-gradient-to-r from-[#00FFD1] to-[#00FFFF]
              text-[#1A0B3B] 
              text-sm 
              font-medium 
              flex items-center
              hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]
              transition-all 
              duration-300
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/donate/centers/${center.id}`)}
          >
            View Details <ChevronRight size={16} className="ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Page Component
const DonationCentersPage: React.FC = () => {
  const { donationCenters, isCreator } = useDonationAndRecycling();
  const { address: userAddress } = useAccount();
  const [filters, setFilters] = useState<FilterOptions>({
    owner: "all",
    isActive: "all",
    acceptsTokens: "all",
    acceptsRecycling: "all",
    search: "",
  });
  const router = useRouter();
  const { owner } = useContractOwnership();

  const isAdmin =
    userAddress && owner && userAddress.toLowerCase() === owner.toLowerCase();

  // Extract unique owners for filter dropdown
  const uniqueOwners = useMemo(() => {
    if (!donationCenters) return [];

    const owners = donationCenters.map(
      (center: DonationCenter) => center.owner
    );
    return ["all", ...Array.from(new Set(owners))] as string[];
  }, [donationCenters]);

  // Filter centers based on selected criteria
  const filteredCenters = useMemo(() => {
    if (!donationCenters) return [];

    return donationCenters.filter((center: DonationCenter) => {
      // Filter by owner
      if (filters.owner !== "all" && center.owner !== filters.owner) {
        return false;
      }

      // Filter by active status
      if (filters.isActive !== "all") {
        const activeFilter = filters.isActive === "true";
        if (center.isActive !== activeFilter) {
          return false;
        }
      }

      // Filter by tokens acceptance
      if (filters.acceptsTokens !== "all") {
        const tokensFilter = filters.acceptsTokens === "true";
        if (center.acceptsTokens !== tokensFilter) {
          return false;
        }
      }

      // Filter by recycling acceptance
      if (filters.acceptsRecycling !== "all") {
        const recyclingFilter = filters.acceptsRecycling === "true";
        if (center.acceptsRecycling !== recyclingFilter) {
          return false;
        }
      }

      // Filter by search term
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          center.name.toLowerCase().includes(searchLower) ||
          center.description.toLowerCase().includes(searchLower) ||
          center.location.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [donationCenters, filters]);

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      owner: "all",
      isActive: "all",
      acceptsTokens: "all",
      acceptsRecycling: "all",
      search: "",
    });
  };

  // Check if a center is owned by the current user
  const isOwnedByUser = (center: DonationCenter) => {
    return !!userAddress && center.owner.toLowerCase() === userAddress.toLowerCase();
  };

  // Add the new route handler
  const handleAddCenter = () => {
    router.push("/donate/add-center");
  };

  const handleAddCreator = () => {
    router.push("/donate/add-creator");
  };

  if (!donationCenters) {
    return (
      <div className="min-h-screen relative">
        <BackgroundElements />
        <Navbar />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">Donation Centers</h1>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundElements />
      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFD1] via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Donation Centers
          </h1>
          <div className="flex gap-3">
            {Boolean(isAdmin) && (
              <motion.button
                className="
                  bg-gradient-to-r from-[#FF00FF] to-[#FF1B6B]
                  text-white px-4 py-2 rounded-lg
                  flex items-center gap-2
                  hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]
                  transition-all duration-300
                "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddCreator}
              >
                <User size={16} />
                Grant Creator
              </motion.button>
            )}
            {Boolean(isCreator) && (
              <motion.button
                className="
                  bg-gradient-to-r from-[#00FFD1] to-[#00FFFF]
                  text-[#1A0B3B] px-4 py-2 rounded-lg
                  flex items-center gap-2
                  hover:shadow-[0_0_15px_rgba(0,255,209,0.4)]
                  transition-all duration-300
                "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddCenter}
              >
                <Plus size={16} />
                Add New Center
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Filter size={18} className="mr-2 text-[#00FFD1]" />
              Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-sm text-[#00FFD1] hover:text-[#00FFFF] transition-colors underline"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Owner
              </label>
              <select
                name="owner"
                value={filters.owner}
                onChange={handleFilterChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#00FFD1] focus:ring-1 focus:ring-[#00FFD1] appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
              >
                <option value="all">All Owners</option>
                {userAddress && <option value={userAddress}>My Centers</option>}
                {uniqueOwners
                  .filter(
                    (owner: string) => owner !== "all" && owner !== userAddress
                  )
                  .map((owner: string, index: number) => (
                    <option key={index} value={owner}>
                      {formatAddress(owner)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Active Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#00FFD1] focus:ring-1 focus:ring-[#00FFD1] appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Accepts Tokens Filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Accepts Tokens
              </label>
              <select
                name="acceptsTokens"
                value={filters.acceptsTokens}
                onChange={handleFilterChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#00FFD1] focus:ring-1 focus:ring-[#00FFD1] appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Accepts Recycling Filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Accepts Recycling
              </label>
              <select
                name="acceptsRecycling"
                value={filters.acceptsRecycling}
                onChange={handleFilterChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#00FFD1] focus:ring-1 focus:ring-[#00FFD1] appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search centers..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-9 pr-3 text-white placeholder-white/50 focus:outline-none focus:border-[#00FFD1] focus:ring-1 focus:ring-[#00FFD1]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#00FFD1]/20 flex items-center justify-center mr-4">
              <Package className="w-6 h-6 text-[#00FFD1]" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Centers</p>
              <p className="text-2xl font-bold text-white">{donationCenters.length}</p>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#FF00FF]/20 flex items-center justify-center mr-4">
              <Gift className="w-6 h-6 text-[#FF00FF]" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Active Centers</p>
              <p className="text-2xl font-bold text-white">
                {donationCenters.filter((center: DonationCenter) => center.isActive).length}
              </p>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-purple-900/20 border border-purple-500/10 rounded-xl p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#7B42FF]/20 flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-[#7B42FF]" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Your Centers</p>
              <p className="text-2xl font-bold text-white">
                {userAddress ? donationCenters.filter((center: DonationCenter) => 
                  center.owner.toLowerCase() === userAddress.toLowerCase()
                ).length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Centers List */}
        <div className="space-y-6">
          {filteredCenters.length > 0 ? (
            filteredCenters.map((center: DonationCenter) => (
              <DonationCenterCard 
                key={center.id.toString()} 
                center={center} 
                isOwnedByUser={isOwnedByUser(center)}
                router={router}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
        
        {/* Pagination */}
        {filteredCenters.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                &lt;
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#7B42FF] text-white">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                3
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                &gt;
              </button>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-purple-500/10 text-center">
          <p className="text-white/50 text-sm">
            Thrift Protocol — Sustainable Fashion on the Blockchain
          </p>
          <div className="flex justify-center mt-4 space-x-4">
            <a href="#" className="text-white/70 hover:text-[#00FFD1] transition-colors">
              About
            </a>
            <a href="#" className="text-white/70 hover:text-[#00FFD1] transition-colors">
              Terms
            </a>
            <a href="#" className="text-white/70 hover:text-[#00FFD1] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-white/70 hover:text-[#00FFD1] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCentersPage;
