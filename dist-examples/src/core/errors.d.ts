export declare class ActorNotFound extends Error {
    constructor(actorId: string);
}
export declare class RouteNotFound extends Error {
    constructor(method: string, path: string);
}
export declare class EventBusError extends Error {
    constructor(message: string, originalError?: Error);
}
