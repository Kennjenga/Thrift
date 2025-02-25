import { useState } from "react";
import { useDonationAndRecycling } from "@/blockchain/hooks/useDonationCenter";

export default function CenterDetails() {
  const {
    donationCenters,
    isCreator,
    userAddress,
    donateCloths,
    donateTokens,
    donateRecycling,
    approveCreator,
    revokeCreator,
  } = useDonationAndRecycling();

  const [showInactive, setShowInactive] = useState(false);
  const [showUserOnly, setShowUserOnly] = useState(false);

  // Filter centers based on criteria
  const filteredCenters = donationCenters?.filter((center) => {
    if (!showInactive && !center.isActive) return false;
    if (showUserOnly && center.owner !== userAddress) return false;
    return true;
  });

  // Donation form state
  const [clothingAmount, setClothingAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [recyclingWeight, setRecyclingWeight] = useState("");

  // Handle donations
  const handleClothingDonation = async (centerId: string) => {
    try {
      await donateCloths(centerId, Number(clothingAmount));
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  const handleTokenDonation = async (centerId: string) => {
    try {
      await donateTokens(centerId, tokenAmount);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  const handleRecyclingDonation = async (centerId: string) => {
    try {
      await donateRecycling(centerId, Number(recyclingWeight));
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  // Creator management for admins
  const handleCreatorApproval = async (account: string) => {
    try {
      await approveCreator(account as `0x${string}`);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  const handleCreatorRevocation = async (account: string) => {
    try {
      await revokeCreator(account as `0x${string}`);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {/* Filters */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show Inactive Centers
        </label>
        <label>
          <input
            type="checkbox"
            checked={showUserOnly}
            onChange={(e) => setShowUserOnly(e.target.checked)}
          />
          Show My Centers Only
        </label>
      </div>

      {/* Centers List */}
      {filteredCenters?.map((center) => (
        <div key={center.id.toString()}>
          <h3>{center.name}</h3>

          {/* Donation Forms */}
          {center.isActive && (
            <div>
              {/* Clothing Donation */}
              <div>
                <input
                  type="number"
                  value={clothingAmount}
                  onChange={(e) => setClothingAmount(e.target.value)}
                  placeholder="Number of items"
                />
                <button
                  onClick={() => handleClothingDonation(center.id.toString())}
                >
                  Donate Clothes
                </button>
              </div>

              {/* Token Donation */}
              {center.acceptsTokens && (
                <div>
                  <input
                    type="text"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="Token amount"
                  />
                  <button
                    onClick={() => handleTokenDonation(center.id.toString())}
                  >
                    Donate Tokens
                  </button>
                </div>
              )}

              {/* Recycling Donation */}
              {center.acceptsRecycling && (
                <div>
                  <input
                    type="number"
                    value={recyclingWeight}
                    onChange={(e) => setRecyclingWeight(e.target.value)}
                    placeholder="Weight in kg"
                  />
                  <button
                    onClick={() =>
                      handleRecyclingDonation(center.id.toString())
                    }
                  >
                    Donate Recycling
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin Controls */}
          {isCreator && (
            <div>
              <input
                type="text"
                placeholder="Account address"
                id={`creator-${center.id}`}
              />
              <button
                onClick={() =>
                  handleCreatorApproval(
                    (
                      document.getElementById(
                        `creator-${center.id}`
                      ) as HTMLInputElement
                    ).value
                  )
                }
              >
                Grant Creator Role
              </button>
              <button
                onClick={() =>
                  handleCreatorRevocation(
                    (
                      document.getElementById(
                        `creator-${center.id}`
                      ) as HTMLInputElement
                    ).value
                  )
                }
              >
                Revoke Creator Role
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
