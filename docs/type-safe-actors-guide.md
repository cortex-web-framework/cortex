# Type-Safe Actors: Complete Guide

This guide demonstrates how to use Cortex's type-safe actor system to build robust, scalable applications with compile-time message safety guarantees.

## Table of Contents

1. [Basic Concepts](#basic-concepts)
2. [Message Types](#message-types)
3. [Creating Type-Safe Actors](#creating-type-safe-actors)
4. [Actor Communication](#actor-communication)
5. [State Management](#state-management)
6. [Lifecycle Hooks](#lifecycle-hooks)
7. [Real-World Patterns](#real-world-patterns)
8. [Best Practices](#best-practices)

## Basic Concepts

### Type Safety Guarantees

The Cortex actor system uses TypeScript's discriminated unions to provide compile-time message type checking:

```typescript
// ✅ Compile-time safe - message types are checked
type UserMessage =
  | { type: 'create'; name: string; email: string }
  | { type: 'update'; id: string; name?: string; email?: string }
  | { type: 'delete'; id: string }
  | { type: 'query'; id: string };

class UserActor extends TypeSafeActor<UserState, UserMessage> {
  protected receive(message: UserMessage): void {
    // TypeScript ensures message is one of the defined types
    // and provides type narrowing based on message.type
  }
}

// ✅ Compile error - invalid message type
const ref = system.createActor(UserActor, 'users', initialState);
ref.tell({ type: 'invalid' }); // ❌ Type error!
```

### Key Benefits

1. **Compile-Time Safety** - Catch message type errors before runtime
2. **IDE Autocomplete** - IDEs can suggest valid message types
3. **Type Narrowing** - Discriminated unions provide automatic type refinement
4. **Self-Documenting** - Message types serve as documentation
5. **Refactoring Safety** - Renaming message types updates all usages

## Message Types

### Discriminated Union Pattern

Messages should use discriminated unions with a `type` field:

```typescript
type Order = { id: string; items: Item[]; total: number };

type OrderMessage =
  | { type: 'create'; order: Order }
  | { type: 'fulfill'; orderId: string }
  | { type: 'cancel'; orderId: string; reason: string }
  | { type: 'query'; orderId: string }
  | { type: 'archive' }; // No additional data needed
```

### Message Variants

For complex scenarios, use separate types for each message variant:

```typescript
// For simple messages
type CreateOrderMessage = {
  type: 'create';
  order: Order;
};

// For query messages (often with response expected)
type QueryOrderMessage = {
  type: 'query';
  orderId: string;
  // Note: Standard actors don't support request/response
  // See request/response patterns below for alternatives
};

// Union of all messages
type OrderMessage = CreateOrderMessage | QueryOrderMessage | ...;
```

### Message Hierarchies

Group related messages by feature:

```typescript
// User management messages
type UserMessage =
  | { type: 'user:create'; name: string }
  | { type: 'user:update'; id: string; name: string }
  | { type: 'user:delete'; id: string };

// Admin-specific messages
type AdminMessage =
  | { type: 'admin:purge' }
  | { type: 'admin:stats' };

// Complete message set
type ManagerMessage = UserMessage | AdminMessage;
```

## Creating Type-Safe Actors

### Basic Actor Definition

```typescript
// Define the state type
interface UserState {
  users: Map<string, User>;
  totalCreated: number;
}

// Define the message type
type UserMessage =
  | { type: 'create'; id: string; name: string }
  | { type: 'update'; id: string; name: string }
  | { type: 'delete'; id: string };

// Implement the actor
class UserActor extends TypeSafeActor<UserState, UserMessage> {
  protected receive(message: UserMessage): void {
    switch (message.type) {
      case 'create':
        this.state.users.set(message.id, {
          id: message.id,
          name: message.name,
          createdAt: new Date(),
        });
        this.state.totalCreated++;
        break;

      case 'update':
        const user = this.state.users.get(message.id);
        if (user) {
          user.name = message.name;
        }
        break;

      case 'delete':
        this.state.users.delete(message.id);
        break;
    }
  }
}
```

### Creating Actor Instances

```typescript
const system = createTypeSafeActorSystem();

// Create actor with initial state
const userActorRef = system.createActor(
  UserActor,
  'user-manager',
  {
    users: new Map(),
    totalCreated: 0,
  }
);
```

## Actor Communication

### Sending Messages

```typescript
// Using tell() - fire and forget
userActorRef.tell({
  type: 'create',
  id: 'user-123',
  name: 'Alice Johnson',
});

// Using send() - same as tell()
userActorRef.send({
  type: 'update',
  id: 'user-123',
  name: 'Alice Smith',
});
```

### Message Ordering Guarantee

Messages are processed sequentially in the order they were sent:

```typescript
// Messages are guaranteed to be processed in order
ref.tell({ type: 'create', id: '1', name: 'Alice' }); // Processed first
ref.tell({ type: 'update', id: '1', name: 'Alice Updated' }); // Processed second
ref.tell({ type: 'delete', id: '1' }); // Processed third

// State will correctly reflect all three operations
```

### Actor-to-Actor Communication

```typescript
class OrderDispatcher extends TypeSafeActor<DispatcherState, DispatcherMessage> {
  protected receive(message: DispatcherMessage): void {
    if (message.type === 'process-order') {
      // Send to worker actor
      const workerRef = this.system.getActor('worker-1');
      if (workerRef) {
        (workerRef as any).postMessage({
          type: 'work',
          data: message.order,
        });
      }
    }
  }
}
```

## State Management

### Immutable State Updates

Always treat state as potentially immutable (good practice):

```typescript
class ListActor extends TypeSafeActor<string[], ListMessage> {
  protected receive(message: ListMessage): void {
    switch (message.type) {
      case 'add':
        // Good: creates new array
        this.state = [...this.state, message.item];
        break;

      case 'remove':
        // Good: creates new array
        this.state = this.state.filter(item => item !== message.item);
        break;

      case 'update':
        // Good: creates new array with updated item
        this.state = this.state.map(item =>
          item.id === message.id
            ? { ...item, ...message.updates }
            : item
        );
        break;
    }
  }
}
```

### Complex State Objects

```typescript
interface AppState {
  users: Map<string, User>;
  roles: Map<string, Role>;
  permissions: Set<string>;
  stats: {
    lastUpdated: Date;
    totalOperations: number;
  };
}

class AppActor extends TypeSafeActor<AppState, AppMessage> {
  protected receive(message: AppMessage): void {
    // Access nested state safely
    const user = this.state.users.get(message.userId);
    const userRole = this.state.roles.get(user?.roleId || '');
    const canDelete = this.state.permissions.has('delete:user');

    // Update nested state
    this.state.stats.lastUpdated = new Date();
    this.state.stats.totalOperations++;
  }
}
```

## Lifecycle Hooks

### Initialization and Cleanup

```typescript
class DatabaseActor extends TypeSafeActor<DBState, DBMessage> {
  private connection: DatabaseConnection | null = null;

  public override preStart(): void {
    console.log('Actor starting, establishing DB connection...');
    this.connection = new DatabaseConnection();
  }

  public override postStop(): void {
    console.log('Actor stopping, closing DB connection...');
    this.connection?.close();
  }

  protected receive(message: DBMessage): void {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    // ... handle message using connection
  }
}
```

### Error Recovery

```typescript
class ResilientActor extends TypeSafeActor<State, Message> {
  private restartCount = 0;

  public override preRestart(reason: Error): void {
    console.log(`Actor restarting due to: ${reason.message}`);
    this.restartCount++;
  }

  public override postRestart(reason: Error): void {
    console.log(`Actor restarted (count: ${this.restartCount})`);
    // Reset or recover state here
  }

  protected receive(message: Message): void {
    // Implementation
  }
}
```

## Real-World Patterns

### Request-Response Using Async/Await

Since standard actors use fire-and-forget messaging, use intermediate state for request/response:

```typescript
class QueryActor extends TypeSafeActor<QueryState, QueryMessage> {
  private pendingQueries: Map<string, (result: any) => void> = new Map();

  protected receive(message: QueryMessage): void {
    if (message.type === 'query') {
      const result = this.executeQuery(message.query);
      // Store response handler if provided
      if (message.responseId) {
        const handler = this.pendingQueries.get(message.responseId);
        if (handler) {
          handler(result);
          this.pendingQueries.delete(message.responseId);
        }
      }
    }
  }

  public async executeQueryAsync(query: string): Promise<any> {
    return new Promise((resolve) => {
      const responseId = `${Date.now()}-${Math.random()}`;
      this.pendingQueries.set(responseId, resolve);
      this.send({
        type: 'query',
        query,
        responseId,
      });
    });
  }
}
```

### Fan-Out/Fan-In Pattern

```typescript
class Coordinator extends TypeSafeActor<CoordinatorState, CoordinatorMessage> {
  protected receive(message: CoordinatorMessage): void {
    if (message.type === 'start-work') {
      // Fan-out: send work to multiple workers
      const workers = ['worker-1', 'worker-2', 'worker-3'];
      workers.forEach((workerId, index) => {
        const worker = this.system.getActor(workerId);
        if (worker) {
          (worker as any).postMessage({
            type: 'work',
            taskId: message.taskId,
            partIndex: index,
          });
        }
      });
      this.state.activeWork.set(message.taskId, []);
    }

    if (message.type === 'work-complete') {
      // Fan-in: collect results
      const results = this.state.activeWork.get(message.taskId) || [];
      results.push(message.result);

      if (results.length === 3) {
        // All workers completed
        console.log('All work complete:', results);
        this.state.activeWork.delete(message.taskId);
      }
    }
  }
}
```

### Backpressure Handling

```typescript
interface ProcessorState {
  queue: Task[];
  processing: boolean;
  maxQueueSize: number;
}

type ProcessorMessage =
  | { type: 'submit'; task: Task }
  | { type: 'process-next' };

class ProcessorActor extends TypeSafeActor<ProcessorState, ProcessorMessage> {
  protected receive(message: ProcessorMessage): void {
    if (message.type === 'submit') {
      if (this.state.queue.length >= this.state.maxQueueSize) {
        console.log('Queue full, rejecting task');
        return; // Apply backpressure
      }
      this.state.queue.push(message.task);
      this.processNext();
    }

    if (message.type === 'process-next') {
      const task = this.state.queue.shift();
      if (task) {
        // Process task (could be async)
        console.log('Processing:', task);
        // Schedule next processing
        process.nextTick(() =>
          this.postMessage({ type: 'process-next' })
        );
      } else {
        this.state.processing = false;
      }
    }
  }

  private processNext(): void {
    if (!this.state.processing && this.state.queue.length > 0) {
      this.state.processing = true;
      this.postMessage({ type: 'process-next' });
    }
  }
}
```

## Best Practices

### 1. Keep Actors Focused

Each actor should have a single responsibility:

```typescript
// ✅ Good: Each actor has one concern
class UserStore extends TypeSafeActor<UserMap, UserMessage> { ... }
class UserValidator extends TypeSafeActor<ValidationState, ValidateMessage> { ... }
class NotificationService extends TypeSafeActor<NotificationState, NotifyMessage> { ... }

// ❌ Avoid: Actor doing too many things
class SuperActor extends TypeSafeActor<State, AnyMessage> { ... }
```

### 2. Use Meaningful Actor Names

```typescript
// ✅ Clear actor IDs
const userStore = system.createActor(UserActor, 'user-store', {});
const orderProcessor = system.createActor(OrderActor, 'order-processor', {});

// ❌ Avoid vague names
const actor1 = system.createActor(SomeActor, 'actor-1', {});
```

### 3. Avoid Blocking Operations

Actors should never block:

```typescript
// ❌ Avoid blocking
protected receive(message: Message): void {
  this.expensiveSync Computation(); // ❌ Blocks actor thread
}

// ✅ Use async/await if needed
protected receive(message: Message): void {
  this.scheduleAsync(() => this.expensiveComputation());
}
```

### 4. Handle State Initialization

```typescript
class AccountActor extends TypeSafeActor<AccountState, AccountMessage> {
  public override preStart(): void {
    if (!this.state.initialized) {
      this.state.initialized = true;
      this.state.createdAt = new Date();
    }
  }
}
```

### 5. Document Message Types

```typescript
/**
 * Messages for managing user accounts
 *
 * - create: Initialize new user account
 * - suspend: Temporarily disable account access
 * - activate: Re-enable suspended account
 * - delete: Permanently remove account
 */
type UserAccountMessage =
  | { type: 'create'; email: string }
  | { type: 'suspend'; reason: string }
  | { type: 'activate' }
  | { type: 'delete' };
```

### 6. Use Type Assertion Sparingly

```typescript
// ✅ Good: Let TypeScript help you
class Router extends TypeSafeActor<RouteState, RouteMessage> {
  protected receive(message: RouteMessage): void {
    if (message.type === 'route') {
      const handler = this.routes.get(message.path);
      if (handler) handler(message);
    }
  }
}

// ❌ Avoid: Breaking type safety
const ref = system.getActor('some-actor') as any; // ❌ Loses type info
ref.postMessage({ type: 'anything', random: 'field' }); // ❌ No type checking
```

## Summary

The Cortex type-safe actor system provides:

- **Compile-time message type checking** using discriminated unions
- **Self-documenting APIs** through message type definitions
- **Prevention of common runtime errors** like sending wrong message types
- **IDE support** with autocomplete and type hints
- **Scalable architecture** with concurrent processing and message ordering guarantees

By following these patterns and best practices, you can build robust, maintainable distributed systems with strong guarantees about message correctness.
