export declare class Logger {
    private static instance;
    private constructor();
    static getInstance(): Logger;
    private formatMessage;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
}
//# sourceMappingURL=logger.d.ts.map