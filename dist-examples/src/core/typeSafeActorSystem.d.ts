/**
 * Type-Safe Actor System
 *
 * A complete refactoring of the actor system to support type-safe messaging
 * using discriminated unions and generics. This replaces the loose `any` types
 * with compile-time checked message passing.
 */
import type { BaseMessage, ActorRef } from './actorTypes.js';
import { EventBus } from './eventBus.js';
/**
 * Type-safe actor reference that can only send messages of type TMessage
 */
export declare class TypedActorRef<TMessage extends BaseMessage> implements ActorRef<TMessage> {
    readonly id: string;
    private sendFn;
    constructor(id: string, sendFn: (message: TMessage) => void);
    tell(message: TMessage): void;
    send(message: TMessage): void;
}
/**
 * Lifecycle callbacks for actors
 */
export interface TypeSafeActorLifecycle {
    preStart?(): void | Promise<void>;
    postStop?(): void | Promise<void>;
    preRestart?(reason: Error): void | Promise<void>;
    postRestart?(reason: Error): void | Promise<void>;
}
/**
 * Base class for type-safe actors
 * TState: The state type of the actor
 * TMessage: The discriminated union of messages this actor can handle
 */
export declare abstract class TypeSafeActor<TState, TMessage extends BaseMessage> implements TypeSafeActorLifecycle {
    protected state: TState;
    protected readonly id: string;
    protected readonly system: TypeSafeActorSystem;
    protected readonly mailbox: TMessage[];
    protected isProcessing: boolean;
    protected restartCount: number;
    constructor(id: string, initialState: TState, system: TypeSafeActorSystem);
    /**
     * Handle an incoming message
     * Must be implemented by subclasses to define behavior
     */
    protected abstract receive(message: TMessage): void;
    /**
     * Get current actor state
     */
    getState(): TState;
    /**
     * Get actor ID
     */
    getId(): string;
    /**
     * Post a message to this actor
     * Messages are queued and processed sequentially
     */
    postMessage(message: TMessage): void;
    /**
     * Process all pending messages in the mailbox
     */
    private processMailbox;
    /**
     * Lifecycle hook: called before actor starts
     */
    preStart(): void | Promise<void>;
    /**
     * Lifecycle hook: called after actor stops
     */
    postStop(): void | Promise<void>;
    /**
     * Lifecycle hook: called before actor restarts
     */
    preRestart(_reason: Error): void | Promise<void>;
    /**
     * Lifecycle hook: called after actor restarts
     */
    postRestart(_reason: Error): void | Promise<void>;
}
/**
 * Type-safe actor system
 * Manages actor creation, message dispatch, and lifecycle
 */
export declare class TypeSafeActorSystem {
    private actors;
    private static readonly MAX_RESTARTS;
    constructor(_eventBus?: EventBus);
    /**
     * Create a new type-safe actor
     */
    createActor<TState, TMessage extends BaseMessage>(ActorClass: new (id: string, initialState: TState, system: TypeSafeActorSystem) => TypeSafeActor<TState, TMessage>, id: string, initialState: TState): TypedActorRef<TMessage>;
    /**
     * Get an actor by ID (returns untyped reference)
     */
    getActor(id: string): TypeSafeActor<any, any> | undefined;
    /**
     * Stop an actor
     */
    stopActor(id: string): void;
    /**
     * Handle actor failure with supervision strategy
     */
    handleActorFailure(actor: TypeSafeActor<any, any>, error: any): void;
    /**
     * Get all actors in the system
     */
    getAllActors(): TypeSafeActor<any, any>[];
    /**
     * Get actor count
     */
    getActorCount(): number;
    /**
     * Shut down the entire actor system
     */
    shutdown(): void;
}
/**
 * Helper function to create a typed actor system
 */
export declare function createTypeSafeActorSystem(): TypeSafeActorSystem;
