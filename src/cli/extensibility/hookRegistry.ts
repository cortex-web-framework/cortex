/**
 * Hook Registry Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { Hook, HookContext, HookRegistry } from './types.js';

/**
 * Hook Registry Implementation
 */
export class CortexHookRegistry implements HookRegistry {
  private readonly hooks = new Map<string, Hook>();
  private readonly hooksByEvent = new Map<string, Hook[]>();

  /**
   * Register a hook
   */
  register(hook: Hook): void {
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

  /**
   * Unregister a hook
   */
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

  /**
   * Emit an event to all registered hooks
   */
  async emit(event: string, context: HookContext): Promise<void> {
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

  /**
   * List all hooks or hooks for a specific event
   */
  list(event?: string): readonly Hook[] {
    if (event) {
      return this.hooksByEvent.get(event) ?? [];
    }
    return Array.from(this.hooks.values());
  }

  /**
   * Check if a hook is registered
   */
  isRegistered(hookName: string): boolean {
    return this.hooks.has(hookName);
  }

  /**
   * Get hook count
   */
  getCount(): number {
    return this.hooks.size;
  }

  /**
   * Get hook count for an event
   */
  getEventCount(event: string): number {
    return this.hooksByEvent.get(event)?.length ?? 0;
  }

  /**
   * Clear all hooks
   */
  clear(): void {
    this.hooks.clear();
    this.hooksByEvent.clear();
  }

  /**
   * Get hooks by priority range
   */
  getByPriorityRange(minPriority: number, maxPriority: number): readonly Hook[] {
    return this.list().filter(hook => 
      hook.priority >= minPriority && hook.priority <= maxPriority
    );
  }

  /**
   * Get hooks by condition
   */
  getByCondition(condition: (hook: Hook) => boolean): readonly Hook[] {
    return this.list().filter(condition);
  }

  /**
   * Get event names
   */
  getEvents(): readonly string[] {
    return Array.from(this.hooksByEvent.keys());
  }

  /**
   * Check if an event has hooks
   */
  hasHooks(event: string): boolean {
    return this.hooksByEvent.has(event) && this.hooksByEvent.get(event)!.length > 0;
  }
}