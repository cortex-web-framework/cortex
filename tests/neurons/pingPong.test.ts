import { test } from 'node:test';
import assert from 'node:assert';
import { EventBus } from '../../src/core/eventBus';
import { Actor, ActorSystem } from '../../src/core/actorSystem';
import { PingNeuron } from '../../src/neurons/pingNeuron';
import { PongNeuron } from '../../src/neurons/pongNeuron';

test('PingNeuron and PongNeuron should communicate via EventBus', async () => {
  const eventBus = EventBus.getInstance();
  const actorSystem = new ActorSystem(eventBus);

  const pingNeuron = actorSystem.createActor(PingNeuron, 'pingActor', eventBus);
  const pongNeuron = actorSystem.createActor(PongNeuron, 'pongActor', eventBus);

  // Simulate starting the ping neuron
  await actorSystem.dispatch('pingActor', { type: 'start' });

  // Give some time for asynchronous operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  assert.ok(pongNeuron.hasPongBeenReceived(), 'PongNeuron should have received the ping message');
});
