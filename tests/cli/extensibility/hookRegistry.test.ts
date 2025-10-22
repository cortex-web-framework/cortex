/**
 * Hook Registry Tests
 * TDD approach with super strict TypeScript and comprehensive test coverage
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

// Mock types for now - these will be replaced with actual imports
interface MockHookContext {
  readonly hookName: string;
  readonly event: string;
  readonly command?: string;
  readonly args?: readonly string[];
  readonly options?: Record<string, unknown>;
  readonly workingDirectory: string;
  readonly logger: {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };
  readonly data: Record<string, unknown>;
}

interface MockHook {
  readonly name: string;
  readonly event: string;
  readonly priority: number;
  readonly handler: (context: MockHookContext) => Promise<void>;
  readonly condition?: (context: MockHookContext) => boolean;
}

interface MockHookRegistry {
  register(hook: MockHook): void;
  unregister(hookName: string): void;
  emit(event: string, context: MockHookContext): Promise<void>;
  list(event?: string): readonly MockHook[];
  isRegistered(hookName: string): boolean;
  getCount(): number;
  getEventCount(event: string): number;
  clear(): void;
  getByPriorityRange(minPriority: number, maxPriority: number): readonly MockHook[];
  getByCondition(condition: (hook: MockHook) => boolean): readonly MockHook[];
  getEvents(): readonly string[];
  hasHooks(event: string): boolean;
}

// Mock implementation for testing
class MockCortexHookRegistry implements MockHookRegistry {
  private readonly hooks = new Map<string, MockHook>();
  private readonly hooksByEvent = new Map<string, MockHook[]>();

  register(hook: MockHook): void {
    if (this.hooks.has(hook.name)) {
      throw new Error(`Hook '${hook.name}' is already registered`);
    }
    
    this.hooks.set(hook.name, hook);
    
    // Add to event index
    if (!this.hooksByEvent.has(hook.event)) {
      this.hooksByEvent.set(hook.event, []);
    }
    this.hooksByEvent.get(hook.event)!.push(hook);
    
    // Sort by priority
    this.hooksByEvent.get(hook.event)!.sort((a, b) => a.priority - b.priority);
  }

  unregister(hookName: string): void {
    const hook = this.hooks.get(hookName);
    if (!hook) {
      throw new Error(`Hook '${hookName}' is not registered`);
    }
    
    this.hooks.delete(hookName);
    
    // Remove from event index
    const eventHooks = this.hooksByEvent.get(hook.event);
    if (eventHooks) {
      const index = eventHooks.findIndex(h => h.name === hookName);
      if (index !== -1) {
        eventHooks.splice(index, 1);
      }
    }
  }

  async emit(event: string, context: MockHookContext): Promise<void> {
    const eventHooks = this.hooksByEvent.get(event);
    if (!eventHooks || eventHooks.length === 0) {
      return;
    }

    // Execute hooks in priority order
    for (const hook of eventHooks) {
      try {
        // Check condition if provided
        if (hook.condition && !hook.condition(context)) {
          continue;
        }

        // Execute hook
        await hook.handler(context);
      } catch (error) {
        // Log error but continue with other hooks
        console["error"](`Hook '${hook.name}' failed:`, error);
      }
    }
  }

  list(event?: string): readonly MockHook[] {
    if (event) {
      return this.hooksByEvent.get(event) ?? [];
    }
    return Array.from(this.hooks.values());
  }

  isRegistered(hookName: string): boolean {
    return this.hooks.has(hookName);
  }

  getCount(): number {
    return this.hooks.size;
  }

  getEventCount(event: string): number {
    return this.hooksByEvent.get(event)?.length ?? 0;
  }

  clear(): void {
    this.hooks.clear();
    this.hooksByEvent.clear();
  }

  getByPriorityRange(minPriority: number, maxPriority: number): readonly MockHook[] {
    return this.list().filter(hook => 
      hook.priority >= minPriority && hook.priority <= maxPriority
    );
  }

  getByCondition(condition: (hook: MockHook) => boolean): readonly MockHook[] {
    return this.list().filter(condition);
  }

  getEvents(): readonly string[] {
    return Array.from(this.hooksByEvent.keys());
  }

  hasHooks(event: string): boolean {
    return this.hooksByEvent.has(event) && this.hooksByEvent.get(event)!.length > 0;
  }
}

describe('CortexHookRegistry', () => {
  let registry: MockHookRegistry;
  let testHook: MockHook;
  let testHook2: MockHook;
  let testContext: MockHookContext;

  beforeEach(() => {
    registry = new MockCortexHookRegistry();
    testContext = {
      hookName: 'test-hook',
      event: 'test-event',
      command: 'test-command',
      args: ['arg1', 'arg2'],
      options: { verbose: true },
      workingDirectory: '/test/dir',
      logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {}
      },
      data: { test: 'value' }
    };
    testHook = {
      name: 'test-hook',
      event: 'test-event',
      priority: 100,
      handler: async (context: MockHookContext) => {
        context.data['executed'] = true;
      }
    };
    testHook2 = {
      name: 'another-hook',
      event: 'test-event',
      priority: 200,
      handler: async (context: MockHookContext) => {
        context.data['executed2'] = true;
      }
    };
  });

  afterEach(() => {
    registry.clear();
  });

  describe('register', () => {
    it('should register a hook successfully', () => {
      registry.register(testHook);
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('test-hook'), true);
      assert.strictEqual(registry.getEventCount('test-event'), 1);
    });

    it('should throw error when registering duplicate hook', () => {
      registry.register(testHook);
      
      assert.throws(
        () => registry.register(testHook),
        {
          name: 'Error',
          message: "Hook 'test-hook' is already registered"
        }
      );
    });

    it('should register multiple hooks for same event', () => {
      registry.register(testHook);
      registry.register(testHook2);
      
      assert.strictEqual(registry.getCount(), 2);
      assert.strictEqual(registry.getEventCount('test-event'), 2);
    });

    it('should register hooks for different events', () => {
      const hookForDifferentEvent: MockHook = {
        ...testHook,
        name: 'different-event-hook',
        event: 'different-event'
      };
      
      registry.register(testHook);
      registry.register(hookForDifferentEvent);
      
      assert.strictEqual(registry.getCount(), 2);
      assert.strictEqual(registry.getEventCount('test-event'), 1);
      assert.strictEqual(registry.getEventCount('different-event'), 1);
    });

    it('should sort hooks by priority after registration', () => {
      const highPriorityHook: MockHook = {
        name: 'high-priority-hook',
        event: 'test-event',
        priority: 50,
        handler: async () => {}
      };
      
      registry.register(testHook); // priority 100
      registry.register(highPriorityHook); // priority 50
      registry.register(testHook2); // priority 200
      
      const hooks = registry.list('test-event');
      assert.strictEqual(hooks[0]?.name, 'high-priority-hook');
      assert.strictEqual(hooks[1]?.name, 'test-hook');
      assert.strictEqual(hooks[2]?.name, 'another-hook');
    });
  });

  describe('unregister', () => {
    it('should unregister a hook successfully', () => {
      registry.register(testHook);
      assert.strictEqual(registry.getCount(), 1);
      
      registry.unregister('test-hook');
      
      assert.strictEqual(registry.getCount(), 0);
      assert.strictEqual(registry.isRegistered('test-hook'), false);
      assert.strictEqual(registry.getEventCount('test-event'), 0);
    });

    it('should throw error when unregistering non-existent hook', () => {
      assert.throws(
        () => registry.unregister('non-existent-hook'),
        {
          name: 'Error',
          message: "Hook 'non-existent-hook' is not registered"
        }
      );
    });

    it('should unregister correct hook when multiple are registered', () => {
      registry.register(testHook);
      registry.register(testHook2);
      assert.strictEqual(registry.getCount(), 2);
      
      registry.unregister('test-hook');
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.isRegistered('test-hook'), false);
      assert.strictEqual(registry.isRegistered('another-hook'), true);
      assert.strictEqual(registry.getEventCount('test-event'), 1);
    });
  });

  describe('emit', () => {
    it('should execute hooks in priority order', async () => {
      const executionOrder: string[] = [];
      
      const hook1: MockHook = {
        name: 'hook1',
        event: 'test-event',
        priority: 300,
        handler: async () => {
          executionOrder.push('hook1');
        }
      };
      
      const hook2: MockHook = {
        name: 'hook2',
        event: 'test-event',
        priority: 100,
        handler: async () => {
          executionOrder.push('hook2');
        }
      };
      
      const hook3: MockHook = {
        name: 'hook3',
        event: 'test-event',
        priority: 200,
        handler: async () => {
          executionOrder.push('hook3');
        }
      };
      
      registry.register(hook1);
      registry.register(hook2);
      registry.register(hook3);
      
      await registry.emit('test-event', testContext);
      
      assert.deepStrictEqual(executionOrder, ['hook2', 'hook3', 'hook1']);
    });

    it('should not execute hooks for non-existent event', async () => {
      let executed = false;
      const modifiedHook: MockHook = {
        ...testHook,
        handler: async () => {
          executed = true;
        }
      };
      registry.register(modifiedHook);
      
      await registry.emit('non-existent-event', testContext);
      
      assert.strictEqual(executed, false);
    });

    it('should execute hooks with conditions', async () => {
      let executed = false;
      
      const conditionalHook: MockHook = {
        name: 'conditional-hook',
        event: 'test-event',
        priority: 100,
        condition: (context: MockHookContext) => context.command === 'test-command',
        handler: async () => {
          executed = true;
        }
      };
      
      registry.register(conditionalHook);
      
      await registry.emit('test-event', testContext);
      
      assert.strictEqual(executed, true);
    });

    it('should not execute hooks when condition fails', async () => {
      let executed = false;
      
      const conditionalHook: MockHook = {
        name: 'conditional-hook',
        event: 'test-event',
        priority: 100,
        condition: (context: MockHookContext) => context.command === 'wrong-command',
        handler: async () => {
          executed = true;
        }
      };
      
      registry.register(conditionalHook);
      
      await registry.emit('test-event', testContext);
      
      assert.strictEqual(executed, false);
    });

    it('should continue executing other hooks when one fails', async () => {
      let executed1 = false;
      let executed2 = false;
      
      const failingHook: MockHook = {
        name: 'failing-hook',
        event: 'test-event',
        priority: 100,
        handler: async () => {
          executed1 = true;
          throw new Error('Hook failed');
        }
      };
      
      const succeedingHook: MockHook = {
        name: 'succeeding-hook',
        event: 'test-event',
        priority: 200,
        handler: async () => {
          executed2 = true;
        }
      };
      
      registry.register(failingHook);
      registry.register(succeedingHook);
      
      await registry.emit('test-event', testContext);
      
      assert.strictEqual(executed1, true);
      assert.strictEqual(executed2, true);
    });

    it('should handle async hook execution', async () => {
      let executed = false;
      
      const asyncHook: MockHook = {
        name: 'async-hook',
        event: 'test-event',
        priority: 100,
        handler: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          executed = true;
        }
      };
      
      registry.register(asyncHook);
      
      await registry.emit('test-event', testContext);
      
      assert.strictEqual(executed, true);
    });
  });

  describe('list', () => {
    it('should return empty array when no hooks registered', () => {
      const hooks = registry.list();
      assert.strictEqual(hooks.length, 0);
    });

    it('should return all hooks when no event specified', () => {
      registry.register(testHook);
      registry.register(testHook2);
      
      const hooks = registry.list();
      assert.strictEqual(hooks.length, 2);
    });

    it('should return hooks for specific event', () => {
      const differentEventHook: MockHook = {
        name: 'different-event-hook',
        event: 'different-event',
        priority: 100,
        handler: async () => {}
      };
      
      registry.register(testHook);
      registry.register(differentEventHook);
      
      const testEventHooks = registry.list('test-event');
      assert.strictEqual(testEventHooks.length, 1);
      assert.strictEqual(testEventHooks[0]?.name, 'test-hook');
      
      const differentEventHooks = registry.list('different-event');
      assert.strictEqual(differentEventHooks.length, 1);
      assert.strictEqual(differentEventHooks[0]?.name, 'different-event-hook');
    });

    it('should return empty array for non-existent event', () => {
      registry.register(testHook);
      
      const hooks = registry.list('non-existent-event');
      assert.strictEqual(hooks.length, 0);
    });
  });

  describe('isRegistered', () => {
    it('should return false for non-existent hook', () => {
      assert.strictEqual(registry.isRegistered('non-existent-hook'), false);
    });

    it('should return true for registered hook', () => {
      registry.register(testHook);
      assert.strictEqual(registry.isRegistered('test-hook'), true);
    });

    it('should return false after unregistering', () => {
      registry.register(testHook);
      registry.unregister('test-hook');
      assert.strictEqual(registry.isRegistered('test-hook'), false);
    });
  });

  describe('getCount and getEventCount', () => {
    it('should return 0 for empty registry', () => {
      assert.strictEqual(registry.getCount(), 0);
      assert.strictEqual(registry.getEventCount('test-event'), 0);
    });

    it('should return correct counts after registering hooks', () => {
      registry.register(testHook);
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.getEventCount('test-event'), 1);
      
      registry.register(testHook2);
      assert.strictEqual(registry.getCount(), 2);
      assert.strictEqual(registry.getEventCount('test-event'), 2);
    });

    it('should return correct counts after unregistering', () => {
      registry.register(testHook);
      registry.register(testHook2);
      registry.unregister('test-hook');
      
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.getEventCount('test-event'), 1);
    });
  });

  describe('clear', () => {
    it('should clear empty registry without error', () => {
      assert.doesNotThrow(() => registry.clear());
      assert.strictEqual(registry.getCount(), 0);
    });

    it('should clear all registered hooks', () => {
      registry.register(testHook);
      registry.register(testHook2);
      assert.strictEqual(registry.getCount(), 2);
      
      registry.clear();
      
      assert.strictEqual(registry.getCount(), 0);
      assert.strictEqual(registry.getEventCount('test-event'), 0);
    });
  });

  describe('getByPriorityRange', () => {
    beforeEach(() => {
      const hook1: MockHook = {
        name: 'hook1',
        event: 'test-event',
        priority: 50,
        handler: async () => {}
      };
      
      const hook2: MockHook = {
        name: 'hook2',
        event: 'test-event',
        priority: 150,
        handler: async () => {}
      };
      
      const hook3: MockHook = {
        name: 'hook3',
        event: 'test-event',
        priority: 250,
        handler: async () => {}
      };
      
      registry.register(hook1);
      registry.register(hook2);
      registry.register(hook3);
    });

    it('should return hooks within priority range', () => {
      const hooks = registry.getByPriorityRange(100, 200);
      assert.strictEqual(hooks.length, 1);
      assert.strictEqual(hooks[0]?.name, 'hook2');
    });

    it('should return empty array for no matches', () => {
      const hooks = registry.getByPriorityRange(300, 400);
      assert.strictEqual(hooks.length, 0);
    });

    it('should include boundary values', () => {
      const hooks = registry.getByPriorityRange(50, 250);
      assert.strictEqual(hooks.length, 3);
    });
  });

  describe('getByCondition', () => {
    beforeEach(() => {
      registry.register(testHook);
      registry.register(testHook2);
    });

    it('should return hooks matching condition', () => {
      const hooks = registry.getByCondition(hook => hook.priority < 150);
      assert.strictEqual(hooks.length, 1);
      assert.strictEqual(hooks[0]?.name, 'test-hook');
    });

    it('should return empty array for no matches', () => {
      const hooks = registry.getByCondition(hook => hook.priority > 1000);
      assert.strictEqual(hooks.length, 0);
    });
  });

  describe('getEvents and hasHooks', () => {
    it('should return empty array when no events', () => {
      assert.strictEqual(registry.getEvents().length, 0);
    });

    it('should return all events', () => {
      const hook1: MockHook = {
        name: 'hook1',
        event: 'event1',
        priority: 100,
        handler: async () => {}
      };
      
      const hook2: MockHook = {
        name: 'hook2',
        event: 'event2',
        priority: 100,
        handler: async () => {}
      };
      
      registry.register(hook1);
      registry.register(hook2);
      
      const events = registry.getEvents();
      assert.strictEqual(events.length, 2);
      assert.ok(events.includes('event1'));
      assert.ok(events.includes('event2'));
    });

    it('should return true for events with hooks', () => {
      registry.register(testHook);
      assert.strictEqual(registry.hasHooks('test-event'), true);
    });

    it('should return false for events without hooks', () => {
      assert.strictEqual(registry.hasHooks('non-existent-event'), false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle hooks with negative priority', () => {
      const negativePriorityHook: MockHook = {
        name: 'negative-priority-hook',
        event: 'test-event',
        priority: -100,
        handler: async () => {}
      };
      
      registry.register(negativePriorityHook);
      assert.strictEqual(registry.getCount(), 1);
    });

    it('should handle hooks with very high priority', () => {
      const highPriorityHook: MockHook = {
        name: 'high-priority-hook',
        event: 'test-event',
        priority: Number.MAX_SAFE_INTEGER,
        handler: async () => {}
      };
      
      registry.register(highPriorityHook);
      assert.strictEqual(registry.getCount(), 1);
    });

    it('should handle hooks with empty event names', () => {
      const emptyEventHook: MockHook = {
        name: 'empty-event-hook',
        event: '',
        priority: 100,
        handler: async () => {}
      };
      
      registry.register(emptyEventHook);
      assert.strictEqual(registry.getCount(), 1);
      assert.strictEqual(registry.getEventCount(''), 1);
    });

    it('should handle hooks that throw errors', async () => {
      const errorHook: MockHook = {
        name: 'error-hook',
        event: 'test-event',
        priority: 100,
        handler: async () => {
          throw new Error('Intentional error');
        }
      };
      
      registry.register(errorHook);
      
      // Should not throw
      await assert.doesNotReject(() => registry.emit('test-event', testContext));
    });
  });

  describe('performance and memory', () => {
    it('should handle large number of hooks efficiently', () => {
      const startTime = Date.now();
      
      // Register 1000 hooks
      for (let i = 0; i < 1000; i++) {
        const hook: MockHook = {
          name: `hook-${i}`,
          event: `event-${i % 10}`,
          priority: i,
          handler: async () => {}
        };
        registry.register(hook);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(registry.getCount(), 1000);
      assert.ok(duration < 1000, `Registration took too long: ${duration}ms`);
    });

    it('should handle frequent emit operations efficiently', () => {
      // Register hooks
      for (let i = 0; i < 100; i++) {
        const hook: MockHook = {
          name: `hook-${i}`,
          event: 'test-event',
          priority: i,
          handler: async () => {}
        };
        registry.register(hook);
      }
      
      const startTime = Date.now();
      
      // Perform 1000 emit operations
      for (let i = 0; i < 1000; i++) {
        registry.emit('test-event', testContext);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 1000, `Emit operations took too long: ${duration}ms`);
    });
  });
});