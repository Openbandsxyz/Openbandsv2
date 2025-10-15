// import { createBaseAccountSDK, base } from '@base-org/account';
// import type { Config } from 'wagmi';

/**
 * @notice - Base Account SDK instance to get a provider and interact with the Base chain.
 * @notice - This would be worked with a <Wallet /> component and Wallet Modal powered by BASE's OnChainKit.
 * @dev - ref). https://docs.base.org/onchainkit/wallet/wallet
 */
// export async function connectToEvmWalletUsingBaseAccountSDK(): Promise<{ provider: unknown, config: Config }> {
//   const sdk = createBaseAccountSDK({
//     appName: 'My App Name',
//     appLogoUrl: 'https://example.com/logo.png',
//     appChainIds: [base.constants.CHAIN_IDS.base],
//   });

//   // @dev - Get a provider from the Base Account SDK instance, which is avaiable for Wagmi
//   const provider = sdk.getProvider();

//   // @dev - Wagmi configuration to use the provider from Base Account SDK  
//   // @dev - [TODO]: The following "config" should be finalized.
//   const config = createConfig({
//     chains: [base],
//     transports: {
//       [base.id]: custom(provider),
//     },
//   });

//   return { provider, config };
// }
