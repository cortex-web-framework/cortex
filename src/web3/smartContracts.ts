import { ethers } from 'ethers';

export class SmartContractClient {
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  public async callContractFunction(
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[]
  ): Promise<any> {
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const result = await contract[functionName](...args);
    return result;
  }

  public listenToEvent(
    contractAddress: string,
    abi: any[],
    eventName: string,
    callback: (...args: any[]) => void
  ): void {
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    contract.on(eventName, callback);
  }
}
