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
export class TypedActorRef<TMessage extends BaseMessage> implements ActorRef<TMessage> {
  constructor(
    readonly id: string,
    private sendFn: (message: TMessage) => void
  ) {}

  public tell(message: TMessage): void {
    this.sendFn(message);
  }

  public send(message: TMessage): void {
    this.sendFn(message);
  }
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
export abstract class TypeSafeActor<TState, TMessage extends BaseMessage>
  implements TypeSafeActorLifecycle {
  protected state: TState;
  protected readonly id: string;
  protected readonly system: TypeSafeActorSystem;
  protected readonly mailbox: TMessage[] = [];
  protected isProcessing = false;
  protected restartCount = 0;

  constructor(
    id: string,
    initialState: TState,
    system: TypeSafeActorSystem
  ) {
    this.id = id;
    this.state = initialState;
    this.system = system;
  }

  /**
   * Handle an incoming message
   * Must be implemented by subclasses to define behavior
   */
  protected abstract receive(message: TMessage): void;

  /**
   * Get current actor state
   */
  public getState(): TState {
    return this.state;
  }

  /**
   * Get actor ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Post a message to this actor
   * Messages are queued and processed sequentially
   */
  public postMessage(message: TMessage): void {
    this.mailbox.push(message);
    this.processMailbox();
  }

  /**
   * Process all pending messages in the mailbox
   */
  private processMailbox(): void {
    if (!this.isProcessing) {
      this.isProcessing = true;
      process.nextTick(() => {
        while (this.mailbox.length > 0) {
          const message = this.mailbox.shift();
          if (message) {
            try {
              this.receive(message);
            } catch (error: any) {
              this.system.handleActorFailure(this, error);
            }
          }
        }
        this.isProcessing = false;
      });
    }
  }

  /**
   * Lifecycle hook: called before actor starts
   */
  public preStart(): void | Promise<void> {}

  /**
   * Lifecycle hook: called after actor stops
   */
  public postStop(): void | Promise<void> {}

  /**
   * Lifecycle hook: called before actor restarts
   */
  public preRestart(_reason: Error): void | Promise<void> {}

  /**
   * Lifecycle hook: called after actor restarts
   */
  public postRestart(_reason: Error): void | Promise<void> {}
}

/**
 * Type-safe actor system
 * Manages actor creation, message dispatch, and lifecycle
 */
export class TypeSafeActorSystem {
  private actors: Map<string, TypeSafeActor<any, any>> = new Map();
  private static readonly MAX_RESTARTS = 3;

  constructor(_eventBus?: EventBus) {
    // EventBus reserved for future integration
  }

  /**
   * Create a new type-safe actor
   */
  public createActor<TState, TMessage extends BaseMessage>(
    ActorClass: new (
      id: string,
      initialState: TState,
      system: TypeSafeActorSystem
    ) => TypeSafeActor<TState, TMessage>,
    id: string,
    initialState: TState
  ): TypedActorRef<TMessage> {
    if (this.actors.has(id)) {
      throw new Error(`Actor with id ${id} already exists`);
    }

    const actor = new ActorClass(id, initialState, this);
    this.actors.set(id, actor);

    // Store metadata for restart
    (actor as any)._ActorClass = ActorClass;
    (actor as any)._InitialState = initialState;
    (actor as any).restartCount = 0;

    actor.preStart();

    return new TypedActorRef<TMessage>(id, (message: TMessage) => {
      actor.postMessage(message);
    });
  }

  /**
   * Get an actor by ID (returns untyped reference)
   */
  public getActor(id: string): TypeSafeActor<any, any> | undefined {
    return this.actors.get(id);
  }

  /**
   * Stop an actor
   */
  public stopActor(id: string): void {
    const actor = this.actors.get(id);
    if (actor) {
      actor.postStop();
      this.actors.delete(id);
      console.log(`Actor '${id}' stopped`);
    } else {
      console.warn(`Attempted to stop non-existent actor '${id}'`);
    }
  }

  /**
   * Handle actor failure with supervision strategy
   */
  public handleActorFailure(actor: TypeSafeActor<any, any>, error: any): void {
    console.error(`Actor '${actor.getId()}' failed:`, error);
    (actor as any).restartCount++;

    if ((actor as any).restartCount > TypeSafeActorSystem.MAX_RESTARTS) {
      console.error(
        `Actor '${actor.getId()}' exceeded max restarts. Stopping actor.`
      );
      this.stopActor(actor.getId());
    } else {
      console.warn(
        `Restarting actor '${actor.getId()}' (restart count: ${
          (actor as any).restartCount
        })`
      );
      actor.preRestart(error);

      const ActorClass = (actor as any)._ActorClass;
      const initialState = (actor as any)._InitialState;
      const actorId = actor.getId();

      this.stopActor(actorId);

      const newActor = new ActorClass(actorId, initialState, this);
      this.actors.set(actorId, newActor);
      (newActor as any)._ActorClass = ActorClass;
      (newActor as any)._InitialState = initialState;
      (newActor as any).restartCount = (actor as any).restartCount;

      newActor.postRestart(error);
    }
  }

  /**
   * Get all actors in the system
   */
  public getAllActors(): TypeSafeActor<any, any>[] {
    return Array.from(this.actors.values());
  }

  /**
   * Get actor count
   */
  public getActorCount(): number {
    return this.actors.size;
  }

  /**
   * Shut down the entire actor system
   */
  public shutdown(): void {
    const actors = Array.from(this.actors.values());
    for (const actor of actors) {
      this.stopActor(actor.getId());
    }
    console.log('Actor system shut down');
  }
}

/**
 * Helper function to create a typed actor system
 */
export function createTypeSafeActorSystem(): TypeSafeActorSystem {
  return new TypeSafeActorSystem();
}
