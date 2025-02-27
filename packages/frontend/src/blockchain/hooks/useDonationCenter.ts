import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContracts } from 'wagmi'
import { type Abi, type Address } from 'viem'
import { useMemo } from 'react'

// Import your contract ABI and address
import { DONATION_AND_RECYCLING_ABI, DONATION_AND_RECYCLING_ADDRESS } from '@/blockchain/abis/thrift'

// Types
export type DonationCenter = {
  id: bigint;
  name: string;
  description: string;
  location: string;
  isActive: boolean;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
  isDonation: boolean;
  owner: Address;
  totalDonationsReceived: bigint;
  totalRecyclingReceived: bigint;
  totalTokenDonationsReceived: bigint;
  tokenDonationIds?: bigint[];
  clothingDonationIds?: bigint[];
  recyclingDonationIds?: bigint[];
}

export type PendingDonation = {
  id: bigint;
  donor: Address;
  itemCount: bigint;
  itemType: string;
  description: string;
  timestamp: bigint;
  isRecycling: boolean;
  tokenAmount: bigint;
  weightInKg: bigint;
  isTokenDonation: boolean;
  centerId: bigint;
  isApproved: boolean;
  isProcessed: boolean;
  type?: 'Clothing' | 'Recycling' | 'Token';
  amount?: bigint;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
}

export type ApprovedDonation = PendingDonation;

export type RewardRates = {
  clothingItemRewardNumerator: bigint;
  clothingItemRewardDenominator: bigint;
  clothingWeightRewardNumerator: bigint;
  clothingWeightRewardDenominator: bigint;
  recyclingRewardNumerator: bigint;
  recyclingRewardDenominator: bigint;
  maxDonationReward: bigint;
}

export type DonationType = 'clothing' | 'recycling' | 'token';

// Hook to get donation center details
export function useGetDonationCenter(centerId: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getDonationCenter',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })
}

// Hook to get enhanced donation center details
export function useGetDonationCenterById(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getDonationCenterById',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })

  // Convert raw data to our DonationCenter type
  const donationCenter = useMemo(() => {
    if (!data || !centerId) return undefined
    
    const center = data as {
      name: string;
      description: string;
      location: string;
      isActive: boolean;
      acceptsTokens: boolean;
      acceptsRecycling: boolean;
      isDonation: boolean;
      owner: Address;
      totalDonationsReceived: bigint;
      totalRecyclingReceived: bigint;
      totalTokenDonationsReceived: bigint;
      tokenDonationIds: bigint[];
      clothingDonationIds: bigint[];
      recyclingDonationIds: bigint[];
    }
    
    return {
      id: centerId,
      ...center
    } as DonationCenter
  }, [data, centerId])

  return { donationCenter, ...rest }
}

// Hook to get all active donation centers
export function useGetAllActiveCenters() {
  const { data: rawCenters, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getAllActiveCenters',
  })

  // Process the raw data into our DonationCenter type
  const centers = useMemo(() => {
    if (!rawCenters) return undefined
    
    return (rawCenters as {
      name: string;
      description: string;
      location: string;
      isActive: boolean;
      acceptsTokens: boolean;
      acceptsRecycling: boolean;
      isDonation: boolean;
      owner: Address;
      totalDonationsReceived: bigint;
      totalRecyclingReceived: bigint;
      totalTokenDonationsReceived: bigint;
      tokenDonationIds: bigint[];
      clothingDonationIds: bigint[];
      recyclingDonationIds: bigint[];
    }[]).map((center, index) => ({
      id: BigInt(index + 1),
      ...center
    })) as DonationCenter[]
  }, [rawCenters])

  return { centers, ...rest }
}

// Hook to get centers owned by the current user that are inactive
export function useGetOwnerInactiveCenters() {
  const { data: rawCenters, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getOwnerInactiveCenters',
  })

  // Process the raw data into our DonationCenter type
  const inactiveCenters = useMemo(() => {
    if (!rawCenters) return undefined
    
    return (rawCenters as {
      name: string;
      description: string;
      location: string;
      isActive: boolean;
      acceptsTokens: boolean;
      acceptsRecycling: boolean;
      isDonation: boolean;
      owner: Address;
      totalDonationsReceived: bigint;
      totalRecyclingReceived: bigint;
      totalTokenDonationsReceived: bigint;
      tokenDonationIds: bigint[];
      clothingDonationIds: bigint[];
      recyclingDonationIds: bigint[];
    }[]).map((center, index) => ({
      id: BigInt(index + 1),
      ...center
    })) as DonationCenter[]
  }, [rawCenters])

  return { inactiveCenters, ...rest }
}

// Hook to get pending donations for a center
export function useGetCenterPendingDonations(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getCenterPendingDonations',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })

  return {
    pendingDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

// Hook to get active center pending donations
export function useGetActiveCenterPendingDonations(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getActiveCenterPendingDonations',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })

  return {
    pendingDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

// Hook to get a user's pending donations
export function useGetUserPendingDonations(user: Address | undefined) {
  const { address } = useAccount()
  const effectiveUser = user || address
  
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getUserPendingDonations',
    args: effectiveUser ? [effectiveUser] : undefined,
    query: { enabled: Boolean(effectiveUser) },
  })

  return {
    pendingDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

// Hook to get a user's approved donations
export function useGetUserApprovedDonations(user: Address | undefined) {
  const { address } = useAccount()
  const effectiveUser = user || address
  
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getUserApprovedDonations',
    args: effectiveUser ? [effectiveUser] : undefined,
    query: { enabled: Boolean(effectiveUser) },
  })

  return {
    approvedDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

// Hook to get details of a single pending donation
export function useGetPendingDonation(donationId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getPendingDonation',
    args: donationId ? [donationId] : undefined,
    query: { enabled: Boolean(donationId) },
  })

  // Convert raw data to our PendingDonation type
  const donation = useMemo(() => {
    if (!data || !donationId) return undefined
    
    const [
      donor, itemCount, itemType, description, timestamp, 
      isRecycling, tokenAmount, weightInKg, isTokenDonation, 
      centerId, isApproved, isProcessed
    ] = data as [Address, bigint, string, string, bigint, boolean, bigint, bigint, boolean, bigint, boolean, boolean]
    
    // Determine type and amount based on donation properties
    let type: 'Clothing' | 'Recycling' | 'Token'
    let amount: bigint
    
    if (isTokenDonation) {
      type = 'Token'
      amount = tokenAmount
    } else if (isRecycling) {
      type = 'Recycling'
      amount = weightInKg
    } else {
      type = 'Clothing'
      amount = itemCount
    }
    
    // Determine status based on donation properties
    let status: 'Pending' | 'Approved' | 'Rejected'
    if (isApproved) {
      status = 'Approved'
    } else if (isProcessed) {
      status = 'Rejected'
    } else {
      status = 'Pending'
    }
    
    return {
      id: donationId,
      donor,
      itemCount,
      itemType,
      description,
      timestamp,
      isRecycling,
      tokenAmount,
      weightInKg,
      isTokenDonation,
      centerId,
      isApproved,
      isProcessed,
      type,
      amount,
      status
    } as PendingDonation
  }, [data, donationId])

  return { donation, ...rest }
}

// Hook to get details of a single approved donation
export function useGetApprovedDonation(donationId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getApprovedDonation',
    args: donationId ? [donationId] : undefined,
    query: { enabled: Boolean(donationId) },
  })

  // Convert raw data to our ApprovedDonation type
  const donation = useMemo(() => {
    if (!data || !donationId) return undefined
    
    const [
      donor, itemCount, itemType, description, timestamp, 
      isRecycling, tokenAmount, weightInKg, isTokenDonation, 
      centerId, isApproved, isProcessed
    ] = data as [Address, bigint, string, string, bigint, boolean, bigint, bigint, boolean, bigint, boolean, boolean]
    
    // Determine type and amount based on donation properties
    let type: 'Clothing' | 'Recycling' | 'Token'
    let amount: bigint
    
    if (isTokenDonation) {
      type = 'Token'
      amount = tokenAmount
    } else if (isRecycling) {
      type = 'Recycling'
      amount = weightInKg
    } else {
      type = 'Clothing'
      amount = itemCount
    }
    
    return {
      id: donationId,
      donor,
      itemCount,
      itemType,
      description,
      timestamp,
      isRecycling,
      tokenAmount,
      weightInKg,
      isTokenDonation,
      centerId,
      isApproved,
      isProcessed,
      type,
      amount,
      status: 'Approved'
    } as ApprovedDonation
  }, [data, donationId])

  return { donation, ...rest }
}

// Hook to get donation by ID (can be either pending or approved)
export function useGetDonationById(donationId: bigint | undefined, isApproved: boolean) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getDonationById',
    args: donationId !== undefined ? [donationId, isApproved] : undefined,
    query: { enabled: donationId !== undefined },
  })

  const donation = useMemo(() => {
    if (!data || !donationId) return undefined
    
    const [
      donor, itemCount, itemType, description, timestamp, 
      isRecycling, tokenAmount, weightInKg, isTokenDonation, 
      centerId, _isApproved, isProcessed
    ] = data as [Address, bigint, string, string, bigint, boolean, bigint, bigint, boolean, bigint, boolean, boolean]
    
    // Determine type and amount based on donation properties
    let type: 'Clothing' | 'Recycling' | 'Token'
    let amount: bigint
    
    if (isTokenDonation) {
      type = 'Token'
      amount = tokenAmount
    } else if (isRecycling) {
      type = 'Recycling'
      amount = weightInKg
    } else {
      type = 'Clothing'
      amount = itemCount
    }
    
    // Determine status based on donation properties
    let status: 'Pending' | 'Approved' | 'Rejected'
    if (_isApproved) {
      status = 'Approved'
    } else if (isProcessed) {
      status = 'Rejected'
    } else {
      status = 'Pending'
    }
    
    return {
      id: donationId,
      donor,
      itemCount,
      itemType,
      description,
      timestamp,
      isRecycling,
      tokenAmount,
      weightInKg,
      isTokenDonation,
      centerId,
      isApproved: _isApproved,
      isProcessed,
      type,
      amount,
      status
    } as PendingDonation
  }, [data, donationId])

  return { donation, ...rest }
}

// Hook to get the latest clothing donations for a center
export function useGetLatestClothingDonations(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getLatestClothingDonations',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })

  // Process the raw data into our PendingDonation type
  const clothingDonations = useMemo(() => {
    if (!data || !centerId) return undefined
    
    return (data as PendingDonation[]).map((donation, index) => ({
      ...donation,
      id: BigInt(index), // The contract might not return IDs, so we create them
      type: 'Clothing',
      amount: donation.itemCount,
      status: donation.isApproved ? 'Approved' : (donation.isProcessed ? 'Rejected' : 'Pending')
    })) as PendingDonation[]
  }, [data, centerId])

  return { clothingDonations, ...rest }
}

// Hook to get the latest recycling donations for a center
export function useGetLatestRecyclingDonations(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getLatestRecyclingDonations',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })

  // Process the raw data into our PendingDonation type
  const recyclingDonations = useMemo(() => {
    if (!data || !centerId) return undefined
    
    return (data as PendingDonation[]).map((donation, index) => ({
      ...donation,
      id: BigInt(index), // The contract might not return IDs, so we create them
      type: 'Recycling',
      amount: donation.weightInKg,
      status: donation.isApproved ? 'Approved' : (donation.isProcessed ? 'Rejected' : 'Pending')
    })) as PendingDonation[]
  }, [data, centerId])

  return { recyclingDonations, ...rest }
}

// Hook to get the latest token donations for a center
export function useGetLatestTokenDonations(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getLatestTokenDonations',
    args: centerId ? [centerId] : undefined,
    query: { enabled: Boolean(centerId) },
  })

  // Process the raw data into our PendingDonation type
  const tokenDonations = useMemo(() => {
    if (!data || !centerId) return undefined
    
    return (data as PendingDonation[]).map((donation, index) => ({
      ...donation,
      id: BigInt(index), // The contract might not return IDs, so we create them
      type: 'Token',
      amount: donation.tokenAmount,
      status: donation.isApproved ? 'Approved' : (donation.isProcessed ? 'Rejected' : 'Pending')
    })) as PendingDonation[]
  }, [data, centerId])

  return { tokenDonations, ...rest }
}

// Hook to get details for multiple pending donations
export function useGetPendingDonationsDetails(donationIds: bigint[] | undefined) {
  const contracts = useMemo(() => {
    if (!donationIds) return []
    return donationIds.map(id => ({
      address: DONATION_AND_RECYCLING_ADDRESS as Address,
      abi: DONATION_AND_RECYCLING_ABI as Abi,
      functionName: 'getPendingDonation' as const,
      args: [id] as const
    }))
  }, [donationIds])

  const { data, isLoading, error } = useReadContracts({ contracts })

  const donationsDetails = useMemo(() => {
    if (!data || !donationIds) return []
    
    return data.map((result, index) => {
      const id = donationIds[index]
      if (!result.result) return null
      
      const [
        donor,
        itemCount,
        itemType,
        description,
        timestamp,
        isRecycling,
        tokenAmount,
        weightInKg,
        isTokenDonation,
        centerId,
        isApproved,
        isProcessed
      ] = result.result as [
        Address,
        bigint,
        string,
        string,
        bigint,
        boolean,
        bigint,
        bigint,
        boolean,
        bigint,
        boolean,
        boolean
      ]

      let type: 'Clothing' | 'Recycling' | 'Token'
      let amount: bigint
      
      if (isTokenDonation) {
        type = 'Token'
        amount = tokenAmount
      } else if (isRecycling) {
        type = 'Recycling'
        amount = weightInKg
      } else {
        type = 'Clothing'
        amount = itemCount
      }
      
      let status: 'Pending' | 'Approved' | 'Rejected' = 'Pending'
      if (isApproved) {
        status = 'Approved'
      } else if (isProcessed) {
        status = 'Rejected'
      }

      return {
        id,
        donor,
        itemCount,
        itemType,
        description,
        timestamp,
        isRecycling,
        tokenAmount,
        weightInKg,
        isTokenDonation,
        centerId,
        isApproved,
        isProcessed,
        type,
        amount,
        status
      } as PendingDonation
    }).filter(Boolean) as PendingDonation[]
  }, [data, donationIds])

  return { 
    donationsDetails, 
    isLoading, 
    error,
    refetch: () => {}
  }
}

// Similar fixes for useGetApprovedDonationsDetails
export function useGetApprovedDonationsDetails(donationIds: bigint[] | undefined) {
  const contracts = useMemo(() => {
    if (!donationIds) return []
    return donationIds.map(id => ({
      address: DONATION_AND_RECYCLING_ADDRESS as Address,
      abi: DONATION_AND_RECYCLING_ABI as Abi,
      functionName: 'getApprovedDonation' as const,
      args: [id] as const
    }))
  }, [donationIds])

  const { data, isLoading, error } = useReadContracts({ contracts })

  const donationsDetails = useMemo(() => {
    if (!data || !donationIds) return []
    
    return data.map((result, index) => {
      const id = donationIds[index]
      if (!result.result) return null
      
      const [
        donor,
        itemCount,
        itemType,
        description,
        timestamp,
        isRecycling,
        tokenAmount,
        weightInKg,
        isTokenDonation,
        centerId,
        isApproved,
        isProcessed
      ] = result.result as [
        Address,
        bigint,
        string,
        string,
        bigint,
        boolean,
        bigint,
        bigint,
        boolean,
        bigint,
        boolean,
        boolean
      ]

      let type: 'Clothing' | 'Recycling' | 'Token'
      let amount: bigint
      
      if (isTokenDonation) {
        type = 'Token'
        amount = tokenAmount
      } else if (isRecycling) {
        type = 'Recycling'
        amount = weightInKg
      } else {
        type = 'Clothing'
        amount = itemCount
      }

      return {
        id,
        donor,
        itemCount,
        itemType,
        description,
        timestamp,
        isRecycling,
        tokenAmount,
        weightInKg,
        isTokenDonation,
        centerId,
        isApproved,
        isProcessed,
        type,
        amount,
        status: 'Approved' as const
      } as ApprovedDonation
    }).filter(Boolean) as ApprovedDonation[]
  }, [data, donationIds])

  return { donationsDetails, isLoading, error }
}

// Hook to check if a donation is expired
export function useIsDonationExpired(donationId: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'isDonationExpired',
    args: donationId ? [donationId] : undefined,
    query: { enabled: Boolean(donationId) },
  })
}

// Hook to get reward rates
export function useGetRewardRates() {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getRewardRates',
  })

  const rewardRates = useMemo(() => {
    if (!data) return undefined
    
    const [
      clothingItemRewardNumerator,
      clothingItemRewardDenominator,
      clothingWeightRewardNumerator,
      clothingWeightRewardDenominator,
      recyclingRewardNumerator,
      recyclingRewardDenominator,
      maxDonationReward
    ] = data as [bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    
    return {
      clothingItemRewardNumerator,
      clothingItemRewardDenominator,
      clothingWeightRewardNumerator,
      clothingWeightRewardDenominator,
      recyclingRewardNumerator,
      recyclingRewardDenominator,
      maxDonationReward
    } as RewardRates
  }, [data])

  return { rewardRates, ...rest }
}

// Hook to calculate clothing rewards
export function useCalculateClothingReward(itemCount: bigint | undefined, weightInKg: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'calculateClothingReward',
    args: itemCount !== undefined && weightInKg !== undefined ? [itemCount, weightInKg] : undefined,
    query: { enabled: itemCount !== undefined && weightInKg !== undefined },
  })
}

// Hook to calculate recycling rewards
export function useCalculateRecyclingReward(weightInKg: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'calculateRecyclingReward',
    args: weightInKg !== undefined ? [weightInKg] : undefined,
    query: { enabled: weightInKg !== undefined },
  })
}

// === WRITE OPERATIONS ===

// Hook for donation center management
export function useDonationCenterManagement() {
  const { writeContract } = useWriteContract()
  
  // Add a new donation center
  const addDonationCenter = async (
    name: string,
    description: string,
    location: string,
    acceptsTokens: boolean,
    acceptsRecycling: boolean,
    isDonation: boolean
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'addDonationCenter',
      args: [name, description, location, acceptsTokens, acceptsRecycling, isDonation],
    })
  }
  
  // Update an existing donation center
  const updateDonationCenter = async (
    centerId: bigint,
    isActive: boolean,
    acceptsTokens: boolean,
    acceptsRecycling: boolean,
    isDonation: boolean
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'updateDonationCenter',
      args: [centerId, isActive, acceptsTokens, acceptsRecycling, isDonation],
    })
  }
  
  // Transfer ownership of a donation center
  const transferCenterOwnership = async (
    centerId: bigint,
    newOwner: Address
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'transferCenterOwnership',
      args: [centerId, newOwner],
    })
  }
  
  return {
    addDonationCenter,
    updateDonationCenter,
    transferCenterOwnership,
  }
}

// Hook for donation operations
export function useDonationOperations() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  // Submit a clothing donation
  const submitDonation = async (
    centerId: bigint,
    itemCount: bigint,
    itemType: string,
    description: string,
    weightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'submitDonation',
      args: [centerId, itemCount, itemType, description, weightInKg],
    })
  }
  
  // Submit recycling
  const submitRecycling = async (
    centerId: bigint,
    description: string,
    weightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'submitRecycling',
      args: [centerId, description, weightInKg],
    })
  }
  
  // Donate tokens
  const donateTokens = async (
    centerId: bigint,
    tokenAmount: bigint
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'donateTokens',
      args: [centerId, tokenAmount],
    })
  }
  
  return {
    submitDonation,
    submitRecycling,
    donateTokens,
    transactionHash: hash,
    error,
    isSubmitting: isPending,
    isConfirming: isLoading,
    isSuccess,
  }
}

// Hook for donation approval/rejection operations
export function useDonationApproval() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  // Approve a donation
  const approveDonation = async (
    pendingDonationId: bigint,
    verifiedItemCount: bigint,
    verifiedWeightInKg: bigint
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'approveDonation',
      args: [pendingDonationId, verifiedItemCount, verifiedWeightInKg],
    })
  }
  
  // Reject a donation
  const rejectDonation = async (
    pendingDonationId: bigint,
    reason: string
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'rejectDonation',
      args: [pendingDonationId, reason],
    })
  }
  
  // Expire a donation
  const expireDonation = async (
    pendingDonationId: bigint
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'expireDonation',
      args: [pendingDonationId],
    })
  }
  
  // Batch expire multiple donations
  const batchExpireDonations = async (
    pendingDonationIds: bigint[]
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'batchExpireDonations',
      args: [pendingDonationIds],
    })
  }
  
  return {
    approveDonation,
    rejectDonation,
    expireDonation,
    batchExpireDonations,
    transactionHash: hash,
    error,
    isSubmitting: isPending,
    isConfirming: isLoading,
    isSuccess,
  }
}

// Hook for creator management
export function useCreatorManagement() {
  const { writeContract } = useWriteContract()
  const { address } = useAccount()
  
  // Check if the current user is a creator
  const { data: isCreator } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'approvedCreators',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  })
  
  // Approve a creator (only for contract owner)
  const approveCreator = async (creator: Address) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'approveCreator',
      args: [creator],
    })
  }
  
  // Revoke a creator (only for contract owner)
  const revokeCreator = async (creator: Address) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'revokeCreator',
      args: [creator],
    })
  }
  
  return {
    isCreator: Boolean(isCreator),
    approveCreator,
    revokeCreator,
  }
}

// Hook for reward rate management
export function useRewardRateManagement() {
  const { writeContract } = useWriteContract()
  
  // Update reward rates (only for contract owner)
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
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'updateRewardRates',
      args: [
        clothingItemRewardNumerator,
        clothingItemRewardDenominator,
        clothingWeightRewardNumerator,
        clothingWeightRewardDenominator,
        recyclingRewardNumerator,
        recyclingRewardDenominator,
        maxDonationReward,
      ],
    })
  }
  
  return { updateRewardRates }
}

// Hook for contract ownership management
export function useContractOwnership() {
  const { writeContract } = useWriteContract()
  
  // Get current contract owner
  const { data: owner } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'owner',
  })
  
  // Transfer contract ownership (only for current owner)
  const transferOwnership = async (newOwner: Address) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'transferOwnership',
      args: [newOwner],
    })
  }
  
  // Renounce ownership (only for current owner)
  const renounceOwnership = async () => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'renounceOwnership',
      args: [],
    })
  }
  
  return {
    owner: owner as Address | undefined,
    transferOwnership,
    renounceOwnership,
  }
}

// Combined hook for donation and recycling system
export function useDonationAndRecycling() {
  const { address } = useAccount()
  
  // Get all active centers
  const { centers: allCenters, refetch: refetchCenters } = useGetAllActiveCenters()
  
  // Check if the user is a creator
  const { isCreator } = useCreatorManagement()
  
  // Filter centers based on active status and ownership
  const donationCenters = useMemo(() => {
    if (!allCenters) return null
    
    return allCenters.filter(center => 
      center.isActive || 
      (address && center.owner.toLowerCase() === address.toLowerCase())
    )
  }, [allCenters, address])
  
  // Get center management functions
  const {
    addDonationCenter,
    updateDonationCenter,
    transferCenterOwnership,
  } = useDonationCenterManagement()
  
  // Get donation operations
  const {
    submitDonation,
    submitRecycling,
    donateTokens,
  } = useDonationOperations()
  
  // Donation permissions check
  const canDonate = (center: DonationCenter, donationType: DonationType): boolean => {
    if (!center.isActive) return false
    switch (donationType) {
      case 'clothing': return center.isDonation
      case 'recycling': return center.acceptsRecycling
      case 'token': return center.acceptsTokens
      default: return false
    }
  }
  
  return {
    donationCenters,
    isCreator,
    addDonationCenter,
    updateDonationCenter,
    transferCenterOwnership,
    submitDonation,
    submitRecycling,
    donateTokens,
    canDonate,
    refetchCenters,
  }
}

// Hook for donation statistics
export function useDonationStatistics() {
  const { donationCenters } = useDonationAndRecycling()
  
  const statistics = useMemo(() => {
    if (!donationCenters) return null
    
    const totalCenters = donationCenters.length
    const activeCenters = donationCenters.filter(center => center.isActive).length
    
    let totalClothingDonations = BigInt(0)
    let totalRecyclingWeight = BigInt(0)
    let totalTokenDonations = BigInt(0)
    
    donationCenters.forEach(center => {
      totalClothingDonations += center.totalDonationsReceived
      totalRecyclingWeight += center.totalRecyclingReceived
      totalTokenDonations += center.totalTokenDonationsReceived
    })
    
    return {
      totalCenters,
      activeCenters,
      totalClothingDonations,
      totalRecyclingWeight,
      totalTokenDonations,
    }
  }, [donationCenters])
  
  return statistics
}