"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  useContractOwnership,
  useCreatorManagement,
} from "@/blockchain/hooks/useDonationCenter";
import { type Address } from "viem";
import { useReadContract } from "wagmi";
import {
  DONATION_AND_RECYCLING_ABI,
  DONATION_AND_RECYCLING_ADDRESS,
} from "@/blockchain/abis/thrift";

const AdminCreatorManagementPage: React.FC = () => {
  const { address: userAddress } = useAccount();
  const { owner } = useContractOwnership();
  const { approveCreator, revokeCreator } = useCreatorManagement();

  const [newCreatorAddress, setNewCreatorAddress] = useState<string>("");
  const [revokeCreatorAddress, setRevokeCreatorAddress] = useState<string>("");
  const [isSubmittingApprove, setIsSubmittingApprove] =
    useState<boolean>(false);
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState<boolean>(false);
  //   const [creators, setCreators] = useState<Address[]>([]);
  //   const [currentPage, setCurrentPage] = useState<number>(1);
  //   const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // For checking creator status from input fields
  const [addressToCheck, setAddressToCheck] = useState<Address | null>(null);

  // Use the read contract hook at component level for checking creator status
  const { data: isAddressCreator } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: "approvedCreators",
    args: addressToCheck ? [addressToCheck] : undefined,
    query: { enabled: Boolean(addressToCheck) },
  });

  //   const creatorsPerPage = 12;
  const isAdmin =
    userAddress && owner && userAddress.toLowerCase() === owner.toLowerCase();

  // Function to format wallet addresses for display
  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Use contract hook to get approved creators list
  //   const { data: approvedCreatorsList, refetch: refetchCreators } =
  //     useReadContract({
  //       address: DONATION_AND_RECYCLING_ADDRESS,
  //       abi: DONATION_AND_RECYCLING_ABI,
  //       functionName: "getApprovedCreators", // This function name should match your actual contract
  //     });

  //   console.log("creator list", approvedCreatorsList);

  // Function to fetch creators - memoized with useCallback
  //   const fetchCreators = useCallback(async () => {
  //     setIsLoading(true);
  //     setError(null);

  //     try {
  //       await refetchCreators();

  //       if (Array.isArray(approvedCreatorsList)) {
  //         setCreators(approvedCreatorsList as Address[]);
  //       } else if (approvedCreatorsList) {
  //         // Handle case where result exists but is not an array
  //         console.warn(
  //           "Creator list is not in expected format:",
  //           approvedCreatorsList
  //         );
  //         setCreators([]);
  //       } else {
  //         // If no data, empty array
  //         setCreators([]);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching creators:", err);
  //       setError("Failed to load creators. Please try again later.");
  //       setCreators([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, [approvedCreatorsList, refetchCreators]);

  // Check if an address is a creator
  //   const checkIfCreator = async (address: string): Promise<boolean> => {
  //     try {
  //       setAddressToCheck(address as Address);
  //       // Return result from the last check
  //       return Boolean(isAddressCreator);
  //     } catch (err) {
  //       console.error("Error checking if address is creator:", err);
  //       return false;
  //     }
  //   };

  // Set creators when data is available
  //   useEffect(() => {
  //     if (approvedCreatorsList && Array.isArray(approvedCreatorsList)) {
  //       setCreators(approvedCreatorsList as Address[]);
  //       setIsLoading(false);
  //     }
  //   }, [approvedCreatorsList]);

  // Initial fetch on component mount
  //   useEffect(() => {
  //     if (isAdmin) {
  //       setIsLoading(true);
  //       refetchCreators().catch((err) => {
  //         console.error("Error fetching creators:", err);
  //         setError("Failed to load creators. Please try again later.");
  //         setIsLoading(false);
  //       });
  //     }
  //   }, [isAdmin, refetchCreators]);

  // Handle approving a new creator
  const handleApproveCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCreatorAddress) {
      setError("Please enter a valid address");
      return;
    }

    setIsSubmittingApprove(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(newCreatorAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Set address to check
      setAddressToCheck(newCreatorAddress as Address);

      // Wait for the next render to get updated isAddressCreator
      setTimeout(async () => {
        // Check if already a creator
        if (isAddressCreator) {
          setError("This address is already a creator");
          setIsSubmittingApprove(false);
          return;
        }

        try {
          // Approve creator
          await approveCreator(newCreatorAddress as Address);

          setSuccessMessage(
            `Creator role granted to ${formatAddress(newCreatorAddress)}`
          );
          setNewCreatorAddress("");

          // Refresh the creators list
          //   await fetchCreators();
        } catch (err: unknown) {
          console.error("Error approving creator:", err);
          setError(
            (err as Error).message ||
              "Failed to approve creator. Please try again."
          );
        } finally {
          setIsSubmittingApprove(false);
        }
      }, 500);
    } catch (err: unknown) {
      console.error("Error in validation:", err);
      setError((err as Error).message || "Invalid address format");
      setIsSubmittingApprove(false);
    }
  };

  // Handle revoking a creator
  const handleRevokeCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!revokeCreatorAddress) {
      setError("Please enter a valid address");
      return;
    }

    setIsSubmittingRevoke(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(revokeCreatorAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Set address to check
      setAddressToCheck(revokeCreatorAddress as Address);

      // Wait for the next render to get updated isAddressCreator
      setTimeout(async () => {
        // Check if actually a creator
        if (!isAddressCreator) {
          setError("This address is not a creator");
          setIsSubmittingRevoke(false);
          return;
        }

        try {
          // Revoke creator
          await revokeCreator(revokeCreatorAddress as Address);

          setSuccessMessage(
            `Creator role revoked from ${formatAddress(revokeCreatorAddress)}`
          );
          setRevokeCreatorAddress("");

          // Refresh the creators list
          //   await refetchCreators();
        } catch (err: unknown) {
          console.error("Error revoking creator:", err);
          setError(
            (err as Error).message ||
              "Failed to revoke creator. Please try again."
          );
        } finally {
          setIsSubmittingRevoke(false);
        }
      }, 500);
    } catch (err: unknown) {
      console.error("Error in validation:", err);
      setError((err as Error).message || "Invalid address format");
      setIsSubmittingRevoke(false);
    }
  };

  // Handle direct revoke from list
  //   const handleRevokeFromList = async (address: Address) => {
  //     setIsSubmittingRevoke(true);
  //     setError(null);
  //     setSuccessMessage(null);

  //     try {
  //       await revokeCreator(address);
  //       setSuccessMessage(
  //         `Creator role revoked from ${formatAddress(address.toString())}`
  //       );

  //       // Refresh the creators list
  //       //   await fetchCreators();
  //     } catch (err: unknown) {
  //       console.error("Error revoking creator:", err);
  //       setError(
  //         (err as Error).message || "Failed to revoke creator. Please try again."
  //       );
  //     } finally {
  //       setIsSubmittingRevoke(false);
  //     }
  //   };

  // Calculate pagination
  //   const indexOfLastCreator = currentPage * creatorsPerPage;
  //   const indexOfFirstCreator = indexOfLastCreator - creatorsPerPage;
  //   const currentCreators = creators.slice(
  //     indexOfFirstCreator,
  //     indexOfLastCreator
  //   );
  //   const totalPages = Math.ceil(creators.length / creatorsPerPage);

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Creator Management
          </h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-center flex-col py-12">
              <svg
                className="w-16 h-16 text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 text-center max-w-md">
                You need to be the contract owner to access this page. Please
                connect with the admin account to manage creators.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Creator Management
        </h1>

        {/* Alert Messages */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Grant Creator Role */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Grant Creator Role
            </h2>
            <form onSubmit={handleApproveCreator}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newCreatorAddress}
                  onChange={(e) => setNewCreatorAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmittingApprove}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md ${
                  isSubmittingApprove ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmittingApprove}
              >
                {isSubmittingApprove ? "Processing..." : "Grant Creator Role"}
              </button>
            </form>
          </div>

          {/* Revoke Creator Role */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Revoke Creator Role
            </h2>
            <form onSubmit={handleRevokeCreator}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={revokeCreatorAddress}
                  onChange={(e) => setRevokeCreatorAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmittingRevoke}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ${
                  isSubmittingRevoke ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmittingRevoke}
              >
                {isSubmittingRevoke ? "Processing..." : "Revoke Creator Role"}
              </button>
            </form>
          </div>
        </div>

        {/* Creators List
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Current Creators
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading creators...</p>
            </div>
          ) : creators.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCreators.map((creator, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {formatAddress(creator.toString())}
                              <span className="text-xs text-gray-500 ml-2">
                                ({creator})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRevokeFromList(creator)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isSubmittingRevoke}
                          >
                            {isSubmittingRevoke ? "Processing..." : "Revoke"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              Pagination
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No creators found.</p>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default AdminCreatorManagementPage;
