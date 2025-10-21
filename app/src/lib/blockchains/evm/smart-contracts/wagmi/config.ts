import { createConfig, http, fallback } from '@wagmi/core'
import { base, celo, baseSepolia } from '@wagmi/core/chains'
import type { Chain } from 'wagmi/chains'

// Custom Celo Sepolia testnet chain
const celoSepolia: Chain = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
    public: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org' },
  },
  testnet: true,
}

export const wagmiConfig = createConfig({
  chains: [base, celo, baseSepolia, celoSepolia], // Support Base, Celo, Base Sepolia and Celo Sepolia
  //autoConnect: true, // @dev - Restores sessions (But, this ways is the Wagmi v1's way, not v2's way)
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [celo.id]: http('https://forno.celo.org'), // Celo mainnet RPC
    [baseSepolia.id]: http('https://sepolia.base.org'), // Base Sepolia testnet RPC
    [celoSepolia.id]: http(process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'), // Celo Sepolia testnet RPC (override via env)
    
    // [base.id]: fallback([
    //   // Primary RPC - Alchemy (if available)
    //   http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC_URL || undefined),
    //   // Fallback to Coinbase
    //   http('https://mainnet.base.org'),
    //   // Fallback to public Base RPC
    //   http('https://base.gateway.tenderly.co'),
    //   // Final fallback - default Wagmi RPC
    //   http(),
    // ].filter(Boolean))
  },
})