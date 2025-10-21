import { test } from 'node:test';
import assert from 'node:assert';
import { loadWasmModule, instantiateWasmModule, jsToWasm, wasmToJs } from '../../src/wasm/utils';

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

test('jsToWasm should convert JS data to Wasm-compatible format (length)', () => {
  const data = { a: 1, b: 'hello' };
  const length = jsToWasm(data);
  // The current jsToWasm returns the length of the JSON stringified data
  assert.strictEqual(length, JSON.stringify(data).length, 'Should return the correct length');
});

test('wasmToJs should convert Wasm-compatible data to JS object', () => {
  const expectedObject = { status: 'ok' };
  const jsonString = JSON.stringify(expectedObject);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(jsonString);

  const mockMemoryBuffer = new ArrayBuffer(100);
  const mockMemoryView = new Uint8Array(mockMemoryBuffer);
  mockMemoryView.set(encoded, 0);

  const mockInstance = { exports: { memory: { buffer: mockMemoryBuffer } } };
  const ptr = 0;
  const len = encoded.length;
  const result = wasmToJs(mockInstance as any, ptr, len);
  assert.deepStrictEqual(result, expectedObject, 'Should return the parsed JS object');
});
