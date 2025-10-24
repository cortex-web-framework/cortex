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
        var _a;
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, []);
        }
        (_a = this.subscriptions.get(topic)) === null || _a === void 0 ? void 0 : _a.push(callback);
    }
    publish(topic, message) {
        var _a;
        if (this.subscriptions.has(topic)) {
            (_a = this.subscriptions.get(topic)) === null || _a === void 0 ? void 0 : _a.forEach(callback => {
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
