import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { DONATION_ABI, DONATION_ADDRESS } from '@/blockchain/abis/thrift'

export function useDonationContract() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Token details
  const { data: balance } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'balanceOf',
    args: [address],
    abi: DONATION_ABI, 
  })

  const { data: tokenPrice } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'tokenPrice',
    abi: DONATION_ABI, 
  })

  const { data: totalSupply } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'totalSupply',
    abi: DONATION_ABI, 
  })

  // Read functions for counts
  const { data: donationCenterCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'donationCenterCount',
    abi: DONATION_ABI,
  })

  const { data: donationCount } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'donationCount',
    abi: DONATION_ABI,
  })

  // New read functions for donation centers
  const { data: allDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getAllDonationCenters',
    abi: DONATION_ABI,
  })

  const { data: activeDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getActiveDonationCenters',
    abi: DONATION_ABI,
  })

  const { data: totalActiveDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getTotalActiveDonationCenters',
    abi: DONATION_ABI,
  })

  const { data: totalDonationCenters } = useReadContract({
    address: DONATION_ADDRESS,
    functionName: 'getTotalDonationCenters',
    abi: DONATION_ABI,
  })

  const useDonationCenter = (centerId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'getDonationCenter',
      args: [centerId],
      abi: DONATION_ABI,
    })
  }

  const useDonation = (donationId: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'donations',
      args: [donationId],
      abi: DONATION_ABI,
    })
  }

  const useCalculateClothingReward = (itemCount: bigint, weightInKg: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'calculateClothingReward',
      args: [itemCount, weightInKg],
      abi: DONATION_ABI,
    })
  }

  const useCalculateRecyclingReward = (weightInKg: bigint) => {
    return useReadContract({
      address: DONATION_ADDRESS,
      functionName: 'calculateRecyclingReward',
      args: [weightInKg],
      abi: DONATION_ABI,
    })
  }

  // Write functions
  const buyTokens = async () => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'buyTokens',
      abi: DONATION_ABI, 
    })
  }

  const transfer = async (to: Address, amount: bigint) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'transfer',
      abi: DONATION_ABI, 
      args: [to, amount]
    })
  }

  const approve = async (spender: Address, amount: bigint) => {
    return writeContract({
      address: DONATION_ADDRESS,
      functionName: 'approve',
      abi: DONATION_ABI, 
      args: [spender, amount]
    })
  }

  const addDonationCenter = (
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

  const updateDonationCenter = (
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

  const registerDonation = (
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

  const registerRecycling = (
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

  const updateRewardRates = (
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

  return {
    // Token details
    balance,
    tokenPrice,
    totalSupply,
    
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
    buyTokens,
    transfer,
    approve,
    addDonationCenter,
    updateDonationCenter,
    registerDonation,
    registerRecycling,
    updateRewardRates
  }
}