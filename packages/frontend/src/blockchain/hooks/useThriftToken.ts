import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { THRIFT_ABI, THRIFT_ADDRESS } from '@/blockchain/abis/thrift'

export function useThriftToken() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Read functions with proper typing
  const { data: totalSupply = 0n } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'totalSupply',
    chainId: 11155111,
  }) as { data: bigint | undefined }

  const { data: currentCap = 0n } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'currentCap',
    chainId: 11155111,
  }) as { data: bigint | undefined }

  const { data: tokenPrice = 0n } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'tokenPrice',
  }) as { data: bigint | undefined }

  const { data: rewardPoolAllocation = 0n } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'rewardPoolAllocation',
  }) as { data: bigint | undefined }

  // Typed balance hook
  const useGetBalance = (address: Address) => {
    const { data = 0n } = useReadContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'balanceOf',
      args: [address],
    }) as { data: bigint | undefined }
    return { data }
  }

  // Typed allowance hook
  const useGetAllowance = (owner: Address, spender: Address) => {
    const { data = 0n } = useReadContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    }) as { data: bigint | undefined }
    return { data }
  }

  // Write functions remain the same
  const buyTokens = async (ethAmount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'buyTokens',
      value: ethAmount,
    })
  }

  const burn = async (amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'burn',
      args: [amount],
    })
  }

  const setTokenPrice = async (newPrice: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'setTokenPrice',
      args: [newPrice],
    })
  }

  const setCap = async (newCap: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'setCap',
      args: [newCap],
    })
  }

  const approve = async (spender: Address, amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  const transfer = async (to: Address, amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'transfer',
      args: [to, amount],
    })
  }

  return {
    totalSupply,
    currentCap,
    tokenPrice,
    rewardPoolAllocation,
    userAddress: address,
    useGetBalance,
    useGetAllowance,
    approve,
    transfer,
    buyTokens,
    burn,
    setTokenPrice,
    setCap,
  }
}