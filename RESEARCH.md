# Research Findings: Core System and Resilience Refactoring

This document summarizes the research into best practices for the three key areas targeted for refactoring: the Actor System, the Circuit Breaker, and time-based testing.

## 1. Type-Safe Actor System with Generics

**Objective:** Eliminate `any` from the actor system by introducing a generic, type-safe messaging architecture.

**Core Finding:** The most robust and common pattern for achieving type safety in this context is to combine **TypeScript Generics** with **Discriminated Unions**. This approach allows for flexible yet strict contracts for actor messages and state.

### Recommended Pattern

1.  **Discriminated Unions for Messages:** Define all possible messages an actor can receive using a common literal property (e.g., `type`). This enables TypeScript's powerful type narrowing and exhaustive checks in `switch` statements.

    ```typescript
    // Common interface for all messages
    interface ActorMessage {
      readonly type: string;
    }

    // Specific messages for a hypothetical UserActor
    interface CreateUserMessage extends ActorMessage {
      readonly type: 'CREATE_USER';
      readonly username: string;
      readonly email: string;
    }

    interface GetUserMessage extends ActorMessage {
      readonly type: 'GET_USER';
      readonly userId: string;
    }

    // A union of all possible messages for this actor
    type UserActorMessage = CreateUserMessage | GetUserMessage;
    ```

2.  **Generic `Actor` Base Class:** Create a base `Actor` class that is generic over its message type (`TMessage`) and its state type (`TState`).

    ```typescript
    abstract class Actor<TState, TMessage extends ActorMessage> {
      protected state: TState;
      public readonly id: string;
      protected readonly system: ActorSystem;

      constructor(id: string, system: ActorSystem, initialState: TState) {
        this.id = id;
        this.system = system;
        this.state = initialState;
      }

      // The receive method is now strongly typed
      abstract receive(message: TMessage): void;
    }
    ```

3.  **Strongly-Typed Actor Implementation:** When extending the base `Actor`, specify the concrete state and message types.

    ```typescript
    interface UserState {
      users: Map<string, { username: string; email: string }>;
    }

    class UserActor extends Actor<UserState, UserActorMessage> {
      constructor(id: string, system: ActorSystem) {
        super(id, system, { users: new Map() });
      }

      receive(message: UserActorMessage): void {
        switch (message.type) {
          case 'CREATE_USER':
            // `message.username` and `message.email` are fully typed
            console.log(`Creating user: ${message.username}`);
            // ... implementation
            break;
          case 'GET_USER':
            // `message.userId` is fully typed
            console.log(`Getting user: ${message.userId}`);
            // ... implementation
            break;
          default:
            // This ensures all message types are handled at compile time
            const _exhaustiveCheck: never = message;
            return _exhaustiveCheck;
        }
      }
    }
    ```

4.  **Type-Safe `dispatch` in `ActorSystem`:** The `dispatch` method should also be generic to ensure that only messages appropriate for a given actor can be sent. This is the most complex part, as the `ActorSystem` holds a collection of actors of different types. A common solution is to use a type-safe `ActorRef` (Actor Reference) pattern.

    ```typescript
    // A type-safe handle to an actor
    class ActorRef<TMessage extends ActorMessage> {
      constructor(public readonly id: string, private readonly system: ActorSystem) {}

      dispatch(message: TMessage): void {
        this.system.dispatch(this.id, message);
      }
    }

    class ActorSystem {
      private actors: Map<string, Actor<any, any>> = new Map();

      public createActor<TState, TMessage extends ActorMessage>(
        ActorClass: new (id: string, system: ActorSystem) => Actor<TState, TMessage>,
        id: string
      ): ActorRef<TMessage> {
        if (this.actors.has(id)) {
          throw new Error(`Actor with id ${id} already exists.`);
        }
        const actor = new ActorClass(id, this);
        this.actors.set(id, actor);
        return new ActorRef<TMessage>(id, this);
      }

      // Dispatch remains internally untyped, but is protected by the typed ActorRef
      public dispatch(actorId: string, message: ActorMessage): void {
        const actor = this.actors.get(actorId);
        if (actor) {
          actor.receive(message); // The actor's own `receive` is typed
        }
      }
    }

    // Usage
    const system = new ActorSystem();
    const userActorRef = system.createActor(UserActor, 'user-actor');

    // This is type-safe and will compile
    userActorRef.dispatch({ type: 'CREATE_USER', username: 'test', email: 'test@test.com' });

    // This will cause a compile-time error
    // userActorRef.dispatch({ type: 'SOME_OTHER_MESSAGE' });
    ```

**Conclusion:** This pattern provides maximum type safety, improves developer experience through autocompletion, and prevents entire classes of bugs at compile time. It is the recommended approach.

---

## 2. High-Performance Rolling Window Data Structure

**Objective:** Find an efficient data structure for the `CircuitBreaker`'s rolling time window that avoids iterating over a large array on every operation.

**Core Finding:** A **Circular Buffer (or Ring Buffer)** combined with maintaining a running sum is the optimal data structure for this use case. It provides a fixed-size window where adding a new element automatically overwrites the oldest, allowing for O(1) complexity for additions and calculations.

### Recommended Pattern

Implement a `RollingWindow` class that encapsulates this logic.

```typescript
class RollingWindow {
  private readonly window: number[];
  private readonly size: number;
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private sum: number = 0;

  constructor(size: number) {
    if (size <= 0) {
      throw new Error('Window size must be positive.');
    }
    this.size = size;
    this.window = new Array(size).fill(0);
  }

  /**
   * Adds a value to the window, overwriting the oldest value if full.
   * @param value The value to add.
   */
  add(value: number): void {
    // Subtract the value we are about to overwrite
    if (this.isFull()) {
      this.sum -= this.window[this.head];
    }

    this.window[this.head] = value;
    this.head = (this.head + 1) % this.size;
    this.sum += value;

    if (!this.isFull()) {
      this.count++;
    }
  }

  getSum(): number {
    return this.sum;
  }

  getCount(): number {
    return this.count;
  }

  getAverage(): number {
    return this.count === 0 ? 0 : this.sum / this.count;
  }

  isFull(): boolean {
    return this.count === this.size;
  }

  clear(): void {
    this.window.fill(0);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
    this.sum = 0;
  }
}
```

**Application to `CircuitBreaker`:**
Instead of storing every single event, the `CircuitBreaker` can use two `RollingWindow` instances (or a single one storing objects) to track successes and failures over discrete time slices (e.g., 10 windows of 1 second each for a 10-second total window). This avoids unbounded memory growth while still providing accurate metrics for the error threshold calculation.

**Conclusion:** The Circular Buffer pattern is highly efficient, has a constant memory footprint, and provides O(1) performance for the required operations, making it ideal for the `CircuitBreaker`.

---

## 3. Test Clock Injection Pattern

**Objective:** Decouple time-dependent logic from the system clock to make tests deterministic, reliable, and fast.

**Core Finding:** The best practice is to use **Dependency Injection**. Define a simple `TimeProvider` interface and inject it into any class that needs to know the current time. In production, a real implementation is provided. In tests, a mock implementation is provided that allows for manual control of time.

### Recommended Pattern

1.  **Define the `TimeProvider` Interface:**

    ```typescript
    // src/utils/time.ts
    export interface TimeProvider {
      now(): number; // Returns timestamp, e.g., Date.now()
    }
    ```

2.  **Create the Production `SystemTimeProvider`:**

    ```typescript
    // src/utils/time.ts
    export class SystemTimeProvider implements TimeProvider {
      now(): number {
        return Date.now();
      }
    }
    ```

3.  **Refactor `CircuitBreaker` to Use Injection:**

    ```typescript
    // src/resilience/circuitBreaker.ts
    import { TimeProvider, SystemTimeProvider } from '../utils/time';

    export class CircuitBreaker {
      private timeProvider: TimeProvider;

      constructor(
        private config: CircuitBreakerConfig,
        timeProvider?: TimeProvider
      ) {
        this.timeProvider = timeProvider || new SystemTimeProvider();
      }

      public async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
          // Use the injected time provider instead of Date.now()
          if (this.timeProvider.now() < this.nextAttemptTime) {
            throw new CircuitBreakerOpenError(...);
          }
          // ...
        }
        // ...
      }
    }
    ```

4.  **Create a `ManualTimeProvider` for Tests:**

    ```typescript
    // tests/mocks/time.ts
    import { TimeProvider } from '../../src/utils/time';

    export class ManualTimeProvider implements TimeProvider {
      private currentTime: number;

      constructor(startTime: number = 0) {
        this.currentTime = startTime;
      }

      now(): number {
        return this.currentTime;
      }

      /**
       * Manually advance the clock.
       * @param milliseconds The number of milliseconds to advance.
       */
      advance(milliseconds: number): void {
        this.currentTime += milliseconds;
      }

      /**
       * Set the clock to a specific timestamp.
       */
      setTime(timestamp: number): void {
        this.currentTime = timestamp;
      }
    }
    ```

5.  **Use the `ManualTimeProvider` in Tests:**

    ```typescript
    // tests/resilience/circuitBreaker.test.ts
    import { ManualTimeProvider } from '../mocks/time';

    test('CircuitBreaker should transition to HALF_OPEN after timeout', async () => {
      const timeProvider = new ManualTimeProvider();
      const circuitBreaker = new CircuitBreaker({ timeout: 100, ... }, timeProvider);

      // 1. Open the circuit
      await assert.rejects(() => circuitBreaker.execute(async () => { throw new Error('fail'); }));
      assert.strictEqual(circuitBreaker.getState(), CircuitState.OPEN);

      // 2. Advance time instantly, without waiting
      timeProvider.advance(101);

      // 3. The next call will now be in HALF_OPEN state
      await circuitBreaker.execute(async () => 'success');
      assert.strictEqual(circuitBreaker.getState(), CircuitState.CLOSED);
    });
    ```

**Conclusion:** This pattern completely eliminates the need for `setTimeout` in tests, making them instantaneous and 100% reliable. It is a fundamental practice for testing any time-sensitive logic.