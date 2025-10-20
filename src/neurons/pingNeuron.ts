import { Actor, ActorSystem } from '../core/actorSystem';
import { EventBus } from '../core/eventBus';

export class PingNeuron extends Actor {
  constructor(id: string, system: ActorSystem, private eventBus: EventBus) {
    super(id, system);
  }

  async receive(message: any): Promise<void> {
    if (message.type === 'start') {
      console.log(`${this.id} received start message, publishing ping.`);
      this.eventBus.publish('ping', { sender: this.id, message: 'Ping!' });
    }
  }
}
