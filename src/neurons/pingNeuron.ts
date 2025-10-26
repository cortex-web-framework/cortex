import { Actor, ActorSystem, ActorMessage } from '../core/actorSystem.js';
import { EventBus } from '../core/eventBus.js';
import { Logger } from '../core/logger.js';

interface PingEvent {
  sender: string;
  message: string;
}

export class PingNeuron extends Actor {
  private logger: Logger;

  constructor(id: string, system: ActorSystem, private eventBus: EventBus) {
    super(id, system);
    this.logger = Logger.getInstance();
  }

  async receive(message: ActorMessage): Promise<void> {
    if (message.type === 'start') {
      this.logger.info(`${this.id} received start message, publishing ping.`);
      this.eventBus.publish<PingEvent>('ping', { sender: this.id, message: 'Ping!' });
    }
  }
}
