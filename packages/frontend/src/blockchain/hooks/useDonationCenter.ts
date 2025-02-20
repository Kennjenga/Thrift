import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { DONATION_ABI, DONATION_ADDRESS } from '@/blockchain/abis/thrift'

export function useDonationContract() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Read functions for counts
  const { data: donationCenterCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'donationCenterCount',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  const { data: pendingDonationCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'pendingDonationCount',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  const { data: approvedDonationCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'approvedDonationCount',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  // Reward rates
  const { data: rewardRates } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getRewardRates',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  // User donation history
  const useUserPendingDonations = () => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getUserPendingDonations',
      args: [address as Address],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  const useUserApprovedDonations = () => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getUserApprovedDonations',
      args: [address as Address],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  // Donation centers read functions
  const { data: approvedCreators, refetch: refetchApprovedCreators } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'approvedCreators',
    args: [address as Address],
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  // Reward calculation functions
  const useCalculateClothingReward = (itemCount: bigint, weightInKg: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'calculateClothingReward',
      args: [itemCount, weightInKg],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  const useCalculateRecyclingReward = (weightInKg: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'calculateRecyclingReward',
      args: [weightInKg],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  // Donation center CRUD
  const useDonationCenter = (centerId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getDonationCenter',
      args: [centerId],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  // Donation data
  const usePendingDonation = (donationId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getPendingDonation',
      args: [donationId],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  const useApprovedDonation = (donationId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getApprovedDonation',
      args: [donationId],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  // Write functions
  // Center management
  const addDonationCenter = async (
    name: string,
    description: string,
    location: string,
    acceptsTokens: boolean,
    acceptsRecycling: boolean
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'addDonationCenter',
      abi: DONATION_ABI,
      args: [name, description, location, acceptsTokens, acceptsRecycling]
    })
  }

  const updateDonationCenter = async (
    centerId: bigint,
    isActive: boolean,
    acceptsTokens: boolean,
    acceptsRecycling: boolean
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'updateDonationCenter',
      abi: DONATION_ABI,
      args: [centerId, isActive, acceptsTokens, acceptsRecycling]
    })
  }

  const transferCenterOwnership = async (centerId: bigint, newOwner: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'transferCenterOwnership',
      abi: DONATION_ABI,
      args: [centerId, newOwner]
    })
  }

  // Creator management
  const approveCreator = async (creator: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'approveCreator',
      abi: DONATION_ABI,
      args: [creator]
    })
  }

  const revokeCreator = async (creator: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'revokeCreator',
      abi: DONATION_ABI,
      args: [creator]
    })
  }

  // Donation submission
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
      args: [centerId, itemCount, itemType, description, weightInKg]
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
      args: [centerId, description, weightInKg]
    })
  }

  const donateTokens = async (
    centerId: bigint,
    tokenAmount: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'donateTokens',
      abi: DONATION_ABI,
      args: [centerId, tokenAmount]
    })
  }

  // Donation approval/rejection
  const approveDonation = async (
    pendingDonationId: bigint,
    verifiedItemCount: bigint,
    verifiedWeightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'approveDonation',
      abi: DONATION_ABI,
      args: [pendingDonationId, verifiedItemCount, verifiedWeightInKg]
    })
  }

  const rejectDonation = async (
    pendingDonationId: bigint,
    reason: string
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'rejectDonation',
      abi: DONATION_ABI,
      args: [pendingDonationId, reason]
    })
  }

  // Reward rate management
  const updateRewardRates = async (
    clothingItemRewardNumerator: bigint,
    clothingItemRewardDenominator: bigint,
    clothingWeightRewardNumerator: bigint,
    clothingWeightRewardDenominator: bigint,
    recyclingRewardNumerator: bigint,
    recyclingRewardDenominator: bigint,
    maxDonationReward: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'updateRewardRates',
      abi: DONATION_ABI,
      args: [
        clothingItemRewardNumerator,
        clothingItemRewardDenominator,
        clothingWeightRewardNumerator,
        clothingWeightRewardDenominator,
        recyclingRewardNumerator,
        recyclingRewardDenominator,
        maxDonationReward
      ]
    })
  }

  // Contract ownership
  const transferOwnership = async (newOwner: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'transferOwnership',
      abi: DONATION_ABI,
      args: [newOwner]
    })
  }

  const renounceOwnership = async () => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'renounceOwnership',
      abi: DONATION_ABI,
    })
  }

  return {
    // Read functions
    donationCenterCount,
    pendingDonationCount,
    approvedDonationCount,
    rewardRates,
    approvedCreators,
    
    // User specific hooks
    useUserPendingDonations,
    useUserApprovedDonations,
    
    // Custom data fetching hooks
    useDonationCenter,
    usePendingDonation,
    useApprovedDonation,
    useCalculateClothingReward,
    useCalculateRecyclingReward,
    
    // Donation center management
    addDonationCenter,
    updateDonationCenter,
    transferCenterOwnership,
    
    // Creator management
    approveCreator,
    revokeCreator,
    
    // Donation submission
    submitDonation,
    submitRecycling,
    donateTokens,
    
    // Donation approval/rejection
    approveDonation,
    rejectDonation,
    
    // Reward rate management
    updateRewardRates,
    
    // Contract ownership
    transferOwnership,
    renounceOwnership,
    
    // Refetch functions
    refetchApprovedCreators,
  }
}