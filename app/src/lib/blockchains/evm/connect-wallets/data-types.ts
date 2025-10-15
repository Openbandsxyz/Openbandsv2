export interface EthereumRequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface EthereumProvider {
  request(args: EthereumRequestArguments): Promise<unknown>;
  // add more methods as needed
}

// export interface Window {
//   ethereum?: EthereumProvider;
// }