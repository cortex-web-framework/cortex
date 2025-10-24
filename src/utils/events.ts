/**
 * Event utilities - NO external dependencies
 * Debounce, throttle, and event handling functions
 */

/**
 * Debounces function calls
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @param immediate Call on leading edge (default: false)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastResult: any;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const shouldCallNow = immediate && now - lastCallTime > delay;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (!immediate) {
        lastResult = fn(...args);
      }
      timeoutId = null;
      lastCallTime = Date.now();
    }, delay);

    if (shouldCallNow) {
      lastResult = fn(...args);
      lastCallTime = now;
    }

    return lastResult;
  };
}

/**
 * Throttles function calls
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @param options Options object
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;

  let lastCallTime = leading ? 0 : Date.now();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastResult: any;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (leading && now - lastCallTime >= limit) {
      lastResult = fn(...args);
      lastCallTime = now;
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      if (trailing) {
        timeoutId = setTimeout(() => {
          lastResult = fn(...args);
          lastCallTime = trailing ? Date.now() : lastCallTime;
          timeoutId = null;
        }, limit - (now - lastCallTime));
      }
    }

    return lastResult;
  };
}

/**
 * Calls function only once
 * @param fn Function to call once
 * @returns Function that can be called multiple times
 */
export function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false;
  let result: ReturnType<T>;

  return function (...args: Parameters<T>) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

/**
 * Creates a memoized version of function
 * @param fn Function to memoize
 * @param keyGenerator Function to generate cache key (default: uses first argument)
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  const makeKey = keyGenerator || ((first: any) => String(first));

  return function (...args: Parameters<T>) {
    const key = makeKey(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Retries function with exponential backoff
 * @param fn Function to retry
 * @param maxAttempts Maximum number of attempts
 * @param delay Initial delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @param onAttempt Called on each attempt
 * @returns Promise that resolves with result or rejects with error
 */
export async function retry<T>(
  fn: () => Promise<T> | T,
  maxAttempts: number = 3,
  delay: number = 1000,
  maxDelay: number = 10000,
  onAttempt?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await Promise.resolve(fn());
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (onAttempt) {
        onAttempt(attempt, lastError);
      }

      if (attempt < maxAttempts) {
        const backoffDelay = Math.min(delay * Math.pow(2, attempt - 1), maxDelay);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Attaches event listener with automatic cleanup
 * @param target Event target
 * @param event Event name
 * @param handler Event handler
 * @param options Event listener options
 * @returns Cleanup function
 */
export function on<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Window,
  event: K,
  handler: (this: any, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  target.addEventListener(event as string, handler as EventListener, options);

  return () => {
    target.removeEventListener(event as string, handler as EventListener, options);
  };
}

/**
 * Attaches event listener that fires once
 * @param target Event target
 * @param event Event name
 * @param handler Event handler
 * @param options Event listener options
 * @returns Cleanup function
 */
export function once_event<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Window,
  event: K,
  handler: (this: any, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  target.addEventListener(event as string, handler as EventListener, {
    ...options,
    once: true,
  });

  return () => {
    target.removeEventListener(event as string, handler as EventListener, options);
  };
}

/**
 * Emits custom event
 * @param target Event target
 * @param eventName Event name
 * @param detail Event detail
 * @returns True if not cancelled
 */
export function emit<T = any>(
  target: HTMLElement | Window,
  eventName: string,
  detail?: T
): boolean {
  const event = new CustomEvent(eventName, { detail, bubbles: true, cancelable: true });
  return target.dispatchEvent(event);
}

/**
 * Listens to custom event
 * @param target Event target
 * @param eventName Event name
 * @param handler Event handler
 * @returns Cleanup function
 */
export function onCustom<T = any>(
  target: HTMLElement | Window,
  eventName: string,
  handler: (detail: T) => void
): () => void {
  const listener = (event: Event) => {
    if (event instanceof CustomEvent) {
      handler(event.detail);
    }
  };

  target.addEventListener(eventName, listener);

  return () => {
    target.removeEventListener(eventName, listener);
  };
}

/**
 * Waits for an event
 * @param target Event target
 * @param eventName Event name
 * @param timeout Timeout in milliseconds (optional)
 * @returns Promise that resolves with event
 */
export function waitForEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Window,
  eventName: K,
  timeout?: number
): Promise<HTMLElementEventMap[K]> {
  return new Promise((resolve, reject) => {
    const handler = (event: Event) => {
      target.removeEventListener(eventName as string, handler);
      if (timeoutId) clearTimeout(timeoutId);
      resolve(event as HTMLElementEventMap[K]);
    };

    target.addEventListener(eventName as string, handler);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (timeout) {
      timeoutId = setTimeout(() => {
        target.removeEventListener(eventName as string, handler);
        reject(new Error(`Event timeout: ${String(eventName)}`));
      }, timeout);
    }
  });
}

/**
 * Waits for custom event
 * @param target Event target
 * @param eventName Event name
 * @param timeout Timeout in milliseconds (optional)
 * @returns Promise that resolves with detail
 */
export function waitForCustomEvent<T = any>(
  target: HTMLElement | Window,
  eventName: string,
  timeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const listener = (event: Event) => {
      target.removeEventListener(eventName, listener);
      if (timeoutId) clearTimeout(timeoutId);
      if (event instanceof CustomEvent) {
        resolve(event.detail);
      }
    };

    target.addEventListener(eventName, listener);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (timeout) {
      timeoutId = setTimeout(() => {
        target.removeEventListener(eventName, listener);
        reject(new Error(`Event timeout: ${eventName}`));
      }, timeout);
    }
  });
}

/**
 * Batch multiple function calls
 * @param fn Function to batch
 * @param batchSize Batch size
 * @param delay Delay between batches in milliseconds
 * @returns Batched function
 */
export function batch<T extends (...args: any[]) => any>(
  fn: T,
  batchSize: number = 10,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let queue: Parameters<T>[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const processBatch = () => {
    if (queue.length === 0) return;

    const batch_items = queue.splice(0, batchSize);
    batch_items.forEach((args) => fn(...args));

    if (queue.length > 0) {
      timeoutId = setTimeout(processBatch, delay);
    }
  };

  return function (...args: Parameters<T>) {
    queue.push(args);

    if (queue.length >= batchSize) {
      if (timeoutId) clearTimeout(timeoutId);
      processBatch();
    } else if (!timeoutId) {
      timeoutId = setTimeout(processBatch, delay);
    }
  };
}

/**
 * Chains functions in sequence
 * @param fns Functions to chain
 * @returns Chained function
 */
export function chain<T extends (...args: any[]) => any>(...fns: T[]): (...args: Parameters<T>) => void {
  return function (...args: Parameters<T>) {
    fns.forEach((fn) => fn(...args));
  };
}

/**
 * Creates conditional event listener
 * @param target Event target
 * @param eventName Event name
 * @param condition Condition function
 * @param handler Event handler
 * @returns Cleanup function
 */
export function onWhen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Window,
  eventName: K,
  condition: (ev: HTMLElementEventMap[K]) => boolean,
  handler: (ev: HTMLElementEventMap[K]) => void
): () => void {
  const conditionalHandler = (event: Event) => {
    if (condition(event as HTMLElementEventMap[K])) {
      handler(event as HTMLElementEventMap[K]);
    }
  };

  target.addEventListener(eventName as string, conditionalHandler as EventListener);

  return () => {
    target.removeEventListener(eventName as string, conditionalHandler as EventListener);
  };
}
