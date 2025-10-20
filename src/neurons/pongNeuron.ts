import { Actor, ActorSystem } from '../core/actorSystem';
import { EventBus } from '../core/eventBus';

export class PongNeuron extends Actor {
  private pongReceived: boolean = false;

  constructor(id: string, system: ActorSystem, private eventBus: EventBus) {
    super(id, system);
    this.eventBus.subscribe('ping', this.handlePing.bind(this));
  }

  handlePing(payload: any) {
    if (payload.message === 'Ping!') {
      console.log(`${this.id} received ping from ${payload.sender}.`);
      this.pongReceived = true;
    }
  }

  async receive(message: any): Promise<void> {
    // PongNeuron primarily reacts to EventBus messages, not direct actor messages
  }

  public hasPongBeenReceived(): boolean {
    return this.pongReceived;
  }
}
