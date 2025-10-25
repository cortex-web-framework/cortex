/**
 * Event Utilities Test Suite
 * Comprehensive tests for event handling utilities
 */

import { test } from '../../test-framework';
import {
  debounce,
  throttle,
  once,
  delegate,
  waitFor,
  rafThrottle,
  createEventEmitter,
  type EventEmitter
} from './events';

// Polyfill requestAnimationFrame and cancelAnimationFrame for Node.js
if (typeof requestAnimationFrame === 'undefined') {
  (global as any).requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(callback, 16) as unknown as number;
  };
  (global as any).cancelAnimationFrame = (id: number): void => {
    clearTimeout(id as unknown as NodeJS.Timeout);
  };
}

// Minimal DOM polyfill for Node.js environment
if (typeof document === 'undefined') {
  class MockElement {
    className: string = '';
    children: MockElement[] = [];
    listeners: Map<string, EventListener[]> = new Map();
    parentElement: MockElement | null = null;

    appendChild(child: MockElement): void {
      this.children.push(child);
      child.parentElement = this;
    }

    addEventListener(event: string, handler: EventListener): void {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(handler);
    }

    removeEventListener(event: string, handler: EventListener): void {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }

    click(): void {
      const event = { target: this, currentTarget: this };

      // Bubble up the event tree
      let current: MockElement | null = this;
      while (current) {
        const handlers = current.listeners.get('click');
        if (handlers) {
          handlers.forEach(handler => handler(event as any));
        }
        current = current.parentElement;
      }
    }

    closest(selector: string): MockElement | null {
      // Simple selector matching (just class names)
      if (selector.startsWith('.')) {
        const className = selector.substring(1);
        let current: MockElement | null = this;
        while (current) {
          if (current.className === className) {
            return current;
          }
          current = current.parentElement;
        }
      }
      return null;
    }

    contains(element: MockElement): boolean {
      let current: MockElement | null = element;
      while (current) {
        if (current === this) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    }
  }

  (global as any).document = {
    createElement(): MockElement {
      return new MockElement();
    }
  };

  (global as any).Element = MockElement;
}

/**
 * Helper function to wait for a specific duration
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// DEBOUNCE TESTS (8 tests)
// ============================================================================
test.describe('Debounce', () => {
  test.it('should delay execution until after the specified delay', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 50);

    debounced();
    test.expect(callCount).toBe(0);

    await wait(60);
    test.expect(callCount).toBe(1);
  });

  test.it('should cancel previous calls when called multiple times', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 50);

    debounced();
    debounced();
    debounced();
    test.expect(callCount).toBe(0);

    await wait(60);
    test.expect(callCount).toBe(1); // Only called once
  });

  test.it('should execute with the last set of arguments', async () => {
    let lastValue = 0;
    const fn = (value: number) => { lastValue = value; };
    const debounced = debounce(fn, 50);

    debounced(1);
    debounced(2);
    debounced(3);

    await wait(60);
    test.expect(lastValue).toBe(3);
  });

  test.it('should cancel pending execution with cancel method', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 50);

    debounced();
    debounced.cancel();

    await wait(60);
    test.expect(callCount).toBe(0);
  });

  test.it('should handle multiple independent debounced functions', async () => {
    let count1 = 0;
    let count2 = 0;
    const fn1 = () => count1++;
    const fn2 = () => count2++;
    const debounced1 = debounce(fn1, 50);
    const debounced2 = debounce(fn2, 50);

    debounced1();
    debounced2();

    await wait(60);
    test.expect(count1).toBe(1);
    test.expect(count2).toBe(1);
  });

  test.it('should preserve this context', async () => {
    const obj = {
      value: 42,
      method: function(this: { value: number }) {
        return this.value;
      }
    };

    let result = 0;
    const debounced = debounce(function(this: { value: number }) {
      result = this.value;
    }, 50);

    debounced.call(obj);

    await wait(60);
    test.expect(result).toBe(42);
  });

  test.it('should handle rapid successive calls correctly', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 100);

    for (let i = 0; i < 10; i++) {
      debounced();
      await wait(10); // Call every 10ms
    }

    test.expect(callCount).toBe(0);
    await wait(110);
    test.expect(callCount).toBe(1);
  });

  test.it('should allow execution after delay has passed', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 50);

    debounced();
    await wait(60);
    test.expect(callCount).toBe(1);

    debounced();
    await wait(60);
    test.expect(callCount).toBe(2);
  });
});

// ============================================================================
// THROTTLE TESTS (8 tests)
// ============================================================================
test.describe('Throttle', () => {
  test.it('should execute immediately on first call', () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = throttle(fn, 100);

    throttled();
    test.expect(callCount).toBe(1);
  });

  test.it('should limit execution frequency', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    test.expect(callCount).toBe(1);

    await wait(110);
    test.expect(callCount).toBe(2); // Trailing call executes
  });

  test.it('should execute trailing call with latest arguments', async () => {
    let lastValue = 0;
    const fn = (value: number) => { lastValue = value; };
    const throttled = throttle(fn, 100);

    throttled(1);
    throttled(2);
    throttled(3);

    test.expect(lastValue).toBe(1); // First call

    await wait(110);
    test.expect(lastValue).toBe(3); // Last call
  });

  test.it('should cancel pending execution with cancel method', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = throttle(fn, 100);

    throttled();
    test.expect(callCount).toBe(1);

    throttled();
    throttled.cancel();

    await wait(110);
    test.expect(callCount).toBe(1); // No trailing call
  });

  test.it('should handle rapid calls within interval', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = throttle(fn, 100);

    for (let i = 0; i < 10; i++) {
      throttled();
    }

    test.expect(callCount).toBe(1); // First call only

    await wait(110);
    test.expect(callCount).toBe(2); // Trailing call
  });

  test.it('should allow execution after interval has passed', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = throttle(fn, 50);

    throttled();
    test.expect(callCount).toBe(1);

    await wait(60);
    throttled();
    test.expect(callCount).toBe(2);
  });

  test.it('should preserve this context', () => {
    const obj = {
      value: 42,
      result: 0,
      method: function(this: { value: number; result: number }) {
        this.result = this.value;
      }
    };

    const throttled = throttle(function(this: { value: number; result: number }) {
      this.result = this.value;
    }, 100);

    throttled.call(obj);
    test.expect(obj.result).toBe(42);
  });

  test.it('should handle multiple independent throttled functions', async () => {
    let count1 = 0;
    let count2 = 0;
    const fn1 = () => count1++;
    const fn2 = () => count2++;
    const throttled1 = throttle(fn1, 100);
    const throttled2 = throttle(fn2, 100);

    throttled1();
    throttled2();
    throttled1();
    throttled2();

    test.expect(count1).toBe(1);
    test.expect(count2).toBe(1);

    await wait(110);
    test.expect(count1).toBe(2);
    test.expect(count2).toBe(2);
  });
});

// ============================================================================
// ONCE TESTS (4 tests)
// ============================================================================
test.describe('Once', () => {
  test.it('should execute only on first call', () => {
    let callCount = 0;
    const fn = () => callCount++;
    const onceFn = once(fn);

    onceFn();
    onceFn();
    onceFn();

    test.expect(callCount).toBe(1);
  });

  test.it('should return result on first call', () => {
    const fn = () => 42;
    const onceFn = once(fn);

    const result = onceFn();
    test.expect(result).toBe(42);
  });

  test.it('should return undefined on subsequent calls', () => {
    const fn = () => 42;
    const onceFn = once(fn);

    onceFn(); // First call
    const result = onceFn(); // Second call

    test.expect(result).toBeUndefined();
  });

  test.it('should preserve arguments on first call', () => {
    let receivedArgs: number[] = [];
    const fn = (...args: number[]) => {
      receivedArgs = args;
      return args.reduce((a, b) => a + b, 0);
    };
    const onceFn = once(fn);

    const result = onceFn(1, 2, 3);
    test.expect(result).toBe(6);
    test.expect(receivedArgs).toEqual([1, 2, 3]);

    onceFn(4, 5, 6); // Should not execute
    test.expect(receivedArgs).toEqual([1, 2, 3]);
  });
});

// ============================================================================
// DELEGATE TESTS (6 tests)
// ============================================================================
test.describe('Delegate', () => {
  test.it('should listen to child elements matching selector', () => {
    const parent = document.createElement('div');
    const child = document.createElement('button');
    child.className = 'test-button';
    parent.appendChild(child);

    let clickCount = 0;
    delegate(parent, '.test-button', 'click', () => clickCount++);

    child.click();
    test.expect(clickCount).toBe(1);
  });

  test.it('should return unbind function', () => {
    const parent = document.createElement('div');
    const child = document.createElement('button');
    child.className = 'test-button';
    parent.appendChild(child);

    let clickCount = 0;
    const unbind = delegate(parent, '.test-button', 'click', () => clickCount++);

    child.click();
    test.expect(clickCount).toBe(1);

    unbind();
    child.click();
    test.expect(clickCount).toBe(1); // Still 1, not 2
  });

  test.it('should stop listening after unbind is called', () => {
    const parent = document.createElement('div');
    const child = document.createElement('button');
    child.className = 'test-button';
    parent.appendChild(child);

    let clickCount = 0;
    const unbind = delegate(parent, '.test-button', 'click', () => clickCount++);

    unbind();
    child.click();
    test.expect(clickCount).toBe(0);
  });

  test.it('should respect event bubbling', () => {
    const parent = document.createElement('div');
    const child = document.createElement('button');
    const grandchild = document.createElement('span');
    child.className = 'test-button';
    child.appendChild(grandchild);
    parent.appendChild(child);

    let clickCount = 0;
    delegate(parent, '.test-button', 'click', () => clickCount++);

    grandchild.click(); // Bubbles up to button
    test.expect(clickCount).toBe(1);
  });

  test.it('should ignore non-matching selectors', () => {
    const parent = document.createElement('div');
    const child = document.createElement('button');
    child.className = 'other-button';
    parent.appendChild(child);

    let clickCount = 0;
    delegate(parent, '.test-button', 'click', () => clickCount++);

    child.click();
    test.expect(clickCount).toBe(0);
  });

  test.it('should handle multiple delegated listeners independently', () => {
    const parent = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    button1.className = 'button-1';
    button2.className = 'button-2';
    parent.appendChild(button1);
    parent.appendChild(button2);

    let count1 = 0;
    let count2 = 0;
    delegate(parent, '.button-1', 'click', () => count1++);
    delegate(parent, '.button-2', 'click', () => count2++);

    button1.click();
    button2.click();

    test.expect(count1).toBe(1);
    test.expect(count2).toBe(1);
  });
});

// ============================================================================
// WAITFOR TESTS (5 tests)
// ============================================================================
test.describe('WaitFor', () => {
  test.it('should resolve when condition becomes true', async () => {
    let value = false;
    setTimeout(() => { value = true; }, 50);

    await waitFor(() => value, 200, 10);
    test.expect(value).toBe(true);
  });

  test.it('should reject on timeout if condition never becomes true', async () => {
    let rejected = false;
    try {
      await waitFor(() => false, 100, 10);
    } catch (error) {
      rejected = true;
    }
    test.expect(rejected).toBe(true);
  });

  test.it('should use custom interval for checking', async () => {
    let checkCount = 0;
    let value = false;

    setTimeout(() => { value = true; }, 100);

    await waitFor(() => {
      checkCount++;
      return value;
    }, 200, 25);

    // Should check roughly every 25ms for 100ms = ~4 times
    test.expect(checkCount).toBeGreaterThan(2);
    test.expect(checkCount).toBeLessThan(8);
  });

  test.it('should resolve immediately if condition is already true', async () => {
    const startTime = Date.now();
    await waitFor(() => true, 1000, 100);
    const elapsed = Date.now() - startTime;

    test.expect(elapsed).toBeLessThan(50); // Should be nearly instant
  });

  test.it('should use default timeout and interval when not specified', async () => {
    let value = false;
    setTimeout(() => { value = true; }, 50);

    await waitFor(() => value);
    test.expect(value).toBe(true);
  });
});

// ============================================================================
// RAF THROTTLE TESTS (3 tests)
// ============================================================================
test.describe('RafThrottle', () => {
  test.it('should throttle using requestAnimationFrame', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = rafThrottle(fn);

    // Call multiple times rapidly
    throttled();
    throttled();
    throttled();

    test.expect(callCount).toBe(0); // Not executed yet

    await wait(20); // Wait for RAF
    test.expect(callCount).toBe(1);
  });

  test.it('should execute with latest arguments', async () => {
    let lastValue = 0;
    const fn = (value: number) => { lastValue = value; };
    const throttled = rafThrottle(fn);

    throttled(1);
    throttled(2);
    throttled(3);

    await wait(20);
    test.expect(lastValue).toBe(3);
  });

  test.it('should cancel pending execution', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const throttled = rafThrottle(fn);

    throttled();
    throttled.cancel();

    await wait(20);
    test.expect(callCount).toBe(0);
  });
});

// ============================================================================
// EVENT EMITTER TESTS (8 tests)
// ============================================================================
test.describe('EventEmitter', () => {
  test.it('should emit events to registered handlers', () => {
    const emitter = createEventEmitter();
    let value = 0;

    emitter.on('test', (val: number) => { value = val; });
    emitter.emit('test', 42);

    test.expect(value).toBe(42);
  });

  test.it('should support multiple handlers for same event', () => {
    const emitter = createEventEmitter();
    let count = 0;

    emitter.on('test', () => count++);
    emitter.on('test', () => count++);
    emitter.emit('test');

    test.expect(count).toBe(2);
  });

  test.it('should remove handler with off method', () => {
    const emitter = createEventEmitter();
    let count = 0;
    const handler = () => count++;

    emitter.on('test', handler);
    emitter.emit('test');
    test.expect(count).toBe(1);

    emitter.off('test', handler);
    emitter.emit('test');
    test.expect(count).toBe(1); // Still 1
  });

  test.it('should execute once handler only once', () => {
    const emitter = createEventEmitter();
    let count = 0;

    emitter.once('test', () => count++);
    emitter.emit('test');
    emitter.emit('test');

    test.expect(count).toBe(1);
  });

  test.it('should return unbind function from on method', () => {
    const emitter = createEventEmitter();
    let count = 0;

    const unbind = emitter.on('test', () => count++);
    emitter.emit('test');
    test.expect(count).toBe(1);

    unbind();
    emitter.emit('test');
    test.expect(count).toBe(1); // Still 1
  });

  test.it('should return unbind function from once method', () => {
    const emitter = createEventEmitter();
    let count = 0;

    const unbind = emitter.once('test', () => count++);
    unbind(); // Unbind before emit
    emitter.emit('test');

    test.expect(count).toBe(0);
  });

  test.it('should pass multiple arguments to handlers', () => {
    const emitter = createEventEmitter();
    let receivedArgs: unknown[] = [];

    emitter.on('test', (...args: unknown[]) => { receivedArgs = args; });
    emitter.emit('test', 1, 'hello', true);

    test.expect(receivedArgs).toEqual([1, 'hello', true]);
  });

  test.it('should handle multiple different events independently', () => {
    const emitter = createEventEmitter();
    let count1 = 0;
    let count2 = 0;

    emitter.on('event1', () => count1++);
    emitter.on('event2', () => count2++);

    emitter.emit('event1');
    test.expect(count1).toBe(1);
    test.expect(count2).toBe(0);

    emitter.emit('event2');
    test.expect(count1).toBe(1);
    test.expect(count2).toBe(1);
  });
});
