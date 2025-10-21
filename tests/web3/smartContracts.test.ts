import { test } from 'node:test';
import assert from 'node:assert';
import { SmartContractClient } from '../../src/web3/smartContracts';

interface EthCallTransaction {
  to: string;
  data: string;
}

function isEthCallTransaction(obj: any): obj is EthCallTransaction {
  return typeof obj === 'object' && obj !== null && 'to' in obj && 'data' in obj;
}

// Mock RPC client for testing purposes
class MockRpcClient {
  public callCount: number = 0;
  public lastMethod: string = '';
  public lastParams: any[] = []; // Explicitly type as any[]
  public mockResponse: any = '0x123';

  public async call(method: string, params: any[]): Promise<any> {
    this.callCount++;
    this.lastMethod = method;
    this.lastParams = params;
    return this.mockResponse;
  }
}

test.beforeEach(() => {
  // Reset any singletons or global states if necessary
});

test('SmartContractClient should call a contract function', async () => {
  const mockRpc = new MockRpcClient();
  const client = new SmartContractClient(mockRpc as any);
  const contractAddress = '0xabcdef';
  const abi = [{ "name": "myFunction", "type": "function", "inputs": [{ "type": "uint256", "name": "myNumber" }] }];
  const functionName = 'myFunction';
  const args = [123];

  mockRpc.mockResponse = '0x000000000000000000000000000000000000000000000000000000000000007b'; // Mock encoded result for 123

  const result = await client.callFunction(contractAddress, abi, functionName, args);

  assert.strictEqual(mockRpc.callCount, 1, 'RPC client call count should be 1');
  assert.strictEqual(mockRpc.lastMethod, 'eth_call', 'RPC client should call eth_call');
  assert.ok(isEthCallTransaction(mockRpc.lastParams[0]), 'RPC call params should be an EthCallTransaction');
  const transaction: EthCallTransaction = mockRpc.lastParams[0];
  assert.notStrictEqual(mockRpc.lastParams[0].to, undefined, 'RPC call params should include 'to' address');
  assert.notStrictEqual(mockRpc.lastParams[0].to, null, 'RPC call params should include 'to' address');
  assert.notStrictEqual(mockRpc.lastParams[0].data, undefined, 'RPC call params should include 'data'');
  assert.notStrictEqual(mockRpc.lastParams[0].data, null, 'RPC call params should include 'data'');
  assert.strictEqual(result, '0x000000000000000000000000000000000000000000000000000000000000007b', 'Result should match mock response');
});

test('SmartContractClient should listen to contract events', async () => {
  const mockRpc = new MockRpcClient();
  const client = new SmartContractClient(mockRpc as any);
  const contractAddress = '0xabcdef';
  const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }], "name": "Transfer", "type": "event" }];
  const eventName = 'Transfer';
  const filter = { from: '0x123' };

  // Mock RPC client to return logs
  mockRpc.mockResponse = [
    { "address": contractAddress, "topics": ['0x...', '0x00...'], "data": '0x...' }
  ];

  const events = await client.listenToEvents(contractAddress, abi, eventName, filter);

  assert.strictEqual(mockRpc.callCount, 1, 'RPC client call count should be 1');
  assert.strictEqual(mockRpc.lastMethod, 'eth_getLogs', 'RPC client should call eth_getLogs');
  assert.ok(mockRpc.lastParams[0].address, 'RPC call params should include address');
  assert.ok(mockRpc.lastParams[0].topics, 'RPC call params should include topics');
  assert.ok(Array.isArray(events), 'Events should be an array');
  assert.strictEqual(events.length, 1, 'Should return 1 event');
});
