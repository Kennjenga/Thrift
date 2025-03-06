import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, arbitrum, base, optimism } from 'wagmi/chains';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http, createStorage, cookieStorage } from 'wagmi';

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

const { wallets } = getDefaultWallets();

const liskSepolia = {
  id: 4202, // Chain ID for Lisk Sepolia
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://lisk-sepolia.rpc.url'], // Use an array of RPC URLs
    },
  },
  blockExplorers: {
    default: {
      name: 'Lisk Sepolia Explorer',
      url: 'https://explorer.lisk-sepolia.url', // Replace with the actual explorer URL
    },
  },
};



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
    liskSepolia, // Add this to support Lisk Sepolia
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [liskSepolia.id]: http(`https://lisk-sepolia.rpc.url`)
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});