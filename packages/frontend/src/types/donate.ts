// types/donate

export interface DonationCenter {
    id: number;
    name: string;
    description: string;
    location: string;
    acceptsTokens: boolean;
    acceptsRecycling: boolean;
    acceptsDonations: boolean; // Add this new field
    isActive: boolean;
  }
  
  export interface DonationData {
    itemCount: bigint;
    itemType: string;
    description: string;
    weightInKg: bigint;
  }
  
  export interface RecyclingData {
    description: string;
    weightInKg: bigint;
  }
  
  export interface NewDonationCenterData {
    name: string;
    description: string;
    location: string;
    acceptsTokens: boolean;
    acceptsRecycling: boolean;
    acceptsDonations: boolean; // Add this new field
    centerType: 'donation' | 'recycling' | ''; // Add this to track center type
  }
  
  export interface DonationCenterHookResult {
    data?: DonationCenter;
    isError: boolean;
    isLoading: boolean;
  }