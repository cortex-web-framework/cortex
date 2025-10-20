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
    if (originalError) {
      this.stack = originalError.stack; // Preserve original stack trace
    }
  }
}
