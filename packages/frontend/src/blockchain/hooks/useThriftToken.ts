import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { THRIFT_ABI, THRIFT_ADDRESS } from '@/blockchain/abis/thrift'

// ThriftToken Contract Hooks
export function useThriftToken() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Read functions
  const { data: totalSupply } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'totalSupply',
  })

  const { data: currentCap } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'currentCap',
  })

  const { data: tokenPrice } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'tokenPrice',
  })

  const { data: rewardPoolAllocation } = useReadContract({
    address: THRIFT_ADDRESS,
    abi: THRIFT_ABI,
    functionName: 'rewardPoolAllocation',
  })

   // Additional read functions
   const useGetBalance = (address: Address) => {
    return useReadContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'balanceOf',
      args: [address],
    })
  }

  const useGetAllowance = (owner: Address, spender: Address) => {
    return useReadContract({
      address: THRIFT_ADDRESS,
      abi: THRIFT_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    })
  }


  // Write functions
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