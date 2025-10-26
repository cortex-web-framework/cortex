export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, context?: Record<string, any> | Error): string {
    const logEntry: Record<string, any> = {
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
    } else if (context) {
      Object.assign(logEntry, context);
    }

    return JSON.stringify(logEntry);
  }

  public info(message: string, context?: Record<string, any>): void {
    console.log(this.formatMessage('info', message, context));
  }

  public warn(message: string, context?: Record<string, any>): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  public error(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(this.formatMessage('error', message, error || context));
  }

  public debug(message: string, context?: Record<string, any>): void {
    // Only log debug messages if NODE_ENV is 'development'
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}
