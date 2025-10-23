import * as http from 'node:http';
import type { TimeProvider } from '../utils/time.js';
import { SystemTimeProvider } from '../utils/time.js';

interface RequestExt extends http.IncomingMessage {
  ip?: string;
}

interface ResponseExt extends http.ServerResponse {
  status?: (code: number) => ResponseExt;
  send?: (body?: any) => ResponseExt;
}

type Request = RequestExt;
type Response = ResponseExt;
type NextFunction = () => void;

interface RateLimiterOptions {
  windowMs: number; // Window size in milliseconds
  max: number; // Max requests per windowMs
  message: string; // Message to send when rate limit is exceeded
}

const defaultOptions: RateLimiterOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
};

const clients = new Map<string, { count: number; lastReset: number }>();

// Export for testing purposes
export const __testing__ = {
  getClients: () => clients,
  clearClients: () => clients.clear(),
};

export function rateLimiter(options?: Partial<RateLimiterOptions>, timeProvider?: TimeProvider) {
  const opts = { ...defaultOptions, ...options };
  const time = timeProvider ?? new SystemTimeProvider();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown'; // Use 'unknown' if ip is undefined
    const now = time.now();

    if (!clients.has(ip)) {
      clients.set(ip, { count: 0, lastReset: now });
    }

    const client = clients.get(ip)!;

    if (now - client.lastReset > opts.windowMs) {
      client.count = 0;
      client.lastReset = now;
    }

    if (client.count >= opts.max) {
      // Support both Express and native Node.js HTTP
      if (res.status && res.send) {
        res.status!(429).send!(opts.message);
      } else {
        res.statusCode = 429;
        res.end(opts.message);
      }
      return;
    }

    client.count++;
    next();
  };
}
