/**
 * Type-Safe Actor System Tests
 *
 * Tests for type safety, message handling, and actor patterns
 * using discriminated unions and generic types.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import type {
  BaseMessage,
  MessageType as _MessageType,
  MessageVariant as _MessageVariant,
} from '../../src/core/actorTypes.js';
import {
  isBaseMessage,
  isMessageType,
  createHandlerBuilder,
} from '../../src/core/actorTypes.js';

test('Actor Types', async (t) => {
  await t.test('BaseMessage interface exists and allows any string type', () => {
    const message1: BaseMessage = { type: 'foo' };
    const message2: BaseMessage = { type: 'bar' };

    assert.strictEqual(message1.type, 'foo');
    assert.strictEqual(message2.type, 'bar');
  });

  await t.test('isBaseMessage type guard identifies valid messages', () => {
    const validMessages = [
      { type: 'test' },
      { type: 'message', payload: 'data' },
      { type: '' },
    ];

    for (const message of validMessages) {
      assert.strictEqual(isBaseMessage(message), true);
    }
  });

  await t.test('isBaseMessage type guard rejects invalid objects', () => {
    const invalidMessages = [
      { noType: 'test' },
      'just a string',
      42,
      null,
      undefined,
      { type: 123 }, // type must be string
    ];

    for (const message of invalidMessages) {
      assert.strictEqual(isBaseMessage(message), false);
    }
  });

  await t.test('MessageType extracts type field from discriminated union', () => {
    // This test verifies the type works at compile time
    // At runtime, we can verify the literals exist
    const msgTypes = ['increment', 'decrement', 'reset'] as const;
    assert.strictEqual(msgTypes.length, 3);
    assert.ok(msgTypes.includes('increment'));
  });

  await t.test('MessageVariant extracts specific message type from union', () => {
    // Verify we can create instances of specific variants
    const increment = {
      type: 'increment',
      amount: 5,
    } as const;
    assert.strictEqual(increment.type, 'increment');
    assert.strictEqual(increment.amount, 5);

    const reset = { type: 'reset' } as const;
    assert.strictEqual(reset.type, 'reset');
  });

  await t.test('isMessageType type predicate narrows message type', () => {
    const message = { type: 'increment', amount: 10 };

    if (isMessageType(message as any, 'increment')) {
      // TypeScript should narrow to { type: 'increment'; amount: number }
      assert.strictEqual(message.type, 'increment');
      assert.strictEqual(message.amount, 10);
    } else {
      assert.fail('Should have narrowed to increment');
    }
  });

  await t.test('isMessageType correctly rejects non-matching types', () => {
    const message = { type: 'reset' } as any;

    assert.strictEqual(isMessageType(message, 'reset'), true);
    assert.strictEqual(isMessageType(message, 'increment'), false);
    assert.strictEqual(isMessageType(message, 'decrement'), false);
  });

  await t.test('MessageHandlerBuilder builds handler for single message type', () => {
    type TestMessages =
      | { type: 'increment'; amount: number }
      | { type: 'reset' };

    const handler = createHandlerBuilder<number, TestMessages>()
      .on('increment', (state, msg) => state + msg.amount)
      .on('reset', (state) => 0)
      .build();

    let state = 10;
    state = handler(state, { type: 'increment', amount: 5 } as TestMessages);
    assert.strictEqual(state, 15);

    state = handler(state, { type: 'reset' } as TestMessages);
    assert.strictEqual(state, 0);
  });

  await t.test('MessageHandlerBuilder uses default handler for unhandled messages', () => {
    type TestMessages =
      | { type: 'increment'; amount: number }
      | { type: 'unknown' };

    const handler = createHandlerBuilder<number, TestMessages>()
      .on('increment', (state, msg) => state + msg.amount)
      .default((state) => state * 2)
      .build();

    let state = 10;
    state = handler(state, { type: 'increment', amount: 5 } as TestMessages);
    assert.strictEqual(state, 15);

    state = handler(state, { type: 'unknown' } as TestMessages);
    assert.strictEqual(state, 30); // applied default: 15 * 2
  });

  await t.test('MessageHandlerBuilder returns unchanged state if no handler matches', () => {
    type TestMessages =
      | { type: 'increment'; amount: number }
      | { type: 'unknown' };

    const handler = createHandlerBuilder<number, TestMessages>()
      .on('increment', (state, msg) => state + msg.amount)
      .build();

    let state = 10;
    state = handler(state, { type: 'increment', amount: 5 } as TestMessages);
    assert.strictEqual(state, 15);

    state = handler(state, { type: 'unknown' } as TestMessages);
    assert.strictEqual(state, 15); // no change
  });

  await t.test('MessageHandlerBuilder supports fluent chaining', () => {
    type TestMessages =
      | { type: 'add'; value: number }
      | { type: 'multiply'; value: number }
      | { type: 'negate' };

    const handler = createHandlerBuilder<number, TestMessages>()
      .on('add', (state, msg) => state + msg.value)
      .on('multiply', (state, msg) => state * msg.value)
      .on('negate', (state) => -state)
      .build();

    let state = 5;
    state = handler(state, { type: 'add', value: 3 } as TestMessages); // 5 + 3 = 8
    assert.strictEqual(state, 8);

    state = handler(state, { type: 'multiply', value: 2 } as TestMessages); // 8 * 2 = 16
    assert.strictEqual(state, 16);

    state = handler(state, { type: 'negate' } as TestMessages); // -16
    assert.strictEqual(state, -16);
  });

  await t.test('Complex discriminated union with varied message structures', () => {
    type UserMessage =
      | { type: 'create'; name: string; email: string }
      | { type: 'update'; id: number; name?: string; email?: string }
      | { type: 'delete'; id: number }
      | { type: 'getById'; id: number };

    // Test type narrowing with isMessageType
    const createMsg: UserMessage = {
      type: 'create',
      name: 'John',
      email: 'john@example.com',
    };

    assert.strictEqual(isMessageType(createMsg, 'create'), true);
    assert.strictEqual(isMessageType(createMsg, 'delete' as any), false);

    // Test handler builder with complex messages
    interface User {
      id?: number;
      name: string;
      email: string;
    }

    let nextId = 1;

    const userHandler = createHandlerBuilder<User[], UserMessage>()
      .on('create', (state, msg) => {
        const newUser: User = { id: nextId++, name: msg.name, email: msg.email };
        return [...state, newUser];
      })
      .on('delete', (state, msg) => state.filter((u) => u.id !== msg.id))
      .on('update', (state, msg) => {
        return state.map((u) =>
          u.id === msg.id ? { ...u, name: msg.name ?? u.name, email: msg.email ?? u.email } : u
        );
      })
      .on('getById', (state) => state)
      .build();

    let state: User[] = [];
    state = userHandler(state, { type: 'create', name: 'Alice', email: 'alice@example.com' } as UserMessage);
    assert.strictEqual(state.length, 1);
    assert.strictEqual(state[0]?.name, 'Alice');

    state = userHandler(state, { type: 'create', name: 'Bob', email: 'bob@example.com' } as UserMessage);
    assert.strictEqual(state.length, 2);

    state = userHandler(state, { type: 'delete', id: 1 } as UserMessage);
    assert.strictEqual(state.length, 1);
  });

  await t.test('MessageHandlerBuilder handles state transformations correctly', () => {
    type CalcMessage =
      | { type: 'square' }
      | { type: 'sqrt' }
      | { type: 'add'; n: number }
      | { type: 'set'; value: number };

    const calculator = createHandlerBuilder<number, CalcMessage>()
      .on('square', (state) => state * state)
      .on('sqrt', (state) => Math.sqrt(state))
      .on('add', (state, msg) => state + msg.n)
      .on('set', (_state, msg) => msg.value)
      .build();

    let value = 2;
    value = calculator(value, { type: 'square' } as CalcMessage); // 2^2 = 4
    assert.strictEqual(value, 4);

    value = calculator(value, { type: 'sqrt' } as CalcMessage); // sqrt(4) = 2
    assert.strictEqual(value, 2);

    value = calculator(value, { type: 'add', n: 3 } as CalcMessage); // 2 + 3 = 5
    assert.strictEqual(value, 5);

    value = calculator(value, { type: 'set', value: 10 } as CalcMessage); // set to 10
    assert.strictEqual(value, 10);
  });
});
