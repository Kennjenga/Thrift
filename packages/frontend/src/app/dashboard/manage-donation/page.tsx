"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  useDonationAndRecycling,
  useGetUserPendingDonations,
  useGetUserApprovedDonations,
  useGetPendingDonationsDetails,
  useGetApprovedDonationsDetails,
  useDonationCenterManagement,
  type DonationCenter,
  type PendingDonation,
} from "@/blockchain/hooks/useDonationCenter";

const DonationCenterManagementPage: React.FC = () => {
  const { address } = useAccount();
  const { donationCenters, isCreator, refetchCenters } =
    useDonationAndRecycling();
  const { updateDonationCenter } = useDonationCenterManagement();

  // For user donations
  const { pendingDonationIds } = useGetUserPendingDonations(address);
  const { approvedDonationIds } = useGetUserApprovedDonations(address);
  const { donationsDetails: pendingDonations } =
    useGetPendingDonationsDetails(pendingDonationIds);
  const { donationsDetails: approvedDonations } =
    useGetApprovedDonationsDetails(approvedDonationIds);

  // State for donation center form
  const [isEditingCenter, setIsEditingCenter] = useState<boolean>(false);
  const [editingCenterId, setEditingCenterId] = useState<bigint | null>(null);
  const [centerForm, setCenterForm] = useState<{
    isActive: boolean;
    acceptsTokens: boolean;
    acceptsRecycling: boolean;
    isDonation: boolean;
  }>({
    isActive: true,
    acceptsTokens: true,
    acceptsRecycling: true,
    isDonation: true,
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState<"centers" | "donations">(
    "centers"
  );

  // Filter centers owned by the current user
  const userCenters: DonationCenter[] =
    donationCenters?.filter(
      (center) => center.owner.toLowerCase() === address?.toLowerCase()
    ) || [];

  // Get all donations and sort by timestamp (most recent first)
  const allDonations: PendingDonation[] = [
    ...(pendingDonations || []),
    ...(approvedDonations || []),
  ];
  const recentDonations: PendingDonation[] = allDonations
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 10); // Get only the 10 most recent donations

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setCenterForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Start editing a center
  const handleEditCenter = (center: DonationCenter): void => {
    setEditingCenterId(center.id);
    setCenterForm({
      isActive: center.isActive,
      acceptsTokens: center.acceptsTokens,
      acceptsRecycling: center.acceptsRecycling,
      isDonation: center.isDonation,
    });
    setIsEditingCenter(true);
  };

  // Save center changes
  const handleSaveCenter = async (): Promise<void> => {
    if (!editingCenterId) return;

    try {
      await updateDonationCenter(
        editingCenterId,
        centerForm.isActive,
        centerForm.acceptsTokens,
        centerForm.acceptsRecycling,
        centerForm.isDonation
      );

      // Reset form and refresh data
      setIsEditingCenter(false);
      setEditingCenterId(null);
      refetchCenters();
    } catch (error) {
      console.error("Failed to update donation center:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = (): void => {
    setIsEditingCenter(false);
    setEditingCenterId(null);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Format donation type and amount for display
  const formatDonationInfo = (donation: PendingDonation): string => {
    if (donation.isTokenDonation) {
      return `${donation.tokenAmount.toString()} tokens`;
    } else if (donation.isRecycling) {
      return `${donation.weightInKg.toString()} kg recycling`;
    } else {
      return `${donation.itemCount.toString()} ${donation.itemType}`;
    }
  };

  // Get status badge class based on donation status
  const getStatusBadgeClass = (donation: PendingDonation): string => {
    if (donation.isApproved) {
      return "bg-green-100 text-green-800";
    } else if (donation.isProcessed) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-yellow-100 text-yellow-800";
    }
  };

  // Get donation status as a string
  const getDonationStatus = (donation: PendingDonation): string => {
    if (donation.isApproved) {
      return "Approved";
    } else if (donation.isProcessed) {
      return "Rejected";
    } else {
      return "Pending";
    }
  };

  // Get donation type as a string
  const getDonationType = (donation: PendingDonation): string => {
    if (donation.isTokenDonation) {
      return "Token";
    } else if (donation.isRecycling) {
      return "Recycling";
    } else {
      return "Clothing";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Donation Management</h1>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("centers")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "centers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Donation Centers
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "donations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Recent Donations
          </button>
        </nav>
      </div>

      {/* My Donation Centers Tab */}
      {activeTab === "centers" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Donation Centers</h2>
          </div>

          {userCenters.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                You don&apos;t have any donation centers yet.
              </p>
              {isCreator && (
                <p className="mt-2">
                  <a
                    href="/create-center"
                    className="text-blue-600 hover:underline"
                  >
                    Create a new donation center
                  </a>
                </p>
              )}
              {!isCreator && (
                <p className="mt-2 text-gray-500">
                  You need to be an approved creator to create donation centers.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accepts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userCenters.map((center) => (
                    <tr key={center.id.toString()}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {center.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {center.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {center.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            center.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {center.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {[
                          center.isDonation && "Clothing",
                          center.acceptsRecycling && "Recycling",
                          center.acceptsTokens && "Tokens",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          Donations: {center.totalDonationsReceived.toString()}
                        </div>
                        <div>
                          Recycling: {center.totalRecyclingReceived.toString()}{" "}
                          kg
                        </div>
                        <div>
                          Tokens:{" "}
                          {center.totalTokenDonationsReceived.toString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditCenter(center)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <a
                          href={`/donate/centers/${center.id}/manage`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Donation Center Modal */}
          {isEditingCenter && (
            <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
              <div className="fixed inset-0 bg-black opacity-30"></div>
              <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium mb-4">
                  Edit Donation Center
                </h3>

                <form className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={centerForm.isActive}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Accept Clothing Donations
                    </label>
                    <input
                      type="checkbox"
                      name="isDonation"
                      checked={centerForm.isDonation}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Accept Recycling
                    </label>
                    <input
                      type="checkbox"
                      name="acceptsRecycling"
                      checked={centerForm.acceptsRecycling}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Accept Token Donations
                    </label>
                    <input
                      type="checkbox"
                      name="acceptsTokens"
                      checked={centerForm.acceptsTokens}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCenter}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Donations Tab */}
      {activeTab === "donations" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Recent Donations</h2>

          {recentDonations.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                You haven&apos;t made any donations yet.
              </p>
              <p className="mt-2">
                <a href="/donate" className="text-blue-600 hover:underline">
                  Make your first donation
                </a>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donation Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Center ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDonations.map((donation) => (
                    <tr
                      key={`${donation.id.toString()}-${
                        donation.isApproved ? "approved" : "pending"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDonationType(donation)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {donation.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDonationInfo(donation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.centerId.toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            donation
                          )}`}
                        >
                          {getDonationStatus(donation)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationCenterManagementPage;
