/**
 * Array utilities - NO external dependencies (no lodash)
 */

/**
 * Chunks an array into smaller arrays of specified size
 * @param arr Array to chunk
 * @param size Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error('Chunk size must be positive');
  }

  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Returns unique values from array
 * @param arr Array
 * @returns Array with unique values
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Returns unique values based on a predicate
 * @param arr Array
 * @param key Function to get unique key
 * @returns Array with unique values
 */
export function uniqueBy<T>(arr: T[], key: (item: T) => any): T[] {
  const seen = new Set<any>();
  return arr.filter((item) => {
    const k = key(item);
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
}

/**
 * Flattens a nested array
 * @param arr Nested array
 * @param depth Depth to flatten (default: Infinity)
 * @returns Flattened array
 */
export function flatten<T>(arr: any[], depth: number = Infinity): T[] {
  if (depth === 0) {
    return arr;
  }

  return arr.reduce((acc: T[], item) => {
    if (Array.isArray(item)) {
      return acc.concat(flatten(item, depth - 1));
    }
    return acc.concat(item);
  }, []);
}

/**
 * Finds the index of an element matching a predicate
 * @param arr Array
 * @param predicate Function to test
 * @returns Index or -1
 */
export function findIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Groups array items by a key
 * @param arr Array
 * @param key Function to get grouping key
 * @returns Object with groups
 */
export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item);
      if (!acc[k]) {
        acc[k] = [];
      }
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sorts array by a specific key/property
 * @param arr Array
 * @param key Property name or function
 * @param order Sort order: 'asc' or 'desc'
 * @returns Sorted array (new copy)
 */
export function sortBy<T>(
  arr: T[],
  key: ((item: T) => any) | string,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...arr];

  const getValue = typeof key === 'function' ? key : (item: T) => (item as any)[key];

  sorted.sort((a, b) => {
    const aVal = getValue(a);
    const bVal = getValue(b);

    if (aVal < bVal) {
      return order === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return sorted;
}

/**
 * Removes duplicates while preserving order
 * @param arr Array
 * @param key Optional key function for custom comparison
 * @returns Array without duplicates
 */
export function removeDuplicates<T>(
  arr: T[],
  key?: (item: T) => any
): T[] {
  if (!key) {
    return unique(arr);
  }

  return uniqueBy(arr, key);
}

/**
 * Checks if all items in array pass a test
 * @param arr Array
 * @param predicate Test function
 * @returns True if all pass
 */
export function all<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * Checks if any item in array passes a test
 * @param arr Array
 * @param predicate Test function
 * @returns True if any passes
 */
export function any<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.some(predicate);
}

/**
 * Counts items matching a predicate
 * @param arr Array
 * @param predicate Test function
 * @returns Count of matching items
 */
export function count<T>(arr: T[], predicate: (item: T) => boolean): number {
  return arr.filter(predicate).length;
}

/**
 * Sums numeric values in array
 * @param arr Array of numbers
 * @returns Sum
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Averages numeric values in array
 * @param arr Array of numbers
 * @returns Average
 */
export function average(arr: number[]): number {
  if (arr.length === 0) {
    return 0;
  }
  return sum(arr) / arr.length;
}

/**
 * Finds minimum value in array
 * @param arr Array
 * @returns Minimum value
 */
export function min(arr: number[]): number {
  return Math.min(...arr);
}

/**
 * Finds maximum value in array
 * @param arr Array
 * @returns Maximum value
 */
export function max(arr: number[]): number {
  return Math.max(...arr);
}

/**
 * Creates a range of numbers
 * @param start Start number
 * @param end End number (exclusive)
 * @param step Step size (default: 1)
 * @returns Array of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Fills array with a value
 * @param arr Array
 * @param value Value to fill
 * @returns Filled array
 */
export function fill<T>(arr: T[], value: T): T[] {
  return arr.map(() => value);
}

/**
 * Transposes a 2D array
 * @param arr 2D array
 * @returns Transposed array
 */
export function transpose<T>(arr: T[][]): T[][] {
  if (arr.length === 0) {
    return [];
  }

  const maxLength = Math.max(...arr.map((row) => row.length));
  const result: T[][] = [];

  for (let i = 0; i < maxLength; i++) {
    const row: T[] = [];
    for (let j = 0; j < arr.length; j++) {
      if (i < arr[j].length) {
        row.push(arr[j][i]);
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Zips multiple arrays into tuples
 * @param arrays Arrays to zip
 * @returns Array of tuples
 */
export function zip<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) {
    return [];
  }

  const minLength = Math.min(...arrays.map((arr) => arr.length));
  const result: T[][] = [];

  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map((arr) => arr[i]));
  }

  return result;
}

/**
 * Partition array into two based on predicate
 * @param arr Array
 * @param predicate Test function
 * @returns Tuple of [passing, failing]
 */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  arr.forEach((item) => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });

  return [pass, fail];
}

/**
 * Compacts array (removes null and undefined)
 * @param arr Array
 * @returns Array without null/undefined
 */
export function compact<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Intersects two arrays
 * @param arr1 First array
 * @param arr2 Second array
 * @returns Array of common elements
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => arr2.includes(item));
}

/**
 * Differences between two arrays
 * @param arr1 First array
 * @param arr2 Second array
 * @returns Elements in arr1 but not in arr2
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => !arr2.includes(item));
}

/**
 * Moves an element from one index to another
 * @param arr Array
 * @param fromIndex Current index
 * @param toIndex Target index
 * @returns New array with element moved
 */
export function move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const item = result.splice(fromIndex, 1)[0];
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Shuffles array (Fisher-Yates algorithm)
 * @param arr Array to shuffle
 * @returns Shuffled array
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Samples random elements from array
 * @param arr Array
 * @param count Number of elements to sample
 * @returns Random elements
 */
export function sample<T>(arr: T[], count: number = 1): T[] {
  return shuffle(arr).slice(0, count);
}
