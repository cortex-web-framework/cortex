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
