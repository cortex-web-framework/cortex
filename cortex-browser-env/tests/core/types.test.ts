/**
 * Comprehensive test suite for type utilities and branded types
 * Tests ActorId, EventTopic, EventMessage, ActorMessage, and type guards
 */

import test from 'node:test';
import assert from 'node:assert';

import type {
  ActorId,
  EventTopic,
  EventMessage,
  ActorMessage,
  BaseMessage,
} from '../../src/core/types.js';

import {
  isEventMessage,
  isActorMessage,
  isBaseMessage,
} from '../../src/core/types.js';

// ============================================
// TYPE CREATION TESTS
// ============================================

test('ActorId branded type', async (t) => {
  await t.test('should create ActorId from string', () => {
    const id = 'actor-123' as ActorId;
    assert.strictEqual(typeof id, 'string');
    assert.strictEqual(id, 'actor-123');
  });

  await t.test('should preserve ActorId across function calls', () => {
    const id: ActorId = 'test-actor' as ActorId;
    const id2: ActorId = id;
    assert.strictEqual(id2, 'test-actor');
  });

  await t.test('should handle empty string ActorId (edge case)', () => {
    const id = '' as ActorId;
    assert.strictEqual(id, '');
  });

  await t.test('should handle special characters in ActorId', () => {
    const id = 'actor-@#$%^&*()' as ActorId;
    assert.match(id, /actor-/);
  });

  await t.test('should handle UUID-style ActorId', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000' as ActorId;
    assert.strictEqual(typeof id, 'string');
  });

  await t.test('should handle very long ActorId', () => {
    const longId = 'actor-' + 'x'.repeat(1000) as ActorId;
    assert.ok(longId.length > 1000);
  });
});

test('EventTopic branded type', async (t) => {
  await t.test('should create EventTopic from string', () => {
    const topic = 'user.created' as EventTopic;
    assert.strictEqual(typeof topic, 'string');
    assert.strictEqual(topic, 'user.created');
  });

  await t.test('should preserve EventTopic hierarchy', () => {
    const parentTopic = 'user' as EventTopic;
    const childTopic = 'user.created' as EventTopic;
    assert(childTopic.startsWith(parentTopic));
  });

  await t.test('should handle dot-separated topic paths', () => {
    const topic = 'system.event.critical' as EventTopic;
    assert.match(topic, /system\.event\.critical/);
  });

  await t.test('should handle single-level topics', () => {
    const topic = 'ping' as EventTopic;
    assert.strictEqual(topic, 'ping');
  });

  await t.test('should handle topic with wildcards (edge case)', () => {
    const topic = 'user.*' as EventTopic;
    assert.ok(topic.includes('*'));
  });

  await t.test('should handle empty topic', () => {
    const topic = '' as EventTopic;
    assert.strictEqual(topic, '');
  });
});

// ============================================
// EVENT MESSAGE TESTS
// ============================================

test('EventMessage type and validation', async (t) => {
  await t.test('should create valid EventMessage', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'user.created' as EventTopic,
      data: { userId: '123' },
    };
    assert(isEventMessage(msg));
  });

  await t.test('should reject object without type field', () => {
    const msg = {
      topic: 'user.created',
      data: {},
    };
    assert(!isEventMessage(msg));
  });

  await t.test('should reject object without topic field', () => {
    const msg = {
      type: 'event',
      data: {},
    };
    assert(!isEventMessage(msg));
  });

  await t.test('should reject object without data field', () => {
    const msg = {
      type: 'event',
      topic: 'user.created',
    };
    assert(!isEventMessage(msg));
  });

  await t.test('should accept null data', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'ping' as EventTopic,
      data: null,
    };
    assert(isEventMessage(msg));
  });

  await t.test('should accept undefined data', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'test' as EventTopic,
      data: undefined,
    };
    assert(isEventMessage(msg));
  });

  await t.test('should accept complex data objects', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'order.placed' as EventTopic,
      data: {
        orderId: '123',
        items: [{ sku: 'ABC', qty: 2 }],
        total: 99.99,
      },
    };
    assert(isEventMessage(msg));
  });

  await t.test('should accept array data', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'batch.items' as EventTopic,
      data: [1, 2, 3],
    };
    assert(isEventMessage(msg));
  });

  await t.test('should preserve type literal', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'test' as EventTopic,
      data: {},
    };
    assert.strictEqual(msg.type, 'event');
  });

  await t.test('should accept deeply nested data', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'complex.event' as EventTopic,
      data: {
        level1: {
          level2: {
            level3: {
              level4: 'deep',
            },
          },
        },
      },
    };
    assert(isEventMessage(msg));
  });
});

// ============================================
// ACTOR MESSAGE TESTS
// ============================================

test('ActorMessage type and validation', async (t) => {
  await t.test('should create valid ActorMessage', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'actor-123' as ActorId,
      payload: { action: 'start' },
    };
    assert(isActorMessage(msg));
  });

  await t.test('should reject without type field', () => {
    const msg = {
      to: 'actor-123',
      payload: {},
    };
    assert(!isActorMessage(msg));
  });

  await t.test('should reject without to field', () => {
    const msg = {
      type: 'message',
      payload: {},
    };
    assert(!isActorMessage(msg));
  });

  await t.test('should reject without payload field', () => {
    const msg = {
      type: 'message',
      to: 'actor-123',
    };
    assert(!isActorMessage(msg));
  });

  await t.test('should accept null payload', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'actor-1' as ActorId,
      payload: null,
    };
    assert(isActorMessage(msg));
  });

  await t.test('should accept undefined payload', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'actor-1' as ActorId,
      payload: undefined,
    };
    assert(isActorMessage(msg));
  });

  await t.test('should accept complex payload', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'worker-pool' as ActorId,
      payload: {
        task: 'process',
        items: [1, 2, 3],
        metadata: { priority: 'high' },
      },
    };
    assert(isActorMessage(msg));
  });

  await t.test('should preserve type literal', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'actor-1' as ActorId,
      payload: {},
    };
    assert.strictEqual(msg.type, 'message');
  });

  await t.test('should accept deeply nested payload', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'actor-complex' as ActorId,
      payload: {
        data: {
          nested: {
            structure: {
              value: 42,
            },
          },
        },
      },
    };
    assert(isActorMessage(msg));
  });

  await t.test('should handle special actor IDs', () => {
    const specialIds = [
      'actor-system' as ActorId,
      'supervisor-1' as ActorId,
      'worker-pool-0' as ActorId,
    ];

    for (const id of specialIds) {
      const msg: ActorMessage = {
        type: 'message',
        to: id,
        payload: {},
      };
      assert(isActorMessage(msg));
    }
  });
});

// ============================================
// BASE MESSAGE TESTS
// ============================================

test('BaseMessage type and validation', async (t) => {
  await t.test('should accept EventMessage as BaseMessage', () => {
    const msg: EventMessage = {
      type: 'event',
      topic: 'test' as EventTopic,
      data: {},
    };
    assert(isBaseMessage(msg));
  });

  await t.test('should accept ActorMessage as BaseMessage', () => {
    const msg: ActorMessage = {
      type: 'message',
      to: 'actor-1' as ActorId,
      payload: {},
    };
    assert(isBaseMessage(msg));
  });

  await t.test('should reject object without type field', () => {
    const msg = { data: 'test' };
    assert(!isBaseMessage(msg));
  });

  await t.test('should reject invalid type', () => {
    const msg = { type: 'invalid' };
    assert(!isBaseMessage(msg));
  });
});

// ============================================
// TYPE GUARD TESTS
// ============================================

test('Type guard: isEventMessage', async (t) => {
  await t.test('should identify EventMessage correctly', () => {
    const eventMsg: EventMessage = {
      type: 'event',
      topic: 'user.created' as EventTopic,
      data: { id: '123' },
    };
    const actorMsg: ActorMessage = {
      type: 'message',
      to: 'actor-1' as ActorId,
      payload: {},
    };

    assert(isEventMessage(eventMsg));
    assert(!isEventMessage(actorMsg));
  });

  await t.test('should handle edge cases', () => {
    assert(!isEventMessage(null));
    assert(!isEventMessage(undefined));
    assert(!isEventMessage({}));
    assert(!isEventMessage('string'));
    assert(!isEventMessage(123));
  });
});

test('Type guard: isActorMessage', async (t) => {
  await t.test('should identify ActorMessage correctly', () => {
    const eventMsg: EventMessage = {
      type: 'event',
      topic: 'test' as EventTopic,
      data: {},
    };
    const actorMsg: ActorMessage = {
      type: 'message',
      to: 'actor-x' as ActorId,
      payload: {},
    };

    assert(!isActorMessage(eventMsg));
    assert(isActorMessage(actorMsg));
  });

  await t.test('should handle edge cases', () => {
    assert(!isActorMessage(null));
    assert(!isActorMessage(undefined));
    assert(!isActorMessage({}));
    assert(!isActorMessage('string'));
  });
});

test('Type guard: isBaseMessage', async (t) => {
  await t.test('should accept both EventMessage and ActorMessage', () => {
    const eventMsg: EventMessage = {
      type: 'event',
      topic: 'evt' as EventTopic,
      data: 'test',
    };
    const actorMsg: ActorMessage = {
      type: 'message',
      to: 'actor-y' as ActorId,
      payload: 'data',
    };

    assert(isBaseMessage(eventMsg));
    assert(isBaseMessage(actorMsg));
  });

  await t.test('should reject invalid messages', () => {
    assert(!isBaseMessage(null));
    assert(!isBaseMessage({}));
    assert(!isBaseMessage({ type: 'unknown' }));
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

test('Type system integration', async (t) => {
  await t.test('should handle message routing with type guards', () => {
    const messages: (EventMessage | ActorMessage)[] = [
      {
        type: 'event',
        topic: 'user.registered' as EventTopic,
        data: { userId: '123' },
      },
      {
        type: 'message',
        to: 'logger-actor' as ActorId,
        payload: { level: 'info' },
      },
      {
        type: 'event',
        topic: 'system.started' as EventTopic,
        data: null,
      },
    ];

    let eventCount = 0;
    let actorCount = 0;

    for (const msg of messages) {
      if (isEventMessage(msg)) {
        eventCount++;
        assert(msg.topic);
      } else if (isActorMessage(msg)) {
        actorCount++;
        assert(msg.to);
      }
    }

    assert.strictEqual(eventCount, 2);
    assert.strictEqual(actorCount, 1);
  });

  await t.test('should work with message composition', () => {
    const messageFactory = {
      event: (topic: EventTopic, data: unknown): EventMessage => ({
        type: 'event',
        topic,
        data,
      }),
      message: (to: ActorId, payload: unknown): ActorMessage => ({
        type: 'message',
        to,
        payload,
      }),
    };

    const event = messageFactory.event('app.started' as EventTopic, {
      timestamp: Date.now(),
    });
    const message = messageFactory.message('monitor' as ActorId, {
      check: 'health',
    });

    assert(isEventMessage(event));
    assert(isActorMessage(message));
  });

  await t.test('should maintain type safety with type narrowing', () => {
    const msg: EventMessage | ActorMessage = {
      type: 'event',
      topic: 'test.event' as EventTopic,
      data: { value: 42 },
    };

    if (isEventMessage(msg)) {
      assert.strictEqual(msg.type, 'event');
      assert(msg.topic);
      // After type guard, TypeScript knows msg has topic property
    }
  });
});
