"use client"

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { useState, useMemo } from 'react'
import { DONATION_ABI, DONATION_ADDRESS } from '@/blockchain/abis/thrift'
import type {
  DonationCenter,
  PendingDonation,
  RewardRates,
  DonationCenterResponse,
  DonationFormData
} from '@/types/donate'

// Constants
const CHAIN_ID = 11155111 // Sepolia testnet

/**
 * Helper function to convert blockchain response to typed DonationCenter
 */
const toDonationCenter = (response: DonationCenterResponse, id: bigint): DonationCenter => ({
  id,
  ...response
})

/**
 * Core hook for common contract read operations
 */
export function useContractReads() {
  const { data: centerCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'donationCenterCount',
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  const { data: pendingCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'pendingDonationCount',
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  const { data: approvedCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'approvedDonationCount',
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  const { data: rewardRates } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getRewardRates',
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  return {
    centerCount: centerCount as bigint | undefined,
    pendingCount: pendingCount as bigint | undefined,
    approvedCount: approvedCount as bigint | undefined,
    rewardRates: rewardRates as RewardRates | undefined,
  }
}

/**
 * Hook for managing donation centers
 */
export function useDonationCenters() {
  const { writeContract } = useWriteContract()
  const { data: rawCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getAllActiveCenters',
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  const centers = useMemo(() => {
    if (!rawCenters) return undefined
    return (rawCenters as DonationCenterResponse[]).map((center, index) => 
      toDonationCenter(center, BigInt(index + 1))
    )
  }, [rawCenters])

  const addCenter = async (formData: DonationFormData) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'addDonationCenter',
      abi: DONATION_ABI,
      args: [
        formData.name,
        formData.description,
        formData.location,
        formData.acceptsTokens,
        formData.acceptsRecycling
      ],
    })
  }

  const updateCenter = async (
    centerId: bigint,
    isActive: boolean,
    acceptsTokens: boolean,
    acceptsRecycling: boolean
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'updateDonationCenter',
      abi: DONATION_ABI,
      args: [centerId, isActive, acceptsTokens, acceptsRecycling],
    })
  }

  return {
    centers,
    addCenter,
    updateCenter
  }
}

/**
 * Hook for searching and filtering donation centers
 */
export function useDonationCenterSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    donationOnly: false,
    recyclingOnly: false,
    activeOnly: true
  })
  
  const { centers } = useDonationCenters()

  const filteredCenters = useMemo(() => {
    if (!centers) return []

    return centers.filter(center => {
      // Search matching
      const searchMatch = !searchTerm || 
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.location.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filtering
      const typeMatch = (!filters.donationOnly && !filters.recyclingOnly) ||
        (filters.donationOnly && !center.acceptsRecycling) ||
        (filters.recyclingOnly && center.acceptsRecycling)

      // Active status
      const activeMatch = !filters.activeOnly || center.isActive

      return searchMatch && typeMatch && activeMatch
    })
  }, [centers, searchTerm, filters])

  return {
    centers: filteredCenters,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters
  }
}

/**
 * Hook for managing pending and approved donations
 */
export function useDonations() {
  const { writeContract } = useWriteContract()
  const { address: userAddress } = useAccount()

  // Read operations for donations
  const { data: pendingDonations } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getUserPendingDonations',
    args: [userAddress as Address],
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  const { data: approvedDonations } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getUserApprovedDonations',
    args: [userAddress as Address],
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  // Read individual donation details
  const useDonationDetails = (donationId: bigint, isPending: boolean) => {
    const { data: donation } = useReadContract({
      address: DONATION_ADDRESS,
      functionName: isPending ? 'getPendingDonation' : 'getApprovedDonation',
      args: [donationId],
      abi: DONATION_ABI,
      chainId: CHAIN_ID,
    })

    return donation as PendingDonation | undefined
  }

  // Write operations
  const submitDonation = async (
    centerId: bigint,
    itemCount: bigint,
    itemType: string,
    description: string,
    weightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'submitDonation',
      abi: DONATION_ABI,
      args: [centerId, itemCount, itemType, description, weightInKg],
    })
  }

  const submitRecycling = async (
    centerId: bigint,
    description: string,
    weightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'submitRecycling',
      abi: DONATION_ABI,
      args: [centerId, description, weightInKg],
    })
  }

  const approveDonation = async (
    donationId: bigint,
    verifiedItemCount: bigint,
    verifiedWeightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'approveDonation',
      abi: DONATION_ABI,
      args: [donationId, verifiedItemCount, verifiedWeightInKg],
    })
  }

  const rejectDonation = async (donationId: bigint, reason: string) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'rejectDonation',
      abi: DONATION_ABI,
      args: [donationId, reason],
    })
  }

  return {
    submitDonation,
    submitRecycling,
    approveDonation,
    rejectDonation,
    useDonationDetails,
    pendingDonations: pendingDonations as bigint[] | undefined,
    approvedDonations: approvedDonations as bigint[] | undefined
  }
}

/**
 * Hook for calculating donation rewards
 */
export function useRewardCalculator() {
  const useClothingReward = (itemCount: bigint, weightInKg: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'calculateClothingReward',
      args: [itemCount, weightInKg],
      abi: DONATION_ABI,
      chainId: CHAIN_ID,
    })
  }

  const useRecyclingReward = (weightInKg: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'calculateRecyclingReward',
      args: [weightInKg],
      abi: DONATION_ABI,
      chainId: CHAIN_ID,
    })
  }

  return {
    useClothingReward,
    useRecyclingReward
  }
}

/**
 * Hook for managing creator permissions
 */
export function useCreatorManagement() {
  const { writeContract } = useWriteContract()
  const { address: userAddress } = useAccount()

  const { data: isApprovedCreator } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'approvedCreators',
    args: [userAddress as Address],
    abi: DONATION_ABI,
    chainId: CHAIN_ID,
  })

  const approveCreator = async (creator: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'approveCreator',
      abi: DONATION_ABI,
      args: [creator],
    })
  }

  const revokeCreator = async (creator: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'revokeCreator',
      abi: DONATION_ABI,
      args: [creator],
    })
  }

  return {
    isApprovedCreator: isApprovedCreator as boolean | undefined,
    approveCreator,
    revokeCreator
  }
}

/**
 * Main hook that combines all functionality
 */
export function useDonationContract() {
  const contractReads = useContractReads()
  const donationCenters = useDonationCenters()
  const donations = useDonations()
  const rewardCalculator = useRewardCalculator()
  const creatorManagement = useCreatorManagement()

  return {
    ...contractReads,
    ...donationCenters,
    ...donations,
    ...rewardCalculator,
    ...creatorManagement
  }
}