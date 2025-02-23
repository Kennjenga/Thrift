import { useDonationContract } from "@/blockchain/hooks/useDonationCenter";
import { PendingDonation, ApprovedDonation } from "@/types/donate";
import { formatTokenAmount } from "@/utils/token-utils";
import { CheckCircle, Clock } from "lucide-react";

// components/DonationStatus.tsx
export const DonationStatus: React.FC = () => {
  const { useUserPendingDonations, useUserApprovedDonations } =
    useDonationContract();

  const { data: pendingDonations } = useUserPendingDonations() as {
    data: PendingDonation[];
  };
  const { data: approvedDonations } = useUserApprovedDonations() as {
    data: ApprovedDonation[];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Your Donations</h2>

      {/* Pending Donations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-300">Pending</h3>
        {pendingDonations?.map((donation) => (
          <div
            key={donation.id.toString()}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-white">
                  {donation.itemType || "Recycling"}
                </span>
              </div>
              <span className="text-sm text-yellow-400">Pending Approval</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <p>Items: {donation.itemCount.toString()}</p>
              <p>Weight: {donation.weightInKg.toString()} kg</p>
              <p>{donation.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Approved Donations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-300">Approved</h3>
        {approvedDonations?.map((donation) => (
          <div
            key={donation.id.toString()}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">
                  {donation.itemType || "Recycling"}
                </span>
              </div>
              <span className="text-sm text-green-400">
                Reward: {formatTokenAmount(donation.rewardAmount)} tokens
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <p>Verified Items: {donation.verifiedItemCount.toString()}</p>
              <p>
                Verified Weight: {donation.verifiedWeightInKg.toString()} kg
              </p>
              <p>{donation.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
