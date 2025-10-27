import * as http from 'node:http';
import { Socket } from 'node:net';
import { RouteNotFound, isError, getErrorMessage } from './errors.js';
import { Logger } from './logger.js';
import type { MetricsCollector } from '../observability/metrics/collector.js';
import type { HealthCheckRegistry } from '../observability/health/healthRegistry.js';

declare module 'node:http' {
  interface IncomingMessage {
    params?: Record<string, string>;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type NextFunction = () => void;
type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction) => void;
type RouteHandler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  regexp: RegExp;
  paramNames: string[];
  middlewares: Middleware[]; // New: Route-specific middleware
}

export class CortexHttpServer {
  private server: http.Server;
  private port: number;
  private routes: Route[] = [];
  private running: boolean = false;
  private connections: Set<Socket>; // Track active connections
  private globalMiddleware: Middleware[] = []; // New: Global middleware array
  private logger: Logger;

  constructor(port: number) {
    this.logger = Logger.getInstance();
    this.port = port;
    this.connections = new Set();
    this.server = http.createServer(this.requestListener.bind(this));

    // Track connections for graceful shutdown
    this.server.on('connection', (socket: Socket) => {
      this.connections.add(socket);
      socket.on('close', () => this.connections.delete(socket));
    });
  }

  public use(middleware: Middleware): void {
    this.globalMiddleware.push(middleware);
  }

  private requestListener(req: http.IncomingMessage, res: http.ServerResponse): void {
    const runMiddleware = (middlewareStack: Middleware[], index: number, callback: () => void) => {
      if (index < middlewareStack.length) {
        middlewareStack[index]!(req, res, () => runMiddleware(middlewareStack, index + 1, callback));
      } else {
        callback();
      }
    };

    runMiddleware(this.globalMiddleware, 0, () => {
      // All global middleware executed, now proceed to route handling
      try {
        const routeMatch = this.findRoute(req.method as HttpMethod, req.url ?? '/', req);

        if (routeMatch) {
          runMiddleware(routeMatch.route.middlewares, 0, () => {
            // All route middleware executed, now execute handler
            routeMatch.route.handler(req, res);
          });
        } else {
          throw new RouteNotFound(req.method as HttpMethod, req.url ?? '/');
        }
      } catch (error: unknown) {
        const errorMessage = isError(error) ? error.message : getErrorMessage(error);
        this.logger.error(`HTTP Request Error for ${req.method} ${req.url}: ${errorMessage}`, isError(error) ? error : new Error(String(error)));
        if (error instanceof RouteNotFound) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }
    });
  }

  private findRoute(method: HttpMethod, url: string, req: http.IncomingMessage): { route: Route, params: Record<string, string> } | undefined {
    for (const route of this.routes) {
      if (route.method === method) {
        const match = url.match(route.regexp);
        if (match) {
          const params: Record<string, string> = {};
          route.paramNames.forEach((name, index) => {
            if (match && match[index + 1]) {
              params[name] = match[index + 1]!;
            }
          });
          req.params = params;
          return { route, params };
        }
      }
    }
    return undefined;
  }

  private parsePath(path: string): { regexp: RegExp, paramNames: string[] } {
    const paramNames: string[] = [];
    const regexp = new RegExp(
      path.replace(/\/:(\w+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '/(.+)';
      }) + '/?'
    );
    return { regexp, paramNames };
  }

  public get(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'GET', path, handler, regexp, paramNames, middlewares });
  }

  public post(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'POST', path, handler, regexp, paramNames, middlewares });
  }

  public put(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'PUT', path, handler, regexp, paramNames, middlewares });
  }

  public delete(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'DELETE', path, handler, regexp, paramNames, middlewares });
  }

  public patch(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'PATCH', path, handler, regexp, paramNames, middlewares });
  }
  
  public head(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'HEAD', path, handler, regexp, paramNames, middlewares });
  }

  public options(path: string, ...handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];
    const { regexp, paramNames } = this.parsePath(path);
    this.routes.push({ method: 'OPTIONS', path, handler, regexp, paramNames, middlewares });
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        this.running = true;
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        return resolve();
      }

      // Remove all event listeners to prevent listener leaks
      this.server.removeAllListeners();

      // Destroy all active connections
      for (const socket of this.connections) {
        socket.destroy();
      }
      this.connections.clear();

      // Clear routes and middleware for complete cleanup
      this.routes = [];
      this.globalMiddleware = [];

      this.server.close((err: Error | undefined) => {
        if (err) {
          reject(err);
        }
        else {
          this.running = false;
          resolve();
        }
      });
    });
  }

  public isRunning(): boolean {
    return this.running;
  }

  /**
   * Register the /metrics endpoint for Prometheus-format metrics
   *
   * @param metricsCollector - MetricsCollector instance
   */
  public registerMetricsEndpoint(metricsCollector: MetricsCollector): void {
    this.get('/metrics', (_req: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(metricsCollector.toPrometheusFormat());
    });
  }

  /**
   * Register the /health endpoint for health check results
   *
   * @param healthRegistry - HealthCheckRegistry instance
   */
  public registerHealthEndpoint(healthRegistry: HealthCheckRegistry): void {
    this.get('/health', async (_req: http.IncomingMessage, res: http.ServerResponse) => {
      try {
        const results = await healthRegistry.checkAll();
        const overallStatus = healthRegistry.getOverallStatus(results);

        const response = {
          status: overallStatus,
          timestamp: Date.now(),
          checks: Object.fromEntries(results.entries()),
        };

        res.writeHead(overallStatus === 'up' ? 200 : overallStatus === 'degraded' ? 503 : 503, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end(JSON.stringify(response, null, 2));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.writeHead(503, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(
          {
            status: 'down',
            timestamp: Date.now(),
            error: errorMessage,
          },
          null,
          2
        ));
      }
    });
  }
}