import { EventBus } from './eventBus.js';
import { ActorNotFound, isError, getErrorMessage } from './errors.js';
import { Logger } from './logger.js';

/**
 * Base message type for Actor communication
 */
export interface ActorMessage {
  readonly type: string;
  readonly [key: string]: unknown;
}

/**
 * Metadata store for Actor instances using WeakMap for memory safety
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ActorMetadata {
  _ActorClass: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _ActorArgs: any[];
  restartCount: number;
}

const actorMetadata = new WeakMap<Actor, ActorMetadata>();

export abstract class Actor {
  public readonly id: string;
  protected system: ActorSystem;
  private mailbox: ActorMessage[] = [];
  private processingMailbox: boolean = false;

  constructor(id: string, system: ActorSystem) {
    this.id = id;
    this.system = system;
    // Initialize metadata for this actor
    actorMetadata.set(this, {
      _ActorClass: undefined,
      _ActorArgs: [],
      restartCount: 0,
    });
  }

  public abstract receive(message: ActorMessage): void;

  // Lifecycle hooks
  public preStart(): void {}
  public postStop(): void {}
  public preRestart(_reason: Error): void {} // Prefix with _ to mark as intentionally unused
  public postRestart(_reason: Error): void {} // Prefix with _ to mark as intentionally unused

  public postMessage(message: ActorMessage): void {
    this.mailbox.push(message);
    this.processMailbox();
  }

  private processMailbox(): void {
    if (!this.processingMailbox) {
      this.processingMailbox = true;
      process.nextTick(() => {
        while (this.mailbox.length > 0) {
          const message = this.mailbox.shift();
          if (message) {
            try {
              this.receive(message);
            } catch (error: unknown) {
              this.system.handleFailure(this, error);
            }
          }
        }
        this.processingMailbox = false;
      });
    }
  }
}

export class ActorSystem {
  private actors: Map<string, Actor> = new Map();
  private static readonly MAX_RESTARTS = 3;
  private logger: Logger;

  constructor(_eventBus: EventBus) {
    // EventBus is passed for future extensibility
    this.logger = Logger.getInstance();
  }

  public createActor<T extends Actor>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ActorClass: new (id: string, system: ActorSystem, ...args: any[]) => T,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): T {
    if (this.actors.has(id)) {
      throw new Error(`Actor with id ${id} already exists.`);
    }

    const actor = new ActorClass(id, this, ...args);
    this.actors.set(id, actor);

    // Store metadata for potential restarts
    const metadata = actorMetadata.get(actor);
    if (metadata) {
      metadata._ActorClass = ActorClass;
      metadata._ActorArgs = args;
    }

    actor.preStart();
    return actor;
  }

  public getActor(id: string): Actor | undefined {
    return this.actors.get(id);
  }

  public dispatch(actorId: string, message: ActorMessage): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.postMessage(message);
    } else {
      throw new ActorNotFound(actorId);
    }
  }

  public handleFailure(actor: Actor, error: unknown): void {
    const errorMessage = isError(error) ? error.message : getErrorMessage(error);
    this.logger.error(`Actor '${actor.id}' failed: ${errorMessage}`, isError(error) ? error : new Error(String(error)));

    const metadata = actorMetadata.get(actor);
    if (!metadata) {
      this.logger.error(`Actor '${actor.id}' has no metadata. Cannot restart.`);
      this.stopActor(actor.id);
      return;
    }

    metadata.restartCount++;

    if (metadata.restartCount > ActorSystem.MAX_RESTARTS) {
      this.logger.error(`Actor '${actor.id}' exceeded max restarts. Stopping actor.`);
      this.stopActor(actor.id);
    } else {
      this.logger.warn(
        `Restarting actor '${actor.id}' (restart count: ${metadata.restartCount}).`
      );

      const errorObj = isError(error) ? error : new Error(String(error));
      actor.preRestart(errorObj);

      // Retrieve stored actor class and arguments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ActorClass: any = metadata._ActorClass;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ActorArgs: any[] = metadata._ActorArgs;

      if (typeof ActorClass !== 'function') {
        this.logger.error(`Cannot restart actor '${actor.id}': ActorClass not found.`);
        this.stopActor(actor.id);
        return;
      }

      this.stopActor(actor.id);

      // Reconstruct the actor using the constructor we stored
      const newActor = this.createActor(ActorClass, actor.id, ...ActorArgs);
      newActor.postRestart(errorObj);
    }
  }

  public stopActor(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.postStop();
      this.actors.delete(actorId);
      this.logger.info(`Actor '${actorId}' stopped.`);
    } else {
      this.logger.warn(`Attempted to stop non-existent actor '${actorId}'.`);
    }
  }
}
