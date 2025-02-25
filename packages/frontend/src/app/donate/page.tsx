"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useDonationContract } from "@/blockchain/hooks/useDonationCenter";
import type {
  // DonationCenter,
  // PendingDonation,
  NewDonation,
} from "@/types/donate";

const DonationPage: React.FC = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<
    "centers" | "donations" | "manage" | "create"
  >("centers");
  const [newDonation, setNewDonation] = useState<NewDonation>({
    description: "",
    weightInKg: 0,
    isRecycling: false,
    itemCount: 0,
    itemType: "",
  });

  const contract = useDonationContract();
  const { centers, isLoading: centersLoading } =
    contract.useAllDonationCenters();
  const { pendingDonations: userPendingDonations } = contract.useUserDonations(
    address!
  );

  // Filter owned centers based on the connected address
  const ownedCenters =
    centers?.filter((center) => center.owner === address) ?? [];

  const handleDonationSubmit = async (centerId: bigint) => {
    try {
      if (newDonation.isRecycling) {
        await contract.submitRecycling(
          centerId,
          newDonation.description,
          BigInt(newDonation.weightInKg)
        );
      } else {
        await contract.submitDonation(
          centerId,
          BigInt(newDonation.itemCount || 0),
          newDonation.itemType || "",
          newDonation.description,
          BigInt(newDonation.weightInKg)
        );
      }

      // Reset form
      setNewDonation({
        description: "",
        weightInKg: 0,
        isRecycling: false,
        itemCount: 0,
        itemType: "",
      });
    } catch (error) {
      console.error("Error submitting donation:", error);
    }
  };

  if (centersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <nav className="flex gap-2 mb-8 bg-white p-2 rounded-lg shadow">
        <button
          onClick={() => setActiveTab("centers")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "centers"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Donation Centers
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "donations"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          My Donations
        </button>
        {ownedCenters.length > 0 && (
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "manage"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Manage Centers
          </button>
        )}
      </nav>

      {/* Centers View */}
      {activeTab === "centers" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Donation Centers</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers?.map((center) => (
              <div
                key={center.id.toString()}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-2">{center.name}</h2>
                <p className="text-gray-600 mb-4">{center.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  📍 {center.location}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {center.acceptsTokens && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Accepts Tokens
                    </span>
                  )}
                  {center.acceptsRecycling && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Accepts Recycling
                    </span>
                  )}
                </div>

                {/* Donation Form */}
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Make a Donation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={newDonation.isRecycling}
                          onChange={(e) =>
                            setNewDonation((prev) => ({
                              ...prev,
                              isRecycling: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <span>This is a recycling donation</span>
                      </label>
                    </div>

                    {!newDonation.isRecycling && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Item Count
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={newDonation.itemCount}
                            onChange={(e) =>
                              setNewDonation((prev) => ({
                                ...prev,
                                itemCount: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Item Type
                          </label>
                          <input
                            type="text"
                            value={newDonation.itemType}
                            onChange={(e) =>
                              setNewDonation((prev) => ({
                                ...prev,
                                itemType: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newDonation.weightInKg}
                        onChange={(e) =>
                          setNewDonation((prev) => ({
                            ...prev,
                            weightInKg: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={newDonation.description}
                        onChange={(e) =>
                          setNewDonation((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={() => handleDonationSubmit(center.id)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                      Submit Donation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Donations View */}
      {activeTab === "donations" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">My Donations</h1>
          <div className="space-y-4">
            {userPendingDonations?.map((donationId) => {
              const { donation } = contract.usePendingDonation(donationId);
              if (!donation) return null;

              return (
                <div
                  key={donation.id.toString()}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        {donation.isRecycling ? "Recycling" : donation.itemType}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {donation.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>Weight: {Number(donation.weightInKg)}kg</p>
                        {!donation.isRecycling && (
                          <p>Items: {Number(donation.itemCount)}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          donation.isProcessed
                            ? donation.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {donation.isProcessed
                          ? donation.isApproved
                            ? "Approved"
                            : "Rejected"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manage Centers View */}
      {activeTab === "manage" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Manage Centers</h1>
          <div className="space-y-6">
            {ownedCenters.map((center) => (
              <div
                key={center.id.toString()}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{center.name}</h2>
                    <p className="text-gray-600">{center.description}</p>
                    <p className="text-sm text-gray-500">
                      📍 {center.location}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={center.isActive}
                        onChange={(e) =>
                          contract.updateDonationCenter(
                            center.id,
                            e.target.checked,
                            center.acceptsTokens,
                            center.acceptsRecycling
                          )
                        }
                        className="mr-2"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={center.acceptsTokens}
                        onChange={(e) =>
                          contract.updateDonationCenter(
                            center.id,
                            center.isActive,
                            e.target.checked,
                            center.acceptsRecycling
                          )
                        }
                        className="mr-2"
                      />
                      <span>Accept Tokens</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={center.acceptsRecycling}
                        onChange={(e) =>
                          contract.updateDonationCenter(
                            center.id,
                            center.isActive,
                            center.acceptsTokens,
                            e.target.checked
                          )
                        }
                        className="mr-2"
                      />
                      <span>Accept Recycling</span>
                    </label>
                  </div>
                </div>

                {/* Center Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Donations
                    </h4>
                    <p className="text-2xl font-semibold">
                      {Number(center.totalDonationsReceived)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Recycling
                    </h4>
                    <p className="text-2xl font-semibold">
                      {Number(center.totalRecyclingReceived)} kg
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-500">
                      Token Donations
                    </h4>
                    <p className="text-2xl font-semibold">
                      {Number(center.totalTokenDonationsReceived)}
                    </p>
                  </div>
                </div>

                {/* Pending Donations */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Pending Donations
                  </h3>
                  <div className="space-y-4">
                    {userPendingDonations?.map((donationId) => {
                      const { donation } =
                        contract.usePendingDonation(donationId);
                      if (
                        !donation ||
                        donation.centerId !== center.id ||
                        donation.isProcessed
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={donation.id.toString()}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {donation.isRecycling
                                  ? "Recycling"
                                  : donation.itemType}
                              </p>
                              <p className="text-gray-600 mt-1">
                                {donation.description}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Weight: {Number(donation.weightInKg)}kg
                                {!donation.isRecycling &&
                                  ` | Items: ${Number(donation.itemCount)}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  contract.approveDonation(
                                    donation.id,
                                    donation.itemCount,
                                    donation.weightInKg
                                  );
                                }}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt(
                                    "Enter rejection reason:",
                                    ""
                                  );
                                  if (reason !== null) {
                                    contract.rejectDonation(
                                      donation.id,
                                      reason
                                    );
                                  }
                                }}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPage;
