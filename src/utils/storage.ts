/**
 * Storage utilities - NO external dependencies
 * Type-safe localStorage and sessionStorage wrappers
 */

/**
 * Get item from storage with automatic JSON parsing
 * @param key Storage key
 * @param storage Storage object (default: localStorage)
 * @returns Parsed value or null
 */
export function getItem<T = any>(key: string, storage: Storage = localStorage): T | null {
  const value = storage.getItem(key);
  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    // If parsing fails, return the raw value as string
    return value as T;
  }
}

/**
 * Set item in storage with automatic JSON serialization
 * @param key Storage key
 * @param value Value to store
 * @param storage Storage object (default: localStorage)
 */
export function setItem<T = any>(key: string, value: T, storage: Storage = localStorage): void {
  try {
    if (value === null || value === undefined) {
      storage.removeItem(key);
    } else if (typeof value === 'string') {
      storage.setItem(key, value);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded');
    }
  }
}

/**
 * Remove item from storage
 * @param key Storage key
 * @param storage Storage object (default: localStorage)
 */
export function removeItem(key: string, storage: Storage = localStorage): void {
  storage.removeItem(key);
}

/**
 * Clear all items from storage
 * @param storage Storage object (default: localStorage)
 */
export function clear(storage: Storage = localStorage): void {
  storage.clear();
}

/**
 * Check if key exists in storage
 * @param key Storage key
 * @param storage Storage object (default: localStorage)
 * @returns True if key exists
 */
export function hasItem(key: string, storage: Storage = localStorage): boolean {
  return storage.getItem(key) !== null;
}

/**
 * Get all keys from storage
 * @param storage Storage object (default: localStorage)
 * @returns Array of keys
 */
export function keys(storage: Storage = localStorage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Get all items from storage as object
 * @param storage Storage object (default: localStorage)
 * @returns Object with all items
 */
export function getAll(storage: Storage = localStorage): Record<string, any> {
  const items: Record<string, any> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      items[key] = getItem(key, storage);
    }
  }
  return items;
}

/**
 * Get storage size in bytes
 * @param storage Storage object (default: localStorage)
 * @returns Size in bytes
 */
export function getSize(storage: Storage = localStorage): number {
  let size = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      if (value) {
        size += key.length + value.length;
      }
    }
  }
  return size * 2; // Rough estimate (each character is 2 bytes in UTF-16)
}

/**
 * Listen for storage changes
 * @param key Key to listen for (null for all keys)
 * @param callback Callback function
 * @returns Unsubscribe function
 */
export function onStorageChange(
  key: string | null,
  callback: (value: any, oldValue: any, key: string) => void
): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    if (key === null || event.key === key) {
      try {
        const newValue = event.newValue ? JSON.parse(event.newValue) : null;
        const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
        callback(newValue, oldValue, event.key || '');
      } catch {
        callback(event.newValue, event.oldValue, event.key || '');
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Create a type-safe storage wrapper
 * @param prefix Prefix for all keys
 * @param storage Storage object (default: localStorage)
 * @returns Storage wrapper object
 */
export function createStorage(prefix: string = '', storage: Storage = localStorage) {
  const makeKey = (key: string) => (prefix ? `${prefix}:${key}` : key);

  return {
    get<T = any>(key: string): T | null {
      return getItem<T>(makeKey(key), storage);
    },

    set<T = any>(key: string, value: T): void {
      setItem(makeKey(key), value, storage);
    },

    remove(key: string): void {
      removeItem(makeKey(key), storage);
    },

    has(key: string): boolean {
      return hasItem(makeKey(key), storage);
    },

    clear(): void {
      const prefix_with_colon = prefix ? `${prefix}:` : '';
      for (const key of keys(storage)) {
        if (key.startsWith(prefix_with_colon)) {
          removeItem(key, storage);
        }
      }
    },

    keys(): string[] {
      const prefix_with_colon = prefix ? `${prefix}:` : '';
      return keys(storage)
        .filter((key) => key.startsWith(prefix_with_colon))
        .map((key) => key.slice(prefix_with_colon.length));
    },

    getAll(): Record<string, any> {
      const items: Record<string, any> = {};
      const prefix_with_colon = prefix ? `${prefix}:` : '';
      for (const key of keys(storage)) {
        if (key.startsWith(prefix_with_colon)) {
          const cleanKey = key.slice(prefix_with_colon.length);
          items[cleanKey] = getItem(key, storage);
        }
      }
      return items;
    },

    size(): number {
      return getSize(storage);
    },

    onChange(key: string | null, callback: (value: any, oldValue: any, key: string) => void): () => void {
      return onStorageChange(makeKey(key || ''), callback);
    },
  };
}

/**
 * Session storage wrapper (same API as createStorage)
 * @param prefix Prefix for all keys
 * @returns Storage wrapper object
 */
export function createSessionStorage(prefix: string = '') {
  return createStorage(prefix, sessionStorage);
}

/**
 * In-memory storage (for testing or when storage is not available)
 * @param prefix Prefix for all keys
 * @returns Storage wrapper object
 */
export function createMemoryStorage(prefix: string = '') {
  const data: Record<string, any> = {};
  const makeKey = (key: string) => (prefix ? `${prefix}:${key}` : key);

  return {
    get<T = any>(key: string): T | null {
      const fullKey = makeKey(key);
      return data.hasOwnProperty(fullKey) ? data[fullKey] : null;
    },

    set<T = any>(key: string, value: T): void {
      const fullKey = makeKey(key);
      if (value === null || value === undefined) {
        delete data[fullKey];
      } else {
        data[fullKey] = value;
      }
    },

    remove(key: string): void {
      const fullKey = makeKey(key);
      delete data[fullKey];
    },

    has(key: string): boolean {
      const fullKey = makeKey(key);
      return data.hasOwnProperty(fullKey);
    },

    clear(): void {
      const prefix_with_colon = prefix ? `${prefix}:` : '';
      for (const key of Object.keys(data)) {
        if (key.startsWith(prefix_with_colon)) {
          delete data[key];
        }
      }
    },

    keys(): string[] {
      const prefix_with_colon = prefix ? `${prefix}:` : '';
      return Object.keys(data)
        .filter((key) => key.startsWith(prefix_with_colon))
        .map((key) => key.slice(prefix_with_colon.length));
    },

    getAll(): Record<string, any> {
      const items: Record<string, any> = {};
      const prefix_with_colon = prefix ? `${prefix}:` : '';
      for (const key of Object.keys(data)) {
        if (key.startsWith(prefix_with_colon)) {
          const cleanKey = key.slice(prefix_with_colon.length);
          items[cleanKey] = data[key];
        }
      }
      return items;
    },

    size(): number {
      return JSON.stringify(data).length;
    },

    onChange(
      _key: string | null,
      _callback: (value: any, oldValue: any, key: string) => void
    ): () => void {
      // Memory storage doesn't support external events, but return a no-op unsubscribe
      return () => {};
    },
  };
}
