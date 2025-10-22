// Type definitions for ethers module (without importing actual ethers)
interface JsonRpcPayload {
  method: string;
  params?: any[];
  id?: string | number;
  jsonrpc: string;
}

interface JsonRpcResult {
  jsonrpc: string;
  id: string | number | null;
  result?: any;
  error?: any;
}

export class MockJsonRpcProvider {
  public callCount: number = 0;
  public lastMethod: string = '';
  public lastParams: any[] = [];
  public mockResponse: any = '0x';

  constructor(_url: string) {}

  async call(transaction: any): Promise<string> {
    this.callCount++;
    this.lastMethod = 'eth_call'; // Simulate eth_call
    this.lastParams = [transaction, 'latest']; // Simulate params
    return this.mockResponse;
  }

  async _send(payload: JsonRpcPayload): Promise<JsonRpcResult> {
    this.callCount++;
    this.lastMethod = payload.method;
    this.lastParams = payload.params || [];
    return { jsonrpc: '2.0', id: payload.id || null, result: this.mockResponse };
  }
}

export class MockContract {
  public callCount: number = 0;
  public lastMethod: string = '';
  public lastArgs: any[] = [];
  public mockResponse: any = '0x';
  public eventListeners: Map<string, Function[]> = new Map();

  constructor(_address: string, _abi: any[], _provider: any) {}

  // Generic mock for contract function calls
  [key: string]: any; // Allow dynamic property access

  // Mock for specific function calls
  public async myFunction(...args: any[]): Promise<any> {
    this.callCount++;
    this.lastMethod = 'myFunction';
    this.lastArgs = args;
    return this.mockResponse;
  }

  public on(eventName: string, listener: Function): this {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(listener);
    return this;
  }

  // Helper to simulate an event emission
  public emit(eventName: string, ...args: any[]): void {
    this.eventListeners.get(eventName)?.forEach(listener => listener(...args));
  }
}

// Mock the entire ethers module
const mockEthers = {
  JsonRpcProvider: MockJsonRpcProvider,
  Contract: MockContract,
  // Add other ethers exports as needed by the SmartContractClient
  // For example, if SmartContractClient uses ethers.utils, you'd mock it here.
  // utils: { ... },
};

export default mockEthers;
