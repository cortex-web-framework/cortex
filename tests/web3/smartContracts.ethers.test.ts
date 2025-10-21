import { test } from 'node:test';
import assert from 'node:assert';
import { SmartContractClient } from '../../src/web3/smartContracts';
import * as ethers from 'ethers'; // Import the real ethers for types
import { MockJsonRpcProvider, MockContract } from '../mocks/ethers'; // Import mocks

let mockProviderInstance: MockJsonRpcProvider;
let mockContractInstance: MockContract;

test.beforeEach(() => {
  // Mock the ethers module
  test.mock.module('ethers', {
    ...ethers, // Keep original exports for types, if needed
    JsonRpcProvider: class extends MockJsonRpcProvider {
      constructor(url: string) {
        super(url);
        mockProviderInstance = this; // Store instance for assertions
      }
    },
    Contract: class extends MockContract {
      constructor(address: string, abi: any[], provider: any) {
        super(address, abi, provider);
        mockContractInstance = this; // Store instance for assertions
      }
    },
  });
});

test('SmartContractClient should call a contract function', async () => {
  const client = new SmartContractClient('http://localhost:8545');
  const contractAddress = '0xabcdef';
  const abi = [{ "name": "myFunction", "type": "function", "inputs": [{ "type": "uint256", "name": "myNumber" }] }];
  const functionName = 'myFunction';
  const args = [123];

  mockContractInstance.mockResponse = '0x000000000000000000000000000000000000000000000000000000000000007b'; // Mock encoded result for 123

  const result = await client.callContractFunction(contractAddress, abi, functionName, args);

  assert.strictEqual(mockContractInstance.callCount, 1, 'Contract function should be called once');
  assert.strictEqual(mockContractInstance.lastMethod, functionName, 'Correct contract function should be called');
  assert.deepStrictEqual(mockContractInstance.lastArgs, args, 'Correct arguments should be passed to contract function');
  assert.strictEqual(result, '0x000000000000000000000000000000000000000000000000000000000000007b', 'Result should match mock response');
});

test('SmartContractClient should listen to contract events', async () => {
  const client = new SmartContractClient('http://localhost:8545');
  const contractAddress = '0xabcdef';
  const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }], "name": "Transfer", "type": "event" }];
  const eventName = 'Transfer';
  let eventReceived = false;
  const expectedArgs = ['0x123', '0x456', 100];

  const callback = (...args: any[]) => {
    eventReceived = true;
    assert.deepStrictEqual(args, expectedArgs, 'Callback should receive correct event arguments');
  };

  client.listenToEvent(contractAddress, abi, eventName, callback);

  assert.ok(mockContractInstance.eventListeners.has(eventName), 'Event listener should be registered');

  // Simulate event emission
  mockContractInstance.emit(eventName, ...expectedArgs);

  assert.ok(eventReceived, 'Event callback should have been called');
});
