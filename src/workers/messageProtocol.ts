/**
 * Worker Message Protocol Implementation
 * Defines all message types, enumerations, and interfaces
 */

/**
 * Protocol version
 */
export const PROTOCOL_VERSION = "1.0.0";

/**
 * Message type discriminators
 */
export enum MessageType {
  // Task execution
  TaskSubmit = "task.submit",
  TaskResult = "task.result",
  TaskError = "task.error",

  // Actor communication
  ActorInit = "actor.init",
  ActorMessage = "actor.message",
  ActorResult = "actor.result",
  ActorError = "actor.error",

  // Worker lifecycle
  WorkerReady = "worker.ready",
  WorkerHealth = "worker.health",
  WorkerError = "worker.error"
}

/**
 * Data type hints for serialization strategy
 */
export enum DataTypeHint {
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

/**
 * Error codes for structured error handling
 */
export enum ErrorCode {
  SerializationError = "SERIALIZATION_ERROR",
  DeserializationError = "DESERIALIZATION_ERROR",
  TaskExecutionError = "TASK_EXECUTION_ERROR",
  TimeoutError = "TIMEOUT_ERROR",
  ValidationError = "VALIDATION_ERROR",
  WorkerError = "WORKER_ERROR",
  UnknownError = "UNKNOWN_ERROR"
}

/**
 * Message priority levels
 */
export type MessagePriority = "low" | "normal" | "high";

/**
 * Message source
 */
export type MessageSource = "main" | "worker";

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  requestId?: string;
  priority: MessagePriority;
  timeout?: number;
  retry?: RetryPolicy;
  context?: Record<string, unknown>;
  source: MessageSource;
  target?: string;
}

/**
 * Serialization configuration
 */
export interface SerializationConfig {
  preserveTypes: boolean;
  includeTypeInfo: boolean;
  useTransfers: boolean;
  customTypes?: string[];
}

/**
 * Type information for reconstruction
 */
export interface TypeInformation {
  constructorName: string;
  typePath?: string;
  version: number;
  schema?: Record<string, unknown>;
  properties?: Record<string, TypeInformation>;
}

/**
 * Message envelope - base structure for all messages
 */
export interface MessageEnvelope<T = any> {
  version: string;
  messageId: string;
  type: MessageType;
  timestamp: number;
  payload: T;
  metadata: MessageMetadata;
  serialization: SerializationConfig;
  transfers?: Transferable[];
}

/**
 * Task submission payload
 */
export interface TaskSubmitPayload {
  data: unknown;
  dataType: DataTypeHint;
  resultType: DataTypeHint;
  operation?: string;
  preserveTypes: boolean;
}

/**
 * Task result payload
 */
export interface TaskResultPayload {
  result: unknown;
  resultType: DataTypeHint;
  duration: number;
  workerId: string;
  typeInfo?: TypeInformation;
}

/**
 * Serializable error structure
 */
export interface SerializableError {
  message: string;
  code: ErrorCode;
  errorType: string;
  stack?: string;
  context?: {
    taskData?: unknown;
    operation?: string;
    additionalInfo?: Record<string, unknown>;
  };
  cause?: SerializableError;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Task error payload
 */
export interface TaskErrorPayload {
  message: string;
  code: ErrorCode;
  errorType: string;
  stack?: string;
  context?: {
    taskData?: unknown;
    operation?: string;
    additionalInfo?: Record<string, unknown>;
  };
  cause?: TaskErrorPayload;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Actor initialization payload
 */
export interface ActorInitPayload {
  actorId: string;
  config?: Record<string, unknown>;
  wasmModule?: {
    type: "url" | "data";
    value: string;
  };
  resultCallbacks: boolean;
}

/**
 * Actor message payload
 */
export interface ActorMessagePayload {
  message: unknown;
  messageType: DataTypeHint;
  responseCallbackId?: string;
  typeInfo?: TypeInformation;
}

/**
 * Actor result payload
 */
export interface ActorResultPayload {
  result: unknown;
  resultType: DataTypeHint;
  callbackId: string;
  typeInfo?: TypeInformation;
}

/**
 * Worker ready payload
 */
export interface WorkerReadyPayload {
  workerId: string;
  features: string[];
  supportedTypes: DataTypeHint[];
}

/**
 * Worker health payload
 */
export interface WorkerHealthPayload {
  workerId: string;
  status: "healthy" | "degraded" | "failing";
  tasksProcessed: number;
  currentTask?: string;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

/**
 * Validation schema for message payload
 */
export interface ValidationSchema {
  payloadSchema: Record<string, unknown>;
  required: string[];
  constraints?: Record<string, Constraint>;
  validators?: ((payload: unknown) => boolean)[];
}

/**
 * Field constraint definition
 */
export interface Constraint {
  type: string;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
}

/**
 * Message type factory
 */
export function createMessageEnvelope<T>(
  type: MessageType,
  payload: T,
  metadata: MessageMetadata,
  serialization: SerializationConfig,
  transfers?: Transferable[]
): MessageEnvelope<T> {
  return {
    version: PROTOCOL_VERSION,
    messageId: generateMessageId(),
    type,
    timestamp: Date.now(),
    payload,
    metadata,
    serialization,
    transfers
  };
}

/**
 * Generate unique message ID
 */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine data type hint from value
 */
export function detectDataType(value: unknown): DataTypeHint {
  if (value === null || value === undefined) {
    return DataTypeHint.Primitive;
  }

  if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return DataTypeHint.Primitive;
  }

  if (value instanceof Date) {
    return DataTypeHint.Date;
  }

  if (value instanceof RegExp) {
    return DataTypeHint.Regex;
  }

  if (value instanceof Map) {
    return DataTypeHint.Map;
  }

  if (value instanceof Set) {
    return DataTypeHint.Set;
  }

  if (value instanceof ArrayBuffer) {
    return DataTypeHint.ArrayBuffer;
  }

  if (ArrayBuffer.isView(value)) {
    return DataTypeHint.TypedArray;
  }

  if (Array.isArray(value)) {
    return DataTypeHint.Array;
  }

  if (typeof value === "object") {
    return DataTypeHint.PlainObject;
  }

  return DataTypeHint.Unknown;
}

/**
 * Check if a value is serializable (can be structured cloned)
 */
export function isSerializable(value: unknown, visited: WeakSet<any> = new WeakSet()): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  const type = typeof value;

  // Primitives are serializable
  if (type === "boolean" || type === "number" || type === "string") {
    return true;
  }

  // Functions and symbols are not serializable
  if (type === "function" || type === "symbol") {
    return false;
  }

  // Check for circular reference
  if (typeof value === "object") {
    if (visited.has(value)) {
      return false; // Circular reference detected
    }

    // Serializable built-in types
    if (value instanceof Date || value instanceof RegExp) {
      return true;
    }

    if (value instanceof ArrayBuffer) {
      return true;
    }

    if (ArrayBuffer.isView(value)) {
      return true;
    }

    // Collections
    if (value instanceof Map || value instanceof Set) {
      visited.add(value);
      const checkResult = checkCollectionSerializable(value, visited);
      return checkResult;
    }

    // Arrays and objects
    if (Array.isArray(value)) {
      visited.add(value);
      for (const item of value) {
        if (!isSerializable(item, visited)) {
          return false;
        }
      }
      return true;
    }

    // Plain objects
    visited.add(value);
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (!isSerializable((value as any)[key], visited)) {
          return false;
        }
      }
    }
    return true;
  }

  return false;
}

/**
 * Check if Map or Set contents are serializable
 */
function checkCollectionSerializable(collection: Map<any, any> | Set<any>, visited: WeakSet<any>): boolean {
  if (collection instanceof Map) {
    for (const [key, val] of collection) {
      if (!isSerializable(key, visited) || !isSerializable(val, visited)) {
        return false;
      }
    }
    return true;
  }

  if (collection instanceof Set) {
    for (const val of collection) {
      if (!isSerializable(val, visited)) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Validation schema registry
 */
export const MESSAGE_SCHEMAS: Record<MessageType, ValidationSchema> = {
  [MessageType.TaskSubmit]: {
    payloadSchema: {
      type: "object",
      properties: {
        data: { type: "any" },
        dataType: { enum: Object.values(DataTypeHint) },
        resultType: { enum: Object.values(DataTypeHint) },
        preserveTypes: { type: "boolean" }
      }
    },
    required: ["data", "dataType", "resultType", "preserveTypes"]
  },

  [MessageType.TaskResult]: {
    payloadSchema: {
      type: "object",
      properties: {
        result: { type: "any" },
        resultType: { enum: Object.values(DataTypeHint) },
        duration: { type: "number", min: 0 },
        workerId: { type: "string" },
        typeInfo: { type: "object" }
      }
    },
    required: ["result", "resultType", "duration", "workerId"]
  },

  [MessageType.TaskError]: {
    payloadSchema: {
      type: "object",
      properties: {
        message: { type: "string" },
        code: { enum: Object.values(ErrorCode) },
        errorType: { type: "string" },
        retryable: { type: "boolean" }
      }
    },
    required: ["message", "code", "errorType", "retryable"]
  },

  [MessageType.ActorInit]: {
    payloadSchema: {
      type: "object",
      properties: {
        actorId: { type: "string" },
        resultCallbacks: { type: "boolean" }
      }
    },
    required: ["actorId", "resultCallbacks"]
  },

  [MessageType.ActorMessage]: {
    payloadSchema: {
      type: "object",
      properties: {
        message: { type: "any" },
        messageType: { enum: Object.values(DataTypeHint) }
      }
    },
    required: ["message", "messageType"]
  },

  [MessageType.ActorResult]: {
    payloadSchema: {
      type: "object",
      properties: {
        result: { type: "any" },
        resultType: { enum: Object.values(DataTypeHint) },
        callbackId: { type: "string" }
      }
    },
    required: ["result", "resultType", "callbackId"]
  },

  [MessageType.ActorError]: {
    payloadSchema: {
      type: "object",
      properties: {
        message: { type: "string" },
        code: { enum: Object.values(ErrorCode) }
      }
    },
    required: ["message", "code"]
  },

  [MessageType.WorkerReady]: {
    payloadSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        features: { type: "array" },
        supportedTypes: { type: "array" }
      }
    },
    required: ["workerId", "features", "supportedTypes"]
  },

  [MessageType.WorkerHealth]: {
    payloadSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        status: { enum: ["healthy", "degraded", "failing"] },
        tasksProcessed: { type: "number" }
      }
    },
    required: ["workerId", "status", "tasksProcessed"]
  },

  [MessageType.WorkerError]: {
    payloadSchema: {
      type: "object",
      properties: {
        message: { type: "string" },
        code: { enum: Object.values(ErrorCode) }
      }
    },
    required: ["message", "code"]
  }
};
