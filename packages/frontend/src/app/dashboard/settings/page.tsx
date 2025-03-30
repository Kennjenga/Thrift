"use client";

import { useState, useEffect } from "react";
import { useUserAesthetics } from "@/blockchain/hooks/useUserAesthetics";
import {
  Loader2,
  PlusCircle,
  Save,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function AestheticsManager() {
  const { address } = useAccount();
  const {
    userAesthetics,
    isSet,
    isLoading,
    setUserAesthetics,
    deleteUserAesthetics,
    // refreshUserAesthetics,
    formatLastUpdated,
    // lastUpdated,
  } = useUserAesthetics();

  const [editableAesthetics, setEditableAesthetics] = useState<string[]>([]);
  const [newAesthetic, setNewAesthetic] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  // Initialize editable aesthetics when user aesthetics load
  useEffect(() => {
    if (userAesthetics?.length) {
      setEditableAesthetics([...userAesthetics]);
    } else {
      setEditableAesthetics([]);
    }
  }, [userAesthetics]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (
    title: string,
    message: string,
    type: "success" | "error"
  ) => {
    setToast({
      show: true,
      title,
      message,
      type,
    });
  };

  const handleAddAesthetic = () => {
    if (!newAesthetic.trim()) return;

    const trimmedAesthetic = newAesthetic.trim();

    // Check if aesthetic already exists
    if (editableAesthetics.includes(trimmedAesthetic)) {
      showToast(
        "Already added",
        "This aesthetic is already in your list.",
        "error"
      );
      return;
    }

    setEditableAesthetics([...editableAesthetics, trimmedAesthetic]);
    setNewAesthetic("");
  };

  const handleRemoveAesthetic = (index: number) => {
    const updated = [...editableAesthetics];
    updated.splice(index, 1);
    setEditableAesthetics(updated);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await setUserAesthetics(editableAesthetics);
      showToast(
        "Aesthetics saved",
        "Your aesthetics have been updated on the blockchain.",
        "success"
      );
      // We'll refresh after the blockchain event is detected
    } catch (error) {
      console.error("Error saving aesthetics:", error);
      showToast(
        "Save failed",
        error instanceof Error
          ? error.message
          : "Failed to save aesthetics. Please try again.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete all your aesthetics?"))
      return;

    try {
      setIsDeleting(true);
      await deleteUserAesthetics();
      showToast(
        "Aesthetics deleted",
        "Your aesthetics have been removed from the blockchain.",
        "success"
      );
      // We'll refresh after the blockchain event is detected
    } catch (error) {
      console.error("Error deleting aesthetics:", error);
      showToast(
        "Delete failed",
        error instanceof Error
          ? error.message
          : "Failed to delete aesthetics. Please try again.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges =
    JSON.stringify(editableAesthetics) !== JSON.stringify(userAesthetics);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Aesthetics</h1>

      {/* Toast notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 flex items-start gap-3 ${
            toast.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === "success" ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{toast.title}</h3>
            <p className="text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast({ ...toast, show: false })}
            className="ml-auto flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!address ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Connect Wallet</h2>
            <p className="text-gray-500 mt-1">
              Connect your wallet to manage your on-chain aesthetics
            </p>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <ConnectButton />
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Manage Your Aesthetics</h2>
              <p className="text-gray-500 mt-1">
                {isSet
                  ? `Last updated ${formatLastUpdated()}`
                  : "You haven't set any aesthetics yet. Add some below."}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {editableAesthetics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editableAesthetics.map((aesthetic, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm py-1 pl-3 pr-1 rounded-full"
                      >
                        {aesthetic}
                        <button
                          onClick={() => handleRemoveAesthetic(index)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-1"
                          disabled={isSaving || isDeleting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <p className="ml-3 text-sm text-yellow-700">
                        No aesthetics added yet. Add your first aesthetic below.
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 my-4 pt-4"></div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an aesthetic..."
                    value={newAesthetic}
                    onChange={(e) => setNewAesthetic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAesthetic()}
                    disabled={isSaving || isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleAddAesthetic}
                    disabled={!newAesthetic.trim() || isSaving || isDeleting}
                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                onClick={handleDelete}
                disabled={!isSet || isDeleting || isSaving}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={
                  !hasChanges || isSaving || editableAesthetics.length === 0
                }
                className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Your aesthetics are stored on-chain at address {address}.</p>
            <p>Changes will be reflected after transaction confirmation.</p>
          </div>
        </>
      )}
    </div>
  );
}
