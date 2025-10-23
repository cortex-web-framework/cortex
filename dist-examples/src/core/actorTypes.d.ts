/**
 * Type-Safe Actor System with Discriminated Unions
 *
 * Provides generic, type-safe messaging for actors using discriminated unions.
 * This enables compile-time checking of actor messages and prevents runtime errors.
 *
 * @example
 * ```typescript
 * // Define messages as a discriminated union
 * type CounterMessage =
 *   | { type: 'increment'; amount: number }
 *   | { type: 'decrement'; amount: number }
 *   | { type: 'reset' };
 *
 * // Create a type-safe actor
 * class Counter extends TypeSafeActor<number, CounterMessage> {
 *   protected receive(message: CounterMessage): void {
 *     switch (message.type) {
 *       case 'increment':
 *         this.state += message.amount;
 *         break;
 *       case 'decrement':
 *         this.state -= message.amount;
 *         break;
 *       case 'reset':
 *         this.state = 0;
 *         break;
 *     }
 *   }
 * }
 * ```
 */
/**
 * Base message type with discriminating 'type' field
 * All actor messages must extend this
 */
export interface BaseMessage {
    type: string;
}
/**
 * ActorRef provides a type-safe reference to an actor
 * Only allows sending messages of the correct type
 */
export interface ActorRef<TMessage extends BaseMessage> {
    readonly id: string;
    send(message: TMessage): void;
    tell(message: TMessage): void;
}
/**
 * Behavior defines how an actor responds to messages
 * It's a function that takes current state and a message,
 * and returns the new state
 */
export type Behavior<TState, TMessage extends BaseMessage> = (state: TState, message: TMessage) => TState;
/**
 * Handler function for specific message types
 * Used in stateful actors to handle individual message variants
 */
export type MessageHandler<TState, TMessage extends BaseMessage> = (state: TState, message: TMessage) => TState | void;
/**
 * Configuration for creating a type-safe actor
 */
export interface ActorConfig<TState> {
    id: string;
    initialState: TState;
}
/**
 * Type-safe actor context passed to behavior functions
 * Provides access to actor utilities and capabilities
 */
export interface ActorContext<TMessage extends BaseMessage> {
    readonly self: ActorRef<TMessage>;
    readonly system: unknown;
}
/**
 * Message envelope for internal message passing
 * Wraps user messages with metadata
 */
export interface MessageEnvelope<TMessage extends BaseMessage> {
    readonly message: TMessage;
    readonly timestamp: number;
    readonly sender?: ActorRef<any>;
}
/**
 * Result type for ask pattern (request-response)
 * Can be resolved with a response or rejected with an error
 */
export interface AskResult<TResponse> {
    readonly promise: Promise<TResponse>;
    readonly cancel: () => void;
}
/**
 * Type guard to check if an object is a BaseMessage
 */
export declare function isBaseMessage(obj: unknown): obj is BaseMessage;
/**
 * Helper type to extract message type field from a discriminated union
 * @example
 * type CounterMessages = ... // discriminated union
 * type MessageType = MessageType<CounterMessages> // 'increment' | 'decrement' | 'reset'
 */
export type MessageType<T extends BaseMessage> = T['type'];
/**
 * Helper type to extract a specific message variant from a discriminated union
 * @example
 * type CounterMessages = ... // discriminated union
 * type IncrementMsg = MessageVariant<CounterMessages, 'increment'>
 */
export type MessageVariant<TMessage extends BaseMessage, TType extends TMessage['type']> = Extract<TMessage, {
    type: TType;
}>;
/**
 * Helper type for creating message handlers with proper typing
 * Maps message types to their handlers
 */
export type MessageHandlers<TState, TMessage extends BaseMessage> = {
    [K in MessageType<TMessage>]?: (state: TState, message: Extract<TMessage, {
        type: K;
    }>) => TState;
};
/**
 * Supervisor strategy for handling actor failures
 * Determines what to do when an actor throws an error
 */
export type SupervisorStrategy = {
    type: 'stop';
} | {
    type: 'restart';
    maxRestarts?: number;
} | {
    type: 'resume';
} | {
    type: 'escalate';
};
/**
 * Actor lifecycle hooks for initialization and cleanup
 */
export interface ActorLifecycle {
    preStart?(): void | Promise<void>;
    postStop?(): void | Promise<void>;
    preRestart?(reason: Error): void | Promise<void>;
    postRestart?(reason: Error): void | Promise<void>;
}
/**
 * Generic actor state for tracking actor information
 */
export interface ActorState<TState> {
    readonly id: string;
    readonly state: TState;
    readonly isAlive: boolean;
    readonly messageCount: number;
    readonly errorCount: number;
}
/**
 * Builder pattern for creating message handlers with fluent API
 */
export declare class MessageHandlerBuilder<TState, TMessage extends BaseMessage> {
    private handlers;
    /**
     * Add a handler for a specific message type
     */
    on<K extends MessageType<TMessage>>(type: K, handler: (state: TState, message: MessageVariant<TMessage, K>) => TState): this;
    /**
     * Add a default handler for unhandled messages
     */
    default(handler: (state: TState, message: TMessage) => TState): this;
    /**
     * Build the message handler function
     */
    build(): (state: TState, message: TMessage) => TState;
}
/**
 * Create a message handler builder for fluent API
 */
export declare function createHandlerBuilder<TState, TMessage extends BaseMessage>(): MessageHandlerBuilder<TState, TMessage>;
/**
 * Type predicate for checking message type
 * @example
 * if (isMessageType(message, 'increment')) {
 *   // message is now typed as Extract<TMessage, { type: 'increment' }>
 * }
 */
export declare function isMessageType<TMessage extends BaseMessage, K extends MessageType<TMessage>>(message: TMessage, type: K): message is Extract<TMessage, {
    type: K;
}>;
