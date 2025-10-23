import { EventBusError } from './errors.js';
import { Logger } from './logger.js';
class EventBus {
    constructor() {
        this.subscriptions = new Map();
        this.logger = Logger.getInstance();
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    subscribe(topic, callback) {
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, []);
        }
        this.subscriptions.get(topic)?.push(callback);
    }
    publish(topic, message) {
        if (this.subscriptions.has(topic)) {
            this.subscriptions.get(topic)?.forEach(callback => {
                try {
                    callback(message);
                }
                catch (error) {
                    this.logger["error"](`Error in EventBus subscriber for topic '${topic}'`, error, { topic });
                    this.publish('error', new EventBusError(`Error in subscriber for topic '${topic}'`, error));
                }
            });
        }
    }
}
export { EventBus };
