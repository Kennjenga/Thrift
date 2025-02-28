import { useReadContract, useWriteContract, useAccount, useWatchContractEvent } from 'wagmi'
import { Address } from 'viem'
import { useState, useEffect, useCallback } from 'react'
import { USERAESTHETICS_ABI, USERAESTHETICS_ADDRESS } from '@/blockchain/abis/thrift'

// Define type for user profile
interface UserProfile {
  name: string;
  phone: string;
  email: string;
  location: string;
  isProfileSet: boolean;
  profileLastUpdated: number;
}

export function useUserAesthetics(chainId: number = 1) {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  
  // State for profile updates
  const [lastProfileUpdate, setLastProfileUpdate] = useState<number>(0)

  // Custom hook for getting aesthetics for any address
  const useGetUserAesthetics = (userAddress: Address | undefined) => {
    const { data, isError, isLoading, refetch } = useReadContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'getUserAesthetics',
      args: userAddress ? [userAddress] : undefined,
      chainId,
      query: {
        enabled: !!userAddress,
      }
    }) as { 
      data: [string[], boolean, bigint] | undefined, 
      isError: boolean,
      isLoading: boolean,
      refetch: () => void 
    }
    
    // Destructure the returned array with defaults
    const [aesthetics = [], isSet = false, lastUpdated = 0n] = data || []
    
    return { 
      aesthetics, 
      isSet, 
      lastUpdated: lastUpdated ? Number(lastUpdated) : 0,
      isError,
      isLoading,
      refetch
    }
  }

  // Custom hook for getting user profile for any address
  const useGetUserProfile = (userAddress: Address | undefined) => {
    const { data, isError, isLoading, refetch } = useReadContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'getUserProfile',
      args: userAddress ? [userAddress] : undefined,
      chainId,
      query: {
        enabled: !!userAddress,
        refetchInterval: lastProfileUpdate > 0 ? 2000 : 0, // Refetch after update
      }
    }) as { 
      data: [string, string, string, string, boolean, bigint] | undefined, 
      isError: boolean,
      isLoading: boolean,
      refetch: () => void 
    }
    
    // Destructure the returned array with defaults
    const [
      name = '', 
      phone = '', 
      email = '', 
      location = '', 
      isProfileSet = false, 
      profileLastUpdated = 0n
    ] = data || []
    
    const profile: UserProfile = {
      name,
      phone,
      email,
      location,
      isProfileSet,
      profileLastUpdated: profileLastUpdated ? Number(profileLastUpdated) : 0
    }
    
    return { 
      profile,
      isError,
      isLoading,
      refetch
    }
  }

  // Get current user's aesthetics
  const { 
    aesthetics: userAesthetics = [], 
    isSet, 
    lastUpdated, 
    isError: aestheticsError, 
    isLoading: aestheticsLoading, 
    refetch: refetchAesthetics
  } = useGetUserAesthetics(address)
  
  // Get current user's profile
  const {
    profile: userProfile,
    isError: profileError,
    isLoading: profileLoading,
    refetch: refetchProfile
  } = useGetUserProfile(address)

  // Set user aesthetics
  const setUserAesthetics = async (aesthetics: string[]) => {
    if (!address) throw new Error('Wallet not connected')
    
    return writeContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'setUserAesthetics',
      args: [aesthetics],
      chainId,
    })
  }

  // Delete user aesthetics
  const deleteUserAesthetics = async () => {
    if (!address) throw new Error('Wallet not connected')
    
    return writeContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'deleteUserAesthetics',
      chainId,
    })
  }
  
  // Set or update user profile
  const setUserProfile = async (name: string, phone: string, email: string, location: string) => {
    if (!address) throw new Error('Wallet not connected')
    
    const tx = await writeContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'setUserProfile',
      args: [name, phone, email, location],
      chainId,
    })
    
    setLastProfileUpdate(Date.now())
    return tx
  }
  
  // Update a single profile field
  const updateProfileField = async (fieldName: string, value: string) => {
    if (!address) throw new Error('Wallet not connected')
    
    if (!['name', 'phone', 'email', 'location'].includes(fieldName)) {
      throw new Error('Invalid field name')
    }
    
    const tx = await writeContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'updateProfileField',
      args: [fieldName, value],
      chainId,
    })
    
    setLastProfileUpdate(Date.now())
    return tx
  }
  
  // Delete user profile
  const deleteUserProfile = async () => {
    if (!address) throw new Error('Wallet not connected')
    
    const tx = await writeContract({
      address: USERAESTHETICS_ADDRESS,
      abi: USERAESTHETICS_ABI,
      functionName: 'deleteUserProfile',
      chainId,
    })
    
    setLastProfileUpdate(Date.now())
    return tx
  }

  // State for last event timestamp
  const [, setLastEventTimestamp] = useState<number | null>(null)

  // Watch for AestheticsUpdated events
  useWatchContractEvent({
    address: USERAESTHETICS_ADDRESS,
    abi: USERAESTHETICS_ABI,
    eventName: 'AestheticsUpdated',
    chainId,
    onLogs(logs) {
      const log = logs[0]
      if (log && address && ((log as unknown) as { args: { user: string } }).args.user?.toLowerCase() === address.toLowerCase()) {
        setLastEventTimestamp(Date.now())
        refetchAesthetics()
      }
    },
  })
  
  // Watch for ProfileUpdated events
  useWatchContractEvent({
    address: USERAESTHETICS_ADDRESS,
    abi: USERAESTHETICS_ABI,
    eventName: 'ProfileUpdated',
    chainId,
    onLogs(logs) {
      const log = logs[0]
      if (log && address && ((log as unknown) as { args: { user: string } }).args.user?.toLowerCase() === address.toLowerCase()) {
        setLastProfileUpdate(Date.now())
        refetchProfile()
      }
    },
  })
  
  // Watch for ProfileDeleted events
  useWatchContractEvent({
    address: USERAESTHETICS_ADDRESS,
    abi: USERAESTHETICS_ABI,
    eventName: 'ProfileDeleted',
    chainId,
    onLogs(logs) {
      const log = logs[0]
      if (log && address && ((log as unknown) as { args: { user: string } }).args.user?.toLowerCase() === address.toLowerCase()) {
        setLastProfileUpdate(Date.now())
        refetchProfile()
      }
    },
  })
  
  // Refresh all user data
  const refreshUserData = useCallback(() => {
    refetchAesthetics()
    refetchProfile()
  }, [refetchAesthetics, refetchProfile])
  
  // Effect to refresh data on connection changes
  useEffect(() => {
    if (address) {
      refreshUserData()
    }
  }, [address, refreshUserData])

  // Format timestamp to readable date
  const formatLastUpdated = (timestamp: number) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp * 1000).toLocaleString()
  }

  return {
    // Aesthetics state
    userAesthetics,
    isSet,
    lastUpdated: Number(lastUpdated),
    isAestheticsLoading: aestheticsLoading,
    isAestheticsError: aestheticsError,
    
    // Profile state
    userProfile,
    isProfileLoading: profileLoading,
    isProfileError: profileError,
    
    // Common state
    userAddress: address,
    
    // Aesthetics methods
    useGetUserAesthetics,
    setUserAesthetics,
    deleteUserAesthetics,
    
    // Profile methods
    useGetUserProfile,
    setUserProfile,
    updateProfileField,
    deleteUserProfile,
    
    // Utility methods
    refreshUserData,
    refreshUserAesthetics: refetchAesthetics,
    refreshUserProfile: refetchProfile,
    formatLastUpdated,
  }
}