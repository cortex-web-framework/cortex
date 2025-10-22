import { test } from 'node:test';
import assert from 'node:assert';
import { loadWasmModule, instantiateWasmModule, jsToWasm, wasmToJs } from '../../src/wasm/utils.js';

// Mock WebAssembly for testing
const mockWasmModule = new WebAssembly.Module(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));
const mockWasmInstance = new WebAssembly.Instance(mockWasmModule, {});

// Mock fetch for loadWasmModule
global.fetch = async (input: RequestInfo | URL): Promise<Response> => {
  if (input === 'http://localhost/test.wasm') {
    return new Response(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]).buffer, { status: 200 });
  }
  return new Response(null, { status: 404 });
};

// Mock WebAssembly.compile and instantiate
// @ts-ignore
WebAssembly.compile = async (buffer: BufferSource) => mockWasmModule;
// @ts-ignore
WebAssembly.instantiate = async (module: WebAssembly.Module, imports?: WebAssembly.Imports) => mockWasmInstance;

test('loadWasmModule should load a Wasm module', async () => {
  const module = await loadWasmModule('http://localhost/test.wasm');
  assert.strictEqual(module, mockWasmModule, 'Should return the mocked Wasm module');
});

test('instantiateWasmModule should instantiate a Wasm module', async () => {
  const instance = await instantiateWasmModule(mockWasmModule);
  assert.strictEqual(instance, mockWasmInstance, 'Should return the mocked Wasm instance');
});

test('jsToWasm should convert JS data to Wasm-compatible format (pointer)', () => {
  const mockWasmInstance = {
    exports: {
      memory: new WebAssembly.Memory({ initial: 1 })
    }
  } as WebAssembly.Instance;
  const { createMemoryManager } = require('../../src/wasm/memoryManager.js');
  const memoryManager = createMemoryManager(mockWasmInstance);

  const data = { a: 1, b: 'hello' };
  const ptr = jsToWasm(data, memoryManager);
  // jsToWasm should return a pointer (number)
  assert.strictEqual(typeof ptr, 'number', 'Should return a pointer (number)');
  assert.ok(ptr >= 0, 'Pointer should be non-negative');

  memoryManager.destroy();
});

test('wasmToJs should convert Wasm-compatible data to JS object', () => {
  const mockWasmInstance = {
    exports: {
      memory: new WebAssembly.Memory({ initial: 1 })
    }
  } as WebAssembly.Instance;
  const { createMemoryManager } = require('../../src/wasm/memoryManager.js');
  const memoryManager = createMemoryManager(mockWasmInstance);

  const expectedObject = { status: 'ok' };
  const ptr = memoryManager.allocateObject(expectedObject);

  const result = wasmToJs(memoryManager, ptr, 'object');
  assert.deepStrictEqual(result, expectedObject, 'Should return the parsed JS object');

  memoryManager.destroy();
});
