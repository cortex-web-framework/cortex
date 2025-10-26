type Callback<T> = (message: T) => void;
import { EventBusError } from './errors.js';
import { Logger } from './logger.js';

class EventBus {
  private static instance: EventBus;
  private subscriptions: Map<string, Callback<any>[]>;
  private logger: Logger;

  private constructor() {
    this.subscriptions = new Map<string, Callback<any>[]>();
    this.logger = Logger.getInstance();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T>(topic: string, callback: Callback<T>): void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    this.subscriptions.get(topic)?.push(callback);
  }

  public unsubscribe<T>(topic: string, callback: Callback<T>): boolean {
    const callbacks = this.subscriptions.get(topic);
    if (!callbacks) {
      return false;
    }

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      // Clean up empty topic entries
      if (callbacks.length === 0) {
        this.subscriptions.delete(topic);
      }
      return true;
    }

    return false;
  }

  public publish<T>(topic: string, message: T): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.forEach(callback => {
        try {
          callback(message);
        } catch (error: unknown) {
          this.logger.error(`Error in EventBus subscriber for topic '${topic}'`, error as Error, { topic });
          this.publish('error', new EventBusError(`Error in subscriber for topic '${topic}'`, error as Error));
        }
      });
    }
  }
}

export { EventBus };
