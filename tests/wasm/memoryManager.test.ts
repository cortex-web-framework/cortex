import { test } from 'node:test';
import assert from 'node:assert';
import { WasmMemoryManager, createMemoryManager } from '../../src/wasm/memoryManager.js';

// Mock WebAssembly instance for testing
function createMockWasmInstance() {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });
  
  return {
    exports: {
      memory
    }
  } as WebAssembly.Instance;
}

test('WasmMemoryManager should initialize with default config', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const stats = manager.getMemoryStats();
  assert.strictEqual(stats.totalAllocations, 0);
  assert.strictEqual(stats.totalAllocatedSize, 0);
  assert.strictEqual(stats.memoryPages, 1);
});

test('WasmMemoryManager should allocate and deallocate string memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const testString = 'Hello, WebAssembly!';
  const ptr = manager.allocateString(testString);
  
  assert.ok(ptr >= 0);
  assert.strictEqual(manager.readString(ptr), testString);
  
  manager.deallocate(ptr);
  
  // Should throw error when trying to read deallocated memory
  assert.throws(() => {
    manager.readString(ptr);
  }, /Cannot read: pointer/);
});

test('WasmMemoryManager should allocate and deallocate array memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const testArray = [1, 2, 3, 'test', { key: 'value' }];
  const ptr = manager.allocateArray(testArray);
  
  assert.ok(ptr >= 0);
  assert.deepStrictEqual(manager.readArray(ptr), testArray);
  
  manager.deallocate(ptr);
});

test('WasmMemoryManager should allocate and deallocate object memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const testObject = { name: 'test', value: 42, nested: { data: 'value' } };
  const ptr = manager.allocateObject(testObject);
  
  assert.ok(ptr >= 0);
  assert.deepStrictEqual(manager.readObject(ptr), testObject);
  
  manager.deallocate(ptr);
});

test('WasmMemoryManager should allocate and deallocate buffer memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const testBuffer = new Uint8Array([1, 2, 3, 4, 5]);
  const ptr = manager.allocateBuffer(testBuffer);
  
  assert.ok(ptr >= 0);
  const readBuffer = manager.readBuffer(ptr);
  assert.deepStrictEqual(Array.from(readBuffer), Array.from(testBuffer));
  
  manager.deallocate(ptr);
});

test('WasmMemoryManager should track memory statistics', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const ptr1 = manager.allocateString('test1');
  manager.allocateString('test2');
  
  const stats = manager.getMemoryStats();
  assert.strictEqual(stats.totalAllocations, 2);
  assert.ok(stats.totalAllocatedSize > 0);
  assert.strictEqual(stats.freeListSize, 0);
  
  manager.deallocate(ptr1);
  
  const statsAfterDealloc = manager.getMemoryStats();
  assert.strictEqual(statsAfterDealloc.totalAllocations, 1);
  assert.strictEqual(statsAfterDealloc.freeListSize, 1);
});

test('WasmMemoryManager should reuse freed memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const ptr1 = manager.allocateString('test');
  manager.deallocate(ptr1);
  
  const ptr2 = manager.allocateString('new test');
  
  // Should reuse the freed memory
  assert.strictEqual(ptr2, ptr1);
});

test('WasmMemoryManager should handle multiple allocations', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  const pointers: number[] = [];
  
  // Allocate multiple strings
  for (let i = 0; i < 10; i++) {
    const ptr = manager.allocateString(`test string ${i}`);
    pointers.push(ptr);
  }
  
  const stats = manager.getMemoryStats();
  assert.strictEqual(stats.totalAllocations, 10);
  
  // Deallocate all
  pointers.forEach(ptr => manager.deallocate(ptr));
  
  const finalStats = manager.getMemoryStats();
  assert.strictEqual(finalStats.totalAllocations, 0);
  assert.strictEqual(finalStats.freeListSize, 10);
});

test('WasmMemoryManager should throw error for invalid deallocation', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  assert.throws(() => {
    manager.deallocate(999);
  }, /Cannot deallocate: pointer 999 not found/);
});

test('WasmMemoryManager should throw error for invalid read', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);
  
  assert.throws(() => {
    manager.readString(999);
  }, /Cannot read: pointer 999 not found/);
});

test('createMemoryManager should create manager with custom config', () => {
  const instance = createMockWasmInstance();
  const customConfig = {
    initialPages: 2,
    maximumPages: 5,
    gcThreshold: 0.5
  };
  
  const manager = createMemoryManager(instance, customConfig);
  const stats = manager.getMemoryStats();

  assert.strictEqual(stats.memoryPages, 2);
});

test('WasmMemoryManager should handle garbage collection', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance, {
    gcThreshold: 0.1, // Very low threshold for testing
    gcInterval: 100    // Short interval for testing
  });
  
  // Allocate some memory
  const ptr = manager.allocateString('test');
  
  // Force garbage collection
  manager.forceGarbageCollection();
  
  // Should still be able to read the memory
  assert.strictEqual(manager.readString(ptr), 'test');
  
  manager.destroy();
});

test('WasmMemoryManager should clean up on destroy', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const ptr = manager.allocateString('test');
  manager.destroy();

  // Should not be able to read after destroy
  assert.throws(() => {
    manager.readString(ptr);
  }, /Cannot read: pointer/);
});

test('WasmMemoryManager should allocate aligned memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const testBuffer = new Uint8Array([1, 2, 3, 4, 5]);
  const ptr = manager.allocateAligned(testBuffer, 16);

  // Pointer should be aligned to 16-byte boundary
  assert.strictEqual(ptr % 16, 0, 'Pointer should be aligned to 16-byte boundary');

  const readBuffer = manager.readBuffer(ptr);
  assert.deepStrictEqual(Array.from(readBuffer), Array.from(testBuffer));

  manager.deallocate(ptr);
});

test('WasmMemoryManager should enforce alignment constraints', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const testBuffer = new Uint8Array([1, 2, 3, 4, 5]);

  // Test various valid alignments
  const alignments = [1, 2, 4, 8, 16, 32, 64];
  const pointers: number[] = [];

  for (const alignment of alignments) {
    const ptr = manager.allocateAligned(testBuffer, alignment);
    pointers.push(ptr);
    assert.strictEqual(
      ptr % alignment,
      0,
      `Pointer should be aligned to ${alignment}-byte boundary`
    );
    manager.deallocate(ptr);
  }
});

test('WasmMemoryManager should reject invalid alignment', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const testBuffer = new Uint8Array([1, 2, 3, 4, 5]);

  // Test invalid alignments (not powers of 2)
  const invalidAlignments = [3, 5, 7, 9, 15];

  for (const alignment of invalidAlignments) {
    assert.throws(
      () => manager.allocateAligned(testBuffer, alignment),
      /Alignment must be a power of 2/,
      `Should reject alignment of ${alignment}`
    );
  }

  // Test invalid alignment values
  assert.throws(
    () => manager.allocateAligned(testBuffer, 0),
    /Alignment must be a power of 2/
  );

  assert.throws(
    () => manager.allocateAligned(testBuffer, -8),
    /Alignment must be a power of 2/
  );
});

test('WasmMemoryManager should detect memory overflow', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const testBuffer = new Uint8Array([1, 2, 3, 4, 5]);
  const ptr = manager.allocateAligned(testBuffer, 8);

  // Check for overflow (should be none)
  const result = manager.checkOverflow();
  assert.strictEqual(result.overflowed, false, 'Should not detect overflow');
  assert.strictEqual(result.violations.length, 0, 'Should have no violations');

  manager.deallocate(ptr);
});

test('WasmMemoryManager should track multiple aligned allocations', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const pointers: number[] = [];

  // Allocate multiple aligned buffers
  for (let i = 0; i < 5; i++) {
    const buffer = new Uint8Array([i, i + 1, i + 2]);
    const ptr = manager.allocateAligned(buffer, 8);
    pointers.push(ptr);

    // Verify alignment
    assert.strictEqual(ptr % 8, 0);
  }

  // Verify all are tracked
  const stats = manager.getMemoryStats();
  assert.strictEqual(stats.totalAllocations, 5);

  // Deallocate all
  pointers.forEach(ptr => manager.deallocate(ptr));

  const finalStats = manager.getMemoryStats();
  assert.strictEqual(finalStats.totalAllocations, 0);
});

test('WasmMemoryManager should reuse aligned memory', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const buffer = new Uint8Array([1, 2, 3, 4, 5]);
  const ptr1 = manager.allocateAligned(buffer, 16);

  manager.deallocate(ptr1);

  // Allocate again with same alignment
  const ptr2 = manager.allocateAligned(buffer, 16);

  // Should reuse the freed aligned memory
  assert.strictEqual(ptr2, ptr1);
  assert.strictEqual(ptr2 % 16, 0);

  manager.deallocate(ptr2);
});

test('WasmMemoryManager should handle alignment with varying buffer sizes', () => {
  const instance = createMockWasmInstance();
  const manager = new WasmMemoryManager(instance);

  const sizes = [1, 8, 16, 32, 64, 128, 256];
  const pointers: { size: number; ptr: number }[] = [];

  for (const size of sizes) {
    const buffer = new Uint8Array(size);
    const ptr = manager.allocateAligned(buffer, 8);
    pointers.push({ size, ptr });

    // Verify alignment is maintained
    assert.strictEqual(ptr % 8, 0);

    // Verify we can read the data back
    const readBuffer = manager.readBuffer(ptr);
    assert.strictEqual(readBuffer.length, size);
  }

  // Verify all are tracked correctly
  const stats = manager.getMemoryStats();
  assert.strictEqual(stats.totalAllocations, sizes.length);

  // Deallocate all
  pointers.forEach(({ ptr }) => manager.deallocate(ptr));

  const finalStats = manager.getMemoryStats();
  assert.strictEqual(finalStats.totalAllocations, 0);
});
