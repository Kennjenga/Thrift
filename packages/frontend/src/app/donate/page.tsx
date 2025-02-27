"use client";

import React, { useState, useMemo } from "react";
import {
  useDonationAndRecycling,
  type DonationCenter,
} from "@/blockchain/hooks/useDonationCenter"; // Updated import path
import { useAccount } from "wagmi"; // Added import for userAddress
import { useRouter } from "next/navigation";

// Utility function to format addresses
const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Type for filter options
type FilterOptions = {
  owner: string;
  isActive: string;
  acceptsTokens: string;
  acceptsRecycling: string;
  search: string;
};

const DonationCentersPage: React.FC = () => {
  const { donationCenters, isCreator } = useDonationAndRecycling();
  const { address: userAddress } = useAccount(); // Get user address from wagmi
  const [filters, setFilters] = useState<FilterOptions>({
    owner: "all",
    isActive: "all",
    acceptsTokens: "all",
    acceptsRecycling: "all",
    search: "",
  });
  const router = useRouter();

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
    return (
      userAddress && center.owner.toLowerCase() === userAddress.toLowerCase()
    );
  };

  // Add the new route handler
  const handleAddCenter = () => {
    router.push("/donate/add-center");
  };

  if (!donationCenters) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Donation Centers
          </h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-center py-12">
              Loading donation centers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donation Centers</h1>
          {Boolean(isCreator) && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              onClick={handleAddCenter}
            >
              Add New Center
            </button>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <select
                name="owner"
                value={filters.owner}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Accepts Tokens Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accepts Tokens
              </label>
              <select
                name="acceptsTokens"
                value={filters.acceptsTokens}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Accepts Recycling Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accepts Recycling
              </label>
              <select
                name="acceptsRecycling"
                value={filters.acceptsRecycling}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search centers..."
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Centers List */}
        <div className="space-y-6">
          {filteredCenters.length > 0 ? (
            filteredCenters.map((center: DonationCenter) => (
              <div
                key={center.id.toString()}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {center.name}
                        {center.isActive ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 mt-1">{center.description}</p>
                    </div>

                    {/* Action Buttons for owner */}
                    {isOwnedByUser(center) && (
                      <div className="flex space-x-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded"
                          onClick={() =>
                            router.push(`/donate/centers/${center.id}/edit`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded"
                          onClick={() =>
                            router.push(`/donate/centers/${center.id}/manage`)
                          }
                        >
                          Manage
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Location
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {center.location}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Owner
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatAddress(center.owner)}
                        {isOwnedByUser(center) && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">
                            (You)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Accepts
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
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

                  <div className="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Donations
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {center.totalDonationsReceived.toString()} items
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Recycling
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {center.totalRecyclingReceived.toString()} kg
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Token Donations
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {center.totalTokenDonationsReceived.toString()} tokens
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                      onClick={() =>
                        router.push(`/donate/centers/${center.id}`)
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 text-center py-12">
                No centers found matching your criteria. Try adjusting your
                filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCentersPage;
