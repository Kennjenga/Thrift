"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useDonationAndRecycling,
  type PendingDonation,
} from "@/blockchain/hooks/useDonationCenter";

const ManageCenterPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { pendingDonations, approveDonation, rejectDonation } =
    useDonationAndRecycling();

  const handleApprove = async (donationId: string) => {
    try {
      await approveDonation(resolvedParams.id, donationId, "Clothing");
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  const handleReject = async (donationId: string) => {
    try {
      await rejectDonation(donationId, "Rejected by admin");
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Donations</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y">
            {pendingDonations?.map((donation: PendingDonation) => (
              <div key={donation.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{donation.type} Donation</p>
                    <p className="text-sm text-gray-500">
                      From: {donation.donor}
                    </p>
                    <p className="text-sm text-gray-500">
                      Amount: {donation.amount}{" "}
                      {donation.type === "Recycling" ? "kg" : "items"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(donation.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(donation.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCenterPage;
