import { test } from 'node:test';
import assert from 'node:assert';

// Import the EventBus class
const { EventBus } = require('../../src/core/eventBus');

// Test for Singleton Pattern
test('EventBus should be a singleton', () => {
  const instance1 = EventBus.getInstance();
  const instance2 = EventBus.getInstance();
  assert.strictEqual(instance1, instance2, 'Instances should be strictly equal');
});

// Test for Subscribe method (refactored to test behavior)
test('EventBus should allow subscribing to a topic and receive messages', () => {
  const eventBus = EventBus.getInstance();
  let receivedMessage: any = null;
  const testTopic = 'testTopicForSubscribe';
  const expectedMessage = 'Hello from Subscribe Test!';

  eventBus.subscribe(testTopic, (message: any) => {
    receivedMessage = message;
  });

  eventBus.publish(testTopic, expectedMessage);

  assert.strictEqual(receivedMessage, expectedMessage, 'Subscriber should receive the published message');
});

// Test for Publish method (single subscriber)
test('EventBus should publish a message to a single subscriber', () => {
  const eventBus = EventBus.getInstance();
  let receivedMessage = null;
  eventBus.subscribe('singleTopic', (message: any) => { receivedMessage = message; });
  eventBus.publish('singleTopic', 'Hello Single!');
  assert.strictEqual(receivedMessage, 'Hello Single!', 'Message should be received by single subscriber');
});

// Test for Publish method (multiple subscribers)
test('EventBus should publish a message to multiple subscribers', () => {
  const eventBus = EventBus.getInstance();
  let receivedMessage1 = null;
  let receivedMessage2 = null;
  eventBus.subscribe('multiTopic', (message: any) => { receivedMessage1 = message; });
  eventBus.subscribe('multiTopic', (message: any) => { receivedMessage2 = message; });
  eventBus.publish('multiTopic', 'Hello Multi!');
  assert.strictEqual(receivedMessage1, 'Hello Multi!', 'Message should be received by first subscriber');
  assert.strictEqual(receivedMessage2, 'Hello Multi!', 'Message should be received by second subscriber');
});

// Test for publishing to a topic with no subscribers
test('EventBus should not fail when publishing to a topic with no subscribers', () => {
  const eventBus = EventBus.getInstance();
  assert.doesNotThrow(() => {
    eventBus.publish('nonExistentTopic', 'No one listening');
  }, 'Should not throw an error');
});
