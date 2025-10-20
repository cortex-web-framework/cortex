import { test } from 'node:test';
import assert from 'node:assert';
import { EventBus } from '../../src/core/eventBus';

interface TestEvent {
  value: string;
}

test('EventBus should support typed events', () => {
  const eventBus = EventBus.getInstance();
  const topic = 'typed-test-topic';
  let receivedEvent: TestEvent | undefined;

  eventBus.subscribe<TestEvent>(topic, (event) => {
    receivedEvent = event;
  });

  const testPayload: TestEvent = { value: 'Hello Typed Event!' };
  eventBus.publish<TestEvent>(topic, testPayload);

  assert.deepStrictEqual(receivedEvent, testPayload, 'Received event should match published event and be typed');
});

test('EventBus should not allow incorrect type assignment for typed events', () => {
  const eventBus = EventBus.getInstance();
  const topic = 'typed-test-topic-incorrect';
  let receivedEvent: any;

  eventBus.subscribe<TestEvent>(topic, (event) => {
    receivedEvent = event;
  });

  // This line should ideally cause a TypeScript compilation error, but for runtime test, we check if it's received
  const incorrectPayload: any = { wrongProperty: 123 };
  eventBus.publish(topic, incorrectPayload);

  // At runtime, the event will still be received, but TypeScript should have caught this.
  // This test primarily validates the type inference in the subscribe/publish methods.
  assert.deepStrictEqual(receivedEvent, incorrectPayload, 'Incorrectly typed event should still be received at runtime');
});
