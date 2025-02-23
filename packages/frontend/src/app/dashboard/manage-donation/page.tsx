"use client";

import React, { useState, useEffect } from "react";
import { useDonationContract } from "@/blockchain/hooks/useDonationCenter";
import { useAccount } from "wagmi";
import {
  Settings,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Building,
  ListChecks,
} from "lucide-react";

// Update the DonationCenter interface to include proper ID typing
interface DonationCenter {
  name: string;
  location: string;
  description: string;
  isActive: boolean;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
  owner: string;
  id?: bigint; // Change to bigint to match blockchain data
}

export default function ManageDonationCenters() {
  const { address } = useAccount();
  const { addDonationCenter, updateDonationCenter, allDonationCenters } =
    useDonationContract();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userCenters, setUserCenters] = useState<DonationCenter[]>([]);

  const [newCenter, setNewCenter] = useState<DonationCenter>({
    name: "",
    description: "",
    location: "",
    acceptsTokens: true,
    acceptsRecycling: true,
    isActive: true,
    owner: "",
  });

  const [updateCenterData, setUpdateCenterData] = useState({
    centerId: "",
    isActive: true,
    acceptsTokens: true,
    acceptsRecycling: true,
  });

  useEffect(() => {
    const fetchAndFilterCenters = async () => {
      try {
        if (allDonationCenters && address) {
          // Ensure allDonationCenters is an array and add index as id
          const centers = Array.isArray(allDonationCenters)
            ? allDonationCenters.map((center, index) => ({
                ...center,
                id: BigInt(index + 1), // Add 1 because contract indexes start at 1
              }))
            : [];

          // Filter centers owned by the current user
          const filteredCenters = centers.filter(
            (center) => center.owner?.toLowerCase() === address.toLowerCase()
          );

          setUserCenters(filteredCenters);
        }
      } catch (error) {
        console.error("Filtering error:", error);
        handleError(error as Error, "Fetching donation centers");
      }
    };

    fetchAndFilterCenters();
  }, [allDonationCenters, address]);

  // console.log(allDonationCenters, address);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleError = (error: Error, action: string) => {
    console.error(`${action} failed:`, error);
    setError(error?.message || `${action} failed. Please try again.`);
    setLoading(false);
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setLoading(false);
  };

  const handleAddCenter = async () => {
    try {
      setLoading(true);
      await addDonationCenter(
        newCenter.name,
        newCenter.description,
        newCenter.location,
        newCenter.acceptsTokens,
        newCenter.acceptsRecycling
      );

      handleSuccess("Donation center added successfully!");
      setNewCenter({
        name: "",
        description: "",
        location: "",
        acceptsTokens: true,
        acceptsRecycling: true,
        isActive: true,
        owner: "",
      });
    } catch (error) {
      handleError(error as Error, "Adding donation center");
    }
  };

  const handleUpdateCenter = async () => {
    try {
      setLoading(true);

      if (!updateCenterData.centerId) {
        throw new Error("Please select a donation center");
      }

      // Find the center in userCenters
      const centerToUpdate = userCenters.find(
        (center) => center.id?.toString() === updateCenterData.centerId
      );

      if (!centerToUpdate) {
        throw new Error("Center not found");
      }

      // Verify ownership
      if (centerToUpdate.owner.toLowerCase() !== address?.toLowerCase()) {
        throw new Error("You can only update centers you own");
      }

      await updateDonationCenter(
        BigInt(updateCenterData.centerId),
        updateCenterData.isActive,
        updateCenterData.acceptsTokens,
        updateCenterData.acceptsRecycling
      );

      handleSuccess("Donation center updated successfully!");

      // Reset form
      setUpdateCenterData({
        centerId: "",
        isActive: true,
        acceptsTokens: true,
        acceptsRecycling: true,
      });
    } catch (error) {
      handleError(error as Error, "Updating donation center");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto hero-card p-12 rounded-3xl glass-card mb-16">
          <h1 className="text-4xl font-bold text-[#162A2C] mb-6 text-center">
            Donation Center Management
          </h1>
          <p className="text-xl text-[#686867] text-center">
            Add and update donation centers in your network
          </p>
        </div>

        {error && (
          <div className="mb-8 glass-card p-4 border-l-4 border-red-500 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-[#162A2C]">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-8 glass-card p-4 border-l-4 border-green-500 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <p className="text-[#162A2C]">{success}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Add New Center
              </h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Center Name"
                value={newCenter.name}
                onChange={(e) =>
                  setNewCenter({ ...newCenter, name: e.target.value })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCenter.description}
                onChange={(e) =>
                  setNewCenter({ ...newCenter, description: e.target.value })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <input
                type="text"
                placeholder="Location"
                value={newCenter.location}
                onChange={(e) =>
                  setNewCenter({ ...newCenter, location: e.target.value })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCenter.acceptsTokens}
                    onChange={(e) =>
                      setNewCenter({
                        ...newCenter,
                        acceptsTokens: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  Accepts Tokens
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCenter.acceptsRecycling}
                    onChange={(e) =>
                      setNewCenter({
                        ...newCenter,
                        acceptsRecycling: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  Accepts Recycling
                </label>
              </div>
              <button
                onClick={handleAddCenter}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Processing..." : "Add Center"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#5E6C58]" />
              <h2 className="text-2xl font-semibold text-[#162A2C]">
                Update Center
              </h2>
            </div>
            <div className="space-y-4">
              <select
                value={updateCenterData.centerId.toString()}
                onChange={(e) =>
                  setUpdateCenterData({
                    ...updateCenterData,
                    centerId: e.target.value,
                  })
                }
                className="w-full px-6 py-3 rounded-full border border-[#DBE0E2] focus:outline-none focus:border-[#5E6C58] bg-white/50"
              >
                <option value="">Select a center</option>
                {userCenters.map((center) => (
                  <option
                    key={center.id?.toString()}
                    value={center.id?.toString()}
                  >
                    {center.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={updateCenterData.isActive}
                    onChange={(e) =>
                      setUpdateCenterData({
                        ...updateCenterData,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={updateCenterData.acceptsTokens}
                    onChange={(e) =>
                      setUpdateCenterData({
                        ...updateCenterData,
                        acceptsTokens: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  Accepts Tokens
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={updateCenterData.acceptsRecycling}
                    onChange={(e) =>
                      setUpdateCenterData({
                        ...updateCenterData,
                        acceptsRecycling: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  Accepts Recycling
                </label>
              </div>
              <button
                onClick={handleUpdateCenter}
                disabled={loading || !updateCenterData.centerId}
                className="btn-warning w-full"
              >
                {loading ? "Processing..." : "Update Center"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 glass-card p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <ListChecks className="w-6 h-6 text-[#5E6C58]" />
            <h2 className="text-2xl font-semibold text-[#162A2C]">
              Your Donation Centers
            </h2>
          </div>
          <div className="space-y-4">
            {userCenters.length === 0 ? (
              <p className="text-center text-[#686867] py-4">
                You haven&apos;t created any donation centers yet.
              </p>
            ) : (
              userCenters.map((center, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/50 rounded-xl border border-[#DBE0E2]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{center.name}</h3>
                      <p className="text-[#686867]">{center.location}</p>
                      <p className="text-sm text-[#686867] mt-1">
                        {center.description}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-sm ${
                          center.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {center.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


