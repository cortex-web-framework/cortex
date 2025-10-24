export class Logger {
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    formatMessage(level, message, context) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
        };
        if (context instanceof Error) {
            logEntry["error"] = {
                name: context.name,
                message: context.message,
                stack: context.stack,
            };
        }
        else if (context) {
            Object.assign(logEntry, context);
        }
        return JSON.stringify(logEntry);
    }
    info(message, context) {
        console.log(this.formatMessage('info', message, context));
    }
    warn(message, context) {
        console.warn(this.formatMessage('warn', message, context));
    }
    error(message, error, context) {
        console["error"](this.formatMessage('error', message, error || context));
    }
    debug(message, context) {
        // Only log debug messages if NODE_ENV is 'development'
        if (process.env["NODE_ENV"] === 'development') {
            console.debug(this.formatMessage('debug', message, context));
        }
    }
}
