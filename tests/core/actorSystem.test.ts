import { test } from 'node:test';
import assert from 'node:assert';

import { ActorSystem, Actor } from '../../src/core/actorSystem.js';
import { EventBus } from '../../src/core/eventBus.js';

// Define a simple test actor for use in tests
class TestActor extends Actor {
  receivedMessages: any[] = [];

  constructor(id: string, system: ActorSystem) {
    super(id, system);
  }

  receive(message: any): void {
    this.receivedMessages.push(message);
  }
}

// Test for creating and registering an actor
test('ActorSystem should create and register an actor', () => {
  const eventBus = EventBus.getInstance(); // ActorSystem needs an EventBus
  const system = new ActorSystem(eventBus);
  const actor = system.createActor(TestActor, 'testActor1');
  assert.ok(actor, 'Actor should be created');
  assert.strictEqual(system.getActor('testActor1'), actor, 'Actor should be registered');
});

// Test for dispatching a message to an actor's mailbox (refactored to test behavior)
test(`ActorSystem should dispatch a message to an actor's mailbox and it should be processed`, async () => {
  const eventBus = EventBus.getInstance();
  const system = new ActorSystem(eventBus);
  const actor = system.createActor(TestActor, 'testActor2'); // Re-added this line
  system.dispatch('testActor2', { type: 'message', data: 'Hello Mailbox!' });

  await new Promise(resolve => setTimeout(resolve, 100)); // Allow time for async processing

  assert.strictEqual(actor.receivedMessages.length, 1, 'Actor should have processed one message');
  assert.strictEqual(actor.receivedMessages[0].data, 'Hello Mailbox!', 'Actor should have received the correct message');
});

// Test for asynchronous message processing by an actor
test(`Actor should process messages from its mailbox asynchronously`, async () => {
  const eventBus = EventBus.getInstance();
  const system = new ActorSystem(eventBus);
  const actor = system.createActor(TestActor, 'testActor3');
  system.dispatch('testActor3', { type: 'message', data: 'Async Message 1' });
  system.dispatch('testActor3', { type: 'message', data: 'Async Message 2' });

  await new Promise(resolve => setTimeout(resolve, 100)); // Allow time for async processing

  assert.strictEqual(actor.receivedMessages.length, 2, 'Actor should have processed two messages');
  assert.strictEqual(actor.receivedMessages[0].data, 'Async Message 1', 'Actor should have received first message');
  assert.strictEqual(actor.receivedMessages[1].data, 'Async Message 2', 'Actor should have received second message');
});
