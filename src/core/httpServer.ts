import http from 'node:http';
import { Socket } from 'node:net';
import { RouteNotFound } from './errors';

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

  constructor(port: number) {
    this.port = port;
    this.connections = new Set();
    this.server = http.createServer(this.requestListener.bind(this));

    // Track connections for graceful shutdown
    this.server.on('connection', (socket) => {
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
        middlewareStack[index](req, res, () => runMiddleware(middlewareStack, index + 1, callback));
      } else {
        callback();
      }
    };

    runMiddleware(this.globalMiddleware, 0, () => {
      // All global middleware executed, now proceed to route handling
      try {
        const routeMatch = this.findRoute(req.method as HttpMethod, req.url || '/', req);

        if (routeMatch) {
          runMiddleware(routeMatch.route.middlewares, 0, () => {
            // All route middleware executed, now execute handler
            routeMatch.route.handler(req, res);
          });
        } else {
          throw new RouteNotFound(req.method as HttpMethod, req.url || '/');
        }
      } catch (error: any) {
        console.error(`HTTP Request Error for ${req.method} ${req.url}:`, error);
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
              params[name] = match[index + 1];
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

      // Destroy all active connections
      for (const socket of this.connections) {
        socket.destroy();
      }
      this.connections.clear();

      this.server.close((err) => {
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
}