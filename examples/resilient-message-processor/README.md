# Resilient Message Processor Example

This example demonstrates a production-ready message processor that combines multiple resilience patterns from the Cortex framework:

- **Type-Safe Actors** - For concurrent message processing with compile-time type safety
- **Circuit Breaker** - To prevent cascading failures when downstream services are unavailable
- **Rolling Window** - To track success/failure metrics over time
- **TimeWindowTracker** - To monitor error rates across time buckets
- **Retry Logic** - To handle transient failures gracefully

## Architecture

```
Message Queue
    ↓
[Dispatcher Actor]
    ↓ (distributes work)
[Worker Actor 1] [Worker Actor 2] [Worker Actor 3]
    ↓ (all protected by)
[Circuit Breaker]
    ↓ (metrics tracked by)
[RollingWindow + TimeWindowTracker]
    ↓
Service Execution (with retry logic)
```

## Key Features

### 1. **Type-Safe Message Passing**
Messages use discriminated unions to ensure type safety at compile time:
```typescript
type WorkerMessage =
  | { type: 'process'; id: string; data: any }
  | { type: 'shutdown' };
```

### 2. **Fault Tolerance**
- Circuit breaker opens after 5 consecutive failures
- Automatically transitions to HALF_OPEN after timeout
- Accepts requests again after one successful operation

### 3. **Metrics Tracking**
- Real-time success/failure rate calculation
- Rolling window tracks last 100 operations
- Time-window tracking with 10-second windows

### 4. **Concurrent Processing**
- Multiple worker actors for parallel processing
- Sequential message handling per actor (safe state management)
- Async/await support for long-running operations

## Running the Example

The example source code is provided in `src/index.ts`. To compile and run it:

```bash
# From the project root, compile all code including the example
npm run build

# Run the example (it will be compiled to dist-tests)
node dist-tests/examples/resilient-message-processor/src/index.js
```

Or compile just the example with the main project's TypeScript configuration:

```bash
npx tsc --project tsconfig.json --outDir dist-examples
node dist-examples/examples/resilient-message-processor/src/index.js
```

## Output Example

```
Starting Resilient Message Processor...
Created 3 worker actors
Submitting 30 messages for processing...

Processor Stats:
  Total messages: 30
  Successful: 27 (90%)
  Failed: 3 (10%)
  Success rate: 90%
  Error rate (last window): 10%
  Circuit breaker state: CLOSED
  Average response time: 45ms
```

## Use Cases

This pattern is suitable for:
- **API Gateway** - Processing incoming requests to multiple backend services
- **Message Queue Consumer** - Reliably processing job queue items
- **Event Stream Processor** - Handling Kafka/event stream messages
- **Webhook Handler** - Safely processing incoming webhooks with retry logic
- **Data Pipeline** - Processing batch operations with fault tolerance

## Key Components Explained

### Type-Safe Actors
Ensures at compile-time that only valid messages are sent to each actor type.

### Circuit Breaker
Prevents resource exhaustion by stopping requests when the service is failing.

### Metrics Collection
Provides visibility into system health and performance.

### Retry Strategy
Handles transient failures without overwhelming the system.

## Further Reading

See the Cortex documentation for:
- [Type-Safe Actor System](../../docs/type-safe-actor-system.md)
- [Circuit Breaker Pattern](../../docs/resilience-patterns.md)
- [Metrics and Monitoring](../../docs/observability.md)
