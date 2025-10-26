import { Actor, ActorSystem, ActorMessage } from '../core/actorSystem.js';
import { EventBus } from '../core/eventBus.js';
import { Logger } from '../core/logger.js';

interface PingEvent {
  sender: string;
  message: string;
}

export class PongNeuron extends Actor {
  private pongReceived: boolean = false;
  private logger: Logger;

  constructor(id: string, system: ActorSystem, private eventBus: EventBus) {
    super(id, system);
    this.logger = Logger.getInstance();
    this.eventBus.subscribe<PingEvent>('ping', this.handlePing.bind(this));
  }

  handlePing(payload: PingEvent): void {
    if (payload.message === 'Ping!') {
      this.logger.info(`${this.id} received ping from ${payload.sender}.`);
      this.pongReceived = true;
    }
  }

  async receive(_message: ActorMessage): Promise<void> {
    // PongNeuron primarily reacts to EventBus messages, not direct actor messages
  }

  public hasPongBeenReceived(): boolean {
    return this.pongReceived;
  }
}
