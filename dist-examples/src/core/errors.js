export class ActorNotFound extends Error {
    constructor(actorId) {
        super(`Actor with ID '${actorId}' not found.`);
        this.name = 'ActorNotFound';
    }
}
export class RouteNotFound extends Error {
    constructor(method, path) {
        super(`Route '${method} ${path}' not found.`);
        this.name = 'RouteNotFound';
    }
}
export class EventBusError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'EventBusError';
        if (originalError && originalError.stack) {
            this.stack = originalError.stack; // Preserve original stack trace
        }
    }
}
