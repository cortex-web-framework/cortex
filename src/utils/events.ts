/**
 * Event Utilities Library
 *
 * A comprehensive collection of event handling utilities with zero dependencies.
 * Provides debouncing, throttling, event delegation, and custom event emitters
 * with proper memory management and cleanup.
 *
 * @module events
 * @author Cortex Project
 * @license MIT
 */

/**
 * Debounces a function, delaying its execution until after a specified delay
 * has elapsed since the last time it was invoked.
 *
 * Useful for handling events that fire rapidly (e.g., typing, window resizing)
 * where you only want to execute the function after the user has stopped performing
 * the action.
 *
 * Memory Management:
 * - Call `cancel()` to clear pending timeouts and prevent memory leaks
 * - Automatically clears previous timeout on each new invocation
 *
 * @template T - Function type to debounce
 * @param {T} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds to wait before executing
 * @returns {Function} Debounced function with a `cancel()` method
 *
 * @example
 * const handleSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * input.addEventListener('input', (e) => handleSearch(e.target.value));
 *
 * // Cleanup when component unmounts
 * handleSearch.cancel();
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function(this: unknown, ...args: Parameters<T>): void {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = function(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttles a function, ensuring it is executed at most once per specified interval.
 * Executes immediately on first call, then limits subsequent executions.
 *
 * Useful for limiting the rate of expensive operations (e.g., scroll handlers,
 * window resize handlers, API calls).
 *
 * Behavior:
 * - First call executes immediately
 * - Subsequent calls within interval are queued (trailing call)
 * - Trailing call executes with the latest arguments after interval expires
 *
 * Memory Management:
 * - Call `cancel()` to clear pending timeouts and prevent trailing execution
 *
 * @template T - Function type to throttle
 * @param {T} fn - The function to throttle
 * @param {number} interval - Minimum interval in milliseconds between executions
 * @returns {Function} Throttled function with a `cancel()` method
 *
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 *
 * // Cleanup
 * handleScroll.cancel();
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: unknown = null;

  const throttled = function(this: unknown, ...args: Parameters<T>): void {
    const now = Date.now();
    lastArgs = args;
    lastContext = this;

    // Execute immediately if enough time has passed
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      fn.apply(this, args);
      lastArgs = null;
      lastContext = null;
    } else {
      // Queue trailing call if not already queued
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          if (lastArgs !== null) {
            fn.apply(lastContext, lastArgs);
          }
          timeoutId = null;
          lastArgs = null;
          lastContext = null;
        }, interval - (now - lastCallTime));
      }
    }
  };

  throttled.cancel = function(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastContext = null;
  };

  return throttled;
}

/**
 * Creates a function that can only be executed once. Subsequent calls return undefined.
 *
 * Useful for initialization functions, event handlers that should only fire once,
 * or ensuring idempotent operations.
 *
 * @template T - Function type to wrap
 * @param {T} fn - The function to execute only once
 * @returns {Function} Function that executes only on first call
 *
 * @example
 * const initialize = once(() => {
 *   console.log('Initializing application...');
 *   return { initialized: true };
 * });
 *
 * const result1 = initialize(); // Logs and returns { initialized: true }
 * const result2 = initialize(); // Returns undefined
 */
export function once<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> | void {
  let called = false;
  let result: ReturnType<T> | void;

  return function(this: unknown, ...args: Parameters<T>): ReturnType<T> | void {
    if (!called) {
      called = true;
      result = fn.apply(this, args) as ReturnType<T>;
      return result;
    }
    return undefined;
  };
}

/**
 * Sets up event delegation for handling events on child elements matching a selector.
 *
 * Event delegation allows you to attach a single event listener to a parent element
 * instead of multiple listeners to child elements. This improves performance and
 * handles dynamically added elements automatically.
 *
 * Memory Management:
 * - Returns an unbind function to remove the event listener
 * - Always call unbind when the parent element is removed from DOM
 *
 * @param {Element} element - Parent element to attach listener to
 * @param {string} selector - CSS selector to match child elements
 * @param {string} event - Event type (e.g., 'click', 'mousedown')
 * @param {EventListener} handler - Event handler function
 * @returns {Function} Unbind function to remove the event listener
 *
 * @example
 * const list = document.querySelector('.todo-list');
 * const unbind = delegate(list, '.delete-button', 'click', (e) => {
 *   const item = e.target.closest('.todo-item');
 *   item?.remove();
 * });
 *
 * // Cleanup when list is removed
 * unbind();
 */
export function delegate(
  element: Element,
  selector: string,
  event: string,
  handler: EventListener
): () => void {
  const delegateHandler = (e: Event): void => {
    const target = e.target as Element;
    // Check if target or any of its ancestors match the selector
    const match = target.closest(selector);
    if (match && element.contains(match)) {
      handler.call(match, e);
    }
  };

  element.addEventListener(event, delegateHandler);

  return () => {
    element.removeEventListener(event, delegateHandler);
  };
}

/**
 * Waits for a condition to become true, polling at specified intervals.
 *
 * Useful for waiting for DOM elements to load, state changes, or async operations
 * to complete.
 *
 * @param {Function} condition - Function that returns true when condition is met
 * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
 * @param {number} [interval=100] - Polling interval in milliseconds
 * @returns {Promise<void>} Resolves when condition is true, rejects on timeout
 *
 * @example
 * // Wait for element to appear in DOM
 * await waitFor(() => document.querySelector('.loaded') !== null, 3000);
 *
 * // Wait for state change
 * await waitFor(() => app.isReady, 5000, 50);
 */
export function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = (): void => {
      if (condition()) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('waitFor timeout exceeded'));
        return;
      }

      setTimeout(checkCondition, interval);
    };

    checkCondition();
  });
}

/**
 * Throttles a function using requestAnimationFrame for optimal rendering performance.
 *
 * Similar to throttle, but uses RAF for smooth animations and visual updates.
 * Ensures function executes at most once per animation frame (~60fps).
 *
 * Ideal for:
 * - Scroll handlers that update UI
 * - Mouse/touch move handlers
 * - Animation loops
 *
 * Memory Management:
 * - Call `cancel()` to cancel pending RAF and prevent execution
 *
 * @template T - Function type to throttle
 * @param {T} fn - The function to throttle
 * @returns {Function} RAF-throttled function with a `cancel()` method
 *
 * @example
 * const updatePosition = rafThrottle((x: number, y: number) => {
 *   element.style.transform = `translate(${x}px, ${y}px)`;
 * });
 *
 * document.addEventListener('mousemove', (e) => updatePosition(e.clientX, e.clientY));
 *
 * // Cleanup
 * updatePosition.cancel();
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: unknown = null;

  const throttled = function(this: unknown, ...args: Parameters<T>): void {
    lastArgs = args;
    lastContext = this;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs !== null) {
          fn.apply(lastContext, lastArgs);
        }
        rafId = null;
        lastArgs = null;
        lastContext = null;
      });
    }
  };

  throttled.cancel = function(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastArgs = null;
    lastContext = null;
  };

  return throttled;
}

/**
 * Event emitter interface for custom event handling.
 *
 * Provides methods for subscribing to, emitting, and managing custom events.
 */
export interface EventEmitter {
  /**
   * Registers an event handler for the specified event.
   *
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {Function} Unbind function to remove the handler
   */
  on(event: string, handler: (...args: any[]) => void): () => void;

  /**
   * Removes an event handler for the specified event.
   *
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function to remove
   */
  off(event: string, handler: (...args: any[]) => void): void;

  /**
   * Emits an event, calling all registered handlers with provided arguments.
   *
   * @param {string} event - Event name
   * @param {...any[]} args - Arguments to pass to handlers
   */
  emit(event: string, ...args: any[]): void;

  /**
   * Registers an event handler that executes only once.
   *
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {Function} Unbind function to remove the handler before it fires
   */
  once(event: string, handler: (...args: any[]) => void): () => void;
}

/**
 * Creates a custom event emitter for publish-subscribe pattern.
 *
 * Event emitters allow different parts of your application to communicate
 * without tight coupling. Components can emit events and other components
 * can listen for those events.
 *
 * Memory Management:
 * - Use `off()` or the returned unbind function to remove listeners
 * - Remove all listeners when the emitter is no longer needed
 *
 * @returns {EventEmitter} Event emitter instance
 *
 * @example
 * const emitter = createEventEmitter();
 *
 * // Subscribe to events
 * const unbind = emitter.on('user:login', (user) => {
 *   console.log('User logged in:', user);
 * });
 *
 * // Emit events
 * emitter.emit('user:login', { id: 1, name: 'John' });
 *
 * // One-time listeners
 * emitter.once('app:ready', () => {
 *   console.log('App is ready!');
 * });
 *
 * // Cleanup
 * unbind();
 */
export function createEventEmitter(): EventEmitter {
  const events = new Map<string, Set<(...args: any[]) => void>>();

  return {
    on(event: string, handler: (...args: any[]) => void): () => void {
      if (!events.has(event)) {
        events.set(event, new Set());
      }
      events.get(event)!.add(handler);

      // Return unbind function
      return () => {
        this.off(event, handler);
      };
    },

    off(event: string, handler: (...args: any[]) => void): void {
      const handlers = events.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          events.delete(event);
        }
      }
    },

    emit(event: string, ...args: any[]): void {
      const handlers = events.get(event);
      if (handlers) {
        // Create a copy to avoid issues if handlers are removed during iteration
        const handlersCopy = Array.from(handlers);
        handlersCopy.forEach(handler => {
          handler(...args);
        });
      }
    },

    once(event: string, handler: (...args: any[]) => void): () => void {
      const onceHandler = (...args: any[]): void => {
        this.off(event, onceHandler);
        handler(...args);
      };

      return this.on(event, onceHandler);
    }
  };
}
