// types/donate

export interface DonationCenter {
    id: number;
    name: string;
    description: string;
    location: string;
    acceptsTokens: boolean;
    acceptsRecycling: boolean;
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
  }
  
  export interface DonationCenterHookResult {
    data?: DonationCenter;
    isError: boolean;
    isLoading: boolean;
  }