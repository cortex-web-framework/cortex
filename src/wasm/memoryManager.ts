/**
 * WebAssembly Memory Manager
 * Provides safe memory allocation, deallocation, and data transfer between JS and WASM
 */

/**
 * Memory allocation information
 */
export interface MemoryAllocation {
  ptr: number;           // Pointer to allocated memory
  size: number;          // Size of allocated memory
  type: 'string' | 'array' | 'object' | 'buffer'; // Type of data
  timestamp: number;     // Allocation timestamp
}

/**
 * Memory manager configuration
 */
export interface MemoryManagerConfig {
  initialPages?: number;     // Initial memory pages (64KB each)
  maximumPages?: number;     // Maximum memory pages
  growthFactor?: number;     // Memory growth factor
  gcThreshold?: number;      // Garbage collection threshold
  gcInterval?: number;       // Garbage collection interval (ms)
}

/**
 * Default memory manager configuration
 */
export const DEFAULT_MEMORY_CONFIG: Required<MemoryManagerConfig> = {
  initialPages: 1,           // 64KB initial
  maximumPages: 1000,        // ~64MB maximum
  growthFactor: 2,           // Double memory when growing
  gcThreshold: 0.8,          // GC when 80% full
  gcInterval: 30000,         // 30 seconds
};

/**
 * WebAssembly Memory Manager
 * Handles safe memory allocation, deallocation, and data transfer
 */

// WebAssembly type declarations for Node.js
declare global {
  namespace WebAssembly {
    interface Memory {
      buffer: ArrayBuffer;
      grow(delta: number): number;
    }
    
    interface Instance {
      exports: Record<string, any>;
    }
  }
}
export class WasmMemoryManager {
  private memory: WebAssembly.Memory | undefined;
  private allocations: Map<number, MemoryAllocation> = new Map();
  private freeList: Set<number> = new Set();
  private nextPtr: number = 0;
  private config: Required<MemoryManagerConfig>;
  private gcTimer: NodeJS.Timeout | null = null;

  constructor(instance: WebAssembly.Instance, config: MemoryManagerConfig = {}) {
    this["memory"] = instance.exports["memory"] as WebAssembly.Memory;
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    
    this.initializeMemory();
    this.startGarbageCollection();
  }

  /**
   * Allocate memory for a string
   */
  public allocateString(str: string): number {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    return this.allocateBuffer(encoded, 'string');
  }

  /**
   * Allocate memory for an array
   */
  public allocateArray<T>(arr: T[]): number {
    const jsonString = JSON.stringify(arr);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(jsonString);
    return this.allocateBuffer(encoded, 'array');
  }

  /**
   * Allocate memory for an object
   */
  public allocateObject(obj: any): number {
    const jsonString = JSON.stringify(obj);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(jsonString);
    return this.allocateBuffer(encoded, 'object');
  }

  /**
   * Allocate memory for a buffer
   */
  public allocateBuffer(buffer: Uint8Array, type: MemoryAllocation['type'] = 'buffer'): number {
    const size = buffer.length;
    const ptr = this.findFreeMemory(size);
    
    if (ptr === -1) {
      throw new Error('Failed to allocate memory: insufficient space');
    }

    // Write data to memory
    const memoryView = new Uint8Array(this["memory"]!.buffer, ptr, size);
    memoryView.set(buffer);

    // Track allocation
    const allocation: MemoryAllocation = {
      ptr,
      size,
      type,
      timestamp: Date.now()
    };
    
    this.allocations.set(ptr, allocation);
    this.nextPtr = Math.max(this.nextPtr, ptr + size);

    return ptr;
  }

  /**
   * Deallocate memory
   */
  public deallocate(ptr: number): void {
    const allocation = this.allocations.get(ptr);
    if (!allocation) {
      throw new Error(`Cannot deallocate: pointer ${ptr} not found`);
    }

    // Clear memory
    const memoryView = new Uint8Array(this["memory"]!.buffer, ptr, allocation.size);
    memoryView.fill(0);

    // Remove from tracking
    this.allocations.delete(ptr);
    this.freeList.add(ptr);
  }

  /**
   * Read string from memory
   */
  public readString(ptr: number, length?: number): string {
    const allocation = this.allocations.get(ptr);
    if (!allocation) {
      throw new Error(`Cannot read: pointer ${ptr} not found`);
    }

    const size = length || allocation.size;
    const memoryView = new Uint8Array(this["memory"]!.buffer, ptr, size);
    const decoder = new TextDecoder();
    return decoder.decode(memoryView);
  }

  /**
   * Read array from memory
   */
  public readArray<T>(ptr: number): T[] {
    const str = this.readString(ptr);
    return JSON.parse(str);
  }

  /**
   * Read object from memory
   */
  public readObject<T>(ptr: number): T {
    const str = this.readString(ptr);
    return JSON.parse(str);
  }

  /**
   * Read buffer from memory
   */
  public readBuffer(ptr: number, length?: number): Uint8Array {
    const allocation = this.allocations.get(ptr);
    if (!allocation) {
      throw new Error(`Cannot read: pointer ${ptr} not found`);
    }

    const size = length || allocation.size;
    return new Uint8Array(this["memory"]!.buffer, ptr, size);
  }

  /**
   * Get memory usage statistics
   */
  public getMemoryStats() {
    const totalAllocations = this.allocations.size;
    const totalAllocatedSize = Array.from(this.allocations.values())
      .reduce((sum, alloc) => sum + alloc.size, 0);
    const memoryPages = this["memory"]!.buffer.byteLength / (64 * 1024);
    const memoryUsage = totalAllocatedSize / this["memory"]!.buffer.byteLength;

    return {
      totalAllocations,
      totalAllocatedSize,
      memoryPages,
      memoryUsage,
      freeListSize: this.freeList.size,
      nextPtr: this.nextPtr
    };
  }

  /**
   * Force garbage collection
   */
  public forceGarbageCollection(): void {
    this.performGarbageCollection();
  }

  /**
   * Cleanup and destroy memory manager
   */
  public destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }

    // Clear all allocations
    this.allocations.clear();
    this.freeList.clear();
  }

  /**
   * Initialize memory
   */
  private initializeMemory(): void {
    // Ensure minimum memory size
    if (this["memory"]!.buffer.byteLength < this.config.initialPages * 64 * 1024) {
      this.growMemory(this.config.initialPages);
    }
  }

  /**
   * Find free memory space
   */
  private findFreeMemory(size: number): number {
    // Try to reuse freed memory first
    for (const ptr of this.freeList) {
      const allocation = this.allocations.get(ptr);
      if (!allocation && this.isMemoryFree(ptr, size)) {
        this.freeList.delete(ptr);
        return ptr;
      }
    }

    // Check if we need to grow memory
    const requiredSize = this.nextPtr + size;
    const currentSize = this["memory"]!.buffer.byteLength;
    
    if (requiredSize > currentSize) {
      const pagesNeeded = Math.ceil((requiredSize - currentSize) / (64 * 1024));
      if (!this.growMemory(pagesNeeded)) {
        return -1;
      }
    }

    return this.nextPtr;
  }

  /**
   * Check if memory region is free
   */
  private isMemoryFree(ptr: number, size: number): boolean {
    const endPtr = ptr + size;
    
    // Check if any existing allocation overlaps
    for (const allocation of this.allocations.values()) {
      const allocEnd = allocation.ptr + allocation.size;
      if (ptr < allocEnd && endPtr > allocation.ptr) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Grow memory by specified number of pages
   */
  private growMemory(pages: number): boolean {
    try {
      const currentPages = this["memory"]!.buffer.byteLength / (64 * 1024);
      const newPages = Math.min(currentPages + pages, this.config.maximumPages);
      
      if (newPages <= currentPages) {
        return false;
      }

      (this["memory"] as any).grow(newPages - currentPages);
      return true;
    } catch (error) {
      console["error"]('Failed to grow memory:', error);
      return false;
    }
  }

  /**
   * Start automatic garbage collection
   */
  private startGarbageCollection(): void {
    this.gcTimer = setInterval(() => {
      this.performGarbageCollection();
    }, this.config.gcInterval);
  }

  /**
   * Perform garbage collection
   */
  private performGarbageCollection(): void {
    const stats = this.getMemoryStats();
    
    if (stats.memoryUsage > this.config.gcThreshold) {
      // Clean up old allocations (older than 5 minutes)
      const cutoffTime = Date.now() - 300000;
      const toRemove: number[] = [];
      
      for (const [ptr, allocation] of this.allocations.entries()) {
        if (allocation.timestamp < cutoffTime) {
          toRemove.push(ptr);
        }
      }
      
      toRemove.forEach(ptr => this.deallocate(ptr));
      
      console.log(`Garbage collection: removed ${toRemove.length} allocations`);
    }
  }
}

/**
 * Create a memory manager for a WebAssembly instance
 */
export function createMemoryManager(
  instance: WebAssembly.Instance,
  config?: MemoryManagerConfig
): WasmMemoryManager {
  return new WasmMemoryManager(instance, config);
}

/**
 * Utility function to load and instantiate a WASM module with memory management
 */
export async function loadWasmWithMemory(
  wasmUrl: string,
  config?: MemoryManagerConfig
): Promise<{ instance: WebAssembly.Instance; memoryManager: WasmMemoryManager }> {
  const response = await fetch(wasmUrl);
  const buffer = await response.arrayBuffer();
  const module = await (WebAssembly as any).compile(buffer);
  const instance = await (WebAssembly as any).instantiate(module);
  
  const memoryManager = createMemoryManager(instance, config);
  
  return { instance, memoryManager };
}
