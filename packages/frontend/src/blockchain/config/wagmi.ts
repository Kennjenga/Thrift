import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, arbitrum, base, optimism, Chain } from 'wagmi/chains';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http, createStorage, cookieStorage } from 'wagmi';

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

// Lisk Sepolia Testnet Configuration
export const liskSepolia: Chain = {
  id: 4202, // Confirmed Lisk Sepolia Chain ID
  name: 'Lisk Sepolia',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
    public: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lisk Sepolia Explorer',
      url: 'https://sepolia-explorer.lisk.com', // Replace with actual explorer URL
    },
  },
  testnet: true,
};


const { wallets } = getDefaultWallets();

export const config = getDefaultConfig({
  appName: 'Thrift app',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [
    mainnet,
    sepolia,
    polygon,
    arbitrum,
    base,
    optimism,
    liskSepolia
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [liskSepolia.id]: http(
      process.env.NEXT_PUBLIC_LISK_SEPOLIA_RPC_URL || 'https://rpc.sepolia-api.lisk.com'
    ),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});