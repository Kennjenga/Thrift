import { type Address } from 'viem';

/**
 * Represents a donation center in the system
 */
export interface DonationCenter {
  id: bigint;
  name: string;
  description: string;
  location: string;
  isActive: boolean;
  acceptsTokens: boolean;
  acceptsRecycling: boolean;
  isDonation: boolean; // Added isDonation field
  owner: Address;
  totalDonationsReceived: bigint;
  totalRecyclingReceived: bigint;
  totalTokenDonationsReceived: bigint;
  tokenDonationIds?: bigint[];
  clothingDonationIds?: bigint[];
  recyclingDonationIds?: bigint[];
}

/**
 * Represents a pending or approved donation in the system
 */
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

/**
 * Represents the reward rates for different donation types
 */
export interface RewardRates {
  clothingItemRewardNumerator: bigint;
  clothingItemRewardDenominator: bigint;
  clothingWeightRewardNumerator: bigint;
  clothingWeightRewardDenominator: bigint;
  recyclingRewardNumerator: bigint;
  recyclingRewardDenominator: bigint;
  maxDonationReward: bigint;
}

/**
 * Enum for donation types
 */
export enum DonationType {
  CLOTHING = 'clothing',
  RECYCLING = 'recycling',
  TOKEN = 'token'
}

/**
 * Represents donation statistics for the application
 */
export interface DonationStatistics {
  totalCenters: number;
  activeCenters: number;
  totalClothingDonations: bigint;
  totalRecyclingWeight: bigint;
  totalTokenDonations: bigint;
}

/**
 * Filter options for donation centers
 */
export interface CenterFilterOptions {
  owner: string;
  isActive: string;
  acceptsTokens: string;
  acceptsRecycling: string;
  isDonation: string; // Added isDonation field
  search: string;
}