import { EventBus } from './eventBus';

export abstract class Actor {
  public readonly id: string;
  protected system: ActorSystem;
  private mailbox: any[] = [];
  private processingMailbox: boolean = false;

  constructor(id: string, system: ActorSystem) {
    this.id = id;
    this.system = system;
  }

  public abstract receive(message: any): void;

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
          this.receive(message);
        }
        this.processingMailbox = false;
      });
    }
  }
}

export class ActorSystem {
  private actors: Map<string, Actor> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public createActor<T extends Actor>(ActorClass: new (id: string, system: ActorSystem, ...args: any[]) => T, id: string, ...args: any[]): T {
    if (this.actors.has(id)) {
      throw new Error(`Actor with id ${id} already exists.`);
    }
    const actor = new ActorClass(id, this, ...args);
    this.actors.set(id, actor);
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
      console.warn(`Actor with id ${actorId} not found.`);
    }
  }
}
