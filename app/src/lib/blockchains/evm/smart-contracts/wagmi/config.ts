import { createConfig, http, fallback } from '@wagmi/core'
import { base, celo } from '@wagmi/core/chains'

export const wagmiConfig = createConfig({
  chains: [base, celo], // Support both Base and Celo networks
  //autoConnect: true, // @dev - Restores sessions (But, this ways is the Wagmi v1's way, not v2's way)
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [celo.id]: http('https://forno.celo.org'), // Celo mainnet RPC
    
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