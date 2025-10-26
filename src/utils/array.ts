/**
 * Array Utilities Library
 * ZERO external dependencies - Pure TypeScript implementation
 * Comprehensive array manipulation, analysis, transformation, and utility functions
 */

// ============================================
// ARRAY MANIPULATION
// ============================================

/**
 * Splits an array into smaller chunks of specified size
 * @param arr - Array to chunk
 * @param size - Size of each chunk (must be positive)
 * @returns Array of chunks
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
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
 * Flattens a nested array one level deep
 * @param arr - Nested array to flatten
 * @returns Flattened array
 * @example
 * flatten([[1, 2], [3], [4, 5]]) // [1, 2, 3, 4, 5]
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Returns unique values from array
 * Supports optional key function for custom uniqueness comparison
 * @param arr - Array to process
 * @param key - Optional function to extract comparison key
 * @returns Array with unique values
 * @example
 * unique([1, 2, 2, 3]) // [1, 2, 3]
 * unique([{id:1,name:'a'}, {id:1,name:'b'}], item => item.id) // [{id:1,name:'a'}]
 */
export function unique<T>(arr: T[], key?: (item: T) => any): T[] {
  if (!key) {
    return Array.from(new Set(arr));
  }

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
 * Removes null and undefined values from array
 * Note: keeps falsy values like false, 0, and empty strings
 * @param arr - Array to compact
 * @returns Array without null/undefined
 * @example
 * compact([1, null, 2, undefined, 3]) // [1, 2, 3]
 */
export function compact<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

// ============================================
// ARRAY ANALYSIS
// ============================================

/**
 * Groups array items by a key
 * @param arr - Array to group
 * @param key - Function to extract grouping key or property name
 * @returns Object with grouped arrays
 * @example
 * groupBy([{role:'admin',name:'Alice'}, {role:'user',name:'Bob'}], item => item.role)
 * // { admin: [{...}], user: [{...}] }
 */
export function groupBy<T, K extends string | number | symbol>(
  arr: T[],
  key: ((item: T) => K) | K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  const getKey: (item: T) => K = typeof key === 'function'
    ? (key as (item: T) => K)
    : (item: T) => ((item as unknown) as Record<string, K>)[key as unknown as string];

  for (const item of arr) {
    const k: K = getKey(item);
    if (!result[k]) {
      result[k] = [];
    }
    result[k].push(item);
  }

  return result;
}

/**
 * Sorts array by a specific key or property
 * @param arr - Array to sort
 * @param key - Function to extract sort value or property name
 * @param order - Sort order: 'asc' or 'desc' (default: 'asc')
 * @returns New sorted array (original unchanged)
 * @example
 * sortBy([{id:3}, {id:1}, {id:2}], 'id') // [{id:1}, {id:2}, {id:3}]
 */
export function sortBy<T>(
  arr: T[],
  key: ((item: T) => any) | keyof T,
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
 * Finds the first index of element matching predicate
 * @param arr - Array to search
 * @param predicate - Function to test each element
 * @returns Index of first match, or -1 if not found
 * @example
 * findIndex([1, 2, 3, 4], (item) => item === 3) // 2
 */
export function findIndex<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): number {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Finds the last index of element matching predicate
 * @param arr - Array to search
 * @param predicate - Function to test each element
 * @returns Index of last match, or -1 if not found
 * @example
 * findLastIndex([1, 2, 3, 2], (item) => item === 2) // 3
 */
export function findLastIndex<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i)) {
      return i;
    }
  }
  return -1;
}

// ============================================
// ARRAY TRANSFORMATION
// ============================================

/**
 * Extracts values of a specific property from array of objects
 * @param arr - Array of objects
 * @param key - Property key to extract
 * @returns Array of property values
 * @example
 * pluck([{id:1, name:'a'}, {id:2, name:'b'}], 'name') // ['a', 'b']
 */
export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return arr.map((item) => item[key]);
}

/**
 * Splits array into two groups based on predicate
 * @param arr - Array to partition
 * @param predicate - Function to test each element
 * @returns Tuple: [passing elements, failing elements]
 * @example
 * partition([1, 2, 3, 4], item => item % 2 === 1) // [[1, 3], [2, 4]]
 */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  for (const item of arr) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }

  return [pass, fail];
}

/**
 * Returns unique values from array (alias for unique with no key)
 * @param arr - Array to process
 * @returns Array with unique values
 * @example
 * uniq([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 */
export function uniq<T>(arr: T[]): T[] {
  return unique(arr);
}

/**
 * Returns array excluding specified values
 * @param arr - Source array
 * @param values - Values to exclude
 * @returns New array without specified values
 * @example
 * without([1, 2, 3, 4], 2, 4) // [1, 3]
 */
export function without<T>(arr: T[], ...values: T[]): T[] {
  const excludeSet = new Set(values);
  return arr.filter((item) => !excludeSet.has(item));
}

/**
 * Returns intersection of two arrays (common elements)
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array of elements present in both arrays
 * @example
 * intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Returns difference between two arrays (elements in first but not second)
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Elements in arr1 but not in arr2
 * @example
 * difference([1, 2, 3], [2, 3, 4]) // [1]
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

// ============================================
// SAMPLING
// ============================================

/**
 * Randomly shuffles array elements using Fisher-Yates algorithm
 * @param arr - Array to shuffle
 * @returns New shuffled array (original unchanged)
 * @example
 * shuffle([1, 2, 3]) // [2, 1, 3] (random order)
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
 * Returns random sample(s) from array
 * @param arr - Array to sample from
 * @param count - Number of elements to sample (optional)
 * @returns Single element if count not specified, array of elements otherwise
 * @example
 * sample([1, 2, 3, 4, 5]) // 3 (random single element)
 * sample([1, 2, 3, 4, 5], 3) // [2, 4, 1] (random 3 elements)
 */
export function sample<T>(arr: T[], count?: number): T | T[] {
  if (count === undefined) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// ============================================
// UTILITY
// ============================================

/**
 * Creates an array of numbers in specified range
 * @param start - Start number (inclusive)
 * @param end - End number (inclusive)
 * @param step - Step size (default: 1)
 * @returns Array of numbers
 * @example
 * range(1, 5) // [1, 2, 3, 4, 5]
 * range(0, 10, 2) // [0, 2, 4, 6, 8, 10]
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];

  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }

  return result;
}

/**
 * Creates an array filled with specified value or function-generated values
 * @param length - Length of array to create
 * @param value - Value to fill with, or function to generate values
 * @returns Array filled with values
 * @example
 * fill(3, 'x') // ['x', 'x', 'x']
 * fill(3, () => Math.random()) // [0.123, 0.456, 0.789]
 */
export function fill<T>(length: number, value: T | (() => T)): T[] {
  const result: T[] = [];
  const isFunction = typeof value === 'function';

  for (let i = 0; i < length; i++) {
    result.push(isFunction ? (value as () => T)() : value);
  }

  return result;
}
