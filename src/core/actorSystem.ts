import { EventBus } from './eventBus';
import { ActorNotFound } from './errors';

export abstract class Actor {
  public readonly id: string;
  protected system: ActorSystem;
  private mailbox: any[] = [];
  private processingMailbox: boolean = false;
  // restartCount is managed by ActorSystem, not directly by Actor

  constructor(id: string, system: ActorSystem) {
    this.id = id;
    this.system = system;
  }

  public abstract receive(message: any): void;

  // Lifecycle hooks
  public preStart(): void {}
  public postStop(): void {}
  public preRestart(_reason: Error): void {} // Prefix with _ to mark as intentionally unused
  public postRestart(_reason: Error): void {} // Prefix with _ to mark as intentionally unused

  public postMessage(message: any): void {
    this.mailbox.push(message);
    this.processMailbox();
  }

  private processMailbox(): void {
    if (!this.processingMailbox) {
      this.processingMailbox = true;
      process.nextTick(() => {
        while (this.mailbox.length > 0) {
          const message = this.mailbox.shift();
          try {
            this.receive(message);
          } catch (error: any) {
            this.system.handleFailure(this, error);
          }
        }
        this.processingMailbox = false;
      });
    }
  }
}

export class ActorSystem {
  private actors: Map<string, Actor> = new Map();
  private static readonly MAX_RESTARTS = 3; // Define max restarts

  constructor(_eventBus: EventBus) { // Mark as unused if not stored
    // The eventBus is passed to actors during creation, ActorSystem doesn't need to store it directly
  }

  public createActor<T extends Actor>(ActorClass: new (id: string, system: ActorSystem, ...args: any[]) => T, id: string, ...args: any[]): T {
    if (this.actors.has(id)) {
      throw new Error(`Actor with id ${id} already exists.`);
    }
    const actor = new ActorClass(id, this, ...args);
    this.actors.set(id, actor);
    // Store constructor arguments for potential restarts
    (actor as any)._ActorClass = ActorClass;
    (actor as any)._ActorArgs = args;
    actor.preStart(); // Call preStart hook
    return actor;
  }

  public getActor(id: string): Actor | undefined {
    return this.actors.get(id);
  }

  public dispatch(actorId: string, message: any): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.postMessage(message);
    } else {
      throw new ActorNotFound(actorId);
    }
  }

  public handleFailure(actor: Actor, error: any): void {
    console.error(`Actor '${actor.id}' failed:`, error);
    (actor as any).restartCount++;

    if ((actor as any).restartCount > ActorSystem.MAX_RESTARTS) {
      console.error(`Actor '${actor.id}' exceeded max restarts. Stopping actor.`);
      this.stopActor(actor.id);
    } else {
      console.warn(`Restarting actor '${actor.id}' (restart count: ${(actor as any).restartCount}).`);
      actor.preRestart(error); // Call preRestart hook
      // Re-create actor with original constructor arguments
      const ActorClass = (actor as any)._ActorClass;
      const ActorArgs = (actor as any)._ActorArgs;
      this.stopActor(actor.id); // Remove old instance
      const newActor = this.createActor(ActorClass, actor.id, ...ActorArgs); // Create new instance
      newActor.postRestart(error); // Call postRestart hook
    }
  }

  public stopActor(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.postStop(); // Call postStop hook
      this.actors.delete(actorId);
      console.log(`Actor '${actorId}' stopped.`);
    } else {
      console.warn(`Attempted to stop non-existent actor '${actorId}'.`);
    }
  }
}
