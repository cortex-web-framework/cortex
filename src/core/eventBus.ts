type Callback<T> = (message: T) => void;
import { EventBusError } from './errors';
import { Logger } from './logger';

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

  public publish<T>(topic: string, message: T): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.forEach(callback => {
        try {
          callback(message);
        } catch (error: any) {
          this.logger.error(`Error in EventBus subscriber for topic '${topic}'`, error, { topic });
          this.publish('error', new EventBusError(`Error in subscriber for topic '${topic}'`, error));
        }
      });
    }
  }
}

export { EventBus };
