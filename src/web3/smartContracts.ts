// Type definitions for ethers module
interface EthersModule {
  JsonRpcProvider: new (url: string) => any;
  Contract: new (address: string, abi: any[], provider: any) => any;
}

export class SmartContractClient {
  private provider: any;
  private ethers: EthersModule;

  constructor(rpcUrl: string, ethersModule?: EthersModule) {
    // Use injected ethers module or create a default one
    // For now, assume it's passed in or will be mocked in tests
    if (!ethersModule) {
      throw new Error('ethers module must be provided as a dependency');
    }
    this.ethers = ethersModule;
    this.provider = new this.ethers.JsonRpcProvider(rpcUrl);
  }

  public async callContractFunction(
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[]
  ): Promise<any> {
    const contract = new this.ethers.Contract(contractAddress, abi, this.provider);
    const result = await contract[functionName](...args);
    return result;
  }

  public listenToEvent(
    contractAddress: string,
    abi: any[],
    eventName: string,
    callback: (...args: any[]) => void
  ): void {
    const contract = new this.ethers.Contract(contractAddress, abi, this.provider);
    contract.on(eventName, callback);
  }
}
