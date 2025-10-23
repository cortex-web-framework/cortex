# Type-Safe Actors Examples

This directory contains practical examples demonstrating how to use Cortex's type-safe actor system to build robust, scalable applications with compile-time message safety guarantees.

## Examples

### 1. Basic Counter Example (`basic-example.ts`)

**Demonstrates:**
- Simple message types with discriminated unions
- Basic actor implementation
- Message sending and handling
- Compile-time type safety

**Key Patterns:**
```typescript
type CounterMessage =
  | { type: 'increment'; amount: number }
  | { type: 'decrement'; amount: number }
  | { type: 'reset' };

class CounterActor extends TypeSafeActor<number, CounterMessage> { ... }
```

**Use Cases:**
- Learning the basics
- Simple state management
- Understanding message passing

### 2. User Store Example (`user-store-example.ts`)

**Demonstrates:**
- Complex state with maps and custom types
- CRUD operations
- Query and list operations
- Error handling and validation
- Statistics tracking

**Key Patterns:**
```typescript
interface UserStoreState {
  users: Map<string, User>;
  totalCreated: number;
  totalDeleted: number;
}

type UserStoreMessage =
  | { type: 'create'; id: string; name: string; email: string }
  | { type: 'update'; id: string; name?: string; email?: string }
  | { type: 'delete'; id: string }
  | { type: 'get'; id: string }
  | { type: 'list' };
```

**Use Cases:**
- Data store implementation
- Resource management
- Query interfaces
- State mutation tracking

### 3. Coordinator/Fan-Out-Fan-In Example (`coordinator-example.ts`)

**Demonstrates:**
- Multiple actors working together
- Fan-out pattern (distributing work)
- Fan-in pattern (collecting results)
- Actor-to-actor communication
- Coordination logic

**Key Patterns:**
```typescript
// Coordinator distributes work to workers
data.forEach((item, index) => {
  const workerId = this.workerIds[index % this.workerIds.length];
  const worker = this.system.getActor(workerId);
  worker.postMessage({ type: 'work', taskId, data: item });
});

// Workers send results back
coordinator.postMessage({
  type: 'work-complete',
  taskId,
  workerId,
  result
});
```

**Use Cases:**
- Task distribution systems
- Parallel processing
- Load balancing
- Batch job processing

## Running the Examples

### From the project root:

```bash
# Compile the entire project including examples
npm run build

# Run a specific example
node dist/examples/type-safe-actors/basic-example.js
node dist/examples/type-safe-actors/user-store-example.js
node dist/examples/type-safe-actors/coordinator-example.js
```

### Or compile just the examples:

```bash
npx tsc --project tsconfig.json --outDir dist-examples
node dist-examples/examples/type-safe-actors/basic-example.js
```

## Key Concepts Illustrated

### 1. Type-Safe Message Passing

All examples demonstrate compile-time type checking for messages:

```typescript
// ✅ Correct - TypeScript accepts this
actor.tell({ type: 'increment', amount: 5 });

// ❌ Compile Error - TypeScript rejects this
actor.tell({ type: 'invalid-message' });
actor.tell({ type: 'increment', amount: 'not a number' });
```

### 2. Discriminated Unions

Messages use the pattern `{ type: 'literal' }` to enable TypeScript's type narrowing:

```typescript
if (message.type === 'create') {
  // TypeScript knows message has 'id', 'name', 'email' fields
}
```

### 3. Actor Lifecycle

Each example shows how to manage actor state:

- **Initialization**: Actor created with initial state
- **Message Handling**: Receive method processes messages
- **State Mutation**: State is modified based on messages
- **Cleanup**: System shutdown gracefully

### 4. Communication Patterns

Examples demonstrate:

- **Fire-and-Forget**: `actor.tell()` - no response expected
- **Direct Communication**: `this.system.getActor()` for actor-to-actor messaging
- **Sequential Processing**: Messages are processed in order per actor

## Best Practices Shown

1. **Focused Responsibilities** - Each actor handles one concern
2. **Clear Message Types** - Messages are self-documenting
3. **State Management** - State mutations are deliberate and traceable
4. **Error Handling** - Messages validate state before operations
5. **Observable Behavior** - Console output shows what's happening

## Further Reading

- See `docs/type-safe-actors-guide.md` for comprehensive documentation
- Check `tests/core/typeSafeActorSystem.test.ts` for more test examples
- Review `examples/resilient-message-processor/` for production patterns

## Real-World Applications

These patterns are suitable for:

- **User Management Systems** - CRUD operations on user accounts
- **Task Queue Systems** - Distributing and tracking work
- **Event Processing** - Handling streams of events
- **Resource Pools** - Managing limited resources
- **Distributed Systems** - Coordinating multiple components

## Tips for Learning

1. **Start with Basic Example** - Understand counter before moving to complex examples
2. **Modify and Experiment** - Change message types and handlers
3. **Add Logging** - Add console.log to understand execution flow
4. **Build Incrementally** - Start simple and add features
5. **Use IDE Features** - Let TypeScript catch your mistakes early

## Common Patterns to Try

- Add a "get-stats" message to the counter
- Implement a queue actor (FIFO or priority)
- Create a cache actor with TTL
- Build a pub/sub event system
- Implement a retry mechanism with backoff

## Questions?

Refer to the complete guide at `docs/type-safe-actors-guide.md` or check the test suite for additional patterns.
