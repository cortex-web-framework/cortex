import { Actor, ActorSystem, ActorMessage } from '../core/actorSystem.js';
import { EventBus } from '../core/eventBus.js';

interface PingEvent {
  sender: string;
  message: string;
}

export class PingNeuron extends Actor {
  constructor(id: string, system: ActorSystem, private eventBus: EventBus) {
    super(id, system);
  }

  async receive(message: ActorMessage): Promise<void> {
    if (message.type === 'start') {
      console.log(`${this.id} received start message, publishing ping.`);
      this.eventBus.publish<PingEvent>('ping', { sender: this.id, message: 'Ping!' });
    }
  }
}
