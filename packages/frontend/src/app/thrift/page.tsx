"use client";

import React, { useState } from "react";
import { useThriftToken } from "@/blockchain/hooks/useThriftToken";
// import { useAccount } from "wagmi";
import { Address } from "viem";

export default function ThriftTokenPage() {
  //   const { address } = useAccount();
  const {
    balance = BigInt(0),
    tokenPrice,
    totalSupply,
    buyTokens,
    transfer,
    approve,
    burn,
    mint,
    mintReward,
    setCap,
    setTokenPrice,
    setRewardContract,
  } = useThriftToken();

  const [transferData, setTransferData] = useState({
    to: "" as Address,
    amount: BigInt(0),
  });

  const [approveData, setApproveData] = useState({
    spender: "" as Address,
    amount: BigInt(0),
  });

  const [tokenPriceData, setTokenPriceData] = useState(BigInt(0));
  const [mintData, setMintData] = useState({
    to: "" as Address,
    amount: BigInt(0),
  });

  const [burnAmount, setBurnAmount] = useState(BigInt(0));
  const [rewardData, setRewardData] = useState({
    to: "" as Address,
    amount: BigInt(0),
  });

  const [capAmount, setCapAmount] = useState(BigInt(0));
  const [rewardContractData, setRewardContractData] = useState({
    contractAddress: "" as Address,
    authorized: false,
  });

  const handleBuyTokens = async () => {
    try {
      await buyTokens();
    } catch (error) {
      console.error("Token purchase failed", error);
    }
  };

  const handleTransfer = async () => {
    try {
      await transfer(transferData.to, transferData.amount);
    } catch (error) {
      console.error("Transfer failed", error);
    }
  };

  const handleApprove = async () => {
    try {
      await approve(approveData.spender, approveData.amount);
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleBurn = async () => {
    try {
      await burn(burnAmount);
    } catch (error) {
      console.error("Burn failed", error);
    }
  };

  const handleMint = async () => {
    try {
      await mint(mintData.to, mintData.amount);
    } catch (error) {
      console.error("Mint failed", error);
    }
  };

  const handleMintReward = async () => {
    try {
      await mintReward(rewardData.to, rewardData.amount);
    } catch (error) {
      console.error("Reward minting failed", error);
    }
  };

  const handleSetTokenPrice = async () => {
    try {
      await setTokenPrice(tokenPriceData);
    } catch (error) {
      console.error("Token price update failed", error);
    }
  };

  const handleSetCap = async () => {
    try {
      await setCap(capAmount);
    } catch (error) {
      console.error("Cap setting failed", error);
    }
  };

  const handleSetRewardContract = async () => {
    try {
      await setRewardContract(
        rewardContractData.contractAddress,
        rewardContractData.authorized
      );
    } catch (error) {
      console.error("Reward contract update failed", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thrift Token Management</h1>

      {/* Token Details */}
      <div className="mb-4 grid md:grid-cols-3 gap-4">
        <div className="border p-4">
          <h2 className="font-semibold">Token Balance</h2>
          <p>{balance?.toString() || "0"}</p>
        </div>
        <div className="border p-4">
          <h2 className="font-semibold">Token Price</h2>
          <p>{(tokenPrice ?? BigInt(0)).toString()}</p>
        </div>
        <div className="border p-4">
          <h2 className="font-semibold">Total Supply</h2>
          <p>{(totalSupply ?? BigInt(0)).toString()}</p>
        </div>
      </div>

      {/* Token Actions Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Buy Tokens */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Buy Tokens</h2>
          <button
            onClick={handleBuyTokens}
            className="w-full bg-blue-500 text-white p-2"
          >
            Buy Tokens
          </button>
        </div>

        {/* Transfer Tokens */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Transfer Tokens</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTransfer();
            }}
            className="space-y-2"
          >
            <input
              type="text"
              placeholder="Recipient Address"
              value={transferData.to}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  to: e.target.value as Address,
                })
              }
              className="w-full p-2 border"
            />
            <input
              type="number"
              placeholder="Amount"
              value={transferData.amount.toString()}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  amount: BigInt(e.target.value),
                })
              }
              className="w-full p-2 border"
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2"
            >
              Transfer
            </button>
          </form>
        </div>

        {/* Approve Spending */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Approve Spending</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApprove();
            }}
            className="space-y-2"
          >
            <input
              type="text"
              placeholder="Spender Address"
              value={approveData.spender}
              onChange={(e) =>
                setApproveData({
                  ...approveData,
                  spender: e.target.value as Address,
                })
              }
              className="w-full p-2 border"
            />
            <input
              type="number"
              placeholder="Amount"
              value={approveData.amount.toString()}
              onChange={(e) =>
                setApproveData({
                  ...approveData,
                  amount: BigInt(e.target.value),
                })
              }
              className="w-full p-2 border"
            />
            <button
              type="submit"
              className="w-full bg-purple-500 text-white p-2"
            >
              Approve
            </button>
          </form>
        </div>

        {/* Burn Tokens */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Burn Tokens</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBurn();
            }}
            className="space-y-2"
          >
            <input
              type="number"
              placeholder="Amount to Burn"
              value={burnAmount.toString()}
              onChange={(e) => setBurnAmount(BigInt(e.target.value))}
              className="w-full p-2 border"
            />
            <button type="submit" className="w-full bg-red-500 text-white p-2">
              Burn
            </button>
          </form>
        </div>

        {/* Mint Tokens */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Mint Tokens</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMint();
            }}
            className="space-y-2"
          >
            <input
              type="text"
              placeholder="Recipient Address"
              value={mintData.to}
              onChange={(e) =>
                setMintData({ ...mintData, to: e.target.value as Address })
              }
              className="w-full p-2 border"
            />
            <input
              type="number"
              placeholder="Amount"
              value={mintData.amount.toString()}
              onChange={(e) =>
                setMintData({ ...mintData, amount: BigInt(e.target.value) })
              }
              className="w-full p-2 border"
            />
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white p-2"
            >
              Mint
            </button>
          </form>
        </div>

        {/* Mint Reward */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Mint Reward</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMintReward();
            }}
            className="space-y-2"
          >
            <input
              type="text"
              placeholder="Recipient Address"
              value={rewardData.to}
              onChange={(e) =>
                setRewardData({ ...rewardData, to: e.target.value as Address })
              }
              className="w-full p-2 border"
            />
            <input
              type="number"
              placeholder="Reward Amount"
              value={rewardData.amount.toString()}
              onChange={(e) =>
                setRewardData({ ...rewardData, amount: BigInt(e.target.value) })
              }
              className="w-full p-2 border"
            />
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white p-2"
            >
              Mint Reward
            </button>
          </form>
        </div>

        {/* Set Token Price */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Set Token Price</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSetTokenPrice();
            }}
            className="space-y-2"
          >
            <input
              type="number"
              placeholder="New Token Price"
              value={tokenPriceData.toString()}
              onChange={(e) => setTokenPriceData(BigInt(e.target.value))}
              className="w-full p-2 border"
            />
            <button type="submit" className="w-full bg-teal-500 text-white p-2">
              Update Price
            </button>
          </form>
        </div>

        {/* Set Token Cap */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Set Token Cap</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSetCap();
            }}
            className="space-y-2"
          >
            <input
              type="number"
              placeholder="New Token Cap"
              value={capAmount.toString()}
              onChange={(e) => setCapAmount(BigInt(e.target.value))}
              className="w-full p-2 border"
            />
            <button
              type="submit"
              className="w-full bg-orange-500 text-white p-2"
            >
              Set Cap
            </button>
          </form>
        </div>

        {/* Set Reward Contract */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-2">Set Reward Contract</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSetRewardContract();
            }}
            className="space-y-2"
          >
            <input
              type="text"
              placeholder="Contract Address"
              value={rewardContractData.contractAddress}
              onChange={(e) =>
                setRewardContractData({
                  ...rewardContractData,
                  contractAddress: e.target.value as Address,
                })
              }
              className="w-full p-2 border"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rewardContractData.authorized}
                onChange={(e) =>
                  setRewardContractData({
                    ...rewardContractData,
                    authorized: e.target.checked,
                  })
                }
              />
              <label>Authorized</label>
            </div>
            <button type="submit" className="w-full bg-pink-500 text-white p-2">
              Update Reward Contract
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
