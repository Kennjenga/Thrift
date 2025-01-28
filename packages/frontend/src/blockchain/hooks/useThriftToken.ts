import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { Address } from 'viem'
import { THRIFT_ABI, THRIFT_ADDRESS } from '@/blockchain/abis/thrift'

export function useThriftToken() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Token details
  const { data: balance } = useReadContract({
    address: THRIFT_ADDRESS,
    functionName: 'balanceOf',
    args: [address],
    abi: THRIFT_ABI, 
  })

  const { data: tokenPrice } = useReadContract({
    address: THRIFT_ADDRESS,
    functionName: 'tokenPrice',
    abi: THRIFT_ABI, 
  })

  const { data: totalSupply } = useReadContract({
    address: THRIFT_ADDRESS,
    functionName: 'totalSupply',
    abi: THRIFT_ABI, 
  })

  // Write functions
  const buyTokens = async () => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'buyTokens',
      abi: THRIFT_ABI, 
    })
  }

  const transfer = async (to: Address, amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'transfer',
      abi: THRIFT_ABI, 
      args: [to, amount]
    })
  }

  const approve = async (spender: Address, amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'approve',
      abi: THRIFT_ABI, 
      args: [spender, amount]
    })
  }

  const burn = async (amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'burn',
      abi: THRIFT_ABI, 
      args: [amount]
    })
  }

  const mint = async (to: Address, amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'mint',
      abi: THRIFT_ABI, 
      args: [to, amount]
    })
  }

  const mintReward = async (to: Address, amount: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'mintReward',
      abi: THRIFT_ABI, 
      args: [to, amount]
    })
  }

  const setCap = async (newCap: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'setCap',
      abi: THRIFT_ABI, 
      args: [newCap]
    })
  }

  const setRewardContract = async (contractAddress: Address, authorized: boolean) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'setRewardContract',
      abi: THRIFT_ABI, 
      args: [contractAddress, authorized]
    })
  }

  const setTokenPrice = async (newPrice: bigint) => {
    return writeContract({
      address: THRIFT_ADDRESS,
      functionName: 'setTokenPrice',
      abi: THRIFT_ABI, 
      args: [newPrice]
    })
  }

  return {
    balance,
    tokenPrice,
    totalSupply,
    buyTokens,
    transfer,
    approve,
    burn,
    mint,
    mintReward,
    setCap,
    setRewardContract,
    setTokenPrice
  }
}