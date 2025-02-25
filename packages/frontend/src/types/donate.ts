// types/donation.ts
import { Address } from 'viem';

export interface DonationSubmission {
  centerId: bigint;
  itemCount: bigint;
  itemType: string;
  description: string;
  weightInKg: bigint;
}

export interface RecyclingSubmission {
  centerId: bigint;
  description: string;
  weightInKg: bigint;
}

export interface TokenDonation {
  centerId: bigint;
  tokenAmount: bigint;
}

export interface PendingDonation {
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
}

export interface RewardRates {
  clothingItemRewardNumerator: bigint;
  clothingItemRewardDenominator: bigint;
  clothingWeightRewardNumerator: bigint;
  clothingWeightRewardDenominator: bigint;
  recyclingRewardNumerator: bigint;
  recyclingRewardDenominator: bigint;
  maxDonationReward: bigint;
}

export interface DonationCenterResponse {
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
}


export interface DonationCenter {
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
}

export interface RewardRates {
  clothingItemRewardNumerator: bigint;
  clothingItemRewardDenominator: bigint;
  clothingWeightRewardNumerator: bigint;
  clothingWeightRewardDenominator: bigint;
  recyclingRewardNumerator: bigint;
  recyclingRewardDenominator: bigint;
  maxDonationReward: bigint;
}

export interface DonationFormData {
  name: string;
  description: string;
  location: string;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
}

export interface NewDonation {
  itemCount?: number;
  itemType?: string;
  description: string;
  weightInKg: number;
  isRecycling: boolean;
}