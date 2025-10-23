/**
 * Basic Type-Safe Actor Example
 *
 * Demonstrates the simplest usage pattern with a counter actor
 */

import {
  TypeSafeActor,
  createTypeSafeActorSystem,
} from '../../src/core/typeSafeActorSystem.js';

// Define message types with discriminated union
type CounterMessage =
  | { type: 'increment'; amount: number }
  | { type: 'decrement'; amount: number }
  | { type: 'reset' }
  | { type: 'print' };

// Create a simple counter actor
class CounterActor extends TypeSafeActor<number, CounterMessage> {
  protected receive(message: CounterMessage): void {
    switch (message.type) {
      case 'increment':
        this.state += message.amount;
        console.log(`Incremented by ${message.amount}. State: ${this.state}`);
        break;

      case 'decrement':
        this.state -= message.amount;
        console.log(`Decremented by ${message.amount}. State: ${this.state}`);
        break;

      case 'reset':
        this.state = 0;
        console.log('Reset to 0');
        break;

      case 'print':
        console.log(`Current value: ${this.state}`);
        break;
    }
  }
}

// Usage example
async function basicExample() {
  const system = createTypeSafeActorSystem();

  // Create the counter actor
  const counter = system.createActor(CounterActor, 'counter', 0);

  // Send messages (all type-safe)
  counter.tell({ type: 'increment', amount: 5 });
  counter.tell({ type: 'increment', amount: 3 });
  counter.tell({ type: 'decrement', amount: 2 });
  counter.tell({ type: 'print' });
  counter.tell({ type: 'reset' });
  counter.tell({ type: 'print' });

  // Wait for processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  // These would be compile-time errors:
  // counter.tell({ type: 'invalid' }); // ❌ Type error
  // counter.tell({ type: 'increment', amount: 'string' }); // ❌ Type error

  system.shutdown();
}

// Export for testing
export { basicExample, CounterActor, CounterMessage };
