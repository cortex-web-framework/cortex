# Worker Message Protocol Specification - Phase 4 Task 4.2

## Overview

This specification defines a robust, versioned message protocol for communication between main thread and worker threads. It addresses serialization constraints, type preservation, error handling, and protocol evolution.

**Version**: 1.0
**Status**: SPECIFICATION
**Scope**: WorkerPool, WorkerActor, and future worker implementations

---

## Design Principles

1. **Explicit Type Information**: Every message carries metadata about its structure
2. **Safe Serialization**: Validate serialization capability before sending
3. **Error Context**: Structured error representation with contextual information
4. **Forward Compatibility**: Versioning allows protocol evolution without breaking changes
5. **Optimization Hints**: Support for transferable objects and SharedArrayBuffer
6. **No Silent Failures**: Fail explicitly with actionable error messages

---

## Message Envelope Structure

All messages follow this base envelope:

```typescript
interface MessageEnvelope<T = any> {
  // Protocol version (semver)
  version: "1.0.0";

  // Unique message ID for correlation
  messageId: string;

  // Message type discriminator
  type: MessageType;

  // Timestamp when message was created
  timestamp: number;

  // Actual message payload
  payload: T;

  // Message metadata
  metadata: MessageMetadata;

  // Serialization configuration
  serialization: SerializationConfig;

  // Transfer list for optimization
  transfers?: Transferable[];
}

interface MessageMetadata {
  // Request ID for correlation with response
  requestId?: string;

  // Message priority (for queue ordering)
  priority: "low" | "normal" | "high";

  // Timeout in milliseconds
  timeout?: number;

  // Retry policy
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };

  // Custom context (e.g., trace ID)
  context?: Record<string, unknown>;

  // Sender information
  source: "main" | "worker";

  // Target information
  target?: string;
}

interface SerializationConfig {
  // Type preservation strategy
  preserveTypes: boolean;

  // Whether to include type information
  includeTypeInfo: boolean;

  // Handlers for custom types
  customTypes?: string[];

  // Whether to use transferable objects
  useTransfers: boolean;
}
```

---

## Message Type Definitions

### 1. WorkerPool Messages

#### Task Submission Message

```typescript
interface TaskSubmitMessage {
  type: "task.submit";
  payload: {
    // Task data to process
    data: unknown;

    // Task type hint for worker processing
    dataType: DataTypeHint;

    // Expected result type
    resultType: DataTypeHint;

    // Processing function name or code
    operation?: string;

    // Whether to preserve type information
    preserveTypes: boolean;
  };
  metadata: {
    requestId: string;
    timeout: number;
    priority: "low" | "normal" | "high";
    retry?: {
      maxAttempts: number;
      backoffMs: number;
    };
  };
}

type DataTypeHint =
  | "primitive"      // bool, number, string, null, undefined
  | "plain-object"   // Plain JavaScript object
  | "array"          // Array
  | "date"           // Date object
  | "map"            // Map with serializable keys/values
  | "set"            // Set with serializable values
  | "regex"          // RegExp
  | "arraybuffer"    // ArrayBuffer (transferable)
  | "typed-array"    // TypedArray
  | "blob"           // Blob (browser only, transferable)
  | "custom"         // Custom serialization via type reviver
  | "unknown";       // Unknown type, will attempt generic handling

enum DataTypeHint {
  Primitive = "primitive",
  PlainObject = "plain-object",
  Array = "array",
  Date = "date",
  Map = "map",
  Set = "set",
  Regex = "regex",
  ArrayBuffer = "arraybuffer",
  TypedArray = "typed-array",
  Blob = "blob",
  Custom = "custom",
  Unknown = "unknown"
}
```

#### Task Result Message

```typescript
interface TaskResultMessage {
  type: "task.result";
  payload: {
    // Computed result
    result: unknown;

    // Result type hint
    resultType: DataTypeHint;

    // Duration in milliseconds
    duration: number;

    // Worker ID that processed task
    workerId: string;

    // Type information if preserved
    typeInfo?: TypeInformation;
  };
  metadata: {
    requestId: string;
  };
}
```

#### Task Error Message

```typescript
interface TaskErrorMessage {
  type: "task.error";
  payload: {
    // Error message
    message: string;

    // Error code for programmatic handling
    code: ErrorCode;

    // Error type name (Error, TypeError, RangeError, etc.)
    errorType: string;

    // Stack trace (if available)
    stack?: string;

    // Serializable context information
    context?: {
      taskData?: SerializableValue;
      operation?: string;
      additionalInfo?: Record<string, unknown>;
    };

    // Original error if wrapped
    cause?: TaskErrorPayload;

    // Whether to retry the task
    retryable: boolean;
  };
  metadata: {
    requestId: string;
  };
}

enum ErrorCode {
  SerializationError = "SERIALIZATION_ERROR",
  DeserializationError = "DESERIALIZATION_ERROR",
  TaskExecutionError = "TASK_EXECUTION_ERROR",
  TimeoutError = "TIMEOUT_ERROR",
  ValidationError = "VALIDATION_ERROR",
  WorkerError = "WORKER_ERROR",
  UnknownError = "UNKNOWN_ERROR"
}
```

### 2. WorkerActor Messages

#### Actor Init Message

```typescript
interface ActorInitMessage {
  type: "actor.init";
  payload: {
    // Actor ID
    actorId: string;

    // Actor configuration (serializable only)
    config?: Record<string, SerializableValue>;

    // WASM module URL or base64 data
    wasmModule?: {
      type: "url" | "data";
      value: string;
    };

    // Whether to enable result callbacks
    resultCallbacks: boolean;
  };
  metadata: {
    source: "main";
  };
}

interface ActorMessageData {
  type: "actor.message";
  payload: {
    // The actual message
    message: unknown;

    // Message type hint
    messageType: DataTypeHint;

    // Response callback ID (used instead of function reference)
    responseCallbackId?: string;

    // Type information
    typeInfo?: TypeInformation;
  };
  metadata: {
    actorId: string;
    timeout?: number;
  };
}

interface ActorResultMessage {
  type: "actor.result";
  payload: {
    // The result
    result: unknown;

    // Result type hint
    resultType: DataTypeHint;

    // Callback ID being responded to
    callbackId: string;

    // Type information
    typeInfo?: TypeInformation;
  };
  metadata: {
    actorId: string;
  };
}

interface ActorErrorMessage {
  type: "actor.error";
  payload: ErrorMessagePayload;
  metadata: {
    actorId: string;
    callbackId?: string;
  };
}
```

### 3. Worker Lifecycle Messages

#### Worker Ready Message

```typescript
interface WorkerReadyMessage {
  type: "worker.ready";
  payload: {
    workerId: string;
    features: string[]; // e.g., ["wasm", "transferables"]
    supportedTypes: DataTypeHint[];
  };
  metadata: {
    source: "worker";
  };
}
```

#### Worker Health Message

```typescript
interface WorkerHealthMessage {
  type: "worker.health";
  payload: {
    workerId: string;
    status: "healthy" | "degraded" | "failing";
    tasksProcessed: number;
    currentTask?: string;
    memoryUsage?: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  metadata: {
    source: "worker";
    timestamp: number;
  };
}
```

---

## Type Information Format

When type preservation is enabled, messages include type metadata:

```typescript
interface TypeInformation {
  // Constructor name for reconstruction
  constructorName: string;

  // Full type path (module.Class)
  typePath?: string;

  // Custom serialization version
  version: number;

  // Schema for validation
  schema?: Record<string, unknown>;

  // Nested type information
  properties?: Record<string, TypeInformation>;
}

// Example for Date:
{
  "constructorName": "Date",
  "version": 1,
  "schema": { "time": "number" }
}

// Example for Map:
{
  "constructorName": "Map",
  "version": 1,
  "properties": {
    "key1": { "constructorName": "String", "version": 1 },
    "value1": { "constructorName": "CustomClass", "version": 1 }
  }
}
```

---

## Serialization Strategy

### Type Preservation Modes

#### Mode 1: No Type Preservation (Default)
- Simple structured clone
- All objects become plain objects
- Methods and prototypes lost
- Fastest, least memory overhead
- Suitable for simple data

```typescript
// Input
new Date('2025-01-01')

// Serialized
"2025-01-01T00:00:00.000Z"

// Deserialized
"2025-01-01T00:00:00.000Z" (string, not Date)
```

#### Mode 2: Type Information Only
- Include constructor names and schemas
- Receiver knows types but doesn't reconstruct
- Enables validation on receiver
- Small overhead, useful for debugging

```typescript
// Input
new Date('2025-01-01')

// Serialized
{
  "value": "2025-01-01T00:00:00.000Z",
  "typeInfo": {
    "constructorName": "Date",
    "version": 1
  }
}

// Deserialized
string "2025-01-01T00:00:00.000Z",
but receiver knows it was a Date
```

#### Mode 3: Full Type Preservation
- Custom revivers reconstruct original types
- Objects restored to their constructor
- Full functionality restored
- Larger overhead, necessary for complex types

```typescript
// Input
new Date('2025-01-01')

// Serialized (using replacer)
{
  "value": "2025-01-01T00:00:00.000Z",
  "typeInfo": {
    "constructorName": "Date",
    "version": 1
  }
}

// Deserialized (using reviver)
Date { 2025-01-01T00:00:00.000Z }
// instanceof Date === true
```

---

## Error Representation

### Serializable Error Structure

```typescript
interface SerializableError {
  // Standard error properties
  message: string;
  code: ErrorCode;
  name: string;

  // Stack trace (filtered for serialization)
  stack?: string;

  // Cause chain (for error aggregation)
  cause?: SerializableError;

  // Context information (must be serializable)
  context?: {
    // Serializable task data
    taskData?: SerializableValue;

    // Operation being performed
    operation?: string;

    // Additional debugging info
    debugInfo?: Record<string, unknown>;
  };

  // Whether operation is safe to retry
  retryable: boolean;

  // HTTP status code (if applicable)
  statusCode?: number;
}
```

### Error Serialization Rules

1. Only include serializable error properties
2. Convert function references to string descriptions
3. Truncate large stack traces (first 50 frames max)
4. Create cause chain for error nesting
5. Mark as non-retryable by default unless explicitly set

---

## Transferable Objects

### Optimization for Large Data

When sending large ArrayBuffer or TypedArray, use transfer list:

```typescript
interface TransferableMessage {
  payload: {
    buffer: ArrayBuffer,
    metadata: { size: number }
  },
  transfers: [buffer]  // Transfer ownership, not copy
}
```

### SharedArrayBuffer Support

For data sharing with multiple workers:

```typescript
interface SharedMemoryMessage {
  type: "worker.shared-memory";
  payload: {
    buffer: SharedArrayBuffer;
    layout: {
      offset: number;
      size: number;
      stride: number;
    };
  };
}
```

---

## Protocol Versioning

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes (incompatible messages)
- **MINOR**: New message types (backward compatible)
- **PATCH**: Bug fixes (fully compatible)

### Evolution Rules

1. New message types increment MINOR
2. New fields with defaults increment MINOR
3. Required field addition requires MAJOR
4. Field removal requires MAJOR with deprecation period
5. Servers MUST handle MINOR version above their own

---

## Message Validation Schema

```typescript
interface ValidationSchema {
  // JSON Schema for payload validation
  payloadSchema: Record<string, unknown>;

  // Required fields
  required: string[];

  // Field type constraints
  constraints?: Record<string, Constraint>;

  // Custom validators
  validators?: ((payload: unknown) => boolean)[];
}

interface Constraint {
  type: string;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
}
```

---

## Implementation Checklist

### Phase 4.2 Deliverables
- [ ] MessageEnvelope interface definition
- [ ] All message type definitions
- [ ] DataTypeHint enumeration
- [ ] ErrorCode enumeration
- [ ] TypeInformation structure
- [ ] ValidationSchema for each message type
- [ ] Error representation specification
- [ ] Serialization strategy documentation
- [ ] Transferable object guidelines
- [ ] Version compatibility rules

### Phase 4.3 Deliverables (Implementation)
- [ ] Message envelope builder
- [ ] Message validator
- [ ] Type info collector
- [ ] Serialization handlers for built-in types
- [ ] Error serializer
- [ ] Transfer list optimizer

### Phase 4.4 Deliverables (Testing)
- [ ] Protocol compliance tests
- [ ] Version compatibility tests
- [ ] Serialization tests for all types
- [ ] Error handling tests
- [ ] Transferable object tests

---

## Example Message Exchanges

### Example 1: Simple Task Processing

```javascript
// Main thread → Worker
{
  version: "1.0.0",
  messageId: "msg-123",
  type: "task.submit",
  timestamp: 1234567890,
  payload: {
    data: { value: 42, name: "test" },
    dataType: "plain-object",
    resultType: "plain-object",
    preserveTypes: false
  },
  metadata: {
    requestId: "req-456",
    priority: "normal",
    timeout: 30000,
    source: "main"
  },
  serialization: {
    preserveTypes: false,
    includeTypeInfo: false,
    useTransfers: false
  }
}

// Worker → Main thread
{
  version: "1.0.0",
  messageId: "msg-124",
  type: "task.result",
  timestamp: 1234567900,
  payload: {
    result: { processed: true, sum: 42 },
    resultType: "plain-object",
    duration: 10,
    workerId: "worker-0"
  },
  metadata: {
    requestId: "req-456",
    source: "worker"
  },
  serialization: {
    preserveTypes: false,
    includeTypeInfo: false,
    useTransfers: false
  }
}
```

### Example 2: Complex Type with Preservation

```javascript
// Main thread → Worker
{
  version: "1.0.0",
  messageId: "msg-125",
  type: "task.submit",
  payload: {
    data: {
      created: "2025-01-01T00:00:00.000Z",
      items: [1, 2, 3],
      metadata: { key: "value" }
    },
    dataType: "custom",
    resultType: "custom",
    preserveTypes: true
  },
  metadata: {
    requestId: "req-457",
    priority: "normal",
    timeout: 30000,
    source: "main"
  },
  serialization: {
    preserveTypes: true,
    includeTypeInfo: true,
    useTransfers: false,
    customTypes: ["Date"]
  }
}
```

### Example 3: Error Response

```javascript
// Worker → Main thread (Error)
{
  version: "1.0.0",
  messageId: "msg-126",
  type: "task.error",
  timestamp: 1234567905,
  payload: {
    message: "Failed to process task: Invalid input type",
    code: "TASK_EXECUTION_ERROR",
    errorType: "TypeError",
    stack: "Error: Invalid input type\n    at processTask (worker.js:42)",
    context: {
      taskData: { value: 42 },
      operation: "parseAndProcess",
      additionalInfo: { inputType: "undefined" }
    },
    retryable: false
  },
  metadata: {
    requestId: "req-457",
    source: "worker"
  },
  serialization: {
    preserveTypes: false,
    includeTypeInfo: false,
    useTransfers: false
  }
}
```

### Example 4: Large Data Transfer

```javascript
// Main thread → Worker (with transfer)
{
  version: "1.0.0",
  messageId: "msg-127",
  type: "task.submit",
  payload: {
    data: {
      buffer: ArrayBuffer(1000000),
      size: 1000000
    },
    dataType: "arraybuffer",
    preserveTypes: false
  },
  metadata: {
    requestId: "req-458",
    priority: "high",
    source: "main"
  },
  serialization: {
    preserveTypes: false,
    useTransfers: true
  },
  transfers: [ArrayBuffer(1000000)]  // Transfer, not copy
}
```

---

## Backwards Compatibility

### Version 1.0.0 Features
- Basic message envelope
- Task submit/result/error
- Actor messages
- Simple type hints
- Error codes

### Future Extensions (1.1.0+)
- Streaming messages
- Request cancellation
- Metrics/tracing integration
- Custom type registry
- Plugin system for handlers

---

## Security Considerations

1. **Message Validation**: All incoming messages must be validated against schema
2. **Payload Size Limits**: Enforce maximum message size (prevent memory exhaustion)
3. **Type Whitelist**: Only allow serialization of known safe types
4. **Circular Reference Detection**: Prevent infinite loops during serialization
5. **Eval Prevention**: Never use eval on message data

---

## Conclusion

This specification defines a robust, version-aware message protocol for worker communication. It provides:

- **Type Safety**: Metadata preserves type information across thread boundary
- **Error Clarity**: Structured errors with context for debugging
- **Performance**: Transfer list optimization for large data
- **Extensibility**: Versioning allows safe protocol evolution
- **Safety**: Validation and serialization constraints prevent abuse

Implementation details are deferred to Phase 4.3 (Structured Cloning).
