/**
 * Type-Safe Actor System with Discriminated Unions
 *
 * Provides generic, type-safe messaging for actors using discriminated unions.
 * This enables compile-time checking of actor messages and prevents runtime errors.
 *
 * @example
 * ```typescript
 * // Define messages as a discriminated union
 * type CounterMessage =
 *   | { type: 'increment'; amount: number }
 *   | { type: 'decrement'; amount: number }
 *   | { type: 'reset' };
 *
 * // Create a type-safe actor
 * class Counter extends TypeSafeActor<number, CounterMessage> {
 *   protected receive(message: CounterMessage): void {
 *     switch (message.type) {
 *       case 'increment':
 *         this.state += message.amount;
 *         break;
 *       case 'decrement':
 *         this.state -= message.amount;
 *         break;
 *       case 'reset':
 *         this.state = 0;
 *         break;
 *     }
 *   }
 * }
 * ```
 */
/**
 * Type guard to check if an object is a BaseMessage
 */
export function isBaseMessage(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'type' in obj &&
        typeof obj.type === 'string');
}
/**
 * Builder pattern for creating message handlers with fluent API
 */
export class MessageHandlerBuilder {
    constructor() {
        this.handlers = new Map();
    }
    /**
     * Add a handler for a specific message type
     */
    on(type, handler) {
        this.handlers.set(type, handler);
        return this;
    }
    /**
     * Add a default handler for unhandled messages
     */
    default(handler) {
        this.handlers.set('__default__', handler);
        return this;
    }
    /**
     * Build the message handler function
     */
    build() {
        return (state, message) => {
            const handler = this.handlers.get(message.type);
            if (handler) {
                return handler(state, message);
            }
            const defaultHandler = this.handlers.get('__default__');
            if (defaultHandler) {
                return defaultHandler(state, message);
            }
            // If no handler found, return state unchanged
            return state;
        };
    }
}
/**
 * Create a message handler builder for fluent API
 */
export function createHandlerBuilder() {
    return new MessageHandlerBuilder();
}
/**
 * Type predicate for checking message type
 * @example
 * if (isMessageType(message, 'increment')) {
 *   // message is now typed as Extract<TMessage, { type: 'increment' }>
 * }
 */
export function isMessageType(message, type) {
    return message.type === type;
}
