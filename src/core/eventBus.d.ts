type Callback<T> = (message: T) => void;
declare class EventBus {
    private static instance;
    private subscriptions;
    private logger;
    private constructor();
    static getInstance(): EventBus;
    subscribe<T>(topic: string, callback: Callback<T>): void;
    publish<T>(topic: string, message: T): void;
}
export { EventBus };
//# sourceMappingURL=eventBus.d.ts.map