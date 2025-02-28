import { useReadContract, useWriteContract, useAccount, useWatchContractEvent } from 'wagmi'
import { Address } from 'viem'
import { useState } from 'react'
import { USERAESTHETICS_ABI, USERAESTHETICS_ADDRESS } from '@/blockchain/abis/thrift'

export function useUserAesthetics(chainId: number = 1) {
 const { address } = useAccount()
 const { writeContract } = useWriteContract()


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


 // Get current user's aesthetics
 const {
   aesthetics: userAesthetics = [],
   isSet,
   lastUpdated,
   isError,
   isLoading,
   refetch
 } = useGetUserAesthetics(address)


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
     }
   },
 })


 // Format timestamp to readable date
 const formatLastUpdated = () => {
   if (!lastUpdated) return 'Never'
   return new Date(Number(lastUpdated) * 1000).toLocaleString()
 }


 return {
   // State
   userAesthetics,
   isSet,
   lastUpdated: Number(lastUpdated),
   isLoading,
   isError,
   userAddress: address,
  
   // Methods
   useGetUserAesthetics,
   setUserAesthetics,
   deleteUserAesthetics,
   refreshUserAesthetics: refetch,
   formatLastUpdated,
 }
}

