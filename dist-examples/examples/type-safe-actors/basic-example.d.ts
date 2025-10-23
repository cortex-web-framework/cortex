/**
 * Basic Type-Safe Actor Example
 *
 * Demonstrates the simplest usage pattern with a counter actor
 */
import { TypeSafeActor } from '../../src/core/typeSafeActorSystem.js';
type CounterMessage = {
    type: 'increment';
    amount: number;
} | {
    type: 'decrement';
    amount: number;
} | {
    type: 'reset';
} | {
    type: 'print';
};
declare class CounterActor extends TypeSafeActor<number, CounterMessage> {
    protected receive(message: CounterMessage): void;
}
declare function basicExample(): Promise<void>;
export { basicExample, CounterActor, CounterMessage };
