"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDonationAndRecycling } from "@/blockchain/hooks/useDonationCenter";

const EditCenterPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { donationCenter, updateCenter } = useDonationAndRecycling();
  const resolvedParams = React.use(params);

  const [centerForm, setCenterForm] = useState({
    isActive: true,
    acceptsTokens: true,
    acceptsRecycling: true,
  });

  useEffect(() => {
    if (donationCenter) {
      setCenterForm({
        isActive: donationCenter.isActive,
        acceptsTokens: donationCenter.acceptsTokens,
        acceptsRecycling: donationCenter.acceptsRecycling,
      });
    }
  }, [donationCenter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCenter(resolvedParams.id, {
        isActive: centerForm.isActive,
        acceptsTokens: centerForm.acceptsTokens,
        acceptsRecycling: centerForm.acceptsRecycling,
      });
      router.push("/donate");
    } catch (error) {
      // Handle error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCenterForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Donation Center</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={centerForm.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="isActive" className="ml-2">
                Center is Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptsTokens"
                name="acceptsTokens"
                checked={centerForm.acceptsTokens}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="acceptsTokens" className="ml-2">
                Accept Token Donations
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptsRecycling"
                name="acceptsRecycling"
                checked={centerForm.acceptsRecycling}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="acceptsRecycling" className="ml-2">
                Accept Recycling
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/donate")}
              className="px-4 py-2 text-gray-700 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCenterPage;
