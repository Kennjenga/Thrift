import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { type Address } from 'viem'
import { useState, useEffect, useMemo } from 'react'
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
  type: 'Clothing' | 'Recycling' | 'Token';
  amount: bigint;
  status: 'Pending' | 'Approved' | 'Rejected';
}

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

// Hooks for individual donation center data
export function useGetDonationCenter(centerId: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getDonationCenter',
    args: centerId ? [centerId] : undefined,
    query: {
      enabled: Boolean(centerId),
    },
    chainId: 11155111, // Sepolia testnet
  })
}

export function useGetActiveCenterPendingDonations(centerId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getActiveCenterPendingDonations',
    args: centerId ? [centerId] : undefined,
    query: {
      enabled: Boolean(centerId),
    },
    chainId: 11155111,
  })

  return {
    pendingDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

export function useGetUserPendingDonations(user: Address | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getUserPendingDonations',
    args: user ? [user] : undefined,
    query: {
      enabled: Boolean(user),
    },
  })

  return {
    pendingDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

export function useGetUserApprovedDonations(user: Address | undefined) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getUserApprovedDonations',
    args: user ? [user] : undefined,
    query: {
      enabled: Boolean(user),
    },
  })

  return {
    approvedDonationIds: data as bigint[] | undefined,
    ...rest
  }
}

// Fetch detailed donation information for a list of IDs
export function useGetPendingDonationsDetails(donationIds: bigint[] | undefined) {
  const [donationsDetails, setDonationsDetails] = useState<PendingDonation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!donationIds || donationIds.length === 0) return

      setIsLoading(true)
      setError(null)
      
      try {
        const details = await Promise.all(
          donationIds.map(async (id) => {
            const contract = {
              address: DONATION_AND_RECYCLING_ADDRESS as Address,
              abi: DONATION_AND_RECYCLING_ABI,
            }
            
            // Use client to read contract data
            const result = await fetch('/api/readContract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contract,
                functionName: 'getPendingDonation',
                args: [id],
              }),
            }).then(res => res.json())
            
            // Map contract response to our type with the ID included
            return {
              id,
              ...result,
            } as PendingDonation
          })
        )
        
        setDonationsDetails(details)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [donationIds])

  return { donationsDetails, isLoading, error }
}

export function useGetApprovedDonationsDetails(donationIds: bigint[] | undefined) {
  const [donationsDetails, setDonationsDetails] = useState<PendingDonation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!donationIds || donationIds.length === 0) return

      setIsLoading(true)
      setError(null)
      
      try {
        const details = await Promise.all(
          donationIds.map(async (id) => {
            const contract = {
              address: DONATION_AND_RECYCLING_ADDRESS as Address,
              abi: DONATION_AND_RECYCLING_ABI,
            }
            
            // Use client to read contract data
            const result = await fetch('/api/readContract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contract,
                functionName: 'getApprovedDonation',
                args: [id],
              }),
            }).then(res => res.json())
            
            // Map contract response to our type with the ID included
            return {
              id,
              ...result,
            } as PendingDonation
          })
        )
        
        setDonationsDetails(details)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [donationIds])

  return { donationsDetails, isLoading, error }
}

// Enhanced hook for donation management with status tracking
export function useDonationManagement() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Submit a donation with status tracking
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

  // Submit recycling with status tracking
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

  // Donate tokens with status tracking
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

  // Approve a donation with status tracking
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

  // Reject a donation with status tracking
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

  return {
    submitDonation,
    submitRecycling,
    donateTokens,
    approveDonation,
    rejectDonation,
    transactionHash: hash,
    error,
    isSubmitting: isPending,
    isConfirming: isLoading,
    isSuccess,
  }
}

// Update the DonationCenterHooks interface to include all returned properties
export interface DonationCenterHooks {
  donationCenters: DonationCenter[] | null;
  donationCenter: DonationCenter | null;
  donationCenterCount: bigint | undefined;
  pendingDonationCount: bigint | undefined;
  pendingDonations: PendingDonation[] | null;
  isCreator: boolean;
  userAddress: string | null;
  
  // Donation methods
  donateCloths: (centerId: string, amount: number) => Promise<void>;
  donateRecycling: (centerId: string, weight: number) => Promise<void>;
  donateTokens: (centerId: string, amount: string) => Promise<void>;
  
  // Donation management
  approveDonation: (centerId: string, donationId: string, donationType: string) => Promise<void>;
  rejectDonation: (donationId: string, reason: string) => Promise<void>;
  
  // Center management
  updateCenter: (
    centerId: string,
    updates: {
      isActive: boolean;
      acceptsTokens: boolean;
      acceptsRecycling: boolean;
    }
  ) => Promise<void>;

  // Add the missing addDonationCenter method
  addDonationCenter: (
    name: string,
    description: string,
    location: string,
    acceptsTokens: boolean,
    acceptsRecycling: boolean
  ) => Promise<void>;

  // Creator management methods
  approveCreator: (account: Address) => Promise<void>;
  revokeCreator: (account: Address) => Promise<void>;

  // Add the missing methods that were causing the error
  updateRewardRates: (
    clothingItemRewardNumerator: bigint,
    clothingItemRewardDenominator: bigint,
    clothingWeightRewardNumerator: bigint,
    clothingWeightRewardDenominator: bigint,
    recyclingRewardNumerator: bigint,
    recyclingRewardDenominator: bigint,
    maxDonationReward: bigint
  ) => Promise<void>;

  // Add refetchDonationCenters method
  refetchDonationCenters: () => Promise<void>;

  // Add helper method to check donation permissions
  canDonate: (center: DonationCenter, donationType: DonationType) => boolean;
}

// Update the useDonationAndRecycling hook
export function useDonationAndRecycling(): DonationCenterHooks {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Read functions
  const { data: rawDonationCenters, refetch: refetchDonationCenters } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getAllActiveCenters',
    chainId: 11155111,
  })

  // Process donation centers data to add IDs and filter based on active status and ownership
  const donationCenters = useMemo(() => {
    if (!rawDonationCenters) return undefined

    return (rawDonationCenters as any[]).map((center, index) => ({
      id: BigInt(index + 1),
      name: center.name,
      description: center.description,
      location: center.location,
      isActive: center.isActive,
      acceptsTokens: center.acceptsTokens,
      acceptsRecycling: center.acceptsRecycling,
      owner: center.owner,
      totalDonationsReceived: center.totalDonationsReceived,
      totalRecyclingReceived: center.totalRecyclingReceived,
      totalTokenDonationsReceived: center.totalTokenDonationsReceived,
      tokenDonationIds: center.tokenDonationIds,
      clothingDonationIds: center.clothingDonationIds,
      recyclingDonationIds: center.recyclingDonationIds,
    })).filter(center => 
      // Show active centers to everyone
      center.isActive || 
      // Show inactive centers only to their owners
      (!center.isActive && address && center.owner.toLowerCase() === address.toLowerCase())
    ) as DonationCenter[]
  }, [rawDonationCenters, address])

  const { data: donationCenterCount } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'donationCenterCount',
    chainId: 11155111,
  })

  const { data: pendingDonationCount } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'pendingDonationCount',
    chainId: 11155111,
  })

  // Creator role checking
  const { data: isCreator } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'approvedCreators',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  })

  // Donation center management
  const addDonationCenter = async (
    name: string, 
    description: string, 
    location: string,
    acceptsTokens: boolean,
    acceptsRecycling: boolean
  ): Promise<void> => {
    await refetchDonationCenters();
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'addDonationCenter',
      args: [name, description, location, acceptsTokens, acceptsRecycling],
    })
  }

  const updateDonationCenter = async (
    centerId: bigint, 
    isActive: boolean, 
    acceptsTokens: boolean, 
    acceptsRecycling: boolean
  ) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'updateDonationCenter',
      args: [centerId, isActive, acceptsTokens, acceptsRecycling],
    })
  }

  // Donation submission functions use the dedicated hook
  const donationManagement = useDonationManagement()

  // Creator management
  const approveCreator = async (account: Address) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'approveCreator',
      args: [account],
    })
  }

  const revokeCreator = async (account: Address) => {
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'revokeCreator',
      args: [account],
    })
  }

  // Transfer center ownership
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

  // Update reward rates (admin function)
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
        maxDonationReward
      ],
    })
  }

  // Check if user is center owner
  const isCenterOwner = (centerId: bigint) => {
    if (!address || !donationCenters) return false
    
    const center = donationCenters.find(c => c.id === centerId)
    return center ? center.owner === address : false
  }

  const canDonate = (center: DonationCenter, donationType: DonationType): boolean => {
    if (!center.isActive) return false;
    
    switch (donationType) {
      case 'token':
        return center.acceptsTokens;
      case 'recycling':
        return center.acceptsRecycling;
      case 'clothing':
        return true; // Assuming clothing donations are always accepted if center is active
      default:
        return false;
    }
  }

  return {
    donationCenters: donationCenters || null,
    donationCenter: null, // You'll need to implement this based on your needs
    donationCenterCount: donationCenterCount as bigint | undefined,
    pendingDonationCount: pendingDonationCount as bigint | undefined,
    pendingDonations: [], // You'll need to implement this based on your needs
    isCreator: Boolean(isCreator),
    userAddress: address || null,

    // Donation methods
    donateCloths: async (centerId: string, amount: number) => {
      const center = donationCenters?.find(c => c.id === BigInt(centerId));
      if (!center || !center.isActive) {
        throw new Error('Center is not active');
      }
      return donationManagement.submitDonation(
        BigInt(centerId),
        BigInt(amount),
        'clothing',
        'Clothing donation',
        BigInt(0)
      );
    },
    donateRecycling: async (centerId: string, weight: number) => {
      const center = donationCenters?.find(c => c.id === BigInt(centerId));
      if (!center || !center.isActive || !center.acceptsRecycling) {
        throw new Error('Center does not accept recycling');
      }
      return donationManagement.submitRecycling(
        BigInt(centerId),
        'Recycling donation',
        BigInt(Math.floor(weight * 1000))
      );
    },
    donateTokens: async (centerId: string, amount: string) => {
      const center = donationCenters?.find(c => c.id === BigInt(centerId));
      if (!center || !center.isActive || !center.acceptsTokens) {
        throw new Error('Center does not accept tokens');
      }
      return donationManagement.donateTokens(
        BigInt(centerId),
        BigInt(amount)
      );
    },

    // Donation management
    approveDonation: async (centerId: string, donationId: string, donationType: string) => {
      return donationManagement.approveDonation(
        BigInt(donationId),
        BigInt(1), // verifiedItemCount
        BigInt(1)  // verifiedWeightInKg
      );
    },
    rejectDonation: async (donationId: string, reason: string) => {
      return donationManagement.rejectDonation(
        BigInt(donationId),
        reason
      );
    },

    // Center management
    updateCenter: async (centerId: string, updates) => {
      return updateDonationCenter(
        BigInt(centerId),
        updates.isActive,
        updates.acceptsTokens,
        updates.acceptsRecycling
      );
    },

    // Creator management
    approveCreator,
    revokeCreator,
    
    // Admin functions
    updateRewardRates,
    // Utility
    refetchDonationCenters: async () => {
      // Implementation for refetching donation centers
    },

    // Add the addDonationCenter implementation
    addDonationCenter,

    // Add helper method to check donation permissions
    canDonate,
  }
}

// Enhanced reward rates hook
export function useGetRewardRates() {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getRewardRates',
    chainId: 11155111,
  })

  // Process the data to match our type
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
    ] = data as bigint[]

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

  return {
    rewardRates,
    ...rest
  }
}

// Enhanced to return typed data
export function useGetLatestDonations(centerId: bigint | undefined) {
  // Combine different donation type retrievals
  const { data: clothingDonationsData, isLoading: isLoadingClothing, error: clothingError } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getLatestClothingDonations',
    args: centerId ? [centerId] : undefined,
    query: {
      enabled: Boolean(centerId),
    },
    chainId: 11155111,
  })

  const { data: recyclingDonationsData, isLoading: isLoadingRecycling, error: recyclingError } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getLatestRecyclingDonations',
    args: centerId ? [centerId] : undefined,
    query: {
      enabled: Boolean(centerId),
    },
    chainId: 11155111,
  })

  const { data: tokenDonationsData, isLoading: isLoadingToken, error: tokenError } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getLatestTokenDonations',
    args: centerId ? [centerId] : undefined,
    query: {
      enabled: Boolean(centerId),
    },
    chainId: 11155111,
  })

  // Process the data to match our types
  const clothingDonations = useMemo(() => {
    if (!clothingDonationsData) return undefined
    return (clothingDonationsData as any[]).map((donation, index) => ({
      id: BigInt(index), // Temporary ID (would ideally get real IDs)
      ...donation
    })) as PendingDonation[]
  }, [clothingDonationsData])

  const recyclingDonations = useMemo(() => {
    if (!recyclingDonationsData) return undefined
    return (recyclingDonationsData as any[]).map((donation, index) => ({
      id: BigInt(index), // Temporary ID (would ideally get real IDs)
      ...donation
    })) as PendingDonation[]
  }, [recyclingDonationsData])

  const tokenDonations = useMemo(() => {
    if (!tokenDonationsData) return undefined
    return (tokenDonationsData as any[]).map((donation, index) => ({
      id: BigInt(index), // Temporary ID (would ideally get real IDs)
      ...donation
    })) as PendingDonation[]
  }, [tokenDonationsData])

  return {
    clothingDonations,
    recyclingDonations,
    tokenDonations,
    isLoading: isLoadingClothing || isLoadingRecycling || isLoadingToken,
    error: clothingError || recyclingError || tokenError
  }
}

// Enhanced donation details hook
export function useGetDonationById(donationId: bigint | undefined, isApproved: boolean) {
  const { data, ...rest } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'getDonationById',
    args: donationId !== undefined ? [donationId, isApproved] : undefined,
    query: {
      enabled: donationId !== undefined,
    },
    chainId: 11155111,
  })

  // Process the data to match our type
  const donation = useMemo(() => {
    if (!data) return undefined

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
      _isApproved,
      isProcessed
    ] = data as [
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

    // Map to PendingDonation type with all required fields
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
      // Add the missing fields
      type: isTokenDonation ? 'Token' : (isRecycling ? 'Recycling' : 'Clothing'),
      amount: isTokenDonation ? tokenAmount : (isRecycling ? weightInKg : itemCount),
      status: _isApproved ? 'Approved' : (isProcessed ? 'Rejected' : 'Pending')
    } as PendingDonation
  }, [data, donationId])

  return {
    donation,
    ...rest
  }
}

// Added hooks for additional functionality

// Hook to check if a donation is expired
export function useIsDonationExpired(donationId: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'isDonationExpired',
    args: donationId ? [donationId] : undefined,
    query: {
      enabled: Boolean(donationId),
    },
    chainId: 11155111,
  })
}

// Hook to calculate rewards for clothing donations
export function useCalculateClothingReward(itemCount: bigint | undefined, weightInKg: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'calculateClothingReward',
    args: itemCount !== undefined && weightInKg !== undefined ? [itemCount, weightInKg] : undefined,
    query: {
      enabled: itemCount !== undefined && weightInKg !== undefined,
    },
    chainId: 11155111,
  })
}

// Hook to calculate rewards for recycling
export function useCalculateRecyclingReward(weightInKg: bigint | undefined) {
  return useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'calculateRecyclingReward',
    args: weightInKg !== undefined ? [weightInKg] : undefined,
    query: {
      enabled: weightInKg !== undefined,
    },
    chainId: 11155111,
  })
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
      totalClothingDonations += center.totalDonationsReceived || BigInt(0)
      totalRecyclingWeight += center.totalRecyclingReceived || BigInt(0)
      totalTokenDonations += center.totalTokenDonationsReceived || BigInt(0)
    })
    
    return {
      totalCenters,
      activeCenters,
      totalClothingDonations,
      totalRecyclingWeight,
      totalTokenDonations
    }
  }, [donationCenters])
  
  return statistics
}

export function useCreatorManagement() {
  const { writeContract } = useWriteContract()
  const { address } = useAccount()

  // Check if the current user is an admin
  const { data: isAdmin } = useReadContract({
    address: DONATION_AND_RECYCLING_ADDRESS,
    abi: DONATION_AND_RECYCLING_ABI,
    functionName: 'isAdmin',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  })

  const approveCreator = async (account: Address) => {
    if (!isAdmin) throw new Error('Not authorized');
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'approveCreator',
      args: [account],
    })
  }

  const revokeCreator = async (account: Address) => {
    if (!isAdmin) throw new Error('Not authorized');
    return writeContract({
      address: DONATION_AND_RECYCLING_ADDRESS,
      abi: DONATION_AND_RECYCLING_ABI,
      functionName: 'revokeCreator',
      args: [account],
    })
  }

  return {
    isAdmin: Boolean(isAdmin),
    approveCreator,
    revokeCreator,
  }
}