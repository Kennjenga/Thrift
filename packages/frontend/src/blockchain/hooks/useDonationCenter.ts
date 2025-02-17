import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { DONATION_ABI, DONATION_ADDRESS } from '@/blockchain/abis/thrift'

export function useDonationContract() {
  useAccount()
  const { writeContract } = useWriteContract()

  // Read functions for counts
  const { data: donationCenterCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'donationCenterCount',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  const { data: donationCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'donationCount',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  // Donation centers read functions
  const { data: allDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getAllDonationCenters',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  const { data: activeDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getActiveDonationCenters',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  const { data: totalActiveDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getTotalActiveDonationCenters',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  const { data: totalDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getTotalDonationCenters',
    abi: DONATION_ABI,
    chainId: 11155111,
  })

  // Custom hooks for specific data
  const useDonationCenter = (centerId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getDonationCenter',
      args: [centerId],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

  const useDonation = (donationId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'donations',
      args: [donationId],
      abi: DONATION_ABI,
      chainId: 11155111,
    })
  }

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

  // Write functions
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

  const registerDonation = async (
    centerId: bigint,
    itemCount: bigint,
    itemType: string,
    description: string,
    weightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'registerDonation',
      abi: DONATION_ABI,
      args: [centerId, itemCount, itemType, description, weightInKg]
    })
  }

  const registerRecycling = async (
    centerId: bigint,
    description: string,
    weightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'registerRecycling',
      abi: DONATION_ABI,
      args: [centerId, description, weightInKg]
    })
  }

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

  const transferCenterOwnership = async (centerId: bigint, newOwner: Address) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'transferCenterOwnership',
      abi: DONATION_ABI,
      args: [centerId, newOwner]
    })
  }

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

  return {
    // Read functions
    donationCenterCount,
    donationCount,
    allDonationCenters,
    activeDonationCenters,
    totalActiveDonationCenters,
    totalDonationCenters,
    useDonationCenter,
    useDonation,
    useCalculateClothingReward,
    useCalculateRecyclingReward,
    
    // Write functions
    addDonationCenter,
    updateDonationCenter,
    registerDonation,
    registerRecycling,
    updateRewardRates,
    transferCenterOwnership,
    approveCreator,
    revokeCreator
  }
}