"use client";

import React, { useState } from "react";
import { useThriftToken } from "@/blockchain/hooks/useDonationCenter";
// import { useAccount } from "wagmi";

export default function DonationPage() {
  //   const { address } = useAccount();
  const {
    registerDonation,
    registerRecycling,
    addDonationCenter,
    // useCalculateClothingReward,
    // useCalculateRecyclingReward,
    // donationCenterCount,
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Donation Center</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Donation Registration */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Register Donation</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegisterDonation();
            }}
            className="space-y-2"
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
              className="w-full p-2 border"
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
              className="w-full p-2 border"
            />
            <input
              type="text"
              placeholder="Item Type"
              value={donationData.itemType}
              onChange={(e) =>
                setDonationData({ ...donationData, itemType: e.target.value })
              }
              className="w-full p-2 border"
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
              className="w-full p-2 border"
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
              className="w-full p-2 border"
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2"
            >
              Register Donation
            </button>
          </form>
        </div>

        {/* Recycling Registration */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Register Recycling</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegisterRecycling();
            }}
            className="space-y-2"
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
              className="w-full p-2 border"
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
              className="w-full p-2 border"
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
              className="w-full p-2 border"
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2">
              Register Recycling
            </button>
          </form>
        </div>

        {/* Add Donation Center */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Add Donation Center</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddDonationCenter();
            }}
            className="space-y-2"
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
              className="w-full p-2 border"
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
              className="w-full p-2 border"
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
              className="w-full p-2 border"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={donationCenterData.acceptsTokens}
                onChange={(e) =>
                  setDonationCenterData({
                    ...donationCenterData,
                    acceptsTokens: e.target.checked,
                  })
                }
              />
              <label>Accepts Tokens</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={donationCenterData.acceptsRecycling}
                onChange={(e) =>
                  setDonationCenterData({
                    ...donationCenterData,
                    acceptsRecycling: e.target.checked,
                  })
                }
              />
              <label>Accepts Recycling</label>
            </div>
            <button
              type="submit"
              className="w-full bg-purple-500 text-white p-2"
            >
              Add Donation Center
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
