import { WasmMemoryManager, createMemoryManager } from './memoryManager.js';

// WebAssembly type declarations for Node.js
declare global {
  namespace WebAssembly {
    interface Module {
      // Module interface
    }
    
    interface Instance {
      exports: Record<string, any>;
    }
    
    interface Imports {
      [key: string]: any;
    }
  }
}

export async function loadWasmModule(wasmUrl: string): Promise<WebAssembly.Module> {
  const response = await fetch(wasmUrl);
  const buffer = await response.arrayBuffer();
  return WebAssembly.compile(buffer);
}

export async function instantiateWasmModule(
  module: WebAssembly.Module,
  imports?: WebAssembly.Imports
): Promise<WebAssembly.Instance> {
  return WebAssembly.instantiate(module, imports);
}

/**
 * Enhanced JS to WASM data transfer with memory management
 */
export function jsToWasm(data: any, memoryManager: WasmMemoryManager): number {
  if (typeof data === 'string') {
    return memoryManager.allocateString(data);
  } else if (Array.isArray(data)) {
    return memoryManager.allocateArray(data);
  } else if (typeof data === 'object' && data !== null) {
    return memoryManager.allocateObject(data);
  } else {
    // For primitive types, convert to string
    return memoryManager.allocateString(String(data));
  }
}

/**
 * Enhanced WASM to JS data transfer with memory management
 */
export function wasmToJs(memoryManager: WasmMemoryManager, ptr: number, type: 'string' | 'array' | 'object' | 'buffer' = 'string'): any {
  switch (type) {
    case 'string':
      return memoryManager.readString(ptr);
    case 'array':
      return memoryManager.readArray(ptr);
    case 'object':
      return memoryManager.readObject(ptr);
    case 'buffer':
      return memoryManager.readBuffer(ptr);
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

/**
 * Create a WASM instance with memory management
 */
export async function createWasmInstance(
  wasmUrl: string,
  memoryConfig?: any
): Promise<{ instance: WebAssembly.Instance; memoryManager: WasmMemoryManager }> {
  const module = await loadWasmModule(wasmUrl);
  const instance = await instantiateWasmModule(module);
  const memoryManager = createMemoryManager(instance, memoryConfig);
  
  return { instance, memoryManager };
}

/**
 * Utility to safely execute WASM functions with memory management
 */
export function executeWasmFunction<T>(
  instance: WebAssembly.Instance,
  memoryManager: WasmMemoryManager,
  functionName: string,
  args: any[] = []
): T {
  const wasmFunction = instance.exports[functionName] as Function;
  if (!wasmFunction) {
    throw new Error(`WASM function '${functionName}' not found`);
  }

  // Convert JS arguments to WASM pointers
  const wasmArgs = args.map(arg => jsToWasm(arg, memoryManager));
  
  try {
    // Execute WASM function
    const result = wasmFunction(...wasmArgs);
    
    // Clean up allocated memory for arguments
    wasmArgs.forEach(ptr => {
      try {
        memoryManager.deallocate(ptr);
      } catch (error) {
        // Ignore deallocation errors for now
        console.warn('Failed to deallocate argument memory:', error);
      }
    });
    
    return result as T;
  } catch (error) {
    // Clean up allocated memory on error
    wasmArgs.forEach(ptr => {
      try {
        memoryManager.deallocate(ptr);
      } catch (deallocError) {
        // Ignore deallocation errors
      }
    });
    throw error;
  }
}
