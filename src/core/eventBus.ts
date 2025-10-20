type Callback = (message: any) => void;

class EventBus {
  private static instance: EventBus;
  private subscriptions: Map<string, Callback[]>;

  private constructor() {
    this.subscriptions = new Map<string, Callback[]>();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(topic: string, callback: Callback): void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    this.subscriptions.get(topic)?.push(callback);
  }

  public publish(topic: string, message: any): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.forEach(callback => {
        callback(message);
      });
    }
  }
}

export { EventBus };
