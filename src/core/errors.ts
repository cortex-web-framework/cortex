export class ActorNotFound extends Error {
  constructor(actorId: string) {
    super(`Actor with ID '${actorId}' not found.`);
    this.name = 'ActorNotFound';
  }
}

export class RouteNotFound extends Error {
  constructor(method: string, path: string) {
    super(`Route '${method} ${path}' not found.`);
    this.name = 'RouteNotFound';
  }
}

export class EventBusError extends Error {
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'EventBusError';
    if (originalError && originalError.stack) {
      this.stack = originalError.stack; // Preserve original stack trace
    }
  }
}

/**
 * Timeout-related errors
 */
export class TimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Validation-related errors
 */
export class ValidationError extends Error {
  readonly field?: string;
  readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends Error {
  readonly configKey?: string;

  constructor(message: string, configKey?: string) {
    super(message);
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * Memory-related errors (especially for WASM)
 */
export class MemoryError extends Error {
  readonly requiredBytes?: number;
  readonly availableBytes?: number;

  constructor(message: string, requiredBytes?: number, availableBytes?: number) {
    super(message);
    this.name = 'MemoryError';
    this.requiredBytes = requiredBytes;
    this.availableBytes = availableBytes;
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends Error {
  readonly statusCode?: number;
  readonly originalError?: Error;

  constructor(message: string, statusCode?: number, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Type guard: Check if value is an ActorNotFound error
 */
export function isActorNotFound(value: unknown): value is ActorNotFound {
  return value instanceof ActorNotFound;
}

/**
 * Type guard: Check if value is a RouteNotFound error
 */
export function isRouteNotFound(value: unknown): value is RouteNotFound {
  return value instanceof RouteNotFound;
}

/**
 * Type guard: Check if value is an EventBusError
 */
export function isEventBusError(value: unknown): value is EventBusError {
  return value instanceof EventBusError;
}

/**
 * Type guard: Check if value is a TimeoutError
 */
export function isTimeoutError(value: unknown): value is TimeoutError {
  return value instanceof TimeoutError;
}

/**
 * Type guard: Check if value is a ValidationError
 */
export function isValidationError(value: unknown): value is ValidationError {
  return value instanceof ValidationError;
}

/**
 * Type guard: Check if value is a ConfigurationError
 */
export function isConfigurationError(value: unknown): value is ConfigurationError {
  return value instanceof ConfigurationError;
}

/**
 * Type guard: Check if value is a MemoryError
 */
export function isMemoryError(value: unknown): value is MemoryError {
  return value instanceof MemoryError;
}

/**
 * Type guard: Check if value is a NetworkError
 */
export function isNetworkError(value: unknown): value is NetworkError {
  return value instanceof NetworkError;
}

/**
 * Type guard: Check if value is any kind of Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Convert any error-like value to an Error instance
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === 'string') {
    return new Error(value);
  }

  if (typeof value === 'object' && value !== null && 'message' in value) {
    const obj = value as Record<string, unknown>;
    return new Error(String(obj.message));
  }

  return new Error(String(value));
}

/**
 * Extract error message from any value
 */
export function getErrorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'message' in value) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
  }

  return String(value);
}
